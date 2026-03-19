import { Category } from "@/types/framework";
import BaseCategoryView from "../BaseCategoryView/BaseCategoryView";
import CategoryContentView from "../CategoryContentView/CategoryContentView";

type EditableCategoryViewProps = {
  category: Category;
  onEdit: () => void;
};

const EditableCategoryView = ({ category, onEdit }: EditableCategoryViewProps) => (
  <BaseCategoryView
    renderActions={
      <>
        <button
          type="button"
          onClick={onEdit}
          className="rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          aria-label="Edit category"
        >
          Edit
        </button>
        <button
          type="button"
          // TODO: Add onAddSubcategory
          //   onClick={props.onAddSubcategory}
          className="rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          aria-label="Add subcategory"
        >
          Add subcategory
        </button>
      </>
    }
    renderContent={<CategoryContentView id={category.id} name={category.name} description={category.description} />}
  />
);

export default EditableCategoryView;
