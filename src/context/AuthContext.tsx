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

/**
 * Authentication context provider.
 * Manages user authentication state, JWT tokens, and provides login/signup/logout functions.
 * Persists authentication state in localStorage for session persistence.
 */
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
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
          let errorMessage = "Login failed";
          try {
            const data = await res.json();
            errorMessage =
              (data && (data.message as string)) ??
              (typeof data === "string" ? data : "Login failed");
          } catch {
            // If response is not JSON, use status text
            errorMessage = res.statusText || "Login failed";
          }
          throw new Error(errorMessage);
        }

        const data = await res.json();

        const nextToken = data.token as string;
        const nextUser: AuthUser = {
          id: data.userId,
          email: data.email,
          role: data.role,
        };
        persistAuth(nextToken, nextUser);
      } catch (error) {
        if (error instanceof TypeError && error.message === "Failed to fetch") {
          throw new Error(
            "Cannot connect to server. Please make sure the backend is running on http://localhost:8080 and the API Gateway is running on http://localhost:8085"
          );
        }
        throw error;
      }
    },
    [persistAuth]
  );

  const signup = useCallback(
    async (email: string, password: string, role: UserRole) => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password, role }),
        });

        if (!res.ok) {
          let errorMessage = "Signup failed";
          try {
            const data = await res.json();
            errorMessage =
              (data && (data.message as string)) ??
              (typeof data === "string" ? data : "Signup failed");
          } catch {
            // If response is not JSON, use status text
            errorMessage = res.statusText || "Signup failed";
          }
          throw new Error(errorMessage);
        }

        const data = await res.json();

        const nextToken = data.token as string;
        const nextUser: AuthUser = {
          id: data.userId,
          email: data.email,
          role: data.role,
        };
        persistAuth(nextToken, nextUser);
      } catch (error) {
        if (error instanceof TypeError && error.message === "Failed to fetch") {
          throw new Error(
            "Cannot connect to server. Please make sure the backend is running on http://localhost:8080 and the API Gateway is running on http://localhost:8085"
          );
        }
        throw error;
      }
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

/**
 * Hook to access authentication context.
 * Must be used within an AuthProvider component.
 *
 * @returns AuthContextValue containing user, token, and auth functions
 * @throws Error if used outside AuthProvider
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}


