import type { AdaptiveThreeDotsAction } from 'src/components/adaptive-three-dots-actions';

import { GlobalIcons } from 'src/utils/icons';

type ReviewQueueActionOptions = {
  canReview: boolean;
  onViewDetails?: () => void;
  onApprove: () => void;
  onRequestChanges: () => void;
  onReject: () => void;
};

export function getReviewQueueTableActions(
  options: ReviewQueueActionOptions
): AdaptiveThreeDotsAction[] {
  const actions: AdaptiveThreeDotsAction[] = [];

  if (options.onViewDetails) {
    actions.push({
      id: 'view',
      label: 'View details',
      icon: GlobalIcons.eye,
      onClick: options.onViewDetails,
    });
  }

  if (options.canReview) {
    actions.push(
      {
        id: 'approve',
        label: 'Approve',
        icon: 'solar:check-circle-bold',
        color: 'success.main',
        onClick: options.onApprove,
      },
      {
        id: 'request-changes',
        label: 'Request changes',
        icon: 'solar:alt-arrow-right-bold',
        color: 'warning.main',
        onClick: options.onRequestChanges,
      },
      {
        id: 'reject',
        label: 'Reject',
        icon: 'solar:close-circle-bold',
        color: 'error.main',
        onClick: options.onReject,
      }
    );
  }

  return actions;
}
