"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type UserRole = "LIBRARIAN" | "USER";

export interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_TOKEN_KEY = "lms_token";
const STORAGE_USER_KEY = "lms_user";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8085";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore auth state from localStorage on initial load
    try {
      const storedToken =
        typeof window !== "undefined"
          ? window.localStorage.getItem(STORAGE_TOKEN_KEY)
          : null;
      const storedUser =
        typeof window !== "undefined"
          ? window.localStorage.getItem(STORAGE_USER_KEY)
          : null;

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch {
      // ignore corrupted localStorage
    } finally {
      setLoading(false);
    }
  }, []);

  const persistAuth = useCallback((nextToken: string, nextUser: AuthUser) => {
    setToken(nextToken);
    setUser(nextUser);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_TOKEN_KEY, nextToken);
      window.localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(nextUser));
    }
  }, []);

  const clearAuth = useCallback(() => {
    setToken(null);
    setUser(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_TOKEN_KEY);
      window.localStorage.removeItem(STORAGE_USER_KEY);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const message =
          (data && (data.message as string)) ??
          (typeof data === "string" ? data : "Login failed");
        throw new Error(message);
      }

      const nextToken = data.token as string;
      const nextUser: AuthUser = {
        id: data.userId,
        email: data.email,
        role: data.role,
      };
      persistAuth(nextToken, nextUser);
    },
    [persistAuth]
  );

  const signup = useCallback(
    async (email: string, password: string, role: UserRole) => {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        const message =
          (data && (data.message as string)) ??
          (typeof data === "string" ? data : "Signup failed");
        throw new Error(message);
      }

      const nextToken = data.token as string;
      const nextUser: AuthUser = {
        id: data.userId,
        email: data.email,
        role: data.role,
      };
      persistAuth(nextToken, nextUser);
    },
    [persistAuth]
  );

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: !!token,
    loading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}


