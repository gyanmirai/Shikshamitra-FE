import { it, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import { ReviewQueueTabLabel } from './ReviewQueueTabLabel';

describe('ReviewQueueTabLabel', () => {
  it('hides the badge when there are no pending reviews', () => {
    render(<ReviewQueueTabLabel pendingCount={0} />);

    expect(screen.getByText('Review Queue')).toBeInTheDocument();
    expect(screen.queryByLabelText(/pending review/)).not.toBeInTheDocument();
  });

  it('shows the exact pending count with an accessible label', () => {
    const { rerender } = render(<ReviewQueueTabLabel pendingCount={1} />);

    expect(screen.getByLabelText('1 pending review')).toHaveTextContent('1');

    rerender(<ReviewQueueTabLabel pendingCount={137} />);
    expect(screen.getByLabelText('137 pending reviews')).toHaveTextContent('137');
  });
});
