"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { SubmissionDto } from "@/types";
import { AlertCircle, ArrowLeft, Edit, Paperclip } from "lucide-react";

export default function SubmissionDetailPage({ params }: { params: Promise<{ submissionId: string }> }) {
  const resolvedParams = use(params);
  const submissionId = resolvedParams.submissionId;

  const [submission, setSubmission] = useState<SubmissionDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmission();
  }, [submissionId]);

  const fetchSubmission = async () => {
    setIsLoading(true);
    setError(null);
    const res = await apiClient<SubmissionDto>(`/student/submissions/${submissionId}`);
    if (res.success && res.data) {
      setSubmission(res.data);
    } else {
      setError(res.message || "Failed to load submission details.");
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

  if (error || !submission) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-w-md mx-auto flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-slate-400" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Submission Not Found</h3>
        <p className="text-slate-400 text-sm">{error || "You do not have permission to view this submission."}</p>
        <Link href="/student/submissions" className="inline-block px-5 py-2.5 rounded-xl bg-pink-600 text-white font-bold text-sm">
          Return to My Submissions
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/student/submissions" className="text-xs font-bold text-pink-500 hover:text-pink-400 mb-2 inline-flex items-center space-x-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to My Submissions</span>
          </Link>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">{submission.assignmentTitle}</h1>
          <p className="text-xs text-slate-400 mt-1 font-normal">
            Submitted on {new Date(submission.submittedAtUtc).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <Link
            href={`/student/submissions/${submission.id}/edit`}
            className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm inline-flex items-center space-x-1.5"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Submission</span>
          </Link>
        </div>
      </div>

      {/* Grade & Feedback Highlight Card (If Graded) */}
      {submission.grade !== null && submission.grade !== undefined && (
        <div className="p-6 rounded-3xl bg-slate-900 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/40 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Teacher Evaluation</span>
              <h3 className="text-3xl font-black text-white mt-1">
                {submission.grade} / {submission.assignmentMaxScore ?? 100} Marks
              </h3>
            </div>
            {submission.gradedByName && (
              <span className="text-xs text-slate-300 font-semibold">Evaluated by {submission.gradedByName}</span>
            )}
          </div>

          {submission.feedback && (
            <div className="pt-3 border-t border-slate-800/80 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Teacher Feedback & Comments</span>
              <p className="text-sm text-slate-200 leading-relaxed">{submission.feedback}</p>
            </div>
          )}
        </div>
      )}

      {/* Submission Answer Content */}
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Submitted Answer</h3>
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm whitespace-pre-wrap leading-relaxed">
          {submission.submittedContent}
        </div>

        {submission.attachmentUrl && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Attached Material</span>
            <a
              href={submission.attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-600 dark:text-pink-300 font-bold text-xs hover:bg-pink-600 hover:text-white transition-all"
            >
              <Paperclip className="w-4 h-4" />
              <span>Open Attached Document / Link</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
