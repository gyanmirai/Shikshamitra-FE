import { vi, it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import TeachingKpiCards from './TeachingKpiCards';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

describe('TeachingKpiCards', () => {
  it('opens teaching insights from the shared action button', () => {
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <TeachingKpiCards lessonPlans={[]} diaryEntries={[]} onCardClick={vi.fn()} />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'View full insights' }));

    expect(screen.getByRole('heading', { name: 'Teaching Insights' })).toBeInTheDocument();
    expect(screen.getByText('Lessons planned')).toBeInTheDocument();
    expect(screen.getByText('Pending diaries')).toBeInTheDocument();
  });
});
