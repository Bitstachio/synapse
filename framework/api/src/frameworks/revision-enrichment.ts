/**
 * Enrich revision payloads with current framework names/descriptions so the
 * audit log shows what users see in the app (e.g. "Employee Privacy" instead
 * of "New instruction"). Items are matched by stable id.
 */

type ContentTree = Record<string, unknown>;
type JsonPatchOp = { op: string; path: string; value?: unknown };

export type SemanticDiffOp =
  | { op: "add"; path: string; value: Record<string, unknown> }
  | { op: "remove"; path: string; value: Record<string, unknown> }
  | { op: "replace"; path: string; value: unknown; previousValue: unknown };

const DIFFABLE_SCALARS = ["name", "description", "risk_level"] as const;

function diffScalars(prev: Record<string, unknown>, next: Record<string, unknown>, basePath: string): SemanticDiffOp[] {
  const ops: SemanticDiffOp[] = [];
  for (const key of DIFFABLE_SCALARS) {
    const prevVal = prev[key];
    const nextVal = next[key];
    if ((key in prev || key in next) && prevVal !== nextVal) {
      ops.push({ op: "replace", path: `${basePath}/${key}`, previousValue: prevVal, value: nextVal });
    }
  }
  return ops;
}

function diffByIds(
  prevItems: Record<string, unknown>[],
  nextItems: Record<string, unknown>[],
  basePath: string,
  onModified: (prev: Record<string, unknown>, next: Record<string, unknown>, path: string) => SemanticDiffOp[],
): SemanticDiffOp[] {
  const ops: SemanticDiffOp[] = [];
  const prevById = new Map(prevItems.filter((i) => typeof i.id === "string").map((i) => [i.id as string, i]));
  const nextById = new Map(nextItems.filter((i) => typeof i.id === "string").map((i) => [i.id as string, i]));

  for (const [id, item] of prevById) {
    if (!nextById.has(id)) ops.push({ op: "remove", path: `${basePath}/${id}`, value: item });
  }
  for (const [id, item] of nextById) {
    if (!prevById.has(id)) ops.push({ op: "add", path: `${basePath}/${id}`, value: item });
  }
  for (const [id, prevItem] of prevById) {
    const nextItem = nextById.get(id);
    if (nextItem) ops.push(...onModified(prevItem, nextItem, `${basePath}/${id}`));
  }
  return ops;
}

/**
 * Compute a semantic, identity-based diff between two framework content trees.
 * Items are matched by their stable `id` field rather than array position, so
 * deleting a middle element produces a single `remove` op instead of a chain of
 * index-shifting `replace` ops.
 */
export function computeSemanticDiff(
  previous: Record<string, unknown>,
  next: Record<string, unknown>,
): SemanticDiffOp[] | null {
  const prevCats = Array.isArray(previous.categories) ? (previous.categories as Record<string, unknown>[]) : [];
  const nextCats = Array.isArray(next.categories) ? (next.categories as Record<string, unknown>[]) : [];

  const ops = diffByIds(prevCats, nextCats, "/categories", (prevCat, nextCat, catPath) => {
    const catOps = diffScalars(prevCat, nextCat, catPath);
    const prevSubs = Array.isArray(prevCat.subcategories) ? (prevCat.subcategories as Record<string, unknown>[]) : [];
    const nextSubs = Array.isArray(nextCat.subcategories) ? (nextCat.subcategories as Record<string, unknown>[]) : [];
    catOps.push(
      ...diffByIds(prevSubs, nextSubs, `${catPath}/subcategories`, (prevSub, nextSub, subPath) => {
        const subOps = diffScalars(prevSub, nextSub, subPath);
        const prevInstrs = Array.isArray(prevSub.instructions)
          ? (prevSub.instructions as Record<string, unknown>[])
          : [];
        const nextInstrs = Array.isArray(nextSub.instructions)
          ? (nextSub.instructions as Record<string, unknown>[])
          : [];
        subOps.push(
          ...diffByIds(prevInstrs, nextInstrs, `${subPath}/instructions`, (prevInstr, nextInstr, instrPath) =>
            diffScalars(prevInstr, nextInstr, instrPath),
          ),
        );
        return subOps;
      }),
    );
    return catOps;
  });

  return ops.length > 0 ? ops : null;
}

function isObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

/**
 * Normalize framework content from legacy shape to current shape so the API
 * always returns categories → subcategories → instructions. Legacy shape:
 * functions → categories → subcategories.
 */
export function normalizeContentToNewShape(
  content: Record<string, unknown> | null | undefined,
): Record<string, unknown> | null {
  if (!content || !isObject(content)) return null;
  const legacyFunctions = content.functions;
  if (!Array.isArray(legacyFunctions)) {
    return content;
  }
  const categories = legacyFunctions.map((fn) => {
    if (!isObject(fn)) return fn as Record<string, unknown>;
    const legacyCats = fn.categories;
    const subcategories = Array.isArray(legacyCats)
      ? legacyCats.map((cat) => {
          if (!isObject(cat)) return cat as Record<string, unknown>;
          const legacySubs = cat.subcategories;
          return { ...cat, instructions: Array.isArray(legacySubs) ? legacySubs : [] };
        })
      : [];
    return { ...fn, subcategories };
  });
  const rest = { ...content };
  delete rest.functions;
  return { ...rest, categories };
}

/** Find a category/subcategory/instruction by id in content.categories tree. */
export function findItemByIdInContent(content: ContentTree | null, id: string): ContentTree | null {
  if (!content || !isObject(content)) return null;
  const categories = content.categories;
  if (!Array.isArray(categories)) return null;
  for (const cat of categories) {
    if (!isObject(cat)) continue;
    if (cat.id === id) return cat as ContentTree;
    const subcategories = cat.subcategories;
    if (!Array.isArray(subcategories)) continue;
    for (const sub of subcategories) {
      if (!isObject(sub)) continue;
      if (sub.id === id) return sub as ContentTree;
      const instructions = sub.instructions;
      if (!Array.isArray(instructions)) continue;
      for (const instr of instructions) {
        if (isObject(instr) && instr.id === id) return instr as ContentTree;
      }
    }
  }
  return null;
}

/** Copy name and description from current item onto item when ids match. */
function enrichItemWithCurrent(item: Record<string, unknown>, currentContent: ContentTree | null): void {
  const id = item.id;
  if (id == null || typeof id !== "string") return;
  const current = findItemByIdInContent(currentContent, id);
  if (!current) return;
  if ("name" in current && current.name !== undefined) item.name = current.name;
  if ("description" in current && current.description !== undefined) item.description = current.description;
}

/** Enrich newContent.categories and nested subcategories/instructions. */
export function enrichNewContentWithCurrent(
  newContent: ContentTree | null | undefined,
  currentContent: ContentTree | null,
): void {
  if (!newContent || !isObject(newContent) || !currentContent) return;
  const categories = newContent.categories;
  if (!Array.isArray(categories)) return;
  for (const cat of categories) {
    if (!isObject(cat)) continue;
    enrichItemWithCurrent(cat, currentContent);
    const subcategories = cat.subcategories;
    if (!Array.isArray(subcategories)) continue;
    for (const sub of subcategories) {
      if (!isObject(sub)) continue;
      enrichItemWithCurrent(sub, currentContent);
      const instructions = sub.instructions;
      if (!Array.isArray(instructions)) continue;
      for (const instr of instructions) {
        if (isObject(instr)) enrichItemWithCurrent(instr, currentContent);
      }
    }
  }
}

/** Enrich each diff op's value when it is an object with an id. */
export function enrichDiffValuesWithCurrent(
  diff: JsonPatchOp[] | null | undefined,
  currentContent: ContentTree | null,
): void {
  if (!Array.isArray(diff) || !currentContent) return;
  for (const op of diff) {
    const value = op.value;
    if (isObject(value) && value.id != null && typeof value.id === "string") {
      enrichItemWithCurrent(value, currentContent);
    }
  }
}
