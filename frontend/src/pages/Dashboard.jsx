import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useToast } from '../components/ToastContext';
import { PlusCircle, History, User, Award, FileCode, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState('Student');
  const [stats, setStats] = useState({ total: 0, averageScore: 0 });
  const [recentReviews, setRecentReviews] = useState([]);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        // 1. Fetch User Profile for display name
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setStudentName(userDoc.data().name || 'Student');
        }

        // 2. Fetch Review History (Filter by userId)
        // We fetch all reviews and sort in memory to avoid Firestore Index requirement issues
        const historyQuery = query(
          collection(db, 'reviewHistory'),
          where('userId', '==', currentUser.uid)
        );
        const querySnapshot = await getDocs(historyQuery);
        
        const historyData = [];
        querySnapshot.forEach((doc) => {
          historyData.push({ id: doc.id, ...doc.data() });
        });

        // Sort by createdAt descending
        historyData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Calculate stats
        const total = historyData.length;
        const reviewedCodes = historyData.filter((r) => r.status === 'reviewed' && typeof r.score === 'number');
        const averageScore =
          reviewedCodes.length > 0
            ? Math.round(reviewedCodes.reduce((sum, item) => sum + item.score, 0) / reviewedCodes.length)
            : 0;

        setStats({ total, averageScore });
        setRecentReviews(historyData.slice(0, 4)); // Get top 4 recent reviews
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        showToast('Something went wrong. Please try again.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [showToast]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-400 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Welcome Banner */}
      <div className="glass-panel p-8 rounded-2xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome back, {studentName}!</h1>
          <p className="text-slate-400 text-sm max-w-lg">
            Ready to review your next coding assignment? Select your language, paste or upload your code, and receive real-time, beginner-friendly feedback.
          </p>
        </div>
        <Link to="/review" className="btn-primary flex items-center gap-2 shrink-0">
          <PlusCircle className="h-5 w-5" />
          Start New Review
        </Link>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {/* Total Reviews Card */}
        <div className="glass-panel p-6 rounded-xl flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <FileCode className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Reviews</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
          </div>
        </div>

        {/* Average Score Card */}
        <div className="glass-panel p-6 rounded-xl flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Average Quality Score</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.averageScore}%</p>
          </div>
        </div>

        {/* Learning Hub Shortcut */}
        <div className="glass-panel p-6 rounded-xl flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
            <History className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">History Log</p>
            <Link to="/history" className="text-sm font-semibold text-pink-400 hover:text-pink-300 transition-colors flex items-center gap-1 mt-1">
              View previous reviews
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Reviews Table/Cards */}
      <div className="glass-panel rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Clock className="h-5 w-5 text-indigo-400" />
          Recent Submissions
        </h2>

        {recentReviews.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-800/80 rounded-xl">
            <FileCode className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No code reviews yet</p>
            <p className="text-slate-500 text-xs mt-1">Submit your first code snippet to receive detailed feedback.</p>
            <Link to="/review" className="btn-primary mt-4 py-2 px-4 text-xs inline-flex items-center gap-1.5">
              <PlusCircle className="h-4 w-4" />
              Analyze Code Now
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentReviews.map((review) => (
              <div
                key={review.id}
                className="p-4 rounded-lg bg-dark-900/50 border border-slate-800/80 hover:border-indigo-500/20 transition-all flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-slate-200 text-sm">
                      {review.fileName || 'Pasted Code Snippet'}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded font-mono">
                        {review.language}
                      </span>
                      <span className="text-slate-500 text-xs">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    {review.status === 'reviewed' ? (
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-slate-500 uppercase font-semibold">Score</span>
                        <span className={`text-lg font-bold ${
                          review.score >= 80 ? 'text-emerald-400' : review.score >= 50 ? 'text-amber-400' : 'text-red-400'
                        }`}>
                          {review.score}%
                        </span>
                      </div>
                    ) : review.status === 'failed' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-950/20 text-red-400 border border-red-900/30">
                        <AlertTriangle className="h-3 w-3" />
                        Failed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-950/20 text-blue-400 border border-blue-900/30 animate-pulse">
                        <Clock className="h-3 w-3" />
                        Pending
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  {review.status === 'reviewed' ? (
                    <Link
                      to={`/result?reportId=${review.reportId}`}
                      className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      View Full Report →
                    </Link>
                  ) : (
                    <span className="text-xs text-slate-600">Report unavailable</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
