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
