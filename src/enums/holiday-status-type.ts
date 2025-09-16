// ---------------- Holiday Status Enum ----------------
export enum HolidayStatus {
  Ongoing,
  Upcoming,
  Completed,
}

// ---------------- Holiday Status Colors ----------------
export const HolidayStatusColor: Record<HolidayStatus, string> = {
  [HolidayStatus.Ongoing]: 'success',
  [HolidayStatus.Upcoming]: 'warning',
  [HolidayStatus.Completed]: 'info',
};

// ---------------- Holiday Status Options ----------------
export const HolidayStatusOptions = [
  { label: 'Ongoing', value: HolidayStatus.Ongoing },
  { label: 'Upcoming', value: HolidayStatus.Upcoming },
  { label: 'Completed', value: HolidayStatus.Completed },
];
