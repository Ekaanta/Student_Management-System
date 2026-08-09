"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { UserRole } from "@/types";

interface ClassSubjectDetail {
  id: string;
  classId: string;
  className: string;
  classCode: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
}

interface SchoolClassOption {
  id: string;
  name: string;
  code: string;
}

interface SubjectOption {
  id: string;
  name: string;
  code: string;
}

interface TeacherUserOption {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}

export default function AdminTeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<ClassSubjectDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [classes, setClasses] = useState<SchoolClassOption[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [teachers, setTeachers] = useState<TeacherUserOption[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    fetchAssignments();
    fetchOptions();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    setError(null);
    const res = await apiClient<ClassSubjectDetail[]>("/admin/teacher-assignments");
    setLoading(false);
    if (res.success && res.data) {
      setAssignments(res.data);
    } else {
      setError(res.message || "Failed to load teacher assignments.");
    }
  };

  const fetchOptions = async () => {
    const [cRes, sRes, tRes] = await Promise.all([
      apiClient<SchoolClassOption[]>("/admin/classes"),
      apiClient<SubjectOption[]>("/admin/subjects"),
      apiClient<TeacherUserOption[]>(`/admin/users?role=${UserRole.Teacher}`),
    ]);

    if (cRes.success && cRes.data) setClasses(cRes.data);
    if (sRes.success && sRes.data) setSubjects(sRes.data);
    if (tRes.success && tRes.data) setTeachers(tRes.data);
  };

  const openAssignModal = () => {
    setSelectedClassId(classes[0]?.id || "");
    setSelectedSubjectId(subjects[0]?.id || "");
    setSelectedTeacherId(teachers[0]?.id || "");
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!selectedClassId || !selectedSubjectId || !selectedTeacherId) {
      setModalError("Please select Class, Subject, and Teacher.");
      return;
    }

    setModalSubmitting(true);
    const res = await apiClient<ClassSubjectDetail>("/admin/teacher-assignments", {
      method: "POST",
      body: JSON.stringify({
        classId: selectedClassId,
        subjectId: selectedSubjectId,
        teacherId: selectedTeacherId,
      }),
    });

    setModalSubmitting(false);

    if (res.success && res.data) {
      setIsModalOpen(false);
      fetchAssignments();
    } else {
      setModalError(res.message || "Failed to assign teacher.");
    }
  };

  const handleRemove = async (item: ClassSubjectDetail) => {
    if (!confirm(`Are you sure you want to remove assignment for ${item.teacherName} in ${item.className} - ${item.subjectName}?`)) {
      return;
    }

    const res = await apiClient(`/admin/teacher-assignments/${item.id}`, { method: "DELETE" });
    if (res.success) {
      setAssignments((prev) => prev.filter((a) => a.id !== item.id));
    } else {
      alert(res.message || "Failed to remove assignment.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Teacher Assignments</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Assign designated teachers to teach subjects across school classes.</p>
        </div>
        <button
          onClick={openAssignModal}
          disabled={classes.length === 0 || subjects.length === 0 || teachers.length === 0}
          className="px-5 py-2.5 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/30 hover:shadow-purple-500/40 transition-all flex items-center space-x-2 self-start sm:self-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>👨‍🏫</span>
          <span>Assign Teacher to Class</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchAssignments} className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-xs font-bold">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="h-64 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 animate-pulse flex items-center justify-center text-slate-400">
          Loading teacher assignments...
        </div>
      ) : assignments.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60">
          <span className="text-4xl mb-3 block">👨‍🏫</span>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No teacher assignments yet</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Assign teachers to subjects and classes to allow them to create coursework.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 backdrop-blur-xl shadow-sm">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
              <tr>
                <th className="px-6 py-4">Class</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Assigned Teacher</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {assignments.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                    {item.className} <span className="text-xs font-mono text-amber-600 dark:text-amber-400">({item.classCode})</span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-pink-600 dark:text-pink-300">
                    {item.subjectName} <span className="text-xs font-mono text-pink-600 dark:text-pink-400">({item.subjectCode})</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-600 dark:text-purple-300 font-bold flex items-center justify-center text-xs">
                        {item.teacherName[0]}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{item.teacherName}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{item.teacherEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleRemove(item)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Assign Teacher to Subject & Class</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg">✕</button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select School Class</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Subject</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Designated Teacher</label>
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.firstName} {t.lastName} ({t.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500"
                >
                  {modalSubmitting ? "Assigning..." : "Save Assignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
