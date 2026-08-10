"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { AssignmentDto, SubmissionDto, SubmissionStatus } from "@/types";
import { ArrowLeft, Inbox } from "lucide-react";

export default function AssignmentSubmissionsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const assignmentId = resolvedParams.id;

  const [assignment, setAssignment] = useState<AssignmentDto | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissionsData();
  }, [assignmentId]);

  const fetchSubmissionsData = async () => {
    setIsLoading(true);
    setError(null);

    const [assignRes, subRes] = await Promise.all([
      apiClient<AssignmentDto>(`/teacher/assignments/${assignmentId}`),
      apiClient<SubmissionDto[]>(`/teacher/assignments/${assignmentId}/submissions`),
    ]);

    if (assignRes.success && assignRes.data) setAssignment(assignRes.data);
    if (subRes.success && subRes.data) setSubmissions(subRes.data);
    else if (!subRes.success) setError(subRes.message || "Failed to load student submissions.");

    setIsLoading(false);
  };

  const getStatusBadge = (status: SubmissionStatus) => {
    switch (status) {
      case SubmissionStatus.Graded:
        return <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-bold">Graded</span>;
      case SubmissionStatus.Reviewed:
        return <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 text-xs font-bold">Reviewed</span>;
      case SubmissionStatus.ResubmissionRequested:
        return <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-bold">Resubmission Requested</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20 text-xs font-bold">Submitted</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/teacher/assignments" className="text-xs font-bold text-purple-500 hover:text-purple-400 mb-2 inline-flex items-center space-x-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Assignments</span>
          </Link>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            Student Submissions
          </h1>
          {assignment && (
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Assignment: <span className="font-bold text-slate-900 dark:text-white">{assignment.title}</span> ({assignment.className} - {assignment.subjectName}) • Max Marks: {assignment.maxScore}
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Submissions List Table */}
      {submissions.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
          <Inbox className="w-12 h-12 text-slate-400 mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No submissions yet</h3>
          <p className="text-slate-400 text-sm">No students have submitted answers for this assignment yet.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Submitted Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Marks / Grade</th>
                  <th className="p-4">Feedback</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-900 dark:text-white">{sub.studentName}</p>
                      <p className="text-xs text-slate-400">{sub.studentEmail}</p>
                    </td>
                    <td className="p-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {new Date(sub.submittedAtUtc).toLocaleDateString()} {new Date(sub.submittedAtUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4">{getStatusBadge(sub.status)}</td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      {sub.grade !== null && sub.grade !== undefined ? (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          {sub.grade} / {assignment?.maxScore ?? 100}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs font-normal">Not graded</span>
                      )}
                    </td>
                    <td className="p-4 text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      {sub.feedback || "—"}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/teacher/submissions/${sub.id}/review`}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all"
                      >
                        Review & Grade
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
