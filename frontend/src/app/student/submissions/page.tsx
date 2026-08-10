"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { SubmissionDto, SubmissionStatus } from "@/types";
import { Inbox } from "lucide-react";

export default function StudentSubmissionsPage() {
  const [submissions, setSubmissions] = useState<SubmissionDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setIsLoading(true);
    setError(null);
    const res = await apiClient<SubmissionDto[]>("/student/submissions");
    if (res.success && res.data) {
      setSubmissions(res.data);
    } else {
      setError(res.message || "Failed to load submissions.");
    }
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
        return <span className="px-2.5 py-1 rounded-full bg-pink-500/10 text-pink-500 border border-pink-500/20 text-xs font-bold">Submitted</span>;
    }
  };

  return (
    <div className="space-y-8 w-full">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">My Submissions</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Review your submitted answers, status tracking, grades, and teacher feedback.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Submissions List Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin" />
        </div>
      ) : submissions.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
          <Inbox className="w-12 h-12 text-slate-400 mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No submissions found</h3>
          <p className="text-slate-400 text-sm mb-6">You have not submitted any coursework yet.</p>
          <Link href="/student/assignments" className="px-5 py-2.5 rounded-xl bg-pink-600 text-white font-bold text-sm">
            Browse Assignments
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">Assignment</th>
                  <th className="p-4">Submitted Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Grade / Marks</th>
                  <th className="p-4">Teacher Feedback</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      {sub.assignmentTitle || "Assignment"}
                    </td>
                    <td className="p-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {new Date(sub.submittedAtUtc).toLocaleDateString()} {new Date(sub.submittedAtUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4">{getStatusBadge(sub.status)}</td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      {sub.grade !== null && sub.grade !== undefined ? (
                        <span className="text-emerald-500">
                          {sub.grade} / {sub.assignmentMaxScore ?? 100}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs font-normal">Pending Review</span>
                      )}
                    </td>
                    <td className="p-4 text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      {sub.feedback || "—"}
                    </td>
                    <td className="p-4 text-right space-x-2 shrink-0">
                      <Link
                        href={`/student/submissions/${sub.id}`}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-colors"
                      >
                        View Details
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
