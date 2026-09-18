export type ReviewDrawerCloseReason = 'backdropClick' | 'escapeKeyDown';

export const shouldCloseReviewDrawer = (reason: ReviewDrawerCloseReason) =>
  reason !== 'backdropClick';
