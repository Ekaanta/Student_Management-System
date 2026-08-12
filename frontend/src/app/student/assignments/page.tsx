"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { StudentAssignmentDto, StudentClassDto } from "@/types";
import { BookOpen } from "lucide-react";

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState<StudentAssignmentDto[]>([]);
  const [classes, setClasses] = useState<StudentClassDto[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    setError(null);
    const [clsRes, assignRes] = await Promise.all([
      apiClient<StudentClassDto[]>("/student/classes"),
      apiClient<StudentAssignmentDto[]>("/student/assignments"),
    ]);

    if (clsRes.success && clsRes.data) setClasses(clsRes.data);
    if (assignRes.success && assignRes.data) setAssignments(assignRes.data);
    else if (!assignRes.success) setError(assignRes.message || "Failed to load coursework.");
    setIsLoading(false);
  };

  const filteredAssignments = assignments.filter((a) => {
    if (selectedClassId && a.classSubjectId !== selectedClassId) return false;
    if (searchQuery.trim() && !a.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;

    if (selectedStatusFilter === "pending") {
      if (a.hasSubmitted || a.isOverdue) return false;
    } else if (selectedStatusFilter === "submitted") {
      if (!a.hasSubmitted) return false;
    } else if (selectedStatusFilter === "graded") {
      if (a.studentGrade === null || a.studentGrade === undefined) return false;
    } else if (selectedStatusFilter === "overdue") {
      if (!a.isOverdue) return false;
    }

    return true;
  });

  return (
    <div className="space-y-8 w-full">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">My Coursework & Assignments</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-normal">
          View published assignments across your enrolled classes, track deadlines, and submit your work.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search assignment title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
        />

        <select
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="">All Enrolled Classes</option>
          {classes.map((c) => (
            <option key={c.classId} value={c.classId}>
              {c.className} ({c.classCode})
            </option>
          ))}
        </select>

        <select
          value={selectedStatusFilter}
          onChange={(e) => setSelectedStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending (Action Required)</option>
          <option value="submitted">Submitted</option>
          <option value="graded">Graded</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* Coursework Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin" />
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
          <BookOpen className="w-12 h-12 text-slate-400 mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No coursework found</h3>
          <p className="text-slate-400 text-sm">
            {searchQuery || selectedClassId || selectedStatusFilter
              ? "No assignments match your selected filter criteria."
              : "No published assignments found for your enrolled classes."}
          </p>
        </div>
      ) : (
        <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-xs border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">Assignment Title</th>
                  <th className="p-4">Class & Subject</th>
                  <th className="p-4">Max Marks</th>
                  <th className="p-4">Deadline</th>
                  <th className="p-4">My Status</th>
                  <th className="p-4">Grade</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredAssignments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-900 dark:text-white">{a.title}</p>
                      <p className="text-xs text-slate-400">Teacher: {a.teacherName || "Assigned Educator"}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{a.className} ({a.classCode})</p>
                      <p className="text-xs text-pink-500 font-medium">{a.subjectName}</p>
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      {a.maxScore} Marks
                    </td>
                    <td className="p-4 text-xs font-medium">
                      <span className={a.isOverdue ? "text-red-500 font-bold" : "text-slate-500 dark:text-slate-400"}>
                        {new Date(a.dueDateUtc).toLocaleDateString()} {new Date(a.dueDateUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="p-4">
                      {a.hasSubmitted ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-bold">
                          Submitted
                        </span>
                      ) : a.isOverdue ? (
                        <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-bold">
                          Closed / Overdue
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-bold">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-bold">
                      {a.studentGrade !== null && a.studentGrade !== undefined ? (
                        <span className="text-emerald-500">{a.studentGrade} / {a.maxScore}</span>
                      ) : (
                        <span className="text-slate-400 text-xs font-normal">—</span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2 shrink-0">
                      <Link
                        href={`/student/assignments/${a.id}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-colors"
                      >
                        Details
                      </Link>
                      {a.hasSubmitted ? (
                        <Link
                          href={`/student/submissions/${a.studentSubmissionId}`}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white text-xs font-bold transition-all"
                        >
                          View Submission
                        </Link>
                      ) : a.isOverdue ? (
                        <span className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-bold cursor-not-allowed">
                          Closed
                        </span>
                      ) : (
                        <Link
                          href={`/student/assignments/${a.id}/submit`}
                          className="px-3.5 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition-all shadow-md shadow-pink-600/20"
                        >
                          Submit Answer
                        </Link>
                      )}
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
