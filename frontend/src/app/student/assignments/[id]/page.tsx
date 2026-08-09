"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { StudentAssignmentDto } from "@/types";

export default function StudentAssignmentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const assignmentId = resolvedParams.id;

  const [assignment, setAssignment] = useState<StudentAssignmentDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAssignment();
  }, [assignmentId]);

  const fetchAssignment = async () => {
    setIsLoading(true);
    setError(null);
    const res = await apiClient<StudentAssignmentDto>(`/student/assignments/${assignmentId}`);
    if (res.success && res.data) {
      setAssignment(res.data);
    } else {
      setError(res.message || "Failed to load assignment details.");
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <span className="text-4xl">⚠️</span>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Assignment Not Found</h3>
        <p className="text-slate-400 text-sm">{error || "The requested assignment is not visible or you are not enrolled in this class."}</p>
        <Link href="/student/assignments" className="inline-block px-5 py-2.5 rounded-xl bg-pink-600 text-white font-bold text-sm">
          Return to Coursework
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/student/assignments" className="text-xs font-bold text-pink-500 hover:text-pink-400 mb-2 inline-block">
            ← Back to Coursework
          </Link>
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-xs font-bold text-pink-500">
              {assignment.className} ({assignment.classCode}) • {assignment.subjectName}
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">{assignment.title}</h1>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          {assignment.hasSubmitted ? (
            <Link
              href={`/student/submissions/${assignment.studentSubmissionId}`}
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30"
            >
              ✅ View My Submission
            </Link>
          ) : assignment.isOverdue ? (
            <span className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold text-sm">
              Deadline Passed
            </span>
          ) : (
            <Link
              href={`/student/assignments/${assignment.id}/submit`}
              className="px-6 py-3 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-sm shadow-lg shadow-pink-600/30"
            >
              ✍️ Submit Answer Now
            </Link>
          )}
        </div>
      </div>

      {/* Metadata Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Maximum Marks</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white">{assignment.maxScore}</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Deadline / Due Date</span>
          <span className={`text-sm font-bold ${assignment.isOverdue ? "text-red-500" : "text-slate-900 dark:text-white"}`}>
            {new Date(assignment.dueDateUtc).toLocaleDateString()} {new Date(assignment.dueDateUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Instructor</span>
          <span className="text-sm font-bold text-slate-900 dark:text-white">{assignment.teacherName || "Assigned Teacher"}</span>
        </div>
      </div>

      {/* Description Content */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Assignment Instructions</h3>
        <p className="text-slate-800 dark:text-slate-200 text-sm whitespace-pre-wrap leading-relaxed">
          {assignment.description}
        </p>
      </div>

      {/* Grade & Teacher Feedback Panel (If Graded) */}
      {assignment.hasSubmitted && assignment.studentGrade !== null && assignment.studentGrade !== undefined && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Graded Result</span>
              <h3 className="text-2xl font-black text-white mt-1">
                {assignment.studentGrade} / {assignment.maxScore} Marks
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
              Reviewed by Teacher
            </span>
          </div>

          {assignment.studentFeedback && (
            <div className="pt-3 border-t border-slate-800 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Teacher Feedback</span>
              <p className="text-sm text-slate-200">{assignment.studentFeedback}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
