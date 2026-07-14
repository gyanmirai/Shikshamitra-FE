export type AcademicCommandAction = {
  label: string;
  href?: string;
  icon: string;
  variant?: 'text' | 'outlined' | 'contained';
};

export type AcademicHealthFactor = {
  label: string;
  value: string;
  tone: 'success' | 'warning' | 'error' | 'info';
};

export type AcademicActionItem = {
  id: string;
  title: string;
  summary: string;
  severity: 'critical' | 'warning' | 'info';
  source: string;
  actionLabel: string;
  actionHref?: string;
};

export type AcademicModuleHealthItem = {
  id: string;
  module: string;
  status: string;
  progress: number;
  tone: 'success' | 'warning' | 'error' | 'info';
  icon: string;
  href?: string;
};
