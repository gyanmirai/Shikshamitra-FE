import { it, expect, describe } from 'vitest';

import { shouldCloseReviewDrawer } from './classTeacherReviewDrawer';

describe('shouldCloseReviewDrawer', () => {
  it('keeps the review drawer open after a backdrop click', () => {
    expect(shouldCloseReviewDrawer('backdropClick')).toBe(false);
  });

  it('allows the keyboard close action', () => {
    expect(shouldCloseReviewDrawer('escapeKeyDown')).toBe(true);
  });
});
