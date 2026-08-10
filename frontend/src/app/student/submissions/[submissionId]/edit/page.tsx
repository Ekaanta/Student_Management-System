"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { SubmissionDto } from "@/types";
import { ArrowLeft, Save } from "lucide-react";

export default function EditSubmissionPage({ params }: { params: Promise<{ submissionId: string }> }) {
  const resolvedParams = use(params);
  const submissionId = resolvedParams.submissionId;
  const router = useRouter();

  const [submission, setSubmission] = useState<SubmissionDto | null>(null);
  const [submittedContent, setSubmittedContent] = useState<string>("");
  const [attachmentUrl, setAttachmentUrl] = useState<string>("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      setSubmittedContent(res.data.submittedContent);
      setAttachmentUrl(res.data.attachmentUrl || "");
    } else {
      setError(res.message || "Failed to load submission details.");
    }
    setIsLoading(false);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!submittedContent.trim()) {
      setError("Please enter your submission answer content.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      submittedContent: submittedContent.trim(),
      attachmentUrl: attachmentUrl.trim() || undefined,
    };

    const res = await apiClient<SubmissionDto>(`/student/submissions/${submissionId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    if (res.success) {
      router.push("/student/submissions");
    } else {
      setError(res.message || (res.errors ? res.errors.join(", ") : "Failed to update submission."));
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

  return (
    <div className="w-full space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Edit Submission</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Assignment: <span className="font-bold text-slate-900 dark:text-white">{submission?.assignmentTitle}</span>
          </p>
        </div>
        <Link
          href={`/student/submissions/${submissionId}`}
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors inline-flex items-center space-x-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleUpdateSubmit} className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Updated Answer / Work Content <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={8}
            required
            value={submittedContent}
            onChange={(e) => setSubmittedContent(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 resize-y"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Attachment URL / Link
          </label>
          <input
            type="url"
            placeholder="https://drive.google.com/..."
            value={attachmentUrl}
            onChange={(e) => setAttachmentUrl(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-sm shadow-lg shadow-pink-600/30 transition-all"
          >
            {isSubmitting ? "Saving Update..." : "Save Submission Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
