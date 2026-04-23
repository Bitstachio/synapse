"use client";

import React, { useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { callLogoutEndpoint, loginWithEmailPassword } from "@/lib/auth-api";
import {
  AUTH_LOGOUT_EVENT,
  clearStoredToken,
  getStoredToken,
  setStoredToken,
} from "@/lib/auth-storage";
import type { LoginCredentials } from "@/types/auth";

type AuthState = {
  token: string | null;
  isReady: boolean;
};

type AuthContextValue = AuthState & {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};

type AuthProviderProps = {
  children: React.ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, setState] = useState<AuthState>(() => ({
    token: getStoredToken(),
    isReady: true,
  }));
  const router = useRouter();

  useEffect(() => {
    const handleLogout = () => setState((s) => ({ ...s, token: null }));
    window.addEventListener(AUTH_LOGOUT_EVENT, handleLogout);
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, handleLogout);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const { token } = await loginWithEmailPassword(credentials);
    setStoredToken(token);
    setState({ token, isReady: true });
    router.push("/");
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await callLogoutEndpoint();
    } catch {
      // Ignore: still clear token and redirect
    }
    clearStoredToken();
    setState((s) => ({ ...s, token: null }));
    router.push("/login");
  }, [router]);

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    isAuthenticated: !!state.token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
