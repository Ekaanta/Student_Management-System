"use client";

import React from "react";
import { useTheme } from "@/lib/theme-context";

export const ThemeToggle: React.FC<{ className?: string; showLabel?: boolean }> = ({
  className = "",
  showLabel = false,
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={`relative inline-flex items-center justify-center p-2.5 rounded-xl border transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
        isDark
          ? "bg-slate-900/90 border-slate-800 text-amber-400 hover:bg-slate-800 hover:border-slate-700"
          : "bg-white border-slate-200 text-indigo-600 hover:bg-slate-100 hover:border-slate-300"
      } ${className}`}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {/* Sun Icon */}
        <svg
          className={`w-5 h-5 transform transition-all duration-500 ease-in-out ${
            isDark
              ? "rotate-90 scale-0 opacity-0 absolute"
              : "rotate-0 scale-100 opacity-100"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>

        {/* Moon Icon */}
        <svg
          className={`w-5 h-5 transform transition-all duration-500 ease-in-out ${
            isDark
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0 absolute"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      </div>

      {showLabel && (
        <span
          className={`ml-2.5 text-xs font-semibold tracking-wide ${
            isDark ? "text-slate-300" : "text-slate-700"
          }`}
        >
          {isDark ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </button>
  );
};
