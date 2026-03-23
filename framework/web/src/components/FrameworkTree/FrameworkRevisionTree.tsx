import BaseFrameworkNode from "@/components/framework-nodes/BaseFrameworkNode/BaseFrameworkNode";
import RevisionCategoryView from "@/components/CategoryView/RevisionCategoryView/RevisionCategoryView";
import CategoryContentView from "@/components/CategoryView/CategoryContentView/CategoryContentView";
import RevisionInstructionView from "@/components/instruction-views/RevisionInstructionView/RevisionInstructionView";
import InstructionContentView from "@/components/instruction-views/InstructionContentView/InstructionContentView";
import RevisionSubcategoryView from "@/components/subcategory-views/RevisionSubcategoryView/RevisionSubcategoryView";
import SubcategoryContentView from "@/components/subcategory-views/SubcategoryContentView/SubcategoryContentView";
import type { RevisionDetail, RevisionDiffOp } from "@/lib/frameworks-api";
import type { Category, Instruction, Subcategory } from "@/types/framework";

/** Path up to and including the item (e.g. /categories/0/subcategories/0/instructions/3) */
function getItemPath(path: string): string {
  const segments = path.split("/").filter(Boolean);
  const instIdx = segments.indexOf("instructions");
  if (instIdx >= 0 && segments[instIdx + 1] !== undefined) {
    return "/" + segments.slice(0, instIdx + 2).join("/");
  }
  const subIdx = segments.indexOf("subcategories");
  if (subIdx >= 0 && segments[subIdx + 1] !== undefined) {
    return "/" + segments.slice(0, subIdx + 2).join("/");
  }
  const catIdx = segments.indexOf("categories");
  if (catIdx >= 0 && segments[catIdx + 1] !== undefined) {
    return "/" + segments.slice(0, catIdx + 2).join("/");
  }
  return path;
}

function groupOpsByItemPath(ops: RevisionDiffOp[]): Map<string, RevisionDiffOp[]> {
  const map = new Map<string, RevisionDiffOp[]>();
  for (const op of ops) {
    const key = getItemPath(op.path);
    const list = map.get(key) ?? [];
    list.push(op);
    map.set(key, list);
  }
  return map;
}

function instructionRevisionState(
  instOps: RevisionDiffOp[],
  prevInst: Instruction | undefined,
  nextInst: Instruction | undefined,
): "added" | "deleted" | "updated" | null {
  if (instOps.length === 0) return null;
  if (instOps.some((o) => o.op === "add")) return "added";
  if (instOps.some((o) => o.op === "remove")) return "deleted";
  if (prevInst && nextInst) return "updated";
  if (prevInst && !nextInst) return "deleted";
  if (!prevInst && nextInst) return "added";
  return null;
}

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
  const numCategories = Math.max(prevCats.length, nextCats.length);

  if (numCategories === 0) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">No framework content to show in context.</p>;
  }

  const renderInstructions = (
    ci: number,
    si: number,
    prevSub: Subcategory | undefined,
    nextSub: Subcategory | undefined,
  ) => {
    const prevInsts = prevSub?.instructions ?? [];
    const nextInsts = nextSub?.instructions ?? [];
    const maxLen = Math.max(prevInsts.length, nextInsts.length);
    if (maxLen === 0) return null;

    return Array.from({ length: maxLen }, (_, ii) => {
      const prevInst = prevInsts[ii];
      const nextInst = nextInsts[ii];
      const instPath = `/categories/${ci}/subcategories/${si}/instructions/${ii}`;
      const instOps = opsByItemPath.get(instPath) ?? [];
      const rev = instructionRevisionState(instOps, prevInst, nextInst);
      const instruction = nextInst ?? prevInst;

      if (rev === "added" && nextInst) {
        return <RevisionInstructionView key={nextInst.id ?? instPath} op="added" instruction={nextInst} />;
      }
      if (rev === "deleted" && prevInst) {
        return <RevisionInstructionView key={prevInst.id ?? instPath} op="deleted" instruction={prevInst} />;
      }
      if (rev === "updated" && prevInst && nextInst) {
        return (
          <RevisionInstructionView key={nextInst.id ?? instPath} op="updated" before={prevInst} after={nextInst} />
        );
      }

      if (!instruction) return null;

      return (
        <BaseFrameworkNode
          key={instruction.id ?? instPath}
          content={
            <InstructionContentView
              id={instruction.id}
              risk_level={instruction.risk_level}
              description={instruction.description}
            />
          }
        />
      );
    });
  };

  const renderSubcategories = (ci: number, prevCat: Category | undefined, nextCat: Category | undefined) => {
    const prevSubs = prevCat?.subcategories ?? [];
    const nextSubs = nextCat?.subcategories ?? [];
    const maxLen = Math.max(prevSubs.length, nextSubs.length);
    if (maxLen === 0) return null;

    return Array.from({ length: maxLen }, (_, si) => {
      const prevSub = prevSubs[si];
      const nextSub = nextSubs[si];
      const sub = nextSub ?? prevSub;
      if (!sub) return null;

      const subPath = `/categories/${ci}/subcategories/${si}`;
      const subOps = opsByItemPath.get(subPath) ?? [];
      const isSubAdded = !prevSub && !!nextSub;
      const isSubDeleted = !!prevSub && !nextSub;

      if (isSubAdded && nextSub) {
        return (
          <RevisionSubcategoryView key={nextSub.id ?? subPath} op="added" subcategory={nextSub}>
            {renderInstructions(ci, si, undefined, nextSub)}
          </RevisionSubcategoryView>
        );
      }

      if (isSubDeleted && prevSub) {
        return (
          <RevisionSubcategoryView key={prevSub.id ?? subPath} op="deleted" subcategory={prevSub}>
            {renderInstructions(ci, si, prevSub, undefined)}
          </RevisionSubcategoryView>
        );
      }

      if (subOps.length > 0 && prevSub && nextSub) {
        return (
          <RevisionSubcategoryView key={nextSub.id ?? subPath} op="updated" before={prevSub} after={nextSub}>
            {renderInstructions(ci, si, prevSub, nextSub)}
          </RevisionSubcategoryView>
        );
      }

      return (
        <BaseFrameworkNode key={sub.id ?? subPath} content={<SubcategoryContentView id={sub.id} name={sub.name} />}>
          {renderInstructions(ci, si, prevSub, nextSub)}
        </BaseFrameworkNode>
      );
    });
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">Categories</h3>
      <ul className="space-y-3">
        {Array.from({ length: numCategories }, (_, ci) => {
          const prevCat = prevCats[ci];
          const nextCat = nextCats[ci];
          const cat = nextCat ?? prevCat;
          if (!cat) return null;

          const categoryPath = `/categories/${ci}`;
          const categoryOps = opsByItemPath.get(categoryPath) ?? [];
          const isCategoryAdded = !prevCat && !!nextCat;
          const isCategoryDeleted = !!prevCat && !nextCat;

          if (isCategoryAdded && nextCat) {
            return (
              <RevisionCategoryView key={nextCat.id ?? categoryPath} op="added" category={nextCat}>
                {renderSubcategories(ci, undefined, nextCat)}
              </RevisionCategoryView>
            );
          }

          if (isCategoryDeleted && prevCat) {
            return (
              <RevisionCategoryView key={prevCat.id ?? categoryPath} op="deleted" category={prevCat}>
                {renderSubcategories(ci, prevCat, undefined)}
              </RevisionCategoryView>
            );
          }

          if (categoryOps.length > 0 && prevCat && nextCat) {
            return (
              <RevisionCategoryView key={nextCat.id ?? categoryPath} op="updated" before={prevCat} after={nextCat}>
                {renderSubcategories(ci, prevCat, nextCat)}
              </RevisionCategoryView>
            );
          }

          return (
            <BaseFrameworkNode
              key={cat.id ?? categoryPath}
              content={<CategoryContentView id={cat.id} name={cat.name} description={cat.description} />}
            >
              {renderSubcategories(ci, prevCat, nextCat)}
            </BaseFrameworkNode>
          );
        })}
      </ul>
    </div>
  );
}
