"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { TeacherClassSubjectDto } from "@/types";
import {
  School,
  Users,
  BookOpen,
  Plus,
  ArrowRight,
} from "lucide-react";

export default function MyClassesPage() {
  const [classSubjects, setClassSubjects] = useState<TeacherClassSubjectDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClassSubjects();
  }, []);

  const fetchClassSubjects = async () => {
    setIsLoading(true);
    setError(null);
    const res = await apiClient<TeacherClassSubjectDto[]>("/teacher/class-subjects");
    if (res.success && res.data) {
      setClassSubjects(res.data);
    } else {
      setError(res.message || "Failed to load assigned classes & subjects.");
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-8 w-full">
      <div>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">My Classes & Subjects</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-normal">
          Classes and subjects assigned to you by the School Administrator.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
        </div>
      ) : classSubjects.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
          <School className="w-12 h-12 text-slate-400 mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No assigned classes found</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
            You currently have no class or subject assignments. Please contact your administrator to assign you to a class & subject.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classSubjects.map((cs) => (
            <div
              key={cs.id}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-purple-500/50 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-extrabold uppercase tracking-wider">
                    {cs.classCode}
                  </span>
                  <span className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>{cs.totalStudentsEnrolled} Enrolled</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{cs.className}</h3>
                  <p className="text-sm font-bold text-purple-500 mt-1 flex items-center space-x-1">
                    <BookOpen className="w-4 h-4 shrink-0" />
                    <span>{cs.subjectName} ({cs.subjectCode})</span>
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <Link
                  href={`/teacher/assignments/create?classSubjectId=${cs.id}`}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors inline-flex items-center space-x-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Assignment</span>
                </Link>
                <Link
                  href={`/teacher/assignments?classSubjectId=${cs.id}`}
                  className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white inline-flex items-center space-x-1"
                >
                  <span>Assignments</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
