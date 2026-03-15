import { Framework } from "@/types/framework";

export const shallowCloneFramework = (f: Framework): Framework => ({
  ...f,
  content: {
    ...f.content,
    categories: f.content.categories.map((cat) => ({
      ...cat,
      subcategories: cat.subcategories.map((sub) => ({
        ...sub,
        instructions: [...sub.instructions],
      })),
    })),
  },
});
