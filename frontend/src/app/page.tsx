import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 dark:bg-slate-950 light:bg-slate-50 text-slate-100 dark:text-slate-100 light:text-slate-900 flex flex-col justify-between selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      {/* Header Navigation */}
      <header className="border-b border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 backdrop-blur-md bg-slate-950/60 dark:bg-slate-950/60 light:bg-white/80 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/25">
              Edu
            </div>
            <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400 dark:from-white dark:to-slate-400 light:from-slate-900 light:to-slate-700">
              AssignmentHub
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle showLabel={true} />
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/70 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/70 light:text-slate-700 light:hover:text-slate-900 light:hover:bg-slate-100 transition-all duration-200"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/40 transition-all duration-200"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-24 pb-20 max-w-7xl mx-auto text-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/15 blur-[140px] rounded-full pointer-events-none -z-10" />

        <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-8">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <span>Role-Based Assignment & Submission Platform</span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-black tracking-tight max-w-4xl mx-auto leading-tight mb-8">
          Streamlined Academic Workflows for{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            Next-Gen Education
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-12 font-normal leading-relaxed">
          Manage classes, assign coursework, track submissions in real time, and deliver actionable feedback across Admin, Teacher, and Student roles.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/30 hover:shadow-indigo-500/40 transition-all duration-200 transform hover:-translate-y-0.5"
          >
            Create Account
          </Link>
          <a
            href="http://localhost:5000/swagger"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold text-slate-300 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 transition-all duration-200"
          >
            Explore OpenAPI / Swagger
          </a>
        </div>
      </section>

      {/* Role Feature Cards */}
      <section className="px-6 py-16 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Admin Role */}
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/50 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xl mb-6 group-hover:scale-110 transition-transform duration-300">
              ⚡
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Admin Portal</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Comprehensive control over academic years, class creations, subject mapping, teacher assignments, and student enrollments.
            </p>
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Role: Administrator</span>
          </div>

          {/* Teacher Role */}
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-purple-500/50 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xl mb-6 group-hover:scale-110 transition-transform duration-300">
              📚
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Teacher Hub</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              Draft, publish, and schedule assignments. Grade student submissions, deliver detailed feedback, and request resubmissions.
            </p>
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Role: Educator</span>
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
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Role-Based Assignment & Submission Management System. Built with ASP.NET Core & Next.js.</p>
          <div className="flex space-x-6 text-slate-400">
            <a href="http://localhost:5000/swagger" className="hover:text-white transition-colors">Swagger Documentation</a>
            <span className="text-slate-700">|</span>
            <span className="text-indigo-400">PostgreSQL + EF Core</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
