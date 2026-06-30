import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useToast } from '../components/ToastContext';
import { User, Mail, LogOut, Award, ShieldAlert, GraduationCap } from 'lucide-react';

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ name: 'Student', email: '' });
  const [totalReviews, setTotalReviews] = useState(0);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchProfileData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        // 1. Fetch User Profile
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        let name = 'Student';
        let email = currentUser.email || '';

        if (userDoc.exists()) {
          const data = userDoc.data();
          name = data.name || name;
          email = data.email || email;
        }

        setProfile({ name, email });

        // 2. Fetch Review count internally (avoiding full documents fetch for performance, but simple size works)
        const q = query(
          collection(db, 'reviewHistory'),
          where('userId', '==', currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        setTotalReviews(querySnapshot.size);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        showToast('Something went wrong. Please try again.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [showToast]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      showToast('Logged out successfully', 'success');
      navigate('/login');
    } catch (err) {
      showToast('Something went wrong. Please try again.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-400 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      <div className="glass-panel p-8 rounded-2xl border border-slate-800/80 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-2xl"></div>

        {/* Profile Header */}
        <div className="flex flex-col items-center text-center pb-8 border-b border-slate-800">
          <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 mb-4 border-2 border-slate-800">
            <User className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-950/20 text-purple-400 border border-purple-900/30 mt-2">
            <GraduationCap className="h-3.5 w-3.5" />
            Student Account
          </span>
        </div>

        {/* Profile details */}
        <div className="py-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Email Field */}
            <div className="p-4 rounded-xl bg-dark-900/50 border border-slate-800/50 flex items-start gap-3">
              <Mail className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</p>
                <p className="text-sm font-medium text-slate-200 mt-1">{profile.email}</p>
              </div>
            </div>

            {/* Total reviews */}
            <div className="p-4 rounded-xl bg-dark-900/50 border border-slate-800/50 flex items-start gap-3">
              <Award className="h-5 w-5 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Reviews Made</p>
                <p className="text-sm font-medium text-slate-200 mt-1">{totalReviews}</p>
              </div>
            </div>

          </div>

          {/* Privacy statement */}
          <div className="flex items-center gap-2 p-3.5 bg-blue-950/20 border border-blue-900/30 rounded-xl text-xs text-blue-300">
            <ShieldAlert className="h-4.5 w-4.5 text-blue-400 shrink-0" />
            <span>All reviews are securely mapped. Your code submissions are treated as private text and analyzed locally.</span>
          </div>
        </div>

        {/* Logout Button */}
        <div className="flex justify-center pt-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 hover:border-red-900/50 text-red-300 font-semibold py-2.5 px-6 rounded-lg transition-all w-full sm:w-auto"
          >
            <LogOut className="h-4 w-4" />
            Secure Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
