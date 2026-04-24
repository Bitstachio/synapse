"use client";

import { FrameworkRevisionChangeList } from "@/components/FrameworkTree/FrameworkRevisionChangeList";
import { FrameworkRevisionTree } from "@/components/FrameworkTree/FrameworkRevisionTree";
import { ReturnToTop } from "@/components/ReturnToTop/ReturnToTop";
import { getRevisionById, type RevisionDetail, type RevisionDiffOp } from "@/lib/frameworks-api";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

const REVISION_DETAIL_QUERY_KEY = ["frameworks", "revision"] as const;

function formatAction(action: string): string {
  return action.charAt(0).toUpperCase() + action.slice(1).toLowerCase();
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** Filter to user-visible ops (skip "test" which is used for validation) */
function getDisplayableDiff(diff: RevisionDiffOp[] | undefined): RevisionDiffOp[] {
  if (!diff?.length) return [];
  return diff.filter((op) => op.op !== "test");
}

export default function RevisionDiffPage() {
  const params = useParams();
  const revisionId = typeof params.revisionId === "string" ? params.revisionId : null;

  const { data, isLoading, error } = useQuery({
    queryKey: [...REVISION_DETAIL_QUERY_KEY, revisionId],
    queryFn: () => getRevisionById(revisionId!),
    enabled: !!revisionId,
  });

  const revision: RevisionDetail | undefined = data?.data;
  const hasDiff = revision?.diff && getDisplayableDiff(revision.diff).length > 0;
  const [viewMode, setViewMode] = useState<"list" | "context">("list");

  if (!revisionId) {
    return (
      <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-zinc-600 dark:text-zinc-400">Invalid revision.</p>
          <Link
            href="/frameworks/revisions"
            className="mt-2 inline-block text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Revision history
          </Link>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-zinc-500">Loading revision…</p>
        </main>
      </div>
    );
  }

  if (error || !revision) {
    return (
      <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-red-600 dark:text-red-400">{error?.message ?? "Revision not found."}</p>
          <Link
            href="/frameworks/revisions"
            className="mt-2 inline-block text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Revision history
          </Link>
        </main>
      </div>
    );
  }

  const displayableOps = getDisplayableDiff(revision.diff);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/frameworks/revisions"
          className="mb-6 inline-block text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Revision history
        </Link>

        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900/30">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Revision: {formatAction(revision.action)}
          </h1>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-medium text-zinc-500 dark:text-zinc-400">Framework</dt>
              <dd>
                <Link
                  href={`/frameworks/${revision.frameworkId}`}
                  className="text-zinc-900 underline hover:no-underline dark:text-zinc-100"
                >
                  {revision.frameworkName}
                </Link>{" "}
                (v{revision.frameworkVersion})
              </dd>
            </div>
            <div>
              <dt className="font-medium text-zinc-500 dark:text-zinc-400">Date & time</dt>
              <dd className="text-zinc-700 dark:text-zinc-300">{formatDateTime(revision.performedAt)}</dd>
            </div>
            <div>
              <dt className="font-medium text-zinc-500 dark:text-zinc-400">User</dt>
              <dd className="truncate font-mono text-xs text-zinc-700 dark:text-zinc-300" title={revision.userId}>
                {revision.userId}
              </dd>
            </div>
          </dl>
        </div>

        {!hasDiff ? (
          <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-900/30">
            <p className="text-zinc-600 dark:text-zinc-400">
              Diff is not available for this revision. Earlier records were not stored with change details.
            </p>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
              You can still open the framework above to see its current content.
            </p>
          </div>
        ) : (
          <div className="mt-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Changes</h2>
              <div
                className="inline-flex rounded-lg border border-zinc-200 bg-zinc-100/50 p-0.5 dark:border-zinc-700 dark:bg-zinc-800/50"
                role="tablist"
                aria-label="Change view"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={viewMode === "list"}
                  onClick={() => setViewMode("list")}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    viewMode === "list"
                      ? "bg-white text-zinc-900 shadow dark:bg-zinc-700 dark:text-zinc-100"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  }`}
                >
                  List
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={viewMode === "context"}
                  onClick={() => setViewMode("context")}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    viewMode === "context"
                      ? "bg-white text-zinc-900 shadow dark:bg-zinc-700 dark:text-zinc-100"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  }`}
                >
                  In Context
                </button>
              </div>
            </div>

            {viewMode === "list" ? (
              <FrameworkRevisionChangeList revision={revision} displayableOps={displayableOps} />
            ) : (
              <FrameworkRevisionTree revision={revision} displayableOps={displayableOps} />
            )}
          </div>
        )}
      </main>
      <ReturnToTop />
    </div>
  );
}
