"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Shield, BookOpen, GraduationCap } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative transition-colors duration-300">
      {/* Header Bar */}
      <header className="border-b border-slate-200 dark:border-slate-800/80 px-3 sm:px-6 py-3 sm:py-4 backdrop-blur-xl bg-white/70 dark:bg-slate-950/70 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2.5 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-base sm:text-lg shadow-lg shadow-indigo-500/20 shrink-0">
              OP
            </div>
            <span className="text-base sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 dark:from-white dark:via-slate-100 dark:to-slate-400 truncate">
              OnnoRokom Projukti
            </span>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-4 shrink-0">
            <ThemeToggle showLabel={false} />
            <Link
              href="/login"
              className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-all whitespace-nowrap"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all whitespace-nowrap"
            >
              Create Account
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-20 text-center flex-1 flex flex-col items-center justify-center">
        <h1 className="text-3xl sm:text-5xl lg:text-7xl font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-slate-900 via-slate-800 to-slate-600 dark:from-white dark:via-slate-100 dark:to-slate-400 max-w-5xl leading-tight mb-6 sm:mb-8">
          OnnoRokom Projukti Assignment & Task Management Platform
        </h1>

        <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed mb-8 sm:mb-12 font-normal">
          A centralized digital hub built for Administrators, Teachers, and Students. Publish coursework, manage deadlines, submit answers, and evaluate performance in real-time.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-md">
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all transform hover:-translate-y-0.5 text-center shadow-lg shadow-indigo-600/25"
          >
            Launch Portal &rarr;
          </Link>
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-3.5 sm:py-4 rounded-xl text-base font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all text-center"
          >
            Register Account
          </Link>
        </div>
      </section>

      {/* Role Feature Highlights */}
      <section className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-8 sm:py-12 border-t border-slate-200 dark:border-slate-800/50 transition-colors duration-300">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 w-full">
          {/* Admin Role */}
          <div className="w-full p-5 sm:p-8 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 hover:border-indigo-500/50 transition-all duration-300 group flex flex-col justify-between shadow-sm hover:shadow-md">
            <div>
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xl mb-5 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-2.5 sm:mb-3">Admin Control</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4 font-normal">
                Manage system users, school classes, academic subjects, and teacher-class assignments with complete administrative governance.
              </p>
            </div>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Role: Administrator</span>
          </div>

          {/* Teacher Role */}
          <div className="w-full p-5 sm:p-8 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 hover:border-purple-500/50 transition-all duration-300 group flex flex-col justify-between shadow-sm hover:shadow-md">
            <div>
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xl mb-5 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-2.5 sm:mb-3">Teacher Workflows</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4 font-normal">
                Create and publish assignments, set strict submission due dates, review student coursework, and assign numerical grades with feedback.
              </p>
            </div>
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Role: Teacher</span>
          </div>

          {/* Student Role */}
          <div className="w-full p-5 sm:p-8 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 hover:border-pink-500/50 transition-all duration-300 group flex flex-col justify-between shadow-sm hover:shadow-md">
            <div>
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold text-xl mb-5 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-2.5 sm:mb-3">Student Portal</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4 font-normal">
                View active coursework across enrolled classes, submit assignments before deadlines, attach materials, and track grades.
              </p>
            </div>
            <span className="text-xs font-semibold text-pink-600 dark:text-pink-400 uppercase tracking-wider">Role: Student</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 py-6 sm:py-8 px-4 text-center text-slate-500 dark:text-slate-500 text-xs sm:text-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <p>© 2026 OnnoRokom Projukti Assignment & Task Management Platform.</p>
        </div>
      </footer>
    </main>
  );
}
