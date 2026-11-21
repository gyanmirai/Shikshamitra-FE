import { Label, type LabelColor } from 'src/components/label';

export const notificationGroups = [
  { value: 'bookManagement', label: 'Book Management', eventGroup: 'BookManagement' },
  { value: 'memberManagement', label: 'Member Management', eventGroup: 'MemberManagement' },
  { value: 'transactions', label: 'Transactions', eventGroup: 'Transactions' },
];
export const notificationStatuses = [
  'Queued',
  'Processing',
  'Unconfirmed',
  'Sent',
  'Failed',
  'Skipped',
];
const colors: Record<string, LabelColor> = {
  Queued: 'info',
  Processing: 'info',
  Unconfirmed: 'warning',
  Sent: 'success',
  Failed: 'error',
  Skipped: 'warning',
};
export function NotificationStatus({ status }: { status: string }) {
  return <Label color={colors[status] || 'default'}>{status || 'No delivery recorded'}</Label>;
}
export const notificationZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
export const supportsOffset = (event: string) =>
  ['dueDateReminder', 'reservationExpiring'].includes(event);
export const supportsCadence = (event: string) =>
  [
    'dueDateReminder',
    'overdueReminder',
    'fineDueReminder',
    'reservationExpiring',
    'reservedBookAvailable',
    'lowStockAlert',
  ].includes(event);
