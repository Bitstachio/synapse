import { Category } from "@/types/framework";
import { ReactNode } from "react";

type CategoryViewProps =
  | {
      category: Category;
      isEditable: true;
      onEdit: () => void;
      onAddSubcategory: () => void;
      renderSubcategories: () => ReactNode;
    }
  | {
      category: Category;
      isEditable?: false;
      onEdit?: never;
      onAddSubcategory?: never;
      renderSubcategories: () => ReactNode;
    };

const CategoryView = (props: CategoryViewProps) => {
  const { category, renderSubcategories } = props;
  return (
    <div className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <span className="font-mono text-sm text-zinc-500 dark:text-zinc-400">{category.id}</span>
          <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">{category.name}</h4>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{category.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {props.isEditable && (
            <>
              <button
                type="button"
                onClick={props.onEdit}
                className="rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                aria-label="Edit category"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={props.onAddSubcategory}
                className="rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                aria-label="Add subcategory"
              >
                Add subcategory
              </button>
            </>
          )}
        </div>
      </div>
      {category.subcategories.length > 0 && (
        <ul className="mt-3 ml-4 border-l-2 border-zinc-200 pl-4 dark:border-zinc-600">{renderSubcategories()}</ul>
      )}
    </div>
  );
};

export default CategoryView;
