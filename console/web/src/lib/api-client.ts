import { dispatchAuthLogout, getStoredToken } from "@/lib/auth-storage";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001").replace(/\/+$/, "");

const resolveApiPath = (path: string): string => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (API_BASE_URL.endsWith("/api/v1") && normalizedPath.startsWith("/api/v1")) {
    return normalizedPath.replace(/^\/api\/v1/, "") || "/";
  }
  return normalizedPath;
};

type RequestInitWithBody = Omit<RequestInit, "body"> & { body?: object };

export const fetchWithAuth = async (
  path: string,
  options: RequestInitWithBody = {},
): Promise<Response> => {
  const token = getStoredToken();
  const { body, ...rest } = options;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const init: RequestInit = {
    ...rest,
    headers,
    ...(body !== undefined && { body: JSON.stringify(body) }),
  };

  const res = await fetch(`${API_BASE_URL}${resolveApiPath(path)}`, init);

  if (res.status === 401) {
    dispatchAuthLogout();
    throw new Error("Unauthorized");
  }

  return res;
};
