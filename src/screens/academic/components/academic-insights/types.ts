import type { Theme, SxProps } from '@mui/material/styles';

export type AcademicInsightMetric = {
  id: string;
  label: string;
  value: string | number;
  helper?: string;
  icon: string;
  selected?: boolean;
  onClick?: () => void;
};

export type AcademicInsightChart = {
  title: string;
  description: string;
  categories: string[];
  values: number[];
  seriesName: string;
  valueSuffix?: string;
  max?: number;
};

export type AcademicInsightFocus = {
  title: string;
  description: string;
};

export type AcademicInsightsProps = {
  title: string;
  description: string;
  metrics: AcademicInsightMetric[];
  chart?: AcademicInsightChart;
  focus?: AcademicInsightFocus;
  isLoading?: boolean;
  buttonSx?: SxProps<Theme>;
  open?: boolean;
  onClose?: () => void;
  hideTrigger?: boolean;
};
