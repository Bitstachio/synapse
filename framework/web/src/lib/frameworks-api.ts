import type { Framework } from "@/types/framework";

// TODO: Remove localhost:3001 once the API is set up
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

type ActiveFrameworkResponse = {
  data: Framework & { _id: string };
};

export type ActiveFramework = {
  framework: Framework;
  id: string;
};

export type FrameworkWritePayload = Pick<Framework, "name" | "version" | "content">;

export const getActiveFramework = async (): Promise<ActiveFramework> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/frameworks/active`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
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
  const res = await fetch(`${API_BASE_URL}/api/v1/frameworks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    throw new Error("Failed to save framework");
  }

  return res.json();
};

export const updateFrameworkVersion = async (id: string, input: FrameworkWritePayload) => {
  const res = await fetch(`${API_BASE_URL}/api/v1/frameworks/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    throw new Error("Failed to update framework");
  }

  return res.json();
};

