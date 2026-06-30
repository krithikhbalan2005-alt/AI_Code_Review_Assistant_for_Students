import React from 'react';
import { ShieldCheck, ShieldAlert, Database } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-900 bg-dark-950/80 py-8 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row text-center sm:text-left">
          {/* Left: Brand */}
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold tracking-wide text-slate-300">
              CodeReview<span className="text-purple-400">.AI</span>
            </span>
            <span className="text-xs text-slate-500">
              © {new Date().getFullYear()} CodeReview.AI. Helping students learn programming.
            </span>
          </div>

          {/* Right: Security highlights */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 bg-slate-900/60 py-1.5 px-3 rounded-full border border-slate-800/40">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
              <span>Your reviews are saved safely</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/60 py-1.5 px-3 rounded-full border border-slate-800/40">
              <Database className="h-3.5 w-3.5 text-purple-400" />
              <span>Files are read locally</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/60 py-1.5 px-3 rounded-full border border-slate-800/40">
              <ShieldAlert className="h-3.5 w-3.5 text-pink-400" />
              <span>Your data is private</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
