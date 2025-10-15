export enum AnnouncementStatus {
  Upcoming,
  Published,
  Completed,
}

export const AnnouncementStatusColor: Record<AnnouncementStatus, string> = {
  [AnnouncementStatus.Upcoming]: 'warning',
  [AnnouncementStatus.Published]: 'success',
  [AnnouncementStatus.Completed]: 'info',
};

export const AnnouncementStatusOptions = [
  { label: 'Upcoming', value: AnnouncementStatus.Upcoming },
  { label: 'Published', value: AnnouncementStatus.Published },
  { label: 'Completed', value: AnnouncementStatus.Completed },
];
