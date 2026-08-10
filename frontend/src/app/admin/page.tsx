"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import {
  Users,
  UserCheck,
  GraduationCap,
  School,
  BookOpen,
  FileText,
  Inbox,
  AlertCircle,
} from "lucide-react";

interface AdminOverviewStats {
  totalUsers: number;
  totalTeachers: number;
  totalStudents: number;
  totalClasses: number;
  totalSubjects: number;
  totalAssignments: number;
  totalSubmissions: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminOverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    const res = await apiClient<AdminOverviewStats>("/admin/overview");
    setLoading(false);
    if (res.success && res.data) {
      setStats(res.data);
    } else {
      setError(res.message || "Failed to load system overview stats.");
    }
  };

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20", border: "border-blue-500/30", text: "text-blue-600 dark:text-blue-400" },
    { label: "Teachers", value: stats?.totalTeachers ?? 0, icon: UserCheck, color: "from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20", border: "border-purple-500/30", text: "text-purple-600 dark:text-purple-400" },
    { label: "Students", value: stats?.totalStudents ?? 0, icon: GraduationCap, color: "from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20", border: "border-emerald-500/30", text: "text-emerald-600 dark:text-emerald-400" },
    { label: "Classes / Courses", value: stats?.totalClasses ?? 0, icon: School, color: "from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20", border: "border-amber-500/30", text: "text-amber-600 dark:text-amber-400" },
    { label: "Subjects", value: stats?.totalSubjects ?? 0, icon: BookOpen, color: "from-pink-500/10 to-rose-500/10 dark:from-pink-500/20 dark:to-rose-500/20", border: "border-pink-500/30", text: "text-pink-600 dark:text-pink-400" },
    { label: "Total Assignments", value: stats?.totalAssignments ?? 0, icon: FileText, color: "from-cyan-500/10 to-blue-500/10 dark:from-cyan-500/20 dark:to-blue-500/20", border: "border-cyan-500/30", text: "text-cyan-600 dark:text-cyan-400" },
    { label: "Submissions Delivered", value: stats?.totalSubmissions ?? 0, icon: Inbox, color: "from-violet-500/10 to-purple-500/10 dark:from-violet-500/20 dark:to-purple-500/20", border: "border-violet-500/30", text: "text-violet-600 dark:text-violet-400" },
  ];

  return (
    <div className="space-y-8 w-full">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">System Overview</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Real-time statistics across users, classes, subjects, and academic submissions.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300 text-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
          <button onClick={fetchStats} className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-xs font-bold">
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className={`p-6 rounded-2xl bg-gradient-to-br ${card.color} border ${card.border} backdrop-blur-xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-200 shadow-sm`}
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon className={`w-7 h-7 ${card.text}`} />
                  <span className={`text-xs font-extrabold uppercase tracking-wider ${card.text}`}>System Metric</span>
                </div>
                <p className="text-3xl font-black text-slate-900 dark:text-white mb-1">{card.value}</p>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{card.label}</p>
              </div>
            );
          })}
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Quick Management Shortcuts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href="/admin/users"
            className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 transition-all duration-200 group shadow-sm flex flex-col justify-between"
          >
            <div>
              <Users className="w-7 h-7 text-indigo-500 mb-3" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Manage Users</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Create, update roles, or deactivate system accounts.</p>
            </div>
          </Link>

          <Link
            href="/admin/classes"
            className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 transition-all duration-200 group shadow-sm flex flex-col justify-between"
          >
            <div>
              <School className="w-7 h-7 text-amber-500 mb-3" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Manage Classes</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Configure grade sections, academic years, and class codes.</p>
            </div>
          </Link>

          <Link
            href="/admin/subjects"
            className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-pink-500/50 transition-all duration-200 group shadow-sm flex flex-col justify-between"
          >
            <div>
              <BookOpen className="w-7 h-7 text-pink-500 mb-3" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">Manage Subjects</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Add course modules and academic curriculum subjects.</p>
            </div>
          </Link>

          <Link
            href="/admin/teacher-assignments"
            className="p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 transition-all duration-200 group shadow-sm flex flex-col justify-between"
          >
            <div>
              <UserCheck className="w-7 h-7 text-purple-500 mb-3" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Assign Teachers</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Link designated educators to class-subject pairs.</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
