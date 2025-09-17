// enums/event_status.ts
export enum EventStatus {
  Active,
  Upcoming,
  Archive,
}

export const EventStatusColor = {
  [EventStatus.Active]: 'success',
  [EventStatus.Upcoming]: 'info',
  [EventStatus.Archive]: 'warning',
};

export const EventStatusOptions = [
  { label: 'Active', value: EventStatus.Active },
  { label: 'Upcoming', value: EventStatus.Upcoming },
  { label: 'Archive', value: EventStatus.Archive },
];
