import { Framework } from "@/types/framework";

export const shallowCloneFramework = (f: Framework): Framework => ({
  ...f,
  content: {
    ...f.content,
    functions: f.content.functions.map((fn) => ({
      ...fn,
      categories: fn.categories.map((cat) => ({
        ...cat,
        subcategories: [...cat.subcategories],
      })),
    })),
  },
});
