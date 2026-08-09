"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, isAdminRole } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV_ITEMS = [
  { name: "Overview", href: "/admin", icon: "📊" },
  { name: "User Management", href: "/admin/users", icon: "👥" },
  { name: "Class Management", href: "/admin/classes", icon: "🏫" },
  { name: "Subject Management", href: "/admin/subjects", icon: "📖" },
  { name: "Teacher Assignments", href: "/admin/teacher-assignments", icon: "👨‍🏫" },
  { name: "My Profile", href: "/admin/profile", icon: "👤" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdminRole(user?.role))) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading || !isAuthenticated || !user || !isAdminRole(user.role)) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Verifying Admin Permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-white dark:bg-slate-900/90 border-r border-slate-200 dark:border-slate-800/80 flex flex-col justify-between p-6 shrink-0 sticky top-0 h-screen transition-colors duration-300">
        <div>
          <div className="flex items-center space-x-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/25">
              Edu
            </div>
            <div>
              <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                AssignmentHub
              </span>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Admin Control</span>
            </div>
          </div>

          <nav className="space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Theme Toggle & User Account Info */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Appearance</span>
            <ThemeToggle showLabel={true} />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800/40 flex items-center justify-between">
            <Link href="/admin/profile" className="flex items-center space-x-3 overflow-hidden group hover:opacity-80 transition-opacity">
              {user.profilePictureUrl ? (
                <img
                  src={user.profilePictureUrl}
                  alt={user.firstName}
                  className="w-9 h-9 rounded-xl object-cover border border-indigo-500/30 shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300 font-bold flex items-center justify-center shrink-0">
                  {user.firstName[0]}
                </div>
              )}
              <div className="truncate">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-500 transition-colors">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
              </div>
            </Link>
            <button
              onClick={logout}
              title="Sign out"
              className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors shrink-0"
            >
              🚪
            </button>
          </div>
        </div>
      </aside>

      {/* Main Page Area */}
      <main className="flex-1 p-8 overflow-y-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
}
