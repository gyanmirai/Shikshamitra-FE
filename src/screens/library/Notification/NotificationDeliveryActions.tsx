import type { LibraryNotificationHistory } from 'src/redux/library/library-adapters';

import { GlobalIcons } from 'src/utils/icons';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';

export type DeliveryActions = {
  canRetry: boolean;
  onOpen: (item: LibraryNotificationHistory) => void;
  onRetryDelivery: (item: LibraryNotificationHistory) => void;
};
export function NotificationDeliveryActions({
  item,
  canRetry,
  onOpen,
  onRetryDelivery,
}: DeliveryActions & { item: LibraryNotificationHistory }) {
  const context = `${item.subject} to ${item.recipientName || 'recorded recipient'}`;
  return (
    <AdaptiveThreeDotsActions
      directActionLimit={2}
      actions={[
        {
          id: 'view',
          label: `View delivery ${context}`,
          icon: GlobalIcons.eye,
          onClick: () => onOpen(item),
        },
        ...(canRetry && item.channel === 'Email' && ['Failed', 'Unconfirmed'].includes(item.status)
          ? [
              {
                id: 'retry',
                label: `Retry delivery ${context}`,
                icon: GlobalIcons.refresh,
                onClick: () => onRetryDelivery(item),
              },
            ]
          : []),
      ]}
    />
  );
}
