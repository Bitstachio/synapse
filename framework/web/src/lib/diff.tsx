import { FrameworkContent } from "@/types/framework";
import { ReactNode } from "react";
import { parsePath } from "./json";

/** Build a human-readable location from path using content (e.g. "Category GOVERN-STRUCTURE → Subcategory Work Design → Instruction GV.WD4") */
export const getLocationLabel = (content: FrameworkContent | undefined, path: string): string => {
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
};

/** Format added value for display: category/function objects as readable summary, not raw JSON */
export const formatAddedValue = (value: unknown): ReactNode => {
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
            <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-500">ID: {id}</p>
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
};
