import { cn } from "@/lib/tailwind";
import { ReactNode } from "react";

type BaseCategoryViewProps = {
  classExtension?: string;
  renderLabel?: ReactNode;
  renderActions?: ReactNode;
  renderContent: ReactNode;
};

const BaseCategoryView = ({ classExtension, renderLabel, renderActions, renderContent }: BaseCategoryViewProps) => (
  <div className={cn("p-4", classExtension)}>
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div>{renderContent}</div>
      <div className="flex flex-wrap gap-2">{renderActions}</div>
    </div>
  </div>
);

export default BaseCategoryView;
