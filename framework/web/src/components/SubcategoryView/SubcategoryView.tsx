import { Subcategory } from "@/types/framework";
import { ReactNode } from "react";

type SubcategoryViewProps =
  | {
      subcategory: Subcategory;
      isEditable: true;
      onEdit: () => void;
      onAddInstruction: () => void;
      renderInstructions: () => ReactNode;
    }
  | {
      subcategory: Subcategory;
      isEditable?: false;
      onEdit?: never;
      onAddInstruction?: never;
      renderInstructions: () => ReactNode;
    };

const SubcategoryView = (props: SubcategoryViewProps) => {
  const { subcategory, renderInstructions } = props;
  return (
    <div className="rounded border border-zinc-100 bg-zinc-50/50 p-3 dark:border-zinc-700 dark:bg-zinc-800/30">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{subcategory.id}</span>
          <h5 className="font-medium text-zinc-800 dark:text-zinc-200">{subcategory.name}</h5>
        </div>
        <div className="flex gap-2">
          {props.isEditable && (
            <>
              <button
                type="button"
                onClick={props.onEdit}
                className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
                aria-label="Edit subcategory"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={props.onAddInstruction}
                className="rounded border border-zinc-300 bg-white px-2 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
                aria-label="Add instruction"
              >
                Add instruction
              </button>
            </>
          )}
        </div>
      </div>
      {subcategory.instructions.length > 0 && (
        <ul className="mt-2 ml-3 border-l-2 border-zinc-200 pl-3 dark:border-zinc-600">{renderInstructions()}</ul>
      )}
    </div>
  );
};

export default SubcategoryView;
