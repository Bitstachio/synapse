/**
 * Enrich revision payloads with current framework names/descriptions so the
 * audit log shows what users see in the app (e.g. "Employee Privacy" instead
 * of "New instruction"). Items are matched by stable id.
 */

type ContentTree = Record<string, unknown>;
type JsonPatchOp = { op: string; path: string; value?: unknown };

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
  const { functions: _f, ...rest } = content;
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
