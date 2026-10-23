import type { ReactNode } from 'react';

export interface ReportCategory {
  id: string;
  name: string;
  icon: string | ReactNode;
}

export interface ReportSubCategory {
  id: string;
  name: string;
  categoryId: string;
  render: (item: ReportSubCategory) => ReactNode;
  icon: string | ReactNode;
  description?: string;
  configurationHelp?: string;
}

export interface ReportSchemaField {
  name: string;
  label: string;
  type: 'text' | 'date' | 'select' | 'date-range' | 'checkbox';
  options?: { label: string; value: string | number }[];
  required?: boolean;
  defaultValue?: any;
}

export interface ReportSchema {
  fields: ReportSchemaField[];
}

export interface ReportItem {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  subCategoryId: string;
  icon: string | ReactNode;
  tags?: ('New' | 'Popular' | 'Recommended')[];
  schema: ReportSchema;
  isFavorite?: boolean;
}

export interface UserStats {
  xp: number;
  level: number;
  streak: number;
  badges: string[];
  reportsGenerated: number;
}
