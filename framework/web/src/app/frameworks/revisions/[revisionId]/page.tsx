"use client";

import {
  getRevisionById,
  type RevisionDetail,
  type RevisionDiffOp,
} from "@/lib/frameworks-api";
import type { FrameworkContent } from "@/types/framework";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";

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

/** Parse JSON Patch path into indices and field name for framework content */
function parsePath(path: string): { segments: string[]; field?: string } {
  const segments = path.split("/").filter(Boolean);
  const field = segments.length > 0 ? segments[segments.length - 1] : undefined;
  return { segments, field };
}

/** Build a human-readable location from path using content (e.g. "Category GOVERN-STRUCTURE → Subcategory Work Design → Instruction GV.WD4") */
function getLocationLabel(content: FrameworkContent | undefined, path: string): string {
  if (!content?.functions?.length) return path;

  const { segments, field } = parsePath(path);
  const parts: string[] = [];

  let i = 0;
  if (segments[i] === "functions" && segments[i + 1] !== undefined) {
    const funcIdx = parseInt(segments[i + 1], 10);
    const fn = content.functions[funcIdx];
    if (fn) {
      parts.push(`Category ${fn.name}`);
      i += 2;
    }
  }
  if (segments[i] === "categories" && segments[i + 1] !== undefined) {
    const funcIdx = parts.length ? parseInt(segments[1], 10) : 0;
    const catIdx = parseInt(segments[i + 1], 10);
    const cat = content.functions[funcIdx]?.categories?.[catIdx];
    if (cat) {
      parts.push(`Subcategory ${cat.name}`);
      i += 2;
    }
  }
  if (segments[i] === "subcategories" && segments[i + 1] !== undefined) {
    const funcIdx = parts.length ? parseInt(segments[1], 10) : 0;
    const catIdx = parseInt(segments[3], 10);
    const subIdx = parseInt(segments[i + 1], 10);
    const sub = content.functions[funcIdx]?.categories?.[catIdx]?.subcategories?.[subIdx];
    if (sub) {
      parts.push(`Instruction ${sub.id}`);
      i += 2;
    }
  }

  const location = parts.length ? parts.join(" → ") : path;
  // Don't show raw array index (e.g. "3") as a field—it's not meaningful to the user
  if (field && /^\d+$/.test(field)) return location;
  if (field && field !== "description" && field !== "risk_level") return `${location} › ${field}`;
  if (field === "description") return `${location} › Description`;
  if (field === "risk_level") return `${location} › Risk level`;
  return location;
}

/** Get value at JSON Patch path from an object (e.g. content) */
function getValueAtPath(obj: unknown, path: string): unknown {
  const segments = path.split("/").filter(Boolean);
  let current: unknown = obj;
  for (const seg of segments) {
    const key = /^\d+$/.test(seg) ? parseInt(seg, 10) : seg;
    current = (current as Record<string, unknown>)?.[key as string];
  }
  return current;
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
  const contentForLabel = revision?.newContent ?? revision?.previousContent;

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
            <h2 className="mb-3 text-lg font-medium text-zinc-900 dark:text-zinc-100">Changes</h2>
            <ul className="space-y-4">
              {displayableOps.map((op, idx) => {
                const contentForLocation =
                  op.op === "remove" ? revision.previousContent : contentForLabel;
                const locationLabel = getLocationLabel(contentForLocation, op.path);
                const isReplace = op.op === "replace";
                const isAdd = op.op === "add";
                const isRemove = op.op === "remove";
                let oldValue: unknown = undefined;
                let removedValue: unknown = undefined;
                if (revision.previousContent) {
                  try {
                    if (isReplace) {
                      oldValue = getValueAtPath(revision.previousContent, op.path);
                    } else if (isRemove) {
                      removedValue = getValueAtPath(revision.previousContent, op.path);
                    }
                  } catch {
                    // ignore
                  }
                }
                const removedSub = removedValue &&
                  typeof removedValue === "object" &&
                  removedValue !== null &&
                  "id" in removedValue &&
                  "description" in removedValue
                  ? (removedValue as { id: string; description: string; risk_level?: string })
                  : null;

                return (
                  <li
                    key={`${op.path}-${idx}`}
                    className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900/30"
                  >
                    <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">{locationLabel}</p>
                    {isReplace && (
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                            Before
                          </span>
                          <div className="mt-0.5 rounded border border-red-200 bg-red-50/50 px-3 py-2 text-zinc-800 dark:border-red-900/50 dark:bg-red-950/20 dark:text-zinc-200">
                            {typeof oldValue === "string" ? oldValue : JSON.stringify(oldValue ?? "—")}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                            After
                          </span>
                          <div className="mt-0.5 rounded border border-emerald-200 bg-emerald-50/50 px-3 py-2 text-zinc-800 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-zinc-200">
                            {typeof op.value === "string" ? op.value : JSON.stringify(op.value ?? "—")}
                          </div>
                        </div>
                      </div>
                    )}
                    {isAdd && (
                      <div className="rounded border border-emerald-200 bg-emerald-50/50 px-3 py-2 text-sm text-zinc-800 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-zinc-200">
                        <span className="text-xs font-medium uppercase text-emerald-700 dark:text-emerald-400">Added</span>
                        {" — "}
                        {typeof op.value === "string" ? op.value : JSON.stringify(op.value ?? "")}
                      </div>
                    )}
                    {isRemove && (
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                            Removed
                          </span>
                          <div className="mt-0.5 rounded border border-red-200 bg-red-50/50 px-3 py-2 text-zinc-800 dark:border-red-900/50 dark:bg-red-950/20 dark:text-zinc-200">
                            {removedSub ? (
                              <div className="space-y-1">
                                <p>{removedSub.description}</p>
                                {removedSub.risk_level && (
                                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                    Risk level: {removedSub.risk_level}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <>
                                {typeof removedValue === "string"
                                  ? removedValue
                                  : removedValue !== undefined
                                    ? JSON.stringify(removedValue)
                                    : "—"}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    {!isReplace && !isAdd && !isRemove && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        <span className="font-medium">{op.op}</span>
                        {op.value !== undefined && `: ${typeof op.value === "string" ? op.value : JSON.stringify(op.value)}`}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
