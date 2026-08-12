"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { StudentAssignmentDto, StudentClassDto } from "@/types";
import {
  GraduationCap,
  Clock,
  CheckCircle2,
  Award,
  BookOpen,
  ArrowRight,
} from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<StudentClassDto[]>([]);
  const [assignments, setAssignments] = useState<StudentAssignmentDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    const [clsRes, assignRes] = await Promise.all([
      apiClient<StudentClassDto[]>("/student/classes"),
      apiClient<StudentAssignmentDto[]>("/student/assignments"),
    ]);

    if (clsRes.success && clsRes.data) setClasses(clsRes.data);
    if (assignRes.success && assignRes.data) setAssignments(assignRes.data);
    else if (!clsRes.success && !assignRes.success) {
      setError(clsRes.message || assignRes.message || "Failed to load student dashboard.");
    }

    setIsLoading(false);
  };

  const pendingAssignments = assignments.filter((a) => !a.hasSubmitted && !a.isOverdue);
  const submittedAssignments = assignments.filter((a) => a.hasSubmitted);
  const gradedAssignments = assignments.filter((a) => a.studentGrade !== null && a.studentGrade !== undefined);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-400">Loading Student Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 w-full">
      {/* Welcome Banner */}
      <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 bg-gradient-to-r from-slate-900 via-pink-950 to-purple-950 p-5 sm:p-8 rounded-2xl border border-pink-800/50 shadow-sm">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-pink-300">Student Portal</span>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white mt-1">Welcome, {user?.firstName}!</h1>
          <p className="text-slate-200 text-xs sm:text-sm mt-1 font-normal leading-relaxed">
            Track active coursework across your enrolled classes, submit assignments before deadlines, and view teacher feedback.
          </p>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <Link
            href="/student/assignments"
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-semibold text-sm transition-all inline-flex items-center justify-center space-x-2 shadow-lg shadow-pink-600/25"
          >
            <span>Browse Coursework</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm font-normal">
          {error}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
        <div className="w-full p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Enrolled Classes</span>
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center font-semibold">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-semibold text-slate-900 dark:text-white mt-4">{classes.length}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">Active class sections</p>
        </div>

        <div className="w-full p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pending Tasks</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-semibold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-semibold text-amber-600 dark:text-amber-400 mt-4">{pendingAssignments.length}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">Due soon for submission</p>
        </div>

        <div className="w-full p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Submitted Work</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-semibold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-semibold text-emerald-600 dark:text-emerald-400 mt-4">{submittedAssignments.length}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">Completed submissions</p>
        </div>

        <div className="w-full p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Graded Results</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-semibold">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-semibold text-purple-600 dark:text-purple-400 mt-4">{gradedAssignments.length}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">Reviewed by teacher</p>
        </div>
      </div>

      {/* Main Grid: Active Coursework & Enrolled Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 w-full">
        {/* Active Coursework (2 columns) */}
        <div className="lg:col-span-2 space-y-4 w-full">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Active Coursework</h2>
            <Link href="/student/assignments" className="text-xs font-semibold text-pink-500 hover:text-pink-400 flex items-center space-x-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {assignments.length === 0 ? (
            <div className="p-8 sm:p-12 text-center bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800/80 flex flex-col items-center justify-center w-full">
              <BookOpen className="w-12 h-12 text-slate-400 mb-3" />
              <p className="text-slate-300 font-semibold mb-1">No active coursework found</p>
              <p className="text-xs text-slate-500 font-normal">When your teachers publish assignments for your enrolled classes, they will appear here.</p>
            </div>
          ) : (
            <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-sm">
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {assignments.slice(0, 5).map((item) => (
                  <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-white truncate">{item.title}</span>
                        {item.hasSubmitted ? (
                          <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">Submitted</span>
                        ) : item.isOverdue ? (
                          <span className="px-2.5 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-xs font-semibold">Overdue</span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold">Pending</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-normal truncate">
                        {item.className} ({item.classCode}) • {item.subjectName} • Due: {new Date(item.dueDateUtc).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end space-x-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                      <span className="text-xs text-slate-400 font-normal">{item.maxScore} Marks</span>
                      <Link
                        href={`/student/assignments/${item.id}`}
                        className="px-4 py-2 rounded-xl bg-pink-600/10 border border-pink-500/20 text-pink-600 dark:text-pink-300 hover:bg-pink-600 hover:text-white text-xs font-semibold transition-colors"
                      >
                        View Task
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* My Enrolled Classes Sidebar */}
        <div className="space-y-4 w-full">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">My Enrolled Classes</h2>
          </div>

          {classes.length === 0 ? (
            <div className="p-6 sm:p-8 text-center bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800/80 flex flex-col items-center justify-center w-full">
              <GraduationCap className="w-10 h-10 text-slate-400 mb-2" />
              <p className="text-slate-400 text-xs font-normal">You are not currently enrolled in any classes.</p>
            </div>
          ) : (
            <div className="space-y-3 w-full">
              {classes.map((c) => (
                <div key={c.classId} className="w-full p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-sm">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">{c.className}</p>
                  <p className="text-xs text-pink-500 font-normal">{c.classCode} • Academic Year {c.academicYear}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
