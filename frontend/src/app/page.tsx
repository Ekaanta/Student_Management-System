"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative">
      {/* Header Bar */}
      <header className="border-b border-slate-800/80 px-6 py-4 backdrop-blur-xl bg-slate-950/70 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-indigo-500/20">
              Edu
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              AssignmentHub
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle showLabel={false} />
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all"
            >
              Create Account
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center flex-1 flex flex-col items-center justify-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-8 animate-pulse">
          <span>⚡ Enterprise Role-Based Coursework Portal</span>
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-slate-100 to-slate-400 max-w-4xl leading-tight mb-8">
          Seamless Assignment & Submission Management
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl leading-relaxed mb-12">
          A centralized digital hub built for Administrators, Teachers, and Students. Publish coursework, manage deadlines, submit answers, and evaluate performance in real-time.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-xl shadow-indigo-600/25 transition-all transform hover:-translate-y-0.5"
          >
            Launch Portal &rarr;
          </Link>
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-semibold text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white transition-all"
          >
            Register Account
          </Link>
        </div>
      </section>

      {/* Role Feature Highlights */}
      <section className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-800/50 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Admin Role */}
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/50 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xl mb-6 group-hover:scale-110 transition-transform duration-300">
              👑
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Admin Control</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Manage system users, school classes, academic subjects, and teacher-class assignments with complete administrative governance.
            </p>
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Role: Administrator</span>
          </div>

          {/* Teacher Role */}
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-purple-500/50 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xl mb-6 group-hover:scale-110 transition-transform duration-300">
              📚
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Teacher Workflows</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Create and publish assignments, set strict submission due dates, review student coursework, and assign numerical grades with feedback.
            </p>
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Role: Teacher</span>
          </div>

          {/* Student Role */}
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-pink-500/50 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-xl mb-6 group-hover:scale-110 transition-transform duration-300">
              🎓
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Student Portal</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              View active coursework across enrolled classes, submit assignments before deadlines, attach materials, and track grades.
            </p>
            <span className="text-xs font-semibold text-pink-400 uppercase tracking-wider">Role: Student</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-6 text-center text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <p>© 2026 Role-Based Assignment & Submission Management System. Built with ASP.NET Core & Next.js.</p>
        </div>
      </footer>
    </main>
  );
}
