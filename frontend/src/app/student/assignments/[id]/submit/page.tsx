"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { StudentAssignmentDto, SubmissionDto } from "@/types";
import { Clock, ArrowLeft, Send } from "lucide-react";

export default function SubmitAssignmentPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const assignmentId = resolvedParams.id;
  const router = useRouter();

  const [assignment, setAssignment] = useState<StudentAssignmentDto | null>(null);
  const [submittedContent, setSubmittedContent] = useState<string>("");
  const [attachmentUrl, setAttachmentUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
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
      if (res.data.hasSubmitted) {
        // Redirect to view existing submission if already submitted
        router.push(`/student/submissions/${res.data.studentSubmissionId}`);
        return;
      }
    } else {
      setError(res.message || "Failed to load assignment details.");
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!submittedContent.trim()) {
      setError("Please enter your submission answer content.");
      return;
    }

    if (assignment?.isOverdue) {
      setError("The submission deadline has passed. Submissions are no longer accepted.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      assignmentId,
      submittedContent: submittedContent.trim(),
      attachmentUrl: attachmentUrl.trim() || undefined,
    };

    const res = await apiClient<SubmissionDto>("/student/submissions", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (res.success) {
      router.push("/student/submissions");
    } else {
      setError(res.message || (res.errors ? res.errors.join(", ") : "Failed to submit assignment."));
    }

    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (assignment?.isOverdue) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-w-lg mx-auto flex flex-col items-center justify-center">
        <Clock className="w-12 h-12 text-slate-400 mb-2" />
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Submission Deadline Passed</h3>
        <p className="text-slate-400 text-sm">
          The deadline for <span className="font-bold text-white">"{assignment.title}"</span> was {new Date(assignment.dueDateUtc).toLocaleString()}. New submissions are no longer accepted.
        </p>
        <Link href="/student/assignments" className="inline-block px-5 py-2.5 rounded-xl bg-pink-600 text-white font-bold text-sm">
          Back to Coursework
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Submit Assignment</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Assignment: <span className="font-bold text-slate-900 dark:text-white">{assignment?.title}</span> • Max Marks: {assignment?.maxScore}
          </p>
        </div>
        <Link
          href={`/student/assignments/${assignmentId}`}
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors inline-flex items-center space-x-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Details</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Submission Form */}
      <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="p-4 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-300 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-pink-400 shrink-0" />
            <span>Deadline: {assignment?.dueDateUtc ? new Date(assignment.dueDateUtc).toLocaleString() : ""}</span>
          </div>
          <span className="font-bold">Ensure you submit before deadline</span>
        </div>

        {/* Answer Content Input */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Your Answer / Work Content <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={8}
            required
            placeholder="Type or paste your answer, essay response, code snippet, or detailed solution here..."
            value={submittedContent}
            onChange={(e) => setSubmittedContent(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 resize-y"
          />
        </div>

        {/* Attachment URL Input */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Optional Attachment URL / Document Link
          </label>
          <input
            type="url"
            placeholder="https://drive.google.com/... or https://github.com/..."
            value={attachmentUrl}
            onChange={(e) => setAttachmentUrl(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
            Provide a public link to your supporting document, PDF, presentation, or repository if required.
          </span>
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-sm shadow-lg shadow-pink-600/30 transition-all inline-flex items-center space-x-1.5"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? "Submitting Work..." : "Submit Assignment"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
