/** HTML id segments: only [a-zA-Z0-9_-] are safe without escaping. */
const DOM_ID_SAFE = /[^a-zA-Z0-9_-]/g;

export function frameworkItemElementId(
  kind: "category" | "subcategory" | "instruction",
  id: string,
): string {
  return `fw-${kind}-${id.replace(DOM_ID_SAFE, "_")}`;
}

/** Prefer instruction, then subcategory, then category (deepest match first). */
export function findFrameworkFocusElement(id: string): HTMLElement | null {
  const order = ["instruction", "subcategory", "category"] as const;
  for (const kind of order) {
    const el = document.getElementById(frameworkItemElementId(kind, id));
    if (el) return el;
  }
  return null;
}
