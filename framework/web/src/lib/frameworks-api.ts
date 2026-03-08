import { fetchWithAuth } from "@/lib/api-client";
import type { Framework } from "@/types/framework";

type ActiveFrameworkResponse = {
  data: Framework & { _id: string };
};

export type ActiveFramework = {
  framework: Framework;
  id: string;
};

export type FrameworkWritePayload = Pick<Framework, "name" | "version" | "content">;

/** Thrown when PATCH returns 409 (framework was modified by another user) */
export class FrameworkConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FrameworkConflictError";
  }
}

export const getActiveFramework = async (): Promise<ActiveFramework> => {
  const res = await fetchWithAuth("/api/v1/frameworks/active", {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to load active framework");
  }

  const json: ActiveFrameworkResponse = await res.json();
  const { _id, ...rest } = json.data;
  return {
    framework: rest as Framework,
    id: _id,
  };
};

export const getFrameworkById = async (id: string): Promise<ActiveFramework> => {
  const res = await fetchWithAuth(`/api/v1/frameworks/${id}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to load framework");
  }

  const json: ActiveFrameworkResponse = await res.json();
  const data = json.data ?? json;
  const { _id, ...rest } = data;
  return {
    framework: rest as Framework,
    id: _id ?? id,
  };
};

export const createFrameworkVersion = async (input: FrameworkWritePayload) => {
  const res = await fetchWithAuth("/api/v1/frameworks", {
    method: "POST",
    body: input as object,
  });

  if (!res.ok) {
    throw new Error("Failed to save framework");
  }

  return res.json();
};

export type UpdateFrameworkOptions = {
  /** ISO 8601 string; if provided, update is applied only when DB updatedAt matches (optimistic lock) */
  lastKnownUpdatedAt?: string;
};

export const updateFrameworkVersion = async (
  id: string,
  input: FrameworkWritePayload,
  options?: UpdateFrameworkOptions,
) => {
  const body = {
    ...input,
    ...(options?.lastKnownUpdatedAt != null && { lastKnownUpdatedAt: options.lastKnownUpdatedAt }),
  };
  const res = await fetchWithAuth(`/api/v1/frameworks/${id}`, {
    method: "PATCH",
    body,
  });

  if (res.status === 409) {
    const json = await res.json().catch(() => ({}));
    const message =
      typeof json?.message === "string"
        ? json.message
        : "The framework was modified by another user. Please refresh and submit again.";
    throw new FrameworkConflictError(message);
  }

  if (!res.ok) {
    throw new Error("Failed to update framework");
  }

  return res.json();
};

export type FrameworkListItem = {
  _id: string;
  name: string;
  version: string;
  isActive: boolean;
  updatedAt?: string;
};

type ListFrameworksResponse = {
  data: FrameworkListItem[];
};

export const listFrameworks = async (): Promise<FrameworkListItem[]> => {
  const res = await fetchWithAuth("/api/v1/frameworks", {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to list frameworks");
  }

  const json = await res.json();
  if (Array.isArray(json)) return json as FrameworkListItem[];
  return (json as ListFrameworksResponse).data ?? [];
};

export const activateFramework = async (id: string): Promise<void> => {
  const res = await fetchWithAuth(`/api/v1/frameworks/${id}/activate`, {
    method: "PATCH",
  });

  if (!res.ok) {
    throw new Error("Failed to activate framework");
  }
};

export const deleteFramework = async (id: string): Promise<void> => {
  const res = await fetchWithAuth(`/api/v1/frameworks/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete framework");
  }
};

export type FrameworkRevisionAction = "created" | "updated" | "deleted" | "activated";

export type FrameworkRevision = {
  _id: string;
  action: FrameworkRevisionAction;
  frameworkId: string;
  frameworkName: string;
  frameworkVersion: string;
  userId: string;
  performedAt: string;
};

export type FrameworkRevisionsFilters = {
  frameworkId?: string;
  userId?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
};

export type FrameworkRevisionsResponse = {
  data: FrameworkRevision[];
  meta?: { timestamp?: string; path?: string };
};

export const getFrameworkRevisions = async (
  filters: FrameworkRevisionsFilters = {},
): Promise<FrameworkRevisionsResponse> => {
  const params = new URLSearchParams();
  if (filters.frameworkId) params.set("frameworkId", filters.frameworkId);
  if (filters.userId) params.set("userId", filters.userId);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.limit != null) params.set("limit", String(Math.min(100, Math.max(1, filters.limit))));
  if (filters.offset != null && filters.offset > 0) params.set("offset", String(filters.offset));

  const query = params.toString();
  const url = `/api/v1/frameworks/revisions${query ? `?${query}` : ""}`;
  const res = await fetchWithAuth(url, { method: "GET", cache: "no-store" });

  if (!res.ok) {
    throw new Error("Failed to load revision history");
  }

  return res.json();
};
