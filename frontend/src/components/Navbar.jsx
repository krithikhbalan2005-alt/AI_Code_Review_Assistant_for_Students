import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Code, LogOut, User, History, LayoutDashboard, Menu, X, PlusCircle } from 'lucide-react';
import { useToast } from './ToastContext';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      showToast('Logged out successfully', 'success');
      navigate('/login');
      setMenuOpen(false);
    } catch (err) {
      showToast('Something went wrong. Please try again.', 'error');
    }
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/review', label: 'New Review', icon: PlusCircle },
    { path: '/history', label: 'History', icon: History },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-800/60 bg-dark-900/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 text-white shadow-md shadow-indigo-500/20">
              <Code className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              CodeReview<span className="text-purple-400">.AI</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          {user ? (
            <div className="hidden md:flex md:items-center md:gap-6">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-1.5 text-sm font-medium transition-colors py-1.5 px-3 rounded-md ${
                      isActive(link.path)
                        ? 'text-white bg-slate-800/50'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-red-400 transition-colors py-1.5 px-3 rounded-md"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="hidden md:flex md:items-center md:gap-4">
              <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary py-2 px-4 text-sm">
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-slate-400 hover:text-slate-200 focus:outline-none p-1"
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden glass-panel border-x-0 border-t border-slate-800/80 px-4 py-3 space-y-2">
          {user ? (
            <>
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                      isActive(link.path)
                        ? 'text-white bg-slate-800/60'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 py-2.5 px-3 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-950/10 transition-all text-left"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2 pb-1">
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white border border-slate-700/60 hover:bg-slate-800/30 transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center py-2.5 rounded-lg text-sm font-medium btn-primary text-center"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
