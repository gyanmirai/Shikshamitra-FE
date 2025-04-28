export enum VisitorStatusType {
  InHostel,
  Exited,
  Overstayed,
}

export const VisitorStatusOptions = [
  {
    label: 'In Hostel',
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
  [VisitorStatusType.InHostel]: 'success',
  [VisitorStatusType.Exited]: 'error',
  [VisitorStatusType.Overstayed]: 'warning',
};
