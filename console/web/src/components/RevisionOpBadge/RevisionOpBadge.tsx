import { cn } from "@/lib/tailwind";
import { RevisionOp } from "@/types/revision";
import { REVISION_OP_CONFIG } from "./RevisionBadge.constants";

type BaseRevisionBadgeProps = {
  op: RevisionOp;
};

const RevisionOpBadge = ({ op }: BaseRevisionBadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
      REVISION_OP_CONFIG[op].classExtension,
    )}
  >
    {REVISION_OP_CONFIG[op].label}
  </span>
);

export default RevisionOpBadge;
