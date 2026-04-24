import type { RevisionDiffOp } from "@/lib/frameworks-api";
import type { Instruction } from "@/types/framework";

/** Path up to and including the item (supports both index and id segments, e.g. /categories/F2/...) */
export function getItemPath(path: string): string {
  const segments = path.split("/").filter(Boolean);
  const instIdx = segments.indexOf("instructions");
  if (instIdx >= 0 && segments[instIdx + 1] !== undefined) {
    return "/" + segments.slice(0, instIdx + 2).join("/");
  }
  const subIdx = segments.indexOf("subcategories");
  if (subIdx >= 0 && segments[subIdx + 1] !== undefined) {
    return "/" + segments.slice(0, subIdx + 2).join("/");
  }
  const catIdx = segments.indexOf("categories");
  if (catIdx >= 0 && segments[catIdx + 1] !== undefined) {
    return "/" + segments.slice(0, catIdx + 2).join("/");
  }
  return path;
}

export function groupOpsByItemPath(ops: RevisionDiffOp[]): Map<string, RevisionDiffOp[]> {
  const map = new Map<string, RevisionDiffOp[]>();
  for (const op of ops) {
    const key = getItemPath(op.path);
    const list = map.get(key) ?? [];
    list.push(op);
    map.set(key, list);
  }
  return map;
}

export function instructionRevisionState(
  instOps: RevisionDiffOp[],
  prevInst: Instruction | undefined,
  nextInst: Instruction | undefined,
): "added" | "deleted" | "updated" | null {
  if (instOps.length === 0) return null;
  if (instOps.some((o) => o.op === "add")) return "added";
  if (instOps.some((o) => o.op === "remove")) return "deleted";
  if (prevInst && nextInst) return "updated";
  if (prevInst && !nextInst) return "deleted";
  if (!prevInst && nextInst) return "added";
  return null;
}

export function alignById<T extends { id: string }>(
  prevItems: T[],
  nextItems: T[],
): ({ kind: "pair"; prev: T; next: T } | { kind: "deleted"; prev: T } | { kind: "added"; next: T })[] {
  const nextById = new Map(nextItems.map((item) => [item.id, item]));
  const prevIdSet = new Set(prevItems.map((i) => i.id));
  const rows: ({ kind: "pair"; prev: T; next: T } | { kind: "deleted"; prev: T } | { kind: "added"; next: T })[] = [];

  for (const prev of prevItems) {
    const n = nextById.get(prev.id);
    if (n) rows.push({ kind: "pair", prev, next: n });
    else rows.push({ kind: "deleted", prev });
  }

  for (const n of nextItems) {
    if (!prevIdSet.has(n.id)) rows.push({ kind: "added", next: n });
  }

  return rows;
}
