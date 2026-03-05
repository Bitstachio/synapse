import { Subcategory } from "@/types/framework";

type SubcategoryViewProps = {
  subcategory: Subcategory;
  onEdit: () => void;
};

const SubcategoryView = ({ subcategory, onEdit }: SubcategoryViewProps) => {
  return (
    <div className="flex flex-wrap items-start justify-between gap-2 rounded border border-zinc-100 bg-white py-2 pr-2 pl-2 dark:border-zinc-700 dark:bg-zinc-900/30">
      <div className="min-w-0 flex-1">
        <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{subcategory.id}</span>
        <span
          className="ml-2 rounded px-1.5 py-0.5 text-xs font-medium text-zinc-600 dark:text-zinc-400"
          title="Risk level"
        >
          {subcategory.risk_level}
        </span>
        <p className="mt-0.5 text-sm text-zinc-700 dark:text-zinc-300">{subcategory.description}</p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
      >
        Edit
      </button>
    </div>
  );
};

export default SubcategoryView;
