import { Category } from "@/types/framework";

type CategoryContentViewProps = Pick<Category, "id" | "name" | "description">;

const CategoryContentView = ({ id, name, description }: CategoryContentViewProps) => (
  <article>
    <span className="font-mono text-sm text-zinc-500 dark:text-zinc-400">{id}</span>
    <h4 className="font-semibold text-zinc-900 uppercase dark:text-zinc-100">{name}</h4>
    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
  </article>
);

export default CategoryContentView;
