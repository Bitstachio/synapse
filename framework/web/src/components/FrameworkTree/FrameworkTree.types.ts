export type EditingTarget =
  | { type: "function"; functionIndex: number }
  | { type: "category"; functionIndex: number; categoryIndex: number }
  | {
      type: "subcategory";
      functionIndex: number;
      categoryIndex: number;
      subcategoryIndex: number;
    };
