import React from 'react';
import { Link } from 'react-router-dom';
import { Code, Cpu, Terminal, Shield, Zap, Sparkles, BookOpen } from 'lucide-react';

export default function Landing() {
  const features = [
    {
      title: 'Bugs & Errors Detection',
      desc: 'Pinpoint syntax issues, missing brackets, logic errors, and bad runtime assumptions in your code instantly.',
      icon: Terminal,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Performance & Complexity',
      desc: 'Understand the time and space complexity of your code with simple explanations showing you how to scale it.',
      icon: Cpu,
      color: 'from-indigo-500 to-purple-500',
    },
    {
      title: 'Security Auditing',
      desc: 'Identify memory leaks, SQL injection holes, or standard vulnerabilities before they cause problems.',
      icon: Shield,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Beginner-Friendly Explanations',
      desc: 'No complex jargon. Receive simple English tutorials on why the change helps you learn programming.',
      icon: BookOpen,
      color: 'from-pink-500 to-rose-500',
    },
  ];

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full max-w-7xl px-4 pt-20 pb-16 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] bg-indigo-500/10 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-xs font-semibold text-indigo-300 mb-6 backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Interactive Student Coding Partner</span>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl max-w-3xl leading-tight">
          Level Up Your Programming with{' '}
          <span className="text-gradient">AI-Powered Reviews</span>
        </h1>
        <p className="mt-6 text-lg text-slate-400 max-w-2xl">
          Paste your code or load a file locally to review bugs, optimize complexity, and view beginner-friendly tutorials. Private, secure, and built specifically for computer science students.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link to="/register" className="btn-primary px-8 py-3.5 text-base">
            Create Free Account
          </Link>
          <Link to="/login" className="btn-secondary px-8 py-3.5 text-base">
            Sign In
          </Link>
        </div>

        {/* Hero Code Preview Board */}
        <div className="mt-16 w-full max-w-4xl rounded-xl border border-slate-800/80 bg-slate-950/80 p-1.5 shadow-2xl backdrop-blur-md">
          <div className="rounded-lg border border-slate-800 bg-dark-900/90 overflow-hidden text-left">
            {/* Window bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-dark-950/80">
              <div className="flex gap-1.5">
                <span className="h-3.5 w-3.5 rounded-full bg-red-500/80"></span>
                <span className="h-3.5 w-3.5 rounded-full bg-yellow-500/80"></span>
                <span className="h-3.5 w-3.5 rounded-full bg-green-500/80"></span>
              </div>
              <span className="text-xs font-medium text-slate-500">review_assistant.py</span>
              <div className="w-8"></div>
            </div>
            {/* Editor content */}
            <pre className="p-6 overflow-x-auto text-sm code-font text-slate-300">
              <code>
                <span className="text-purple-400">def</span> <span className="text-blue-400">analyze_performance</span>(student_code):{'\n'}
                {'    '}<span className="text-slate-500"># Reviews time complexity and space allocation</span>{'\n'}
                {'    '}complexity = <span className="text-yellow-400">"Time: O(N) | Space: O(1)"</span>{'\n'}
                {'    '}bugs = check_for_logical_errors(student_code){'\n'}
                {'    '}suggestions = generate_friendly_tutoring_explanation(bugs){'\n'}
                {'    '}<span className="text-purple-400">return</span> {'{'} {'\n'}
                {'        '}<span className="text-yellow-400">"score"</span>: 88,{'\n'}
                {'        '}<span className="text-yellow-400">"bugs"</span>: bugs,{'\n'}
                {'        '}<span className="text-yellow-400">"complexity"</span>: complexity,{'\n'}
                {'        '}<span className="text-yellow-400">"explanation"</span>: suggestions{'\n'}
                {'    '}{'}'}
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 border-t border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Everything You Need to Master Coding
          </h2>
          <p className="mt-4 text-slate-400">
            Get instant feedforward guidance on your lab exercises, homework assignments, and personal coding projects.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={i} className="glass-panel glass-panel-hover p-6 rounded-xl flex flex-col">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-tr ${feature.color} text-white shadow-md mb-5`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed flex-grow">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
