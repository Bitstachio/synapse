import { cn } from "@/lib/tailwind";

type BaseRevisionBadgeProps = {
  label: string;
  classExtension?: string;
};

const BaseRevisionBadge = ({ label, classExtension }: BaseRevisionBadgeProps) => (
  <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", classExtension)}>
    {label}
  </span>
);

export default BaseRevisionBadge;
