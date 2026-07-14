import type { LabelColor } from 'src/components/label';

export type DashboardLabel = {
  name: string;
  color: LabelColor;
};

export type DashboardSummaryCardProps = {
  icon: string;
  title: string;
  count: number | string;
  color: string;
  bgColor: string;
  href?: string;
  labels?: DashboardLabel[];
  index?: number;
};

export type IStudentEnrollmentCardProps = DashboardSummaryCardProps;

export type ICardItem = {
  id: string;
  icon: string;
  title: string;
  count: number | string;
  color: string;
  bgColor: string;
  href: string;
  labels: DashboardLabel[];
  width: number;
};
