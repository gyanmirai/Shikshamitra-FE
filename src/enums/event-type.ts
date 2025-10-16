// enums/event_status.ts
export enum EventStatus {
  Active,
  Upcoming,
  Completed,
}

export const EventStatusColor = {
  [EventStatus.Active]: 'success',
  [EventStatus.Upcoming]: 'warning',
  [EventStatus.Completed]: 'info',
};

export const EventStatusOptions = [
  { label: 'Active', value: EventStatus.Active },
  { label: 'Upcoming', value: EventStatus.Upcoming },
  { label: 'Completed', value: EventStatus.Completed },
];
