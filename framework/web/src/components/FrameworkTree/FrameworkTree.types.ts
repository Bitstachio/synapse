export type EditingTarget =
  | { type: "category"; categoryIndex: number; isNew?: boolean }
  | { type: "subcategory"; categoryIndex: number; subcategoryIndex: number; isNew?: boolean }
  | {
      type: "instruction";
      categoryIndex: number;
      subcategoryIndex: number;
      instructionIndex: number;
      isNew?: boolean;
    };
