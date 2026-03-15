export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export interface Instruction {
  id: string;
  description: string;
  risk_level: RiskLevel;
}

export interface Subcategory {
  id: string;
  name: string;
  instructions: Instruction[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  subcategories: Subcategory[];
}

export interface FrameworkContent {
  categories: Category[];
}

export interface Framework {
  name: string;
  version: string;
  isActive: boolean;
  content: FrameworkContent;
  /** ISO 8601 string from API; used for optimistic locking (lastKnownUpdatedAt) on update */
  updatedAt?: string;
}
