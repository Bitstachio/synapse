import { Category } from "@/types/framework";

type CategoryViewProps = {
  category: Category;
  onEdit: () => void;
  onAddSubcategory: () => void;
  renderSubcategories: () => React.ReactNode;
};

const CategoryView = ({ category, onEdit, onAddSubcategory, renderSubcategories }: CategoryViewProps) => {
  return (
    <div className="rounded border border-zinc-100 bg-zinc-50/50 p-3 dark:border-zinc-700 dark:bg-zinc-800/30">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{category.id}</span>
          <h5 className="font-medium text-zinc-800 dark:text-zinc-200">{category.name}</h5>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onAddSubcategory}
            className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
          >
            Add instruction
          </button>
        </div>
      </div>
      {category.subcategories.length > 0 && (
        <ul className="mt-2 ml-3 border-l-2 border-zinc-200 pl-3 dark:border-zinc-600">{renderSubcategories()}</ul>
      )}
    </div>
  );
};

export default CategoryView;
