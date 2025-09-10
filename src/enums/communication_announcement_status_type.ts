export enum AnnouncementStatus {
  Draft,
  Published,
  Completed,
}

export const AnnouncementStatusColor: Record<AnnouncementStatus, string> = {
  [AnnouncementStatus.Draft]: 'warning',
  [AnnouncementStatus.Published]: 'success',
  [AnnouncementStatus.Completed]: 'info',
};

export const AnnouncementStatusOptions = [
  { label: 'Draft', value: AnnouncementStatus.Draft },
  { label: 'Published', value: AnnouncementStatus.Published },
  { label: 'Completed', value: AnnouncementStatus.Completed },
];
