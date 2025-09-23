export interface IBudgetSubCategoryDetail {
  category: string; // e.g., "Academic"
  subCategory: string; // e.g., "Staff Training"
  amount: number; // e.g., 45455
  notes: string; // e.g., "fd"
}

export interface IBudgetFormValues {
  board: string;
  budgetTitle: string;
  budgetCategory: string;
  budgetSubCategories: string[]; // dropdown multiple selection
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  totalBudgetAmount: number | ''; // initially '', later number
  spendingThreshold: string; // kept as string for form input
  departments: string[]; // multiple departments
  description?: string;
  status?: number;
  unallocated?: string;
  allocated?: string;
  subCategories: IBudgetSubCategoryDetail[];
}
