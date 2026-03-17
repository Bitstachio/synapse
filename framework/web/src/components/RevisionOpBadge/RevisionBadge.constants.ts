import { RevisionOp } from "@/types/revision";

export const REVISION_OP_CONFIG = {
  add: {
    classExtension: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200",
    label: "Added",
  },
  update: {
    classExtension: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200",
    label: "Updated",
  },
  delete: {
    classExtension: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200",
    label: "Deleted",
  },
} satisfies Record<
  RevisionOp,
  {
    classExtension: string;
    label: string;
  }
>;
