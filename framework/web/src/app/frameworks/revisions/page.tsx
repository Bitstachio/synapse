"use client";

import {
  getFrameworkRevisions,
  listFrameworks,
  type FrameworkRevisionsFilters,
  type FrameworkRevision,
} from "@/lib/frameworks-api";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const REVISIONS_QUERY_KEY = ["frameworks", "revisions"] as const;
const DEFAULT_LIMIT = 50;

type FrameworkOption = { id: string; name: string; version: string; label: string };

function formatAction(action: string): string {
  return action.charAt(0).toUpperCase() + action.slice(1).toLowerCase();
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function toDateTimeLocal(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
}

function extractFrameworkOptionsFromRevisions(revisions: FrameworkRevision[]): FrameworkOption[] {
  const byId = new Map<string, FrameworkOption>();
  for (const rev of revisions) {
    if (!byId.has(rev.frameworkId)) {
      byId.set(rev.frameworkId, {
        id: rev.frameworkId,
        name: rev.frameworkName,
        version: rev.frameworkVersion,
        label: `${rev.frameworkName} (v${rev.frameworkVersion})`,
      });
    }
  }
  return Array.from(byId.values());
}

export default function FrameworkRevisionsPage() {
  const [frameworkId, setFrameworkId] = useState("");
  const [frameworkComboboxInput, setFrameworkComboboxInput] = useState("");
  const [frameworkComboboxOpen, setFrameworkComboboxOpen] = useState(false);
  const frameworkComboboxRef = useRef<HTMLDivElement>(null);
  const [userId, setUserId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [offset, setOffset] = useState(0);

  const filters: FrameworkRevisionsFilters = useMemo(
    () => ({
      ...(frameworkId && { frameworkId }),
      ...(userId.trim() && { userId: userId.trim() }),
      ...(from && { from }),
      ...(to && { to }),
      limit,
      ...(offset > 0 && { offset }),
    }),
    [frameworkId, userId, from, to, limit, offset],
  );

  const { data: frameworks = [] } = useQuery({
    queryKey: ["frameworks", "list"],
    queryFn: listFrameworks,
  });

  const { data: revisionsForDropdown } = useQuery({
    queryKey: [...REVISIONS_QUERY_KEY, "dropdown", { limit: 500 }],
    queryFn: () => getFrameworkRevisions({ limit: 500 }),
  });

  const frameworkOptions: FrameworkOption[] = useMemo(() => {
    const fromList: FrameworkOption[] = frameworks.map((f) => ({
      id: f._id,
      name: f.name,
      version: f.version,
      label: `${f.name} (v${f.version})`,
    }));
    const fromRevisions = extractFrameworkOptionsFromRevisions(revisionsForDropdown?.data ?? []);
    const byId = new Map<string, FrameworkOption>(fromList.map((f) => [f.id, f]));
    for (const f of fromRevisions) {
      if (!byId.has(f.id)) byId.set(f.id, f);
    }
    return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  }, [frameworks, revisionsForDropdown?.data]);

  const filteredFrameworkOptions = useMemo(() => {
    const q = frameworkComboboxInput.trim().toLowerCase();
    if (!q) return frameworkOptions;
    return frameworkOptions.filter(
      (opt) =>
        opt.name.toLowerCase().includes(q) ||
        opt.version.toLowerCase().includes(q) ||
        opt.label.toLowerCase().includes(q),
    );
  }, [frameworkOptions, frameworkComboboxInput]);

  const selectedFramework = useMemo(
    () => frameworkOptions.find((f) => f.id === frameworkId),
    [frameworkOptions, frameworkId],
  );

  useEffect(() => {
    if (selectedFramework && !frameworkComboboxOpen) {
      setFrameworkComboboxInput(selectedFramework.label);
    } else if (!frameworkId && !frameworkComboboxOpen) {
      setFrameworkComboboxInput("");
    }
  }, [frameworkId, selectedFramework, frameworkComboboxOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (frameworkComboboxRef.current && !frameworkComboboxRef.current.contains(e.target as Node)) {
        setFrameworkComboboxOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectFramework = useCallback((opt: FrameworkOption | null) => {
    setFrameworkId(opt ? opt.id : "");
    setFrameworkComboboxInput(opt ? opt.label : "");
    setFrameworkComboboxOpen(false);
    setOffset(0);
  }, []);

  const {
    data: revisionsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [...REVISIONS_QUERY_KEY, filters],
    queryFn: () => getFrameworkRevisions(filters),
  });

  const revisions: FrameworkRevision[] = revisionsData?.data ?? [];
  const hasMore = revisions.length === limit;
  const hasPrevious = offset > 0;
  const currentPage = Math.floor(offset / limit) + 1;

  const pageIndices: (number | "ellipsis")[] = useMemo(() => {
    const pages: (number | "ellipsis")[] = [1];
    if (currentPage === 1) {
      if (hasMore) pages.push(2);
    } else if (currentPage === 2) {
      pages.push(2);
      if (hasMore) pages.push(3);
    } else {
      pages.push("ellipsis");
      pages.push(currentPage - 1);
      pages.push(currentPage);
      if (hasMore) pages.push(currentPage + 1);
    }
    return pages;
  }, [currentPage, hasMore]);

  const goToPage = useCallback(
    (page: number) => {
      setOffset((page - 1) * limit);
    },
    [limit],
  );

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Framework Revision History
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          View a log of framework modifications (created, updated, deleted, activated) with date, time, and user.
        </p>

        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900/30">
          <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Filters</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div ref={frameworkComboboxRef} className="relative">
              <label htmlFor="filter-framework" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Framework
              </label>
              <div className="relative mt-1">
                <input
                  id="filter-framework"
                  type="text"
                  value={frameworkComboboxInput}
                  onChange={(e) => {
                    setFrameworkComboboxInput(e.target.value);
                    setFrameworkComboboxOpen(true);
                  }}
                  onFocus={() => setFrameworkComboboxOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setFrameworkComboboxOpen(false);
                    }
                  }}
                  placeholder="Type to search..."
                  autoComplete="off"
                  className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 pr-8 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                />
                {frameworkId && (
                  <button
                    type="button"
                    onClick={() => handleSelectFramework(null)}
                    className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
                    aria-label="Clear framework filter"
                  >
                    ×
                  </button>
                )}
              </div>
              {frameworkComboboxOpen && (
                <ul
                  className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800"
                  role="listbox"
                >
                  <li>
                    <button
                      type="button"
                      role="option"
                      onClick={() => handleSelectFramework(null)}
                      className="w-full px-3 py-2 text-left text-sm text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-700"
                    >
                      All frameworks
                    </button>
                  </li>
                  {filteredFrameworkOptions.length === 0 ? (
                    <li className="px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400">No matching frameworks</li>
                  ) : (
                    filteredFrameworkOptions.map((opt) => (
                      <li key={opt.id}>
                        <button
                          type="button"
                          role="option"
                          onClick={() => handleSelectFramework(opt)}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 ${
                            frameworkId === opt.id
                              ? "bg-zinc-100 font-medium dark:bg-zinc-700"
                              : "text-zinc-900 dark:text-zinc-100"
                          }`}
                        >
                          {opt.label}
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
            <div>
              <label htmlFor="filter-user" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                User ID (Auth0 sub)
              </label>
              <input
                id="filter-user"
                type="text"
                value={userId}
                onChange={(e) => {
                  setUserId(e.target.value);
                  setOffset(0);
                }}
                placeholder="E.g. auth0|..."
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
            <div>
              <label htmlFor="filter-from" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                From Date (ISO 8601)
              </label>
              <input
                id="filter-from"
                type="datetime-local"
                value={from ? toDateTimeLocal(from) : ""}
                onChange={(e) => {
                  setFrom(e.target.value ? new Date(e.target.value).toISOString() : "");
                  setOffset(0);
                }}
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
            <div>
              <label htmlFor="filter-to" className="block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                To Date (ISO 8601)
              </label>
              <input
                id="filter-to"
                type="datetime-local"
                value={to ? toDateTimeLocal(to) : ""}
                onChange={(e) => {
                  setTo(e.target.value ? new Date(e.target.value).toISOString() : "");
                  setOffset(0);
                }}
                className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <div>
              <label htmlFor="filter-limit" className="mr-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Max results
              </label>
              <select
                id="filter-limit"
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setOffset(0);
                }}
                className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="mt-6 flex justify-center py-12">
            <p className="text-zinc-500">Loading revision history…</p>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
            <p>{error.message}</p>
          </div>
        )}

        {!isLoading && !error && (
          <>
            <div className="mt-6 overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900/30">
              {revisions.length === 0 ? (
                <div className="p-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  No revisions found. Try adjusting the filters.
                </div>
              ) : (
                <table className="w-full min-w-[600px] table-fixed text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50">
                      <th className="w-[10%] px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">Action</th>
                      <th className="w-[20%] px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">Date & time</th>
                      <th className="w-[20%] px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">User ID</th>
                      <th className="w-[25%] px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">Framework</th>
                      <th className="w-[10%] px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">Version</th>
                      <th className="w-[15%] px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">Changes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revisions.map((rev) => (
                      <tr key={rev._id} className="border-b border-zinc-100 dark:border-zinc-700/50">
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${
                              rev.action === "created"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200"
                                : rev.action === "deleted"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200"
                                  : rev.action === "activated"
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200"
                                    : "bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200"
                            }`}
                          >
                            {formatAction(rev.action)}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-zinc-600 dark:text-zinc-400">
                          {formatDateTime(rev.performedAt)}
                        </td>
                        <td
                          className="min-w-0 truncate px-4 py-3 font-mono text-xs text-zinc-600 dark:text-zinc-400"
                          title={rev.userId}
                        >
                          {rev.userId}
                        </td>
                        <td className="min-w-0 px-4 py-3">
                          <Link
                            href={`/frameworks/${rev.frameworkId}`}
                            className="block truncate text-zinc-900 underline hover:no-underline dark:text-zinc-100"
                            title={rev.frameworkName}
                          >
                            {rev.frameworkName}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{rev.frameworkVersion}</td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/frameworks/revisions/${rev._id}`}
                            className="text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {revisions.length > 0 && (hasPrevious || hasMore || currentPage > 1) && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setOffset((o) => Math.max(0, o - limit))}
                  disabled={!hasPrevious}
                  className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {pageIndices.map((p, i) =>
                    p === "ellipsis" ? (
                      <span key={`ellipsis-${i}`} className="px-2 text-sm text-zinc-500 dark:text-zinc-400">
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        type="button"
                        onClick={() => goToPage(p)}
                        className={`min-w-[2.25rem] rounded-md border px-2 py-1.5 text-sm font-medium ${
                          p === currentPage
                            ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                            : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setOffset((o) => o + limit)}
                  disabled={!hasMore}
                  className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
