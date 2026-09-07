import { vi, it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { AcademicSetupStatus } from './academic-setup-status';
import { AcademicSetupProgress } from './academic-setup-progress';
import { AcademicActionButtons } from './node-actions/academic-action-buttons';

const renderWithTheme = (node: React.ReactNode) =>
  render(<ThemeProvider theme={createTheme(defaultSettings)}>{node}</ThemeProvider>);

describe('academic setup states and actions', () => {
  it('shows readable progress and the next best action', () => {
    renderWithTheme(
      <AcademicSetupProgress
        counts={{ boards: 2, mediums: 3, stages: 2, standards: 0, divisions: 0 }}
      />
    );

    expect(screen.getByText('3 of 5 hierarchy levels are in use')).toBeVisible();
    expect(screen.getByText('Next, select a stage and add its first standard.')).toBeVisible();
  });

  it('keeps stable progress geometry while counts load', () => {
    renderWithTheme(
      <AcademicSetupProgress
        counts={{ boards: 0, mediums: 0, stages: 0, standards: 0, divisions: 0 }}
        isLoading
      />
    );

    expect(screen.getAllByLabelText(/Loading .* count/)).toHaveLength(5);
  });

  it('offers a recoverable error state', () => {
    const retry = vi.fn();
    renderWithTheme(<AcademicSetupStatus kind="error" onRetry={retry} />);

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(retry).toHaveBeenCalledOnce();
  });

  it('explains the starting point when no academic year exists', () => {
    const createYear = vi.fn();
    renderWithTheme(<AcademicSetupStatus kind="empty" onCreateYear={createYear} />);

    fireEvent.click(screen.getByRole('button', { name: 'Create academic year' }));
    expect(createYear).toHaveBeenCalledOnce();
  });

  it('provides compact record-specific edit and delete actions', () => {
    renderWithTheme(
      <AcademicActionButtons
        recordName="Primary"
        recordType="stage"
        addLabel="Add standard"
        onAdd={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Add standard' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Edit stage Primary' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Delete stage Primary' })).toBeVisible();
  });
});
