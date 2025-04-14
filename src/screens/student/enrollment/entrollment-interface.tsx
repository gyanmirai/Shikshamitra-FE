import type { LabelColor } from 'src/components/label';

interface ILabel {
  name: string;
  color: LabelColor;
}

export interface IStudentEnrollmentCardProps {
  icon: string;
  title: string;
  count: number | string;
  color: string;
  bgColor: string;
  href?: string;
  labels?: ILabel[];
  index?: number;
}

export interface ICardItem {
  id: string;
  icon: string;
  title: string;
  count: number | string;
  color: string;
  bgColor: string;
  href: string;
  labels: ILabel[];
  width: number;
}
