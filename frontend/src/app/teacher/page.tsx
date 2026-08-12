"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { AssignmentDto, AssignmentStatus, TeacherClassSubjectDto } from "@/types";
import {
  Plus,
  School,
  Send,
  FileText,
  Inbox,
  BookOpen,
  ArrowRight,
} from "lucide-react";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [classSubjects, setClassSubjects] = useState<TeacherClassSubjectDto[]>([]);
  const [assignments, setAssignments] = useState<AssignmentDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    const [csRes, assignRes] = await Promise.all([
      apiClient<TeacherClassSubjectDto[]>("/teacher/class-subjects"),
      apiClient<AssignmentDto[]>("/teacher/assignments"),
    ]);

    if (csRes.success && csRes.data) {
      setClassSubjects(csRes.data);
    }
    if (assignRes.success && assignRes.data) {
      setAssignments(assignRes.data);
    } else if (!csRes.success && !assignRes.success) {
      setError(csRes.message || assignRes.message || "Failed to load dashboard data.");
    }

    setIsLoading(false);
  };

  const publishedCount = assignments.filter((a) => a.status === AssignmentStatus.Published).length;
  const draftCount = assignments.filter((a) => a.status === AssignmentStatus.Draft).length;
  const totalSubmissions = assignments.reduce((acc, curr) => acc + (curr.submissionsCount || 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-400">Loading Teacher Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 w-full">
      {/* Top Banner Header */}
      <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 p-5 sm:p-8 rounded-2xl border border-purple-800/50 shadow-sm">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-300">Educator Workspace</span>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white mt-1">Welcome back, {user?.firstName}!</h1>
          <p className="text-slate-200 text-xs sm:text-sm mt-1 font-normal leading-relaxed">
            Manage your courses, draft assignments, review student submissions, and provide actionable grades.
          </p>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <Link
            href="/teacher/assignments/create"
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-purple-600/25"
          >
            <Plus className="w-4 h-4" />
            <span>Create Assignment</span>
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
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">My Classes & Subjects</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-semibold">
              <School className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-semibold text-slate-900 dark:text-white mt-4">{classSubjects.length}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">Assigned courses across school</p>
        </div>

        <div className="w-full p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Published Assignments</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-semibold">
              <Send className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-semibold text-emerald-600 dark:text-emerald-400 mt-4">{publishedCount}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">Active coursework visible to students</p>
        </div>

        <div className="w-full p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Draft Assignments</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-semibold">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-semibold text-amber-600 dark:text-amber-400 mt-4">{draftCount}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">Unpublished work in progress</p>
        </div>

        <div className="w-full p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Submissions</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-semibold">
              <Inbox className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-semibold text-blue-600 dark:text-blue-400 mt-4">{totalSubmissions}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-normal">Student responses received</p>
        </div>
      </div>

      {/* Main Grid: Recent Assignments & Assigned Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 w-full">
        {/* Recent Assignments (2 columns) */}
        <div className="lg:col-span-2 space-y-4 w-full">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Recent Assignments</h2>
            <Link href="/teacher/assignments" className="text-xs font-semibold text-purple-500 hover:text-purple-400 flex items-center space-x-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {assignments.length === 0 ? (
            <div className="p-8 sm:p-12 text-center bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800/80 flex flex-col items-center justify-center w-full">
              <BookOpen className="w-12 h-12 text-slate-400 mb-3" />
              <p className="text-slate-300 font-semibold mb-1">No assignments created yet</p>
              <p className="text-xs text-slate-500 font-normal mb-6">Create your first assignment and assign it to a class & subject.</p>
              <Link
                href="/teacher/assignments/create"
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm inline-flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Assignment Now</span>
              </Link>
            </div>
          ) : (
            <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-sm">
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {assignments.slice(0, 5).map((item) => (
                  <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-white truncate">{item.title}</span>
                        {item.status === AssignmentStatus.Published ? (
                          <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">Published</span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold">Draft</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-normal truncate">
                        {item.className} ({item.classCode}) • {item.subjectName} ({item.subjectCode})
                      </p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end space-x-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                      <span className="text-xs text-slate-400 font-normal">{item.maxScore} Marks</span>
                      <Link
                        href={`/teacher/assignments/${item.id}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-purple-600 hover:text-white text-xs font-semibold transition-colors"
                      >
                        Details
                      </Link>
                      <Link
                        href={`/teacher/assignments/${item.id}/submissions`}
                        className="px-3 py-1.5 rounded-lg bg-purple-600/10 border border-purple-500/20 text-purple-600 dark:text-purple-300 hover:bg-purple-600 hover:text-white text-xs font-semibold transition-colors"
                      >
                        Submissions ({item.submissionsCount || 0})
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Assigned Courses / Subjects Sidebar Card */}
        <div className="space-y-4 w-full">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Assigned Classes</h2>
            <Link href="/teacher/classes" className="text-xs font-semibold text-purple-500 hover:text-purple-400 flex items-center space-x-1">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {classSubjects.length === 0 ? (
            <div className="p-6 sm:p-8 text-center bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800/80 flex flex-col items-center justify-center w-full">
              <School className="w-10 h-10 text-slate-400 mb-2" />
              <p className="text-slate-400 text-xs font-normal">No classes or subjects assigned to you yet by the Admin.</p>
            </div>
          ) : (
            <div className="space-y-3 w-full">
              {classSubjects.map((cs) => (
                <div key={cs.id} className="w-full p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-2 shadow-sm">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{cs.className} ({cs.classCode})</p>
                    <p className="text-xs text-purple-500 font-normal">{cs.subjectName} ({cs.subjectCode})</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-normal shrink-0">
                    {cs.totalStudentsEnrolled} Students
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
