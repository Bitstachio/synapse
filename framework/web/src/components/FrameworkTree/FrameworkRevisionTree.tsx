import BaseFrameworkNode from "@/components/framework-nodes/BaseFrameworkNode/BaseFrameworkNode";
import RevisionCategoryView from "@/components/CategoryView/RevisionCategoryView/RevisionCategoryView";
import CategoryContentView from "@/components/CategoryView/CategoryContentView/CategoryContentView";
import RevisionInstructionView from "@/components/instruction-views/RevisionInstructionView/RevisionInstructionView";
import InstructionContentView from "@/components/instruction-views/InstructionContentView/InstructionContentView";
import RevisionSubcategoryView from "@/components/subcategory-views/RevisionSubcategoryView/RevisionSubcategoryView";
import SubcategoryContentView from "@/components/subcategory-views/SubcategoryContentView/SubcategoryContentView";
import type { RevisionDetail, RevisionDiffOp } from "@/lib/frameworks-api";
import type { Category, Subcategory } from "@/types/framework";
import { alignById, groupOpsByItemPath, instructionRevisionState } from "./FrameworkRevisionTree.shared";

type FrameworkRevisionTreeProps = {
  revision: RevisionDetail;
  displayableOps: RevisionDiffOp[];
};

export function FrameworkRevisionTree({ revision, displayableOps }: FrameworkRevisionTreeProps) {
  const prev = revision.previousContent;
  const next = revision.newContent;
  const opsByItemPath = groupOpsByItemPath(displayableOps);

  const prevCats = prev?.categories ?? [];
  const nextCats = next?.categories ?? [];
  const categoryRows = alignById(prevCats, nextCats);

  if (categoryRows.length === 0) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">No framework content to show in context.</p>;
  }

  const renderInstructions = (
    categoryId: string,
    subcategoryId: string,
    prevSub: Subcategory | undefined,
    nextSub: Subcategory | undefined,
  ) => {
    const prevInsts = prevSub?.instructions ?? [];
    const nextInsts = nextSub?.instructions ?? [];
    const rows = alignById(prevInsts, nextInsts);
    if (rows.length === 0) return null;

    return rows.map((row) => {
      const instructionId = row.kind === "added" ? row.next.id : row.kind === "deleted" ? row.prev.id : row.prev.id;
      const instPath = `/categories/${categoryId}/subcategories/${subcategoryId}/instructions/${instructionId}`;
      const instOps = opsByItemPath.get(instPath) ?? [];

      if (row.kind === "added") {
        return <RevisionInstructionView key={row.next.id} op="added" instruction={row.next} />;
      }
      if (row.kind === "deleted") {
        return <RevisionInstructionView key={row.prev.id} op="deleted" instruction={row.prev} />;
      }

      const { prev: prevInst, next: nextInst } = row;
      const rev = instructionRevisionState(instOps, prevInst, nextInst);

      if (rev === "updated" && prevInst && nextInst) {
        return <RevisionInstructionView key={nextInst.id} op="updated" before={prevInst} after={nextInst} />;
      }

      return (
        <BaseFrameworkNode
          key={nextInst.id}
          content={
            <InstructionContentView
              id={nextInst.id}
              risk_level={nextInst.risk_level}
              description={nextInst.description}
            />
          }
        />
      );
    });
  };

  const renderSubcategories = (categoryId: string, prevCat: Category | undefined, nextCat: Category | undefined) => {
    const prevSubs = prevCat?.subcategories ?? [];
    const nextSubs = nextCat?.subcategories ?? [];
    const rows = alignById(prevSubs, nextSubs);
    if (rows.length === 0) return null;

    return rows.map((row) => {
      const subId = row.kind === "added" ? row.next.id : row.kind === "deleted" ? row.prev.id : row.prev.id;
      const subPath = `/categories/${categoryId}/subcategories/${subId}`;
      const subOps = opsByItemPath.get(subPath) ?? [];

      if (row.kind === "added") {
        return (
          <RevisionSubcategoryView key={row.next.id} op="added" subcategory={row.next}>
            {renderInstructions(categoryId, row.next.id, undefined, row.next)}
          </RevisionSubcategoryView>
        );
      }

      if (row.kind === "deleted") {
        return (
          <RevisionSubcategoryView key={row.prev.id} op="deleted" subcategory={row.prev}>
            {renderInstructions(categoryId, row.prev.id, row.prev, undefined)}
          </RevisionSubcategoryView>
        );
      }

      const { prev: prevSub, next: nextSub } = row;

      if (subOps.length > 0) {
        return (
          <RevisionSubcategoryView key={nextSub.id} op="updated" before={prevSub} after={nextSub}>
            {renderInstructions(categoryId, nextSub.id, prevSub, nextSub)}
          </RevisionSubcategoryView>
        );
      }

      return (
        <BaseFrameworkNode key={nextSub.id} content={<SubcategoryContentView id={nextSub.id} name={nextSub.name} />}>
          {renderInstructions(categoryId, nextSub.id, prevSub, nextSub)}
        </BaseFrameworkNode>
      );
    });
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">Categories</h3>
      <ul className="space-y-3">
        {categoryRows.map((row) => {
          const categoryId = row.kind === "added" ? row.next.id : row.kind === "deleted" ? row.prev.id : row.prev.id;
          const categoryPath = `/categories/${categoryId}`;
          const categoryOps = opsByItemPath.get(categoryPath) ?? [];

          if (row.kind === "added") {
            return (
              <RevisionCategoryView key={row.next.id} op="added" category={row.next}>
                {renderSubcategories(categoryId, undefined, row.next)}
              </RevisionCategoryView>
            );
          }

          if (row.kind === "deleted") {
            return (
              <RevisionCategoryView key={row.prev.id} op="deleted" category={row.prev}>
                {renderSubcategories(categoryId, row.prev, undefined)}
              </RevisionCategoryView>
            );
          }

          const { prev: prevCat, next: nextCat } = row;

          if (categoryOps.length > 0) {
            return (
              <RevisionCategoryView key={nextCat.id} op="updated" before={prevCat} after={nextCat}>
                {renderSubcategories(categoryId, prevCat, nextCat)}
              </RevisionCategoryView>
            );
          }

          return (
            <BaseFrameworkNode
              key={nextCat.id}
              content={<CategoryContentView id={nextCat.id} name={nextCat.name} description={nextCat.description} />}
            >
              {renderSubcategories(categoryId, prevCat, nextCat)}
            </BaseFrameworkNode>
          );
        })}
      </ul>
    </div>
  );
}
