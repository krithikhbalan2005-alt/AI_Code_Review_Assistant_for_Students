import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useToast } from '../components/ToastContext';
import { Code2, Upload, FileText, Play, AlertTriangle, ShieldCheck } from 'lucide-react';

const SUPPORTED_LANGUAGES = ['C', 'C++', 'Java', 'Python', 'JavaScript', 'PHP', 'Others'];
const SUPPORTED_EXTENSIONS = ['.js', '.py', '.java', '.cpp', '.c', '.php', '.txt'];
const MAX_FILE_SIZE_MB = 5;

export default function CodeReview() {
  const [language, setLanguage] = useState('');
  const [codeText, setCodeText] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Handle local file upload via FileReader API
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (limit to 5MB)
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > MAX_FILE_SIZE_MB) {
      showToast('File is too large. Limit file size to 5MB.', 'error');
      return;
    }

    // Validate type (check extension)
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
      showToast('Supported file types: .js, .py, .java, .cpp, .c, .php, .txt', 'error');
      return;
    }

    // Read file locally using FileReader
    const reader = new FileReader();
    reader.onload = (event) => {
      setCodeText(event.target.result);
      setFileName(file.name);
      
      // Auto-detect language based on extension
      if (ext === '.js') setLanguage('JavaScript');
      else if (ext === '.py') setLanguage('Python');
      else if (ext === '.java') setLanguage('Java');
      else if (ext === '.cpp') setLanguage('C++');
      else if (ext === '.c') setLanguage('C');
      else if (ext === '.php') setLanguage('PHP');
      
      showToast('File loaded locally successfully.', 'success');
    };
    reader.onerror = () => {
      showToast('Something went wrong. Please try again.', 'error');
    };
    reader.readAsText(file);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Submit Code to Backend
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      showToast('Session expired. Please log in again.', 'error');
      return;
    }

    if (!language) {
      showToast('Please select a programming language.', 'error');
      return;
    }

    if (!codeText.trim()) {
      showToast('Please enter some code to review.', 'error');
      return;
    }

    setLoading(true);

    // 1. Generate unique submission ID
    const submissionRef = doc(collection(db, 'codeSubmissions'));
    const submissionId = submissionRef.id;

    try {
      // 2. Call Express Backend (AI Bridge)
      // Call backend route directly (without exposing keys in frontend)
      const response = await fetch('http://localhost:5000/api/review-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language,
          codeText,
        }),
      });

      if (!response.ok) {
        throw new Error('Backend review endpoint returned non-200 response.');
      }

      const reviewData = await response.json();

      // 3. Save Code Submission Document internally
      await setDoc(submissionRef, {
        submissionId,
        userId: currentUser.uid,
        language,
        codeText,
        fileName: fileName || null,
        createdAt: new Date().toISOString(),
        status: 'reviewed',
      });

      // 4. Save Review Report Document internally
      const reportRef = doc(collection(db, 'reviewReports'));
      const reportId = reportRef.id;

      await setDoc(reportRef, {
        reportId,
        submissionId,
        userId: currentUser.uid,
        language,
        score: reviewData.score,
        bugs: reviewData.bugs,
        suggestions: reviewData.suggestions,
        securityIssues: reviewData.securityIssues,
        optimizedCode: reviewData.optimizedCode,
        complexityAnalysis: reviewData.complexityAnalysis,
        beginnerExplanation: reviewData.beginnerExplanation,
        originalCode: codeText,
        createdAt: new Date().toISOString(),
      });

      // 5. Save Review History Log internally
      const historyRef = doc(collection(db, 'reviewHistory'));
      const historyId = historyRef.id;

      await setDoc(historyRef, {
        historyId,
        userId: currentUser.uid,
        submissionId,
        reportId,
        language,
        score: reviewData.score,
        status: 'reviewed',
        createdAt: new Date().toISOString(),
      });

      showToast('Review saved successfully', 'success');
      navigate(`/result?reportId=${reportId}`);
    } catch (err) {
      console.error('Error during code review submit flow:', err);

      // Save submission as failed in Firestore so student keeps log
      try {
        await setDoc(submissionRef, {
          submissionId,
          userId: currentUser.uid,
          language,
          codeText,
          fileName: fileName || null,
          createdAt: new Date().toISOString(),
          status: 'failed',
        });

        // Also add failed history record
        const historyRef = doc(collection(db, 'reviewHistory'));
        await setDoc(historyRef, {
          historyId: historyRef.id,
          userId: currentUser.uid,
          submissionId,
          reportId: null,
          language,
          score: null,
          status: 'failed',
          createdAt: new Date().toISOString(),
        });
      } catch (dbErr) {
        console.error('Failed to log failed submission in database:', dbErr);
      }

      showToast('AI review failed. Please try again later.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Code2 className="h-8 w-8 text-blue-500" />
          Analyze Your Code
        </h1>
        <p className="text-slate-400 text-sm">
          Get real-time tutor feedback on syntax, logic, security bugs, and efficiency.
        </p>
      </div>

      <form onSubmit={handleSubmitReview} className="space-y-6">
        {/* Settings Bar */}
        <div className="glass-panel p-5 rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Select Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-dark-900 border border-slate-800 rounded-lg py-2.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              required
            >
              <option value="" disabled>-- Choose a Language --</option>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Local File Import
            </span>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".js,.py,.java,.cpp,.c,.php,.txt"
            />
            <button
              type="button"
              onClick={triggerFileInput}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg py-2.5 px-3 text-sm text-slate-300 font-medium transition-colors"
            >
              <Upload className="h-4 w-4 text-purple-400" />
              {fileName ? `Loaded: ${fileName}` : 'Upload Local File (<5MB)'}
            </button>
          </div>
        </div>

        {/* Local File Privacy Notice */}
        <div className="flex items-center gap-2 p-3 bg-blue-950/20 border border-blue-900/30 rounded-lg text-xs text-blue-300">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <span>Uploaded files are read locally and are not stored in cloud storage. Files are read as plain text and not executed.</span>
        </div>

        {/* Editor Area */}
        <div className="glass-panel rounded-xl overflow-hidden border border-slate-800">
          {/* Header */}
          <div className="bg-dark-900/80 border-b border-slate-800/80 px-4 py-2.5 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              {language ? language : 'Source Code Editor'}
            </span>
            <div className="flex gap-1.5">
              <span className="h-2 w-2 rounded-full bg-slate-700"></span>
              <span className="h-2 w-2 rounded-full bg-slate-700"></span>
              <span className="h-2 w-2 rounded-full bg-slate-700"></span>
            </div>
          </div>
          {/* Text Area */}
          <textarea
            value={codeText}
            onChange={(e) => setCodeText(e.target.value)}
            placeholder="// Paste your code here, or upload a local code file above..."
            className="w-full h-96 bg-dark-950/60 p-6 text-sm text-slate-200 code-font placeholder-slate-600 focus:outline-none resize-y min-h-[200px]"
            style={{ tabSize: 4 }}
          />
        </div>

        {/* Submit review */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2 px-8 py-3 w-full sm:w-auto"
          >
            {loading ? (
              <>
                <span className="h-5 w-5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin"></span>
                Reviewing Code...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-white" />
                Submit Code Review
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
