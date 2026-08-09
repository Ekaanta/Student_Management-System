"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { StudentAssignmentDto, StudentClassDto, SubmissionStatus } from "@/types";

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
  const overdueAssignments = assignments.filter((a) => a.isOverdue);

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
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-pink-900/40 via-purple-900/40 to-slate-900/80 p-8 rounded-3xl border border-pink-800/40">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-pink-400">Student Portal</span>
          <h1 className="text-3xl font-black text-white mt-1">Welcome, {user?.firstName}! 👋</h1>
          <p className="text-slate-400 text-sm mt-1">
            Track active coursework across your enrolled classes, submit assignments before deadlines, and view teacher feedback.
          </p>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <Link
            href="/student/assignments"
            className="px-5 py-3 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-sm shadow-lg shadow-pink-600/30 transition-all"
          >
            Browse Coursework →
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Enrolled Classes</span>
            <span className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center font-bold">🎓</span>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-4">{classes.length}</p>
          <p className="text-xs text-slate-400 mt-1">Active class sections</p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Tasks</span>
            <span className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">⏳</span>
          </div>
          <p className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-4">{pendingAssignments.length}</p>
          <p className="text-xs text-slate-400 mt-1">Due soon for submission</p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Submitted Work</span>
            <span className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">✅</span>
          </div>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-4">{submittedAssignments.length}</p>
          <p className="text-xs text-slate-400 mt-1">Completed submissions</p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Graded Results</span>
            <span className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">⭐</span>
          </div>
          <p className="text-3xl font-black text-purple-600 dark:text-purple-400 mt-4">{gradedAssignments.length}</p>
          <p className="text-xs text-slate-400 mt-1">Reviewed by teacher</p>
        </div>
      </div>

      {/* Main Grid: Active Coursework & Enrolled Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Assignments (2 columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Active Coursework</h2>
            <Link href="/student/assignments" className="text-xs font-bold text-pink-500 hover:text-pink-400">
              View All Coursework →
            </Link>
          </div>

          {assignments.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-4xl block mb-3">🎉</span>
              <p className="text-slate-300 font-bold mb-1">No active assignments</p>
              <p className="text-xs text-slate-500">All coursework is currently up to date.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {assignments.slice(0, 6).map((item) => (
                  <div key={item.id} className="p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 dark:text-white">{item.title}</span>
                        {item.hasSubmitted ? (
                          <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold">Submitted</span>
                        ) : item.isOverdue ? (
                          <span className="px-2.5 py-0.5 rounded-md bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-bold">Overdue</span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold">Pending</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {item.className} ({item.classCode}) • {item.subjectName} • Due: {new Date(item.dueDateUtc).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3 shrink-0">
                      {item.hasSubmitted ? (
                        <Link
                          href={`/student/submissions/${item.studentSubmissionId}`}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600 hover:text-white text-xs font-bold transition-all"
                        >
                          View Submission
                        </Link>
                      ) : item.isOverdue ? (
                        <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-bold">
                          Closed
                        </span>
                      ) : (
                        <Link
                          href={`/student/assignments/${item.id}/submit`}
                          className="px-3.5 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition-all shadow-md shadow-pink-600/20"
                        >
                          Submit Answer
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Enrolled Classes Sidebar Card */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">My Enrolled Classes</h2>
          </div>

          {classes.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-3xl block mb-2">🏫</span>
              <p className="text-slate-400 text-xs">You are not enrolled in any classes yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {classes.map((c) => (
                <div key={c.classId} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{c.className}</p>
                    <p className="text-xs text-pink-500 font-medium">{c.classCode} • Academic Year {c.academicYear}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-semibold">
                    Enrolled
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
