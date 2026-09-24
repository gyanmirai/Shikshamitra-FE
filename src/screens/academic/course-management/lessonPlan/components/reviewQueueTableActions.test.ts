import { describe, expect, it, vi } from 'vitest';

import { getReviewQueueTableActions } from './reviewQueueTableActions';

function createOptions() {
  return {
    canReview: true,
    onViewDetails: vi.fn(),
    onApprove: vi.fn(),
    onRequestChanges: vi.fn(),
    onReject: vi.fn(),
  };
}

describe('getReviewQueueTableActions', () => {
  it('orders reject as the fourth review action', () => {
    const actions = getReviewQueueTableActions(createOptions());

    expect(actions.map((action) => action.id)).toEqual([
      'view',
      'approve',
      'request-changes',
      'reject',
    ]);
  });

  it('shows only view when the row cannot be reviewed', () => {
    const actions = getReviewQueueTableActions({ ...createOptions(), canReview: false });

    expect(actions.map((action) => action.id)).toEqual(['view']);
  });
});
