export type EditingTarget =
  | { type: "function"; functionIndex: number; isNew?: boolean }
  | { type: "category"; functionIndex: number; categoryIndex: number; isNew?: boolean }
  | {
      type: "subcategory";
      functionIndex: number;
      categoryIndex: number;
      subcategoryIndex: number;
      isNew?: boolean;
    };
