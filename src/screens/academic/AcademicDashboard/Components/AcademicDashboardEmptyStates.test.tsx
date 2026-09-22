import { it, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import { SmartAcademicInsightsCard } from './SmartAcademicInsightsCard';
import { AcademicActionQueue } from '../../components/command-center/AcademicActionQueue';

describe('Academic Dashboard empty states', () => {
  it('uses the shared empty content for an empty priority queue', () => {
    render(
      <AcademicActionQueue
        title="Priority Action Queue"
        subtitle="Most important academic issues to close first"
        items={[]}
      />
    );

    expect(screen.getByText('No priority actions')).toBeVisible();
    expect(screen.getByRole('img', { name: 'empty content' })).toBeVisible();
  });

  it('uses the shared empty content when there are no insights', () => {
    render(<SmartAcademicInsightsCard insights={[]} />);

    expect(screen.getByText('No academic insights')).toBeVisible();
    expect(screen.getByRole('img', { name: 'empty content' })).toBeVisible();
  });
});
