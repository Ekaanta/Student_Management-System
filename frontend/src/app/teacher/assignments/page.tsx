"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { AssignmentDto, AssignmentStatus, TeacherClassSubjectDto } from "@/types";
import {
  Plus,
  FileText,
  Inbox,
  Send,
  Edit,
  Trash2,
} from "lucide-react";

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<AssignmentDto[]>([]);
  const [classSubjects, setClassSubjects] = useState<TeacherClassSubjectDto[]>([]);
  const [selectedClassSubjectId, setSelectedClassSubjectId] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AssignmentDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    setError(null);
    const [csRes, assignRes] = await Promise.all([
      apiClient<TeacherClassSubjectDto[]>("/teacher/class-subjects"),
      apiClient<AssignmentDto[]>("/teacher/assignments"),
    ]);

    if (csRes.success && csRes.data) setClassSubjects(csRes.data);
    if (assignRes.success && assignRes.data) setAssignments(assignRes.data);
    else if (!assignRes.success) setError(assignRes.message || "Failed to fetch assignments.");
    setIsLoading(false);
  };

  const handlePublish = async (id: string) => {
    const res = await apiClient<AssignmentDto>(`/teacher/assignments/${id}/publish`, {
      method: "POST",
    });
    if (res.success && res.data) {
      setAssignments((prev) => prev.map((a) => (a.id === id ? res.data! : a)));
    } else {
      alert(res.message || "Failed to publish assignment.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const res = await apiClient<boolean>(`/teacher/assignments/${deleteTarget.id}`, {
      method: "DELETE",
    });
    if (res.success) {
      setAssignments((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      setDeleteTarget(null);
    } else {
      alert(res.message || "Failed to delete assignment.");
    }
    setIsDeleting(false);
  };

  const filteredAssignments = assignments.filter((a) => {
    if (selectedClassSubjectId && a.classSubjectId !== selectedClassSubjectId) return false;
    if (selectedStatus && String(a.status) !== selectedStatus) return false;
    if (searchQuery.trim() && !a.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Assignments</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Create, manage, and publish assignments for your assigned classes.
          </p>
        </div>
        <Link
          href="/teacher/assignments/create"
          className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all duration-200 inline-flex items-center space-x-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Assignment</span>
        </Link>
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
          placeholder="Search by assignment title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <select
          value={selectedClassSubjectId}
          onChange={(e) => setSelectedClassSubjectId(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">All Classes & Subjects</option>
          {classSubjects.map((cs) => (
            <option key={cs.id} value={cs.id}>
              {cs.className} - {cs.subjectName}
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">All Statuses</option>
          <option value="1">Draft</option>
          <option value="2">Published</option>
          <option value="3">Closed</option>
        </select>
      </div>

      {/* Assignments Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
          <FileText className="w-12 h-12 text-slate-400 mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No assignments found</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {searchQuery || selectedClassSubjectId || selectedStatus
              ? "No assignments match your selected filter criteria."
              : "You have not created any assignments yet."}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-4">Title</th>
                  <th className="p-4">Class & Subject</th>
                  <th className="p-4">Max Marks</th>
                  <th className="p-4">Deadline</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Submissions</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredAssignments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-900 dark:text-white">{a.title}</p>
                      <p className="text-xs text-slate-400 line-clamp-1">{a.description}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{a.className} ({a.classCode})</p>
                      <p className="text-xs text-purple-500 font-medium">{a.subjectName}</p>
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      {a.maxScore} Marks
                    </td>
                    <td className="p-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {new Date(a.dueDateUtc).toLocaleDateString()} {new Date(a.dueDateUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4">
                      {a.status === AssignmentStatus.Published ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-bold">
                          Published
                        </span>
                      ) : a.status === AssignmentStatus.Draft ? (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs font-bold">
                          Draft
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-slate-500/10 text-slate-500 border border-slate-500/20 text-xs font-bold">
                          Closed
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/teacher/assignments/${a.id}/submissions`}
                        className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20 hover:bg-purple-600 hover:text-white text-xs font-bold transition-all"
                      >
                        <Inbox className="w-3.5 h-3.5" />
                        <span>{a.submissionsCount || 0} Submissions</span>
                      </Link>
                    </td>
                    <td className="p-4 text-right space-x-2 shrink-0">
                      {a.status === AssignmentStatus.Draft && (
                        <button
                          onClick={() => handlePublish(a.id)}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Publish</span>
                        </button>
                      )}
                      <Link
                        href={`/teacher/assignments/${a.id}/edit`}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(a)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-600 hover:text-white text-red-500 text-xs font-bold transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Delete Assignment</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">"{deleteTarget.title}"</span>? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-600/30"
              >
                {isDeleting ? "Deleting..." : "Delete Assignment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
