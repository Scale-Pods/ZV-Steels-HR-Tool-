"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface AuthUser {
  name: string;
  email: string;
  accessType: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refresh: async () => {},
  logout: async () => {},
});

const ACTIVITY_INTERVAL_MS = 5 * 60 * 1000;

async function fetchCurrentUser(): Promise<AuthUser | null> {
  try {
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    fetch("/api/auth/activity", { method: "POST" }).catch(() => {});
    return data.user ?? null;
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const current = await fetchCurrentUser();
      if (cancelled) return;
      setUser(current);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(async () => {
    const current = await fetchCurrentUser();
    setUser(current);
  }, []);

  useEffect(() => {
    if (!user) return;
    const timer = setInterval(() => {
      fetch("/api/auth/activity", { method: "POST" }).catch(() => {});
    }, ACTIVITY_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [user]);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Error signing out:", error);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
