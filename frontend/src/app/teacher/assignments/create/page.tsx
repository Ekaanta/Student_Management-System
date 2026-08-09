"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { AssignmentDto, TeacherClassSubjectDto } from "@/types";

export default function CreateAssignmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClassSubjectId = searchParams.get("classSubjectId") || "";

  const [classSubjects, setClassSubjects] = useState<TeacherClassSubjectDto[]>([]);
  const [classSubjectId, setClassSubjectId] = useState<string>(preselectedClassSubjectId);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [maxScore, setMaxScore] = useState<number>(100);
  const [dueDate, setDueDate] = useState<string>("");
  const [isLoadingClasses, setIsLoadingClasses] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClassSubjects();
    // Default due date to 7 days from now formatted for datetime-local input
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    setDueDate(defaultDate.toISOString().slice(0, 16));
  }, []);

  const fetchClassSubjects = async () => {
    setIsLoadingClasses(true);
    const res = await apiClient<TeacherClassSubjectDto[]>("/teacher/class-subjects");
    if (res.success && res.data) {
      setClassSubjects(res.data);
      if (!classSubjectId && res.data.length > 0) {
        setClassSubjectId(res.data[0].id);
      }
    } else {
      setError(res.message || "Failed to load assigned classes & subjects.");
    }
    setIsLoadingClasses(false);
  };

  const handleSubmit = async (saveAsDraft: boolean) => {
    setError(null);

    // Client-side validation
    if (!classSubjectId) {
      setError("Please select a Class and Subject.");
      return;
    }
    if (!title.trim()) {
      setError("Assignment title is required.");
      return;
    }
    if (!description.trim()) {
      setError("Assignment description is required.");
      return;
    }
    if (maxScore <= 0) {
      setError("Maximum marks must be greater than zero.");
      return;
    }
    if (!dueDate) {
      setError("Valid deadline / due date is required.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      maxScore: Number(maxScore),
      dueDateUtc: new Date(dueDate).toISOString(),
      classSubjectId: classSubjectId,
    };

    const res = await apiClient<AssignmentDto>(
      `/teacher/assignments?saveAsDraft=${saveAsDraft}`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );

    if (res.success) {
      router.push("/teacher/assignments");
    } else {
      setError(res.message || (res.errors ? res.errors.join(", ") : "Failed to create assignment."));
    }

    setIsSubmitting(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Create Assignment</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Define coursework title, instructions, maximum marks, deadline, and assign to your class.
          </p>
        </div>
        <Link
          href="/teacher/assignments"
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          ← Back to Assignments
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium">
          {error}
        </div>
      )}

      {isLoadingClasses ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
        </div>
      ) : classSubjects.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <span className="text-4xl block mb-3">⚠️</span>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No assigned classes</h3>
          <p className="text-slate-400 text-sm">
            You cannot create an assignment because you have not been assigned to any class or subject yet.
          </p>
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          {/* Class & Subject Dropdown */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Assign to Class & Subject <span className="text-red-500">*</span>
            </label>
            <select
              value={classSubjectId}
              onChange={(e) => setClassSubjectId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {classSubjects.map((cs) => (
                <option key={cs.id} value={cs.id}>
                  {cs.className} ({cs.classCode}) — {cs.subjectName} ({cs.subjectCode})
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Assignment Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Midterm Physics Lab Report"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Description & Instructions <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={5}
              placeholder="Provide detailed instructions, submission guidelines, or question prompts..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
            />
          </div>

          {/* Maximum Marks & Due Date Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Maximum Marks <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                step="1"
                placeholder="100"
                value={maxScore}
                onChange={(e) => setMaxScore(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Deadline / Due Date (UTC) <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Submit Action Buttons */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(true)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-sm font-bold transition-all"
            >
              💾 Save as Draft
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit(false)}
              className="w-full sm:w-auto px-8 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all"
            >
              {isSubmitting ? "Submitting..." : "🚀 Publish Assignment"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
