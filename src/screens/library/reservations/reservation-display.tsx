import { Label } from 'src/components/label';
import { formatDateOnly } from 'src/utils/date-only';

export const reservationStates = [
  'Waiting',
  'Ready',
  'Fulfilled',
  'Cancelled',
  'Expired',
  'Needs review',
];
export function ReservationStatus({ state }: { state: number }) {
  const colors = ['info', 'success', 'default', 'default', 'warning', 'error'] as const;
  return (
    <Label color={colors[state] || 'default'}>{reservationStates[state] || 'Unknown state'}</Label>
  );
}
export function reservationDate(value: string | null | undefined, provenance: number) {
  if (provenance === 0) return 'Unconfirmed';
  return value ? formatDateOnly(value) : 'Not set';
}
export function reservationPerson(item: {
  memberName?: string | null;
  memberIdentifier?: string | null;
  memberId: string;
}) {
  return [item.memberName, item.memberIdentifier || item.memberId].filter(Boolean).join(' · ');
}
