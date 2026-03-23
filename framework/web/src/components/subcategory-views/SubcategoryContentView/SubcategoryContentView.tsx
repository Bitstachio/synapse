import { Subcategory } from "@/types/framework";

type SubcategoryContentProps = Pick<Subcategory, "id" | "name">;

const SubcategoryContentView = ({ id, name }: SubcategoryContentProps) => (
  <article>
    <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{id}</span>
    <h5 className="font-medium text-zinc-800 dark:text-zinc-200">{name}</h5>
  </article>
);

export default SubcategoryContentView;
