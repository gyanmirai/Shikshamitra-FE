import { screen } from '@testing-library/react';
import { it, vi, expect, describe, beforeEach } from 'vitest';

import { renderReviewQueue, prepareReviewNetwork } from './review-comment-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

beforeEach(prepareReviewNetwork);

describe('review queue toolbar', () => {
  it('keeps structured filters and omits the teacher search field', async () => {
    renderReviewQueue();

    await screen.findByText('Review teacher');
    expect(screen.queryByPlaceholderText('Search Teacher...')).not.toBeInTheDocument();
    expect(screen.getByText('All Classes')).toBeInTheDocument();
    expect(screen.getByText('All Subjects')).toBeInTheDocument();
  });

  it('stretches through the available tab content height', async () => {
    renderReviewQueue();

    await screen.findByText('Review teacher');
    expect(screen.getByTestId('review-queue-tab')).toHaveStyle({
      display: 'flex',
      flex: '1 1 0%',
      minHeight: '0',
    });
  });
});
