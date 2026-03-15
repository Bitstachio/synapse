import { formatAddedValue, getLocationLabel } from "@/lib/diff";
import { RevisionDetail, RevisionDiffOp } from "@/lib/frameworks-api";
import { getValueAtPath } from "@/lib/json";
import { FrameworkContent } from "@/types/framework";

type ChangeCardProps = {
  revision: RevisionDetail;
  op: RevisionDiffOp;
  contentForLabel: FrameworkContent | undefined;
  showLocationLabel?: boolean;
};

const ChangeCard = ({ revision, op, contentForLabel, showLocationLabel = true }: ChangeCardProps) => {
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
    Array.isArray((op.value as Record<string, unknown>).subcategories)
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
};

export default ChangeCard;
