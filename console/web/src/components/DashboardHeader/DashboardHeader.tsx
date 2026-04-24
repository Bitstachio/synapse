"use client";

import { useAuth } from "@/lib/auth-context";

export const DashboardHeader = () => {
  const { logout } = useAuth();

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Synapse Framework Manager
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Edit categories and subcategories. Changes are saved to the API.
        </p>
      </div>
      <button
        type="button"
        onClick={() => logout()}
        className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
      >
        Log out
      </button>
    </div>
  );
};
