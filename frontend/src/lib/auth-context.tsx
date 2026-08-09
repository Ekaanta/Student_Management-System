"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthResponse, UserRole } from "@/types";
import { STORAGE_KEYS } from "./constants";
import { useRouter } from "next/navigation";

export const isAdminRole = (role: UserRole | string | number | undefined | null): boolean => {
  if (role === null || role === undefined) return false;
  return (
    role === UserRole.Admin ||
    Number(role) === 1 ||
    String(role).toLowerCase() === "admin"
  );
};

export const isTeacherRole = (role: UserRole | string | number | undefined | null): boolean => {
  if (role === null || role === undefined) return false;
  return (
    role === UserRole.Teacher ||
    Number(role) === 2 ||
    String(role).toLowerCase() === "teacher"
  );
};

export const isStudentRole = (role: UserRole | string | number | undefined | null): boolean => {
  if (role === null || role === undefined) return false;
  return (
    role === UserRole.Student ||
    Number(role) === 3 ||
    String(role).toLowerCase() === "student"
  );
};

interface AuthContextType {
  user: AuthResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (authData: AuthResponse) => void;
  updateUser: (updatedUser: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  updateUser: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (err) {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (authData: AuthResponse) => {
    setToken(authData.token);
    setUser(authData);
    localStorage.setItem(STORAGE_KEYS.TOKEN, authData.token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(authData));

    if (isAdminRole(authData.role)) {
      router.push("/admin");
    } else if (isTeacherRole(authData.role)) {
      router.push("/teacher");
    } else if (isStudentRole(authData.role)) {
      router.push("/student");
    } else {
      router.push("/");
    }
  };

  const updateUser = (updatedUser: AuthResponse) => {
    setUser(updatedUser);
    if (updatedUser.token) {
      setToken(updatedUser.token);
      localStorage.setItem(STORAGE_KEYS.TOKEN, updatedUser.token);
    }
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
