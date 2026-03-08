"use client";

import { getRevisionById, type RevisionDetail, type RevisionDiffOp } from "@/lib/frameworks-api";
import type { FrameworkContent } from "@/types/framework";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { type ReactNode, useState } from "react";

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

/** Path up to and including the item (e.g. /functions/0/categories/0/subcategories/3 for an instruction) */
function getItemPath(path: string): string {
  const segments = path.split("/").filter(Boolean);
  const subIdx = segments.indexOf("subcategories");
  if (subIdx >= 0 && segments[subIdx + 1] !== undefined) {
    return "/" + segments.slice(0, subIdx + 2).join("/");
  }
  const catIdx = segments.indexOf("categories");
  if (catIdx >= 0 && segments[catIdx + 1] !== undefined) {
    return "/" + segments.slice(0, catIdx + 2).join("/");
  }
  const funcIdx = segments.indexOf("functions");
  if (funcIdx >= 0 && segments[funcIdx + 1] !== undefined) {
    return "/" + segments.slice(0, funcIdx + 2).join("/");
  }
  return path;
}

/** Group displayable ops by item path for in-context view */
function groupOpsByItemPath(ops: RevisionDiffOp[]): Map<string, RevisionDiffOp[]> {
  const map = new Map<string, RevisionDiffOp[]>();
  for (const op of ops) {
    const key = getItemPath(op.path);
    const list = map.get(key) ?? [];
    list.push(op);
    map.set(key, list);
  }
  return map;
}

/** Format added value for display: category/function objects as readable summary, not raw JSON */
function formatAddedValue(value: unknown): ReactNode {
  if (value == null) return "—";
  if (typeof value === "string") return value;

  if (typeof value === "object" && value !== null) {
    const o = value as Record<string, unknown>;

    // Top-level category (function): { id, name, description, categories }
    if ("name" in o && Array.isArray(o.categories)) {
      const id = o.id != null ? String(o.id) : null;
      const name = String(o.name ?? o.id ?? "Unnamed");
      const desc = o.description != null && String(o.description).trim() !== "" ? String(o.description) : null;
      const count = o.categories.length;
      const subSummary = count === 0 ? "No subcategories yet" : `${count} subcategor${count === 1 ? "y" : "ies"}`;
      return (
        <div className="space-y-1">
          {id && (
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-500">ID: {id}</p>
          )}
          <p className="font-medium">{name}</p>
          {desc && <p className="text-zinc-600 dark:text-zinc-400">{desc}</p>}
          <p className="text-xs text-zinc-500 dark:text-zinc-500">{subSummary}</p>
        </div>
      );
    }

    // Middle-tier subcategory: { id, name, subcategories }
    if ("name" in o && Array.isArray(o.subcategories)) {
      const name = String(o.name ?? o.id ?? "Unnamed");
      const count = o.subcategories.length;
      const subSummary = count === 0 ? "No instructions yet" : `${count} instruction${count === 1 ? "" : "s"}`;
      return (
        <div className="space-y-1">
          <p className="font-medium">{name}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-500">{subSummary}</p>
        </div>
      );
    }

    // Instruction (subcategory item): { id, description, risk_level }
    if ("description" in o) {
      const desc = String(o.description ?? "");
      const risk = o.risk_level != null ? String(o.risk_level) : null;
      return (
        <div className="space-y-1">
          <p>{desc || "—"}</p>
          {risk && <p className="text-xs text-zinc-600 dark:text-zinc-400">Risk level: {risk}</p>}
        </div>
      );
    }
  }

  return JSON.stringify(value);
}

/** Single change card (before/after, removed, or added) - reused in list and in-context views */
function ChangeCard({
  revision,
  op,
  contentForLabel,
  showLocationLabel = true,
}: {
  revision: RevisionDetail;
  op: RevisionDiffOp;
  contentForLabel: FrameworkContent | undefined;
  showLocationLabel?: boolean;
}) {
  const contentForLocation = op.op === "remove" ? revision.previousContent : contentForLabel;
  const isReplace = op.op === "replace";
  const isAdd = op.op === "add";
  const isRemove = op.op === "remove";
  // For "add" ops, prefer the actual added value's name/id for the label so we show created content, not a generic path
  const addedCategoryLabel =
    isAdd &&
    op.value &&
    typeof op.value === "object" &&
    "name" in op.value &&
    Array.isArray((op.value as Record<string, unknown>).categories)
      ? (() => {
          const v = op.value as Record<string, unknown>;
          const id = v.id != null ? String(v.id) : null;
          const name = String(v.name ?? v.id ?? "New category");
          return id ? `Category ${name} (${id})` : `Category ${name}`;
        })()
      : null;
  const locationLabel = addedCategoryLabel ?? getLocationLabel(contentForLocation, op.path);
  let oldValue: unknown = undefined;
  let removedValue: unknown = undefined;
  if (revision.previousContent) {
    try {
      if (isReplace) oldValue = getValueAtPath(revision.previousContent, op.path);
      else if (isRemove) removedValue = getValueAtPath(revision.previousContent, op.path);
    } catch {
      // ignore
    }
  }
  const removedSub =
    removedValue &&
    typeof removedValue === "object" &&
    removedValue !== null &&
    "id" in removedValue &&
    "description" in removedValue
      ? (removedValue as { id: string; description: string; risk_level?: string })
      : null;

  return (
    <div
      className={
        showLocationLabel
          ? ""
          : "rounded-lg border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-800/50 dark:bg-amber-950/20"
      }
    >
      {showLocationLabel && (
        <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">{locationLabel}</p>
      )}
      {isReplace && (
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">Before</span>
            <div className="mt-0.5 rounded border border-red-200 bg-red-50/50 px-3 py-2 text-zinc-800 dark:border-red-900/50 dark:bg-red-950/20 dark:text-zinc-200">
              {typeof oldValue === "string" ? oldValue : JSON.stringify(oldValue ?? "—")}
            </div>
          </div>
          <div>
            <span className="text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">After</span>
            <div className="mt-0.5 rounded border border-emerald-200 bg-emerald-50/50 px-3 py-2 text-zinc-800 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-zinc-200">
              {typeof op.value === "string" ? op.value : JSON.stringify(op.value ?? "—")}
            </div>
          </div>
        </div>
      )}
      {isAdd && (
        <div className="rounded border border-emerald-200 bg-emerald-50/50 px-3 py-2 text-sm text-zinc-800 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-zinc-200">
          <span className="text-xs font-medium text-emerald-700 uppercase dark:text-emerald-400">Added</span>
          <div className="mt-1.5">{formatAddedValue(op.value)}</div>
        </div>
      )}
      {isRemove && (
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
              Removed
            </span>
            <div className="mt-0.5 rounded border border-red-200 bg-red-50/50 px-3 py-2 text-zinc-800 dark:border-red-900/50 dark:bg-red-950/20 dark:text-zinc-200">
              {removedSub ? (
                <div className="space-y-1">
                  <p>{removedSub.description}</p>
                  {removedSub.risk_level && (
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">Risk level: {removedSub.risk_level}</p>
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
    </div>
  );
}

/** Small "Added" badge for in-context view */
function AddedBadge() {
  return (
    <span className="ml-2 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
      Added
    </span>
  );
}

/** Full framework tree with change cards in place of changed items */
function RevisionContextView({
  revision,
  contentForLabel,
  displayableOps,
}: {
  revision: RevisionDetail;
  contentForLabel: FrameworkContent | undefined;
  displayableOps: RevisionDiffOp[];
}) {
  const prev = revision.previousContent;
  const next = revision.newContent;
  const opsByItemPath = groupOpsByItemPath(displayableOps);

  const prevFuncs = prev?.functions ?? [];
  const nextFuncs = next?.functions ?? [];
  const numFunctions = Math.max(prevFuncs.length, nextFuncs.length);

  if (numFunctions === 0) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">No framework content to show in context.</p>;
  }

  return (
    <div className="space-y-6 rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900/30">
      {Array.from({ length: numFunctions }, (_, fi) => {
        const prevFn = prevFuncs[fi];
        const nextFn = nextFuncs[fi];
        const fn = nextFn ?? prevFn;
        if (!fn) return null;

        const functionPath = `/functions/${fi}`;
        const functionOps = opsByItemPath.get(functionPath) ?? [];
        const isFunctionAdded = !prevFn && !!nextFn;

        return (
          <section
            key={fn.id ?? fi}
            className={`space-y-3 ${isFunctionAdded ? "rounded-lg border border-emerald-200 bg-emerald-50/30 p-3 dark:border-emerald-800/50 dark:bg-emerald-950/20" : ""}`}
          >
            <div>
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {fn.name}
                {fn.id && (
                  <span className="ml-1.5 font-normal text-zinc-500 dark:text-zinc-400">({fn.id})</span>
                )}
                {isFunctionAdded && <AddedBadge />}
              </h3>
              {fn.description && (
                <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">{fn.description}</p>
              )}
              {isFunctionAdded && (
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                  {(fn.categories?.length ?? 0) === 0
                    ? "No subcategories yet"
                    : `${fn.categories!.length} subcategor${fn.categories!.length === 1 ? "y" : "ies"}`}
                </p>
              )}
            </div>
            {!isFunctionAdded && functionOps.length > 0 && (
              <div className="space-y-2">
                {functionOps.map((op, oi) => (
                  <ChangeCard
                    key={`${op.path}-${oi}`}
                    revision={revision}
                    op={op}
                    contentForLabel={contentForLabel}
                    showLocationLabel={false}
                  />
                ))}
              </div>
            )}
            <div className="ml-4 space-y-4 border-l-2 border-zinc-200 pl-4 dark:border-zinc-700">
              {Array.from(
                {
                  length: Math.max(
                    (prevFn?.categories?.length ?? 0),
                    (nextFn?.categories?.length ?? 0),
                  ),
                },
                (_, ci) => {
                  const prevCat = prevFn?.categories?.[ci];
                  const nextCat = nextFn?.categories?.[ci];
                  const cat = nextCat ?? prevCat;
                  if (!cat) return null;

                  const categoryPath = `/functions/${fi}/categories/${ci}`;
                  const isCategoryAdded = !prevCat && !!nextCat;

                  const prevSubs = prevCat?.subcategories ?? [];
                  const nextSubs = nextCat?.subcategories ?? [];
                  const maxLen = Math.max(prevSubs.length, nextSubs.length);

                  return (
                    <div key={cat.id ?? ci} className="space-y-2">
                      <h4 className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                        {cat.name}
                        {cat.id && (
                          <span className="ml-1 font-normal text-zinc-500 dark:text-zinc-400">({cat.id})</span>
                        )}
                        {isCategoryAdded && <AddedBadge />}
                      </h4>
                      <ul className="space-y-2">
                        {Array.from({ length: maxLen }, (_, si) => {
                          const path = `/functions/${fi}/categories/${ci}/subcategories/${si}`;
                          const ops = opsByItemPath.get(path) ?? [];
                          const prevSub = prevSubs[si];
                          const nextSub = nextSubs[si];
                          const instruction = nextSub ?? prevSub;
                          const isInstructionAdded = ops.some((o) => o.op === "add");

                          if (ops.length > 0) {
                            return (
                              <li key={path}>
                                {isInstructionAdded && (
                                  <span className="mb-1 block text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                    Added
                                  </span>
                                )}
                                <div className="space-y-2">
                                  {ops.map((op, oi) => (
                                    <ChangeCard
                                      key={`${op.path}-${oi}`}
                                      revision={revision}
                                      op={op}
                                      contentForLabel={contentForLabel}
                                      showLocationLabel={false}
                                    />
                                  ))}
                                </div>
                              </li>
                            );
                          }

                          if (!instruction) return null;

                          return (
                            <li
                              key={path}
                              className="rounded-md border border-zinc-100 bg-zinc-50/50 px-3 py-2 text-sm dark:border-zinc-700/50 dark:bg-zinc-800/30"
                            >
                              <p className="text-zinc-800 dark:text-zinc-200">{instruction.description}</p>
                              {instruction.risk_level && (
                                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                                  Risk level: {instruction.risk_level}
                                </p>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                },
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
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
              <ul className="space-y-4">
                {displayableOps.map((op, idx) => (
                  <li
                    key={`${op.path}-${idx}`}
                    className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900/30"
                  >
                    <ChangeCard
                      revision={revision}
                      op={op}
                      contentForLabel={contentForLabel}
                      showLocationLabel={true}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <RevisionContextView
                revision={revision}
                contentForLabel={contentForLabel}
                displayableOps={displayableOps}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
