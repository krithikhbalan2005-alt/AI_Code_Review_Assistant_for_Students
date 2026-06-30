import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useToast } from '../components/ToastContext';
import { jsPDF } from 'jspdf';
import { 
  Award, AlertCircle, Sparkles, CheckCircle2, ChevronLeft, Download, 
  BookOpen, Code2, ShieldAlert, Cpu, Check, Copy 
} from 'lucide-react';

export default function ReviewResult() {
  const [searchParams] = useSearchParams();
  const reportId = searchParams.get('reportId');
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedOptimized, setCopiedOptimized] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      if (!reportId) {
        showToast('Invalid report identifier.', 'error');
        navigate('/dashboard');
        return;
      }

      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        const reportRef = doc(db, 'reviewReports', reportId);
        const docSnap = await getDoc(reportRef);

        if (!docSnap.exists()) {
          showToast('Something went wrong. Please try again.', 'error');
          navigate('/dashboard');
          return;
        }

        const data = docSnap.data();

        // Security check: Only the owner user can read their report
        if (data.userId !== currentUser.uid) {
          showToast('Something went wrong. Please try again.', 'error');
          navigate('/dashboard');
          return;
        }

        setReport(data);
      } catch (err) {
        console.error('Error fetching report details:', err);
        showToast('Something went wrong. Please try again.', 'error');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId, navigate, showToast]);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'original') {
      setCopiedOriginal(true);
      setTimeout(() => setCopiedOriginal(false), 2000);
    } else {
      setCopiedOptimized(true);
      setTimeout(() => setCopiedOptimized(false), 2000);
    }
    showToast('Code copied to clipboard', 'success');
  };

  // Generate and Download PDF Report locally via jsPDF
  const handleDownloadPDF = () => {
    if (!report) return;

    try {
      const doc = new jsPDF();
      const leftMargin = 15;
      let yOffset = 20;

      // Page Header
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(30, 41, 59); // Slate 800
      doc.text("Student Code Review Report", leftMargin, yOffset);
      yOffset += 8;

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // Slate 500
      doc.text(`Generated on: ${new Date(report.createdAt).toLocaleString()}`, leftMargin, yOffset);
      yOffset += 5;
      doc.text(`Student Account: ${auth.currentUser?.email}`, leftMargin, yOffset);
      yOffset += 5;
      doc.text(`Programming Language: ${report.language}`, leftMargin, yOffset);
      yOffset += 5;
      doc.text(`Overall Code Quality Score: ${report.score}%`, leftMargin, yOffset);
      yOffset += 8;

      // Thick divider line
      doc.setDrawColor(99, 102, 241); // Indigo 500
      doc.setLineWidth(1);
      doc.line(leftMargin, yOffset, 195, yOffset);
      yOffset += 12;

      // Section printing function with autowrap and page breaks
      const printSection = (title, items, isCode = false) => {
        // Safe check for page break before section title
        if (yOffset > 250) {
          doc.addPage();
          yOffset = 20;
        }

        doc.setFont("Helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(15, 23, 42); // Slate 900
        doc.text(title, leftMargin, yOffset);
        yOffset += 6;

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(51, 65, 85); // Slate 700

        if (Array.isArray(items)) {
          if (items.length === 0) {
            doc.text("• No issues detected.", leftMargin + 4, yOffset);
            yOffset += 6;
          } else {
            items.forEach((item) => {
              const textLine = `• ${item}`;
              const splitLines = doc.splitTextToSize(textLine, 175);
              splitLines.forEach((line) => {
                if (yOffset > 275) {
                  doc.addPage();
                  yOffset = 20;
                }
                doc.text(line, leftMargin + 4, yOffset);
                yOffset += 5;
              });
            });
          }
        } else {
          const text = items || 'N/A';
          if (isCode) {
            doc.setFont("Courier", "normal");
            doc.setFontSize(8.5);
            doc.setTextColor(30, 41, 59);
          }
          
          const splitLines = doc.splitTextToSize(text, 175);
          splitLines.forEach((line) => {
            if (yOffset > 275) {
              doc.addPage();
              yOffset = 20;
              if (isCode) {
                doc.setFont("Courier", "normal");
                doc.setFontSize(8.5);
              }
            }
            doc.text(line, leftMargin, yOffset);
            yOffset += 5;
          });
        }
        
        yOffset += 10;
      };

      printSection("1. Detected Bugs & Syntactical Mistakes", report.bugs);
      printSection("2. Improvement Suggestions", report.suggestions);
      printSection("3. Security Auditing", report.securityIssues);
      printSection("4. Time & Space Complexity", report.complexityAnalysis);
      printSection("5. Learning Explanations (Tutor Notes)", report.beginnerExplanation);
      printSection("6. Corrected Code (Error Removed)", report.optimizedCode, true);


      doc.save(`CodeReview_Report_${reportId.substring(0, 8)}.pdf`);
      showToast('Report downloaded successfully', 'success');
    } catch (err) {
      console.error('PDF creation error:', err);
      showToast('Something went wrong. Please try again.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-400 font-medium">Fetching analysis report...</p>
        </div>
      </div>
    );
  }

  // Determine score color
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5';
    if (score >= 50) return 'text-amber-400 border-amber-500/30 bg-amber-500/5';
    return 'text-red-400 border-red-500/30 bg-red-500/5';
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <Link to="/dashboard" className="flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <button onClick={handleDownloadPDF} className="btn-primary flex items-center gap-2 text-sm py-2 px-4">
          <Download className="h-4 w-4" />
          Download PDF Report
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Score & Core Metrics */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quality Score Panel */}
          <div className={`glass-panel p-8 rounded-xl border text-center relative overflow-hidden flex flex-col items-center justify-center ${getScoreColor(report.score)}`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-current opacity-[0.02] rounded-full blur-2xl pointer-events-none"></div>
            
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Code Quality Score</h2>
            <div className="relative flex items-center justify-center w-36 h-36 rounded-full border-4 border-slate-800">
              <span className="text-4xl font-extrabold text-white">{report.score}%</span>
            </div>
            
            <p className="text-slate-400 text-xs mt-6 leading-relaxed max-w-[240px]">
              This score aggregates code logic correctness, programming style best practices, and code complexity metrics.
            </p>
          </div>

          {/* Complexity Analysis Panel */}
          <div className="glass-panel p-6 rounded-xl border border-slate-800">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <Cpu className="h-4 w-4 text-blue-400" />
              Complexity Analysis
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed font-mono bg-slate-950/50 p-4 rounded-lg border border-slate-900">
              {report.complexityAnalysis}
            </p>
          </div>
        </div>

        {/* Right Side: Detailed AI Reviews */}
        <div className="lg:col-span-2 space-y-6">
          {/* Friendly Tutor Explanations */}
          <div className="glass-panel p-6 rounded-xl border border-indigo-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-400" />
              Tutor Learning Notes
            </h3>
            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line border-l-2 border-indigo-500/30 pl-4 py-1">
              {report.beginnerExplanation}
            </div>
          </div>

          {/* Tabbed Review Items */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Bugs Card */}
            <div className="glass-panel p-5 rounded-xl border border-slate-800 flex flex-col">
              <h4 className="text-sm font-bold text-red-400 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                <AlertCircle className="h-4 w-4" />
                Bugs ({report.bugs.length})
              </h4>
              <ul className="text-xs text-slate-400 space-y-2 flex-grow">
                {report.bugs.length === 0 ? (
                  <li className="flex items-center gap-1.5 text-emerald-400/80 font-medium">
                    <Check className="h-3.5 w-3.5" /> No bugs found
                  </li>
                ) : (
                  report.bugs.map((bug, i) => <li key={i} className="list-disc ml-3 leading-relaxed">{bug}</li>)
                )}
              </ul>
            </div>

            {/* Suggestions Card */}
            <div className="glass-panel p-5 rounded-xl border border-slate-800 flex flex-col">
              <h4 className="text-sm font-bold text-blue-400 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="h-4 w-4" />
                Suggestions ({report.suggestions.length})
              </h4>
              <ul className="text-xs text-slate-400 space-y-2 flex-grow">
                {report.suggestions.length === 0 ? (
                  <li className="flex items-center gap-1.5 text-slate-500">
                    No styling improvements
                  </li>
                ) : (
                  report.suggestions.map((sug, i) => <li key={i} className="list-disc ml-3 leading-relaxed">{sug}</li>)
                )}
              </ul>
            </div>

            {/* Security Card */}
            <div className="glass-panel p-5 rounded-xl border border-slate-800 flex flex-col">
              <h4 className="text-sm font-bold text-purple-400 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                <ShieldAlert className="h-4 w-4" />
                Security ({report.securityIssues.length})
              </h4>
              <ul className="text-xs text-slate-400 space-y-2 flex-grow">
                {report.securityIssues.length === 0 ? (
                  <li className="flex items-center gap-1.5 text-emerald-400/80 font-medium">
                    <Check className="h-3.5 w-3.5" /> Code is secure
                  </li>
                ) : (
                  report.securityIssues.map((sec, i) => <li key={i} className="list-disc ml-3 leading-relaxed text-red-300/85">{sec}</li>)
                )}
              </ul>
            </div>
            
          </div>

          {/* Corrected Code Display */}
          <div className="glass-panel rounded-xl overflow-hidden border border-slate-800">
            <div className="bg-dark-900/80 border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Code2 className="h-4 w-4 text-purple-400" />
                Corrected Code (Error Removed)
              </span>

              <button 
                onClick={() => copyToClipboard(report.optimizedCode, 'optimized')}
                className="text-slate-400 hover:text-slate-200 transition-colors p-1 flex items-center gap-1 text-xs"
              >
                {copiedOptimized ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                Copy Solution
              </button>
            </div>
            <pre className="p-5 overflow-x-auto text-xs code-font text-slate-300 bg-slate-950/60 leading-relaxed max-h-96">
              <code>{report.optimizedCode}</code>
            </pre>
          </div>

          {/* Original Student Code Display */}
          <div className="glass-panel rounded-xl overflow-hidden border border-slate-800 opacity-80">
            <div className="bg-dark-900/80 border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                Original Submitted Code
              </span>
              <button 
                onClick={() => copyToClipboard(report.originalCode, 'original')}
                className="text-slate-400 hover:text-slate-200 transition-colors p-1 flex items-center gap-1 text-xs"
              >
                {copiedOriginal ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                Copy Original
              </button>
            </div>
            <pre className="p-5 overflow-x-auto text-xs code-font text-slate-400 bg-slate-950/40 leading-relaxed max-h-64">
              <code>{report.originalCode}</code>
            </pre>
          </div>

        </div>

      </div>
    </div>
  );
}
