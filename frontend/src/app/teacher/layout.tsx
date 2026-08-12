"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, isTeacherRole, isAdminRole } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  LayoutDashboard,
  School,
  FileText,
  PlusCircle,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/teacher", icon: LayoutDashboard },
  { name: "My Classes & Subjects", href: "/teacher/classes", icon: School },
  { name: "Assignments", href: "/teacher/assignments", icon: FileText },
  { name: "Create Assignment", href: "/teacher/assignments/create", icon: PlusCircle },
  { name: "My Profile", href: "/teacher/profile", icon: User },
];

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthorized = isTeacherRole(user?.role) || isAdminRole(user?.role);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAuthorized)) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, isAuthorized, router]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (isLoading || !isAuthenticated || !user || !isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Verifying Teacher Credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-md bg-gradient-to-tr from-purple-500 via-indigo-500 to-pink-500 flex items-center justify-center font-semibold text-white text-xs shrink-0">
            OP
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-900 dark:text-white block tracking-tight">
              OnnoRokom Projukti
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Teacher Portal
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <ThemeToggle showLabel={false} />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex flex-col justify-between p-4 bg-white dark:bg-slate-900">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-md bg-gradient-to-tr from-purple-500 via-indigo-500 to-pink-500 flex items-center justify-center font-semibold text-white text-xs">
                  OP
                </div>
                <div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white block">
                    OnnoRokom Projukti
                  </span>
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    Teacher Portal
                  </span>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-1.5">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-purple-600 text-white"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Appearance</span>
              <ThemeToggle showLabel={true} />
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800/40 flex items-center justify-between">
              <Link
                href="/teacher/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 overflow-hidden"
              >
                {user.profilePictureUrl ? (
                  <img
                    src={user.profilePictureUrl}
                    alt={user.firstName}
                    className="w-9 h-9 rounded-xl object-cover border border-purple-500/30 shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-300 font-bold flex items-center justify-center shrink-0">
                    {user.firstName[0]}
                  </div>
                )}
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
              </Link>
              <button
                onClick={logout}
                title="Sign out"
                className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex w-72 bg-white dark:bg-slate-900/90 border-r border-slate-200 dark:border-slate-800/80 flex-col justify-between p-6 shrink-0 sticky top-0 h-screen transition-colors duration-300">
        <div>
          <div className="flex items-center space-x-3 mb-8 shrink-0">
            <div className="w-10 h-10 rounded-md bg-gradient-to-tr from-purple-500 via-indigo-500 to-pink-500 flex items-center justify-center font-semibold text-white text-sm shrink-0">
              OP
            </div>
            <div className="min-w-0">
              <span className="text-sm font-semibold text-slate-900 dark:text-white whitespace-nowrap block tracking-tight">
                OnnoRokom Projukti
              </span>
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Teacher Portal
              </span>
            </div>
          </div>

          <nav className="space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-purple-600 text-white"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
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
            <Link href="/teacher/profile" className="flex items-center space-x-3 overflow-hidden group hover:opacity-80 transition-opacity">
              {user.profilePictureUrl ? (
                <img
                  src={user.profilePictureUrl}
                  alt={user.firstName}
                  className="w-9 h-9 rounded-xl object-cover border border-purple-500/30 shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-600 dark:text-purple-300 font-bold flex items-center justify-center shrink-0">
                  {user.firstName[0]}
                </div>
              )}
              <div className="truncate">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-purple-500 transition-colors">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
              </div>
            </Link>
            <button
              onClick={logout}
              title="Sign out"
              className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors shrink-0 flex items-center justify-center"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-3 sm:p-6 md:p-8 overflow-y-auto w-full min-w-0">
        {children}
      </main>
    </div>
  );
}
