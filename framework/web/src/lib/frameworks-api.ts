import type { Framework } from "@/types/framework";

// TODO: Remove localhost:3001 once the API is set up
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

type ActiveFrameworkResponse = {
  data: Framework;
};

export const getActiveFramework = async (): Promise<Framework> => {
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
  return json.data;
};

export const saveFrameworkVersion = async (input: unknown) => {
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
