import type { LibraryReservation } from 'src/redux/library/reservation-types';

import { GlobalIcons } from 'src/utils/icons';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';

import { reservationPerson } from './reservation-display';

export type ReservationActions = {
  onView: (item: LibraryReservation) => void;
  onAction: (item: LibraryReservation, action: 'cancel' | 'review') => void;
  canWrite: boolean;
};
export function ReservationRowActions({
  item,
  onView,
  onAction,
  canWrite,
}: ReservationActions & { item: LibraryReservation }) {
  const name = reservationPerson(item);
  const actions = [
    {
      id: 'view',
      label: `View reservation for ${name}`,
      icon: GlobalIcons.eye,
      onClick: () => onView(item),
    },
  ];
  if (canWrite && item.canReview)
    actions.push({
      id: 'review',
      label: `Review reservation for ${name}`,
      icon: GlobalIcons.edit,
      onClick: () => onAction(item, 'review'),
    });
  if (canWrite && item.canCancel)
    actions.push({
      id: 'cancel',
      label: `Cancel reservation for ${name}`,
      icon: GlobalIcons.cancel,
      onClick: () => onAction(item, 'cancel'),
    });
  return (
    <AdaptiveThreeDotsActions
      actions={actions}
      directActionLimit={2}
      moreLabel={`More reservation actions for ${name}`}
    />
  );
}
