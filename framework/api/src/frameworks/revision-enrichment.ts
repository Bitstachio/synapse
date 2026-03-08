/**
 * Enrich revision payloads with current framework names/descriptions so the
 * audit log shows what users see in the app (e.g. "Employee Privacy" instead
 * of "New category"). Items are matched by stable id.
 */

type ContentTree = Record<string, unknown>;
type JsonPatchOp = { op: string; path: string; value?: unknown };

function isObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

/** Find a function/category/subcategory by id in content.functions tree. */
export function findItemByIdInContent(content: ContentTree | null, id: string): ContentTree | null {
  if (!content || !isObject(content)) return null;
  const functions = content.functions;
  if (!Array.isArray(functions)) return null;
  for (const fn of functions) {
    if (!isObject(fn)) continue;
    if (fn.id === id) return fn as ContentTree;
    const categories = fn.categories;
    if (!Array.isArray(categories)) continue;
    for (const cat of categories) {
      if (!isObject(cat)) continue;
      if (cat.id === id) return cat as ContentTree;
      const subcategories = cat.subcategories;
      if (!Array.isArray(subcategories)) continue;
      for (const sub of subcategories) {
        if (isObject(sub) && sub.id === id) return sub as ContentTree;
      }
    }
  }
  return null;
}

/** Copy name and description from current item onto item when ids match. */
function enrichItemWithCurrent(
  item: Record<string, unknown>,
  currentContent: ContentTree | null,
): void {
  const id = item.id;
  if (id == null || typeof id !== "string") return;
  const current = findItemByIdInContent(currentContent, id);
  if (!current) return;
  if ("name" in current && current.name !== undefined) item.name = current.name;
  if ("description" in current && current.description !== undefined)
    item.description = current.description;
}

/** Enrich newContent.functions and nested categories/subcategories. */
export function enrichNewContentWithCurrent(
  newContent: ContentTree | null | undefined,
  currentContent: ContentTree | null,
): void {
  if (!newContent || !isObject(newContent) || !currentContent) return;
  const functions = newContent.functions;
  if (!Array.isArray(functions)) return;
  for (const fn of functions) {
    if (!isObject(fn)) continue;
    enrichItemWithCurrent(fn, currentContent);
    const categories = fn.categories;
    if (!Array.isArray(categories)) continue;
    for (const cat of categories) {
      if (!isObject(cat)) continue;
      enrichItemWithCurrent(cat, currentContent);
      const subcategories = cat.subcategories;
      if (!Array.isArray(subcategories)) continue;
      for (const sub of subcategories) {
        if (isObject(sub)) enrichItemWithCurrent(sub, currentContent);
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
