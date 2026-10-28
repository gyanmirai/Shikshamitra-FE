import type { ReactNode } from 'react';

import { it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { SmartAcademicInsightsCard } from './SmartAcademicInsightsCard';
import { AcademicActionQueue } from '../../components/command-center/AcademicActionQueue';

const theme = createTheme(defaultSettings);
const renderCard = (card: ReactNode) => render(<ThemeProvider theme={theme}>{card}</ThemeProvider>);

describe('Academic Dashboard empty states', () => {
  it('uses the shared empty content for an empty priority queue', () => {
    renderCard(
      <AcademicActionQueue
        title="Priority Action Queue"
        subtitle="Most important academic issues to close first"
        items={[]}
      />
    );

    expect(screen.getByText('No priority actions')).toBeVisible();
    expect(screen.getByText('No priority actions').parentElement?.querySelector('svg'))
      .toHaveAttribute('aria-hidden', 'true');
  });

  it('uses the shared empty content when there are no insights', () => {
    renderCard(<SmartAcademicInsightsCard insights={[]} />);

    expect(screen.getByText('No academic insights')).toBeVisible();
    expect(screen.getByText('No academic insights').parentElement?.querySelector('svg'))
      .toHaveAttribute('aria-hidden', 'true');
  });
});
