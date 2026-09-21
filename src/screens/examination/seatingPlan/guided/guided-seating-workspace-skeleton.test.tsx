import { it, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import { GuidedSeatingWorkspaceSkeleton } from './guided-seating-workspace-skeleton';

describe('GuidedSeatingWorkspaceSkeleton', () => {
  it('announces loading and renders visible progress feedback', () => {
    render(<GuidedSeatingWorkspaceSkeleton />);

    expect(screen.getByRole('status', { name: 'Loading seating plan workspace' })).toHaveAttribute(
      'aria-busy',
      'true'
    );
    expect(screen.getByRole('progressbar', { name: 'Loading seating plan data' })).toBeVisible();
    expect(screen.getByText('Loading seating plan workspace…')).toBeVisible();
  });
});
