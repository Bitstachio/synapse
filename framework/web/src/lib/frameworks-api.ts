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
    framework: rest,
    id: _id,
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

export const updateFrameworkVersion = async (id: string, input: FrameworkWritePayload) => {
  const res = await fetchWithAuth(`/api/v1/frameworks/${id}`, {
    method: "PATCH",
    body: input as object,
  });

  if (!res.ok) {
    throw new Error("Failed to update framework");
  }

  return res.json();
};
