import RevisionCategoryView from "@/components/CategoryView/RevisionCategoryView/RevisionCategoryView";
import RevisionInstructionView from "@/components/instruction-views/RevisionInstructionView/RevisionInstructionView";
import RevisionSubcategoryView from "@/components/subcategory-views/RevisionSubcategoryView/RevisionSubcategoryView";
import type { RevisionDetail, RevisionDiffOp } from "@/lib/frameworks-api";
import type { Category, Subcategory } from "@/types/framework";
import type { ReactNode } from "react";
import { alignById, groupOpsByItemPath, instructionRevisionState } from "./FrameworkRevisionTree.shared";

type FrameworkRevisionChangeListProps = {
  revision: RevisionDetail;
  displayableOps: RevisionDiffOp[];
};

export function FrameworkRevisionChangeList({ revision, displayableOps }: FrameworkRevisionChangeListProps) {
  const prev = revision.previousContent;
  const next = revision.newContent;
  const opsByItemPath = groupOpsByItemPath(displayableOps);

  const prevCats = prev?.categories ?? [];
  const nextCats = next?.categories ?? [];
  const categoryRows = alignById(prevCats, nextCats);

  const collectInstructionCards = (
    categoryId: string,
    subcategoryId: string,
    prevSub: Subcategory | undefined,
    nextSub: Subcategory | undefined,
  ): ReactNode[] => {
    const prevInsts = prevSub?.instructions ?? [];
    const nextInsts = nextSub?.instructions ?? [];
    const rows = alignById(prevInsts, nextInsts);
    const cards: ReactNode[] = [];

    for (const row of rows) {
      const instructionId = row.kind === "added" ? row.next.id : row.kind === "deleted" ? row.prev.id : row.prev.id;
      const instPath = `/categories/${categoryId}/subcategories/${subcategoryId}/instructions/${instructionId}`;
      const instOps = opsByItemPath.get(instPath) ?? [];

      if (row.kind === "added") {
        cards.push(
          <RevisionInstructionView
            key={`inst-add-${categoryId}-${subcategoryId}-${row.next.id}`}
            op="added"
            instruction={row.next}
          />,
        );
        continue;
      }
      if (row.kind === "deleted") {
        cards.push(
          <RevisionInstructionView
            key={`inst-del-${categoryId}-${subcategoryId}-${row.prev.id}`}
            op="deleted"
            instruction={row.prev}
          />,
        );
        continue;
      }

      const { prev: prevInst, next: nextInst } = row;
      const rev = instructionRevisionState(instOps, prevInst, nextInst);
      if (rev === "updated" && prevInst && nextInst) {
        cards.push(
          <RevisionInstructionView
            key={`inst-upd-${categoryId}-${subcategoryId}-${nextInst.id}`}
            op="updated"
            before={prevInst}
            after={nextInst}
          />,
        );
      }
    }

    return cards;
  };

  const collectSubcategoryCards = (
    categoryId: string,
    prevCat: Category | undefined,
    nextCat: Category | undefined,
  ): ReactNode[] => {
    const prevSubs = prevCat?.subcategories ?? [];
    const nextSubs = nextCat?.subcategories ?? [];
    const rows = alignById(prevSubs, nextSubs);
    const cards: ReactNode[] = [];

    for (const subRow of rows) {
      const subId =
        subRow.kind === "added" ? subRow.next.id : subRow.kind === "deleted" ? subRow.prev.id : subRow.prev.id;
      const subPath = `/categories/${categoryId}/subcategories/${subId}`;
      const subOps = opsByItemPath.get(subPath) ?? [];

      if (subRow.kind === "added") {
        cards.push(
          <RevisionSubcategoryView
            key={`sub-add-${categoryId}-${subRow.next.id}`}
            op="added"
            subcategory={subRow.next}
          />,
        );
        continue;
      }

      if (subRow.kind === "deleted") {
        cards.push(
          <RevisionSubcategoryView
            key={`sub-del-${categoryId}-${subRow.prev.id}`}
            op="deleted"
            subcategory={subRow.prev}
          />,
        );
        continue;
      }

      const { prev: prevSub, next: nextSub } = subRow;

      if (subOps.length > 0) {
        cards.push(
          <RevisionSubcategoryView
            key={`sub-upd-${categoryId}-${nextSub.id}`}
            op="updated"
            before={prevSub}
            after={nextSub}
          />,
        );
        continue;
      }

      cards.push(...collectInstructionCards(categoryId, nextSub.id, prevSub, nextSub));
    }

    return cards;
  };

  if (categoryRows.length === 0) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">No framework content to show.</p>;
  }

  const cards: ReactNode[] = [];

  for (const row of categoryRows) {
    const categoryId = row.kind === "added" ? row.next.id : row.kind === "deleted" ? row.prev.id : row.prev.id;
    const categoryPath = `/categories/${categoryId}`;
    const categoryOps = opsByItemPath.get(categoryPath) ?? [];

    if (row.kind === "added") {
      cards.push(<RevisionCategoryView key={`cat-add-${row.next.id}`} op="added" category={row.next} />);
      continue;
    }

    if (row.kind === "deleted") {
      cards.push(<RevisionCategoryView key={`cat-del-${row.prev.id}`} op="deleted" category={row.prev} />);
      continue;
    }

    const { prev: prevCat, next: nextCat } = row;

    if (categoryOps.length > 0) {
      cards.push(
        <RevisionCategoryView
          key={`cat-upd-${nextCat.id}`}
          op="updated"
          before={prevCat}
          after={nextCat}
        />,
      );
      continue;
    }

    cards.push(...collectSubcategoryCards(categoryId, prevCat, nextCat));
  }

  if (cards.length === 0) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">No changes to display.</p>;
  }

  return <ul className="space-y-4">{cards}</ul>;
}
