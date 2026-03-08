import type { LoginCredentials } from "@/types/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

type LoginResponse =
  | { data: { access_token: string; expires_in?: number; token_type?: string } }
  | { data: { token: string } }
  | { token: string };

export const loginWithEmailPassword = async (credentials: LoginCredentials): Promise<{ token: string }> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.message || "Login failed");
  }

  const json: LoginResponse = await res.json();
  const token =
    "data" in json && json.data
      ? "access_token" in json.data
        ? json.data.access_token
        : "token" in json.data
          ? json.data.token
          : null
      : "token" in json
        ? json.token
        : null;

  if (!token) {
    throw new Error("Invalid login response");
  }

  return { token };
};

/** Notify the backend that the user is logging out (no auth header or body). Call before clearing the token. */
export const callLogoutEndpoint = async (): Promise<void> => {
  await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
    method: "POST",
  });
  // Ignore errors: we still clear the token and redirect; backend is best-effort for analytics.
};
