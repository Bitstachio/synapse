export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export interface Subcategory {
  id: string;
  description: string;
  risk_level: RiskLevel;
}

export interface Category {
  id: string;
  name: string;
  subcategories: Subcategory[];
}

export interface FrameworkFunction {
  id: string;
  name: string;
  description: string;
  categories: Category[];
}

export interface FrameworkContent {
  functions: FrameworkFunction[];
}

export interface Framework {
  name: string;
  version: string;
  isActive: boolean;
  content: FrameworkContent;
  /** ISO 8601 string from API; used for optimistic locking (lastKnownUpdatedAt) on update */
  updatedAt?: string;
}
