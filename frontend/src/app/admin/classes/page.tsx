"use client";

import React, { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { Plus, School, Users, X } from "lucide-react";

interface SchoolClass {
  id: string;
  name: string;
  code: string;
  academicYear: string;
  totalStudentsEnrolled: number;
  createdAtUtc: string;
}

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    setError(null);
    const res = await apiClient<SchoolClass[]>("/admin/classes");
    setLoading(false);
    if (res.success && res.data) {
      setClasses(res.data);
    } else {
      setError(res.message || "Failed to load school classes.");
    }
  };

  const openCreateModal = () => {
    setEditingClass(null);
    setName("");
    setCode("");
    setAcademicYear("2025-2026");
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (c: SchoolClass) => {
    setEditingClass(c);
    setName(c.name);
    setCode(c.code);
    setAcademicYear(c.academicYear);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!name || !code || !academicYear) {
      setModalError("Please fill out Name, Code, and Academic Year.");
      return;
    }

    setModalSubmitting(true);
    const endpoint = editingClass ? `/admin/classes/${editingClass.id}` : "/admin/classes";
    const method = editingClass ? "PUT" : "POST";

    const res = await apiClient<SchoolClass>(endpoint, {
      method,
      body: JSON.stringify({ name, code, academicYear }),
    });

    setModalSubmitting(false);

    if (res.success && res.data) {
      setIsModalOpen(false);
      fetchClasses();
    } else {
      setModalError(res.message || "Failed to save class.");
    }
  };

  const handleDelete = async (c: SchoolClass) => {
    if (!confirm(`Are you sure you want to delete class "${c.name}"? This action cannot be undone.`)) {
      return;
    }

    const res = await apiClient(`/admin/classes/${c.id}`, { method: "DELETE" });
    if (res.success) {
      setClasses((prev) => prev.filter((item) => item.id !== c.id));
    } else {
      alert(res.message || "Failed to delete class.");
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">Class & Course Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-normal">Configure academic classes, unique class codes, and academic years.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-xl font-bold text-white bg-amber-600 hover:bg-amber-500 shadow-lg shadow-amber-600/30 hover:shadow-amber-500/40 transition-all flex items-center space-x-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Class</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchClasses} className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-xs font-bold">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="h-64 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 animate-pulse flex items-center justify-center text-slate-400">
          Loading class configurations...
        </div>
      ) : classes.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 flex flex-col items-center justify-center">
          <School className="w-12 h-12 text-slate-400 mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No classes created yet</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Click "Create New Class" to set up your first class section.</p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 backdrop-blur-xl shadow-sm">
          <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
              <tr>
                <th className="px-6 py-4">Class Name</th>
                <th className="px-6 py-4">Class Code</th>
                <th className="px-6 py-4">Academic Year</th>
                <th className="px-6 py-4">Enrolled Students</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {classes.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{c.name}</td>
                  <td className="px-6 py-4 font-mono text-amber-600 dark:text-amber-400 text-xs font-bold">{c.code}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">{c.academicYear}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                      <Users className="w-3.5 h-3.5" />
                      <span>{c.totalStudentsEnrolled} Students</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(c)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(c)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20"
                    >
                      Delete
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
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{editingClass ? "Edit School Class" : "Create New Class"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Class Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Grade 10 - Section A"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Unique Class Code</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. G10-SECA"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Academic Year</label>
                <input
                  type="text"
                  required
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="e.g. 2025-2026"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
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
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500"
                >
                  {modalSubmitting ? "Saving..." : "Save Class"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
