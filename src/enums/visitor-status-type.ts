export enum VisitorStatusType {
  InHostel,
  Exited,
  Overstayed,
}

export const VisitorStatusOptions = [
  {
    label: 'InHostel',
    value: VisitorStatusType.InHostel,
  },
  {
    label: 'Exited',
    value: VisitorStatusType.Exited,
  },
  {
    label: 'Overstayed',
    value: VisitorStatusType.Overstayed,
  },
];

export const VisitorStatusColors: Record<VisitorStatusType, 'success' | 'error' | 'warning'> = {
  [VisitorStatusType.InHostel]: 'error',
  [VisitorStatusType.Exited]: 'success',
  [VisitorStatusType.Overstayed]: 'warning',
};
