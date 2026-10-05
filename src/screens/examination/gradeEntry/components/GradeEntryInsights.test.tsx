import { it, vi, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, fireEvent } from '@testing-library/react';
import { GradeEntryWorkflowStatus } from 'src/enums/grade-entry-status';
import { defaultSettings } from 'src/components/settings/config-settings';

import { GradeEntryInsights } from './GradeEntryInsights';

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} aria-hidden="true" />,
}));

const stats = {
  totalCount: 3,
  pendingCount: 1,
  passCount: 1,
  failCount: 1,
  passPercentage: 50,
  failPercentage: 50,
  highestMarks: 88,
  lowestMarks: 32,
  averageMarks: 60,
};

function renderInsights(overrides: Partial<React.ComponentProps<typeof GradeEntryInsights>> = {}) {
  const onClose = vi.fn();
  const props = {
    open: true,
    onClose,
    stats,
    allMarksAssigned: false,
    workflowStatus: GradeEntryWorkflowStatus.Draft,
    ...overrides,
  };

  return {
    onClose,
    ...render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <GradeEntryInsights {...props} />
      </ThemeProvider>
    ),
  };
}

describe('GradeEntryInsights', () => {
  it('shows live metrics and readiness from the selected exam state and closes from the header', () => {
    const { onClose } = renderInsights();

    expect(screen.getByRole('heading', { name: 'Grade entry insights' })).toBeInTheDocument();
    expect(screen.getByText('Total students')).toBeInTheDocument();
    expect(screen.getByText('Highest marks')).toBeInTheDocument();
    expect(screen.getByText('88')).toBeInTheDocument();
    expect(screen.getByText('Pass:')).toBeInTheDocument();
    expect(screen.getByText('Fail:')).toBeInTheDocument();
    expect(screen.getByText('Pending:')).toBeInTheDocument();
    expect(screen.getByText('All Students Graded')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close insights' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('shows zeros and the empty chart message when there are no graded students', () => {
    renderInsights({ stats: null });

    expect(screen.getByText('No graded data yet')).toBeInTheDocument();
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(6);
  });
});
