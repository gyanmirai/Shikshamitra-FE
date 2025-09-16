// ---------------- Holiday Status Enum ----------------
export enum MeetingStatus {
  Draft,
  Ongoing,
  Completed,
}

// ---------------- Holiday Status Colors ----------------
export const MeetingStatusColor = {
  [MeetingStatus.Draft]: 'warning', // yellow
  [MeetingStatus.Ongoing]: 'success', // green
  [MeetingStatus.Completed]: 'info', // blue
};

// ---------------- Holiday Status Options ----------------
export const MeetingStatusOptions = [
  { label: 'Draft', value: MeetingStatus.Draft },
  { label: 'Ongoing', value: MeetingStatus.Ongoing },
  { label: 'Completed', value: MeetingStatus.Completed },
];
