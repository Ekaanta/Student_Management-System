"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { SubmissionDto, SubmissionStatus } from "@/types";
import { AlertCircle, ArrowLeft, Paperclip, Save } from "lucide-react";

export default function SubmissionReviewPage({ params }: { params: Promise<{ submissionId: string }> }) {
  const resolvedParams = use(params);
  const submissionId = resolvedParams.submissionId;
  const router = useRouter();

  const [submission, setSubmission] = useState<SubmissionDto | null>(null);
  const [grade, setGrade] = useState<number | string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [status, setStatus] = useState<SubmissionStatus>(SubmissionStatus.Graded);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissionData();
  }, [submissionId]);

  const fetchSubmissionData = async () => {
    setIsLoading(true);
    setError(null);
    const res = await apiClient<SubmissionDto>(`/teacher/submissions/${submissionId}`);
    if (res.success && res.data) {
      const data = res.data;
      setSubmission(data);
      if (data.grade !== null && data.grade !== undefined) setGrade(data.grade);
      if (data.feedback) setFeedback(data.feedback);
      if (data.status) setStatus(data.status);
    } else {
      setError(res.message || "Failed to load submission details.");
    }
    setIsLoading(false);
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const numGrade = Number(grade);
    const maxScore = submission?.assignmentMaxScore ?? 100;

    // Client-side validation
    if (grade === "" || isNaN(numGrade)) {
      setError("Please enter a valid numeric grade.");
      return;
    }
    if (numGrade < 0) {
      setError("Grade marks cannot be negative.");
      return;
    }
    if (numGrade > maxScore) {
      setError(`Marks assigned (${numGrade}) cannot exceed the maximum allowed marks of ${maxScore}.`);
      return;
    }

    setIsSubmitting(true);

    const payload = {
      grade: numGrade,
      feedback: feedback.trim(),
      status: Number(status),
    };

    const res = await apiClient<SubmissionDto>(`/teacher/submissions/${submissionId}/grade`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (res.success && res.data) {
      setSubmission(res.data);
      setSuccessMessage("Submission reviewed and graded successfully!");
      setTimeout(() => {
        if (submission?.assignmentId) {
          router.push(`/teacher/assignments/${submission.assignmentId}/submissions`);
        }
      }, 1500);
    } else {
      setError(res.message || (res.errors ? res.errors.join(", ") : "Failed to save submission review."));
    }

    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !submission) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-slate-400" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Submission Not Found</h3>
        <p className="text-slate-400 text-sm">{error}</p>
        <Link href="/teacher/assignments" className="inline-block px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-sm">
          Return to Assignments
        </Link>
      </div>
    );
  }

  const maxScore = submission?.assignmentMaxScore ?? 100;

  return (
    <div className="w-full space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          {submission?.assignmentId && (
            <Link href={`/teacher/assignments/${submission.assignmentId}/submissions`} className="text-xs font-bold text-purple-500 hover:text-purple-400 mb-2 inline-flex items-center space-x-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Submissions List</span>
            </Link>
          )}
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Review & Grade Submission</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-normal">
            Assignment: <span className="font-semibold text-slate-900 dark:text-white">{submission?.assignmentTitle}</span> • Max Marks: {maxScore}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-sm font-bold">
          {successMessage}
        </div>
      )}

      {/* Grid: Left Student Work / Right Grading Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Student Submission Content (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Student Profile</span>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{submission?.studentName}</p>
                <p className="text-xs text-slate-400">{submission?.studentEmail}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Submitted At</span>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {submission?.submittedAtUtc ? new Date(submission.submittedAtUtc).toLocaleString() : "N/A"}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-500">Student Answer / Work</span>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm whitespace-pre-wrap leading-relaxed">
                {submission?.submittedContent || "No text content submitted."}
              </div>
            </div>

            {submission?.attachmentUrl && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Attachment Material</span>
                <div>
                  <a
                    href={submission.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-300 font-bold text-xs hover:bg-purple-600 hover:text-white transition-all"
                  >
                    <Paperclip className="w-4 h-4" />
                    <span>View Attached Document / Link</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Grading & Feedback Form */}
        <div className="space-y-6">
          <form onSubmit={handleGradeSubmit} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Grading Panel</h3>

            {/* Marks Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Assigned Marks (Out of {maxScore}) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                max={maxScore}
                step="0.5"
                placeholder={`0 - ${maxScore}`}
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-base font-black focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Status Dropdown */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Submission Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(Number(e.target.value) as SubmissionStatus)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value={SubmissionStatus.Graded}>Graded (Complete)</option>
                <option value={SubmissionStatus.Reviewed}>Reviewed</option>
                <option value={SubmissionStatus.ResubmissionRequested}>Resubmission Requested</option>
              </select>
            </div>

            {/* Feedback Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Teacher Feedback & Comments
              </label>
              <textarea
                rows={4}
                placeholder="Provide constructive feedback, suggestions, or comments for the student..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
              />
            </div>

            {/* Save Grade Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all inline-flex items-center justify-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? "Saving Grade..." : "Submit Grade & Feedback"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
