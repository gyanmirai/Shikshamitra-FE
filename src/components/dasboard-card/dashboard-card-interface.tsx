interface LabelItem {
  label: string;
  value: string | number;
  bgColor?: string;
}

export interface DashboardCardProps {
  title: string;
  mainText: string;
  mainIcon?: React.ReactNode;
  subtitleText?: string;
  subtitleIcon?: React.ReactNode;
  labelData?: LabelItem[];

  // Optional color overrides
  titleColor?: string;
  mainTextColor?: string;
  subtitleTextColor?: string;
  mainIconColor?: string;
  subtitleIconColor?: string;
  backgroundColor?: string;
}
