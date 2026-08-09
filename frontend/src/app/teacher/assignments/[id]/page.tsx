"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { AssignmentDto, AssignmentStatus } from "@/types";

export default function AssignmentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const assignmentId = resolvedParams.id;

  const [assignment, setAssignment] = useState<AssignmentDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAssignmentDetails();
  }, [assignmentId]);

  const fetchAssignmentDetails = async () => {
    setIsLoading(true);
    setError(null);
    const res = await apiClient<AssignmentDto>(`/teacher/assignments/${assignmentId}`);
    if (res.success && res.data) {
      setAssignment(res.data);
    } else {
      setError(res.message || "Failed to fetch assignment details.");
    }
    setIsLoading(false);
  };

  const handlePublish = async () => {
    if (!assignment) return;
    const res = await apiClient<AssignmentDto>(`/teacher/assignments/${assignment.id}/publish`, {
      method: "POST",
    });
    if (res.success && res.data) {
      setAssignment(res.data);
    } else {
      alert(res.message || "Failed to publish assignment.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <span className="text-4xl">⚠️</span>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Assignment Not Found</h3>
        <p className="text-slate-400 text-sm">{error || "The requested assignment does not exist or you do not have permission to view it."}</p>
        <Link href="/teacher/assignments" className="inline-block px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-sm">
          Return to Assignments
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            {assignment.status === AssignmentStatus.Published ? (
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-bold">
                Published
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-bold">
                Draft
              </span>
            )}
            <span className="text-xs font-bold text-purple-500">
              {assignment.className} ({assignment.classCode}) • {assignment.subjectName} ({assignment.subjectCode})
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">{assignment.title}</h1>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          {assignment.status === AssignmentStatus.Draft && (
            <button
              onClick={handlePublish}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30"
            >
              🚀 Publish Now
            </button>
          )}
          <Link
            href={`/teacher/assignments/${assignment.id}/edit`}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm"
          >
            ✏️ Edit
          </Link>
          <Link
            href={`/teacher/assignments/${assignment.id}/submissions`}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30"
          >
            📥 Submissions ({assignment.submissionsCount || 0})
          </Link>
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
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {new Date(assignment.dueDateUtc).toLocaleDateString()} {new Date(assignment.dueDateUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Created Date</span>
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {new Date(assignment.createdAtUtc).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Description Content Card */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Description & Student Instructions</h3>
        <p className="text-slate-800 dark:text-slate-200 text-sm whitespace-pre-wrap leading-relaxed">
          {assignment.description}
        </p>
      </div>
    </div>
  );
}
