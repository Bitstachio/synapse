/** Get value at JSON Patch path from an object (e.g. content) */
export const getValueAtPath = (obj: unknown, path: string): unknown => {
  const segments = path.split("/").filter(Boolean);
  let current: unknown = obj;
  for (const seg of segments) {
    const key = /^\d+$/.test(seg) ? parseInt(seg, 10) : seg;
    current = (current as Record<string, unknown>)?.[key as string];
  }
  return current;
};

/** Parse JSON Patch path into indices and field name for framework content */
export const parsePath = (path: string): { segments: string[]; field?: string } => {
  const segments = path.split("/").filter(Boolean);
  const field = segments.length > 0 ? segments[segments.length - 1] : undefined;
  return { segments, field };
};
