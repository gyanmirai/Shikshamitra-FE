export interface TDashboardCardProps {
  title: string;
  value: number | string;
  icon: string;
  href?: string;
  color?: string;
  bgColor?: string;
  labels?: { name: string; color: string }[];
  description?: string;
}
