"use client";

import { createFrameworkVersion, listFrameworks, type FrameworkListItem } from "@/lib/frameworks-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ReturnToTop } from "@/components/ReturnToTop/ReturnToTop";
import { ACTIVE_FRAMEWORK_QUERY_KEY } from "@/components/FrameworkTree/useActiveFramework";

const FRAMEWORKS_LIST_QUERY_KEY = ["frameworks", "list"] as const;

type SortOption = "name" | "dateModified";

const emptyContent = { functions: [] };

function sortFrameworks(frameworks: FrameworkListItem[], sortBy: SortOption): FrameworkListItem[] {
  const copy = [...frameworks];
  if (sortBy === "name") {
    copy.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  } else {
    copy.sort((a, b) => {
      const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return bTime - aTime;
    });
  }
  return copy;
}

export default function FrameworksPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createVersion, setCreateVersion] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("dateModified");

  const {
    data: frameworks = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: FRAMEWORKS_LIST_QUERY_KEY,
    queryFn: listFrameworks,
  });

  const createMutation = useMutation({
    mutationFn: createFrameworkVersion,
    onSuccess: (res: { data?: { _id?: string }; _id?: string }) => {
      queryClient.invalidateQueries({ queryKey: FRAMEWORKS_LIST_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ACTIVE_FRAMEWORK_QUERY_KEY });
      const id = res?.data?._id ?? res?._id;
      setShowCreate(false);
      setCreateName("");
      setCreateVersion("");
      if (id) router.push(`/frameworks/${id}`);
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name: createName.trim(),
      version: createVersion.trim(),
      content: emptyContent,
    });
  };

  const sortedFrameworks = useMemo(() => sortFrameworks(frameworks, sortBy), [frameworks, sortBy]);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Manage Frameworks</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Create new frameworks, edit any iteration, or set which one is active.
        </p>

        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            {showCreate ? (
              <form
                onSubmit={handleCreateSubmit}
                className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900/30"
              >
                <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">New framework</h2>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="min-w-0 flex-1">
                    <label htmlFor="create-name" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      Name
                    </label>
                    <input
                      id="create-name"
                      type="text"
                      value={createName}
                      onChange={(e) => setCreateName(e.target.value)}
                      required
                      placeholder="e.g. Engineering Framework"
                      className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </div>
                  <div className="w-32">
                    <label
                      htmlFor="create-version"
                      className="block text-xs font-medium text-zinc-500 dark:text-zinc-400"
                    >
                      Version
                    </label>
                    <input
                      id="create-version"
                      type="text"
                      value={createVersion}
                      onChange={(e) => setCreateVersion(e.target.value)}
                      required
                      placeholder="1.0"
                      className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={createMutation.isPending}
                      className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
                    >
                      {createMutation.isPending ? "Creating…" : "Create"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreate(false)}
                      className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
                {createMutation.isError && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{createMutation.error.message}</p>
                )}
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900/30 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                + Create
              </button>
            )}
          </div>
          {!isLoading && !error && frameworks.length > 0 && (
            <div className="flex shrink-0 items-center gap-3">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">Sort by</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option value="dateModified">Date modified</option>
                <option value="name">Name (A–Z)</option>
              </select>
            </div>
          )}
        </div>

        {isLoading && (
          <div className="mt-8 flex justify-center py-12">
            <p className="text-zinc-500">Loading frameworks…</p>
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
            <p>{error.message}</p>
          </div>
        )}

        {!isLoading && !error && frameworks.length === 0 && !showCreate && (
          <div className="mt-8 rounded-lg border border-zinc-200 bg-zinc-50 p-6 text-center text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-400">
            <p>No frameworks yet. Create one above.</p>
          </div>
        )}

        {!isLoading && !error && frameworks.length > 0 && (
          <>
            <ul className="mt-8 space-y-3">
              {sortedFrameworks.map((fw) => (
                <FrameworkRow key={fw._id} framework={fw} />
              ))}
            </ul>
          </>
        )}
      </main>
      <ReturnToTop />
    </div>
  );
}

function FrameworkRow({ framework }: { framework: FrameworkListItem }) {
  const updatedAtLabel = framework.updatedAt
    ? new Date(framework.updatedAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  return (
    <li className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-700 dark:bg-zinc-900/30">
      <Link href={`/frameworks/${framework._id}`} className="min-w-0 flex-1 hover:opacity-90">
        <div className="flex items-center gap-2">
          <span className="font-medium text-zinc-900 dark:text-zinc-100">{framework.name}</span>
          {framework.isActive && (
            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
              Active
            </span>
          )}
        </div>
        <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
          Version {framework.version}
          {updatedAtLabel && <span className="ml-2 text-zinc-500">· Updated {updatedAtLabel}</span>}
        </p>
      </Link>
    </li>
  );
}
