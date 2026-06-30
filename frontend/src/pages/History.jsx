import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useToast } from '../components/ToastContext';
import { jsPDF } from 'jspdf';
import { History as HistoryIcon, Download, Eye, FileCode, AlertTriangle, Clock } from 'lucide-react';

export default function History() {
  const [loading, setLoading] = useState(true);
  const [historyItems, setHistoryItems] = useState([]);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchHistory = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        // Query only the authenticated user's history
        const q = query(
          collection(db, 'reviewHistory'),
          where('userId', '==', currentUser.uid)
        );
        const querySnapshot = await getDocs(q);

        const items = [];
        querySnapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() });
        });

        // Sort chronologically descending
        items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setHistoryItems(items);
      } catch (err) {
        console.error('Error fetching review history:', err);
        showToast('Something went wrong. Please try again.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [showToast]);

  // Download PDF directly from History list
  const handleDownloadPDF = async (reportId, lang) => {
    if (!reportId) return;

    try {
      showToast('Preparing PDF report...', 'info');

      // Fetch the full report details
      const docRef = doc(db, 'reviewReports', reportId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        showToast('Something went wrong. Please try again.', 'error');
        return;
      }

      const report = docSnap.data();

      // Owner validation check
      if (report.userId !== auth.currentUser.uid) {
        showToast('Something went wrong. Please try again.', 'error');
        return;
      }

      // Compile PDF
      const pdf = new jsPDF();
      const leftMargin = 15;
      let yOffset = 20;

      // Header
      pdf.setFont("Helvetica", "bold");
      pdf.setFontSize(22);
      pdf.setTextColor(30, 41, 59);
      pdf.text("Student Code Review Report", leftMargin, yOffset);
      yOffset += 8;

      pdf.setFont("Helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(100, 116, 139);
      pdf.text(`Generated on: ${new Date(report.createdAt).toLocaleString()}`, leftMargin, yOffset);
      yOffset += 5;
      pdf.text(`Student Account: ${auth.currentUser?.email}`, leftMargin, yOffset);
      yOffset += 5;
      pdf.text(`Programming Language: ${report.language}`, leftMargin, yOffset);
      yOffset += 5;
      pdf.text(`Overall Code Quality Score: ${report.score}%`, leftMargin, yOffset);
      yOffset += 8;

      // Divider Line
      pdf.setDrawColor(99, 102, 241);
      pdf.setLineWidth(1);
      pdf.line(leftMargin, yOffset, 195, yOffset);
      yOffset += 12;

      // Wrap and print sections helper
      const printSection = (title, items, isCode = false) => {
        if (yOffset > 250) {
          pdf.addPage();
          yOffset = 20;
        }

        pdf.setFont("Helvetica", "bold");
        pdf.setFontSize(13);
        pdf.setTextColor(15, 23, 42);
        pdf.text(title, leftMargin, yOffset);
        yOffset += 6;

        pdf.setFont("Helvetica", "normal");
        pdf.setFontSize(10);
        pdf.setTextColor(51, 65, 85);

        if (Array.isArray(items)) {
          if (items.length === 0) {
            pdf.text("• No issues detected.", leftMargin + 4, yOffset);
            yOffset += 6;
          } else {
            items.forEach((item) => {
              const textLine = `• ${item}`;
              const splitLines = pdf.splitTextToSize(textLine, 175);
              splitLines.forEach((line) => {
                if (yOffset > 275) {
                  pdf.addPage();
                  yOffset = 20;
                }
                pdf.text(line, leftMargin + 4, yOffset);
                yOffset += 5;
              });
            });
          }
        } else {
          const text = items || 'N/A';
          if (isCode) {
            pdf.setFont("Courier", "normal");
            pdf.setFontSize(8.5);
            pdf.setTextColor(30, 41, 59);
          }
          
          const splitLines = pdf.splitTextToSize(text, 175);
          splitLines.forEach((line) => {
            if (yOffset > 275) {
              pdf.addPage();
              yOffset = 20;
              if (isCode) {
                pdf.setFont("Courier", "normal");
                pdf.setFontSize(8.5);
              }
            }
            pdf.text(line, leftMargin, yOffset);
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


      pdf.save(`CodeReview_Report_${reportId.substring(0, 8)}.pdf`);
      showToast('Report downloaded successfully', 'success');
    } catch (err) {
      console.error('PDF creation error in history list:', err);
      showToast('Something went wrong. Please try again.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-400 font-medium">Fetching history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <HistoryIcon className="h-8 w-8 text-purple-400" />
          Review History
        </h1>
        <p className="text-slate-400 text-sm">
          Browse and download reports for your previously analyzed code files.
        </p>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden border border-slate-800">
        {historyItems.length === 0 ? (
          <div className="text-center py-20">
            <FileCode className="h-14 w-14 text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-400">No submissions found</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
              You haven't submitted any code snippets for review yet. Start your first analysis from the dashboard.
            </p>
            <Link to="/review" className="btn-primary mt-6 text-sm inline-block">
              Analyze New Code
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-dark-900 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Language</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-transparent text-slate-300">
                {historyItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/10 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString()}{' '}
                      <span className="text-slate-600 text-xs pl-1">
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded text-xs border border-slate-700/40">
                        {item.language}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {item.status === 'reviewed' ? (
                        <span className={`font-bold ${
                          item.score >= 80 ? 'text-emerald-400' : item.score >= 50 ? 'text-amber-400' : 'text-red-400'
                        }`}>
                          {item.score}%
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {item.status === 'reviewed' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-950/20 text-emerald-400 border border-emerald-900/30">
                          Reviewed
                        </span>
                      ) : item.status === 'failed' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-950/20 text-red-400 border border-red-900/30">
                          <AlertTriangle className="h-3 w-3" />
                          Failed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-950/20 text-blue-400 border border-blue-900/30">
                          <Clock className="h-3 w-3 animate-spin" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right space-x-2">
                      {item.status === 'reviewed' ? (
                        <>
                          <Link
                            to={`/result?reportId=${item.reportId}`}
                            className="inline-flex items-center gap-1 hover:text-white transition-colors bg-slate-900 border border-slate-800 hover:border-slate-700 font-medium text-xs px-3 py-1.5 rounded-lg"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </Link>
                          <button
                            onClick={() => handleDownloadPDF(item.reportId, item.language)}
                            className="inline-flex items-center gap-1 hover:text-white transition-colors bg-slate-900 border border-slate-800 hover:border-slate-700 font-medium text-xs px-3 py-1.5 rounded-lg"
                          >
                            <Download className="h-3.5 w-3.5" />
                            PDF
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-500">No actions</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
