import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useToast } from '../components/ToastContext';
import { User, Mail, Lock, ShieldCheck, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      showToast('Please fill in all fields.', 'error');
      return;
    }

    setLoading(true);

    try {
      // 1. Create user in internal Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Save user profile internally using UID as document ID
      const userProfile = {
        uid: user.uid,
        name: name,
        email: email,
        role: 'student',
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);

      showToast('Welcome! Account created successfully', 'success');
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration internal error:', error.code, error.message);
      
      // Friendly User-facing error message mapping
      if (error.code === 'auth/email-already-in-use') {
        showToast('Account already exists.', 'error');
      } else if (error.code === 'auth/invalid-email') {
        showToast('Invalid email address format.', 'error');
      } else if (error.code === 'auth/weak-password') {
        showToast('Password should be at least 6 characters.', 'error');
      } else {
        showToast('Something went wrong. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100-16rem)] flex items-center justify-center px-4 py-12">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-purple-500/5 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel p-8 rounded-2xl shadow-xl">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 mb-4 border border-purple-500/20 shadow-inner">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Create your account</h2>
          <p className="mt-2 text-sm text-slate-400">Secure signup • Your data is private</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          {/* Name Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-dark-900/60 border border-slate-800/80 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all"
                placeholder="Alex Smith"
                required
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-dark-900/60 border border-slate-800/80 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all"
                placeholder="alex@example.edu"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-dark-900/60 border border-slate-800/80 rounded-lg py-2.5 pl-10 pr-10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <span className="h-5 w-5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                Register Account
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
            Secure login
          </Link>
        </p>
      </div>
    </div>
  );
}
