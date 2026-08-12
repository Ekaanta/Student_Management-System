"use client";

import React, { useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { AuthResponse } from "@/types";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AlertCircle, Shield, BookOpen, GraduationCap } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please fill in both Email and Password.");
      return;
    }

    setIsSubmitting(true);
    const res = await apiClient<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    setIsSubmitting(false);

    if (res.success && res.data) {
      login(res.data);
    } else {
      setError(res.message || "Invalid credentials. Please verify your email & password.");
    }
  };

  const handleDemoFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Password123!");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center py-6 sm:py-12 px-3 sm:px-6 lg:px-8 selection:bg-indigo-500 selection:text-white relative transition-colors duration-300">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle showLabel={true} />
      </div>
      <div className="w-full sm:mx-auto sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center space-x-3 mb-4 sm:mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-lg sm:text-xl">
            OP
          </div>
          <span className="text-xl sm:text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
            OnnoRokom Projukti
          </span>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">Sign in to your account</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 font-normal">
          Or{" "}
          <Link href="/register" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline transition-colors">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-6 sm:mt-8 w-full sm:mx-auto sm:max-w-md">
        <div className="w-full bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/90 p-5 sm:p-10 rounded-2xl backdrop-blur-xl space-y-6 shadow-sm">
          {error && (
            <div className="p-4 rounded-md bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300 text-sm flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Login Preset Buttons */}
          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => handleDemoFill("admin@example.com")}
              className="px-3 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-500 hover:text-white text-xs font-bold transition-all text-center flex items-center justify-center space-x-1.5"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill("teacher@example.com")}
              className="px-3 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-300 hover:bg-purple-500 hover:text-white text-xs font-bold transition-all text-center flex items-center justify-center space-x-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Teacher</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill("student@example.com")}
              className="px-3 py-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-600 dark:text-pink-300 hover:bg-pink-500 hover:text-white text-xs font-bold transition-all text-center flex items-center justify-center space-x-1.5"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student</span>
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@example.com"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
