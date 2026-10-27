import { Provider } from 'react-redux';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from 'src/redux/auth/authSlice';
import { _api as iconifyApi } from '@iconify/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { iconApiHandlers } from 'src/test/icon-api-handlers';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, within, fireEvent } from '@testing-library/react';

import { AcademicSetupStatus } from './academic-setup-status';
import { AcademicYearContext } from './academic-year-context';
import { AcademicSetupProgress } from './academic-setup-progress';
import { AcademicActionButtons } from './node-actions/academic-action-buttons';

const renderWithTheme = (node: React.ReactNode, grants = ['Add', 'Edit', 'Delete']) => {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        ...authReducer(undefined, { type: 'init' }),
        permissions: grants.map((action) => ({
          name: `InstituteSetup.AcademicSetup.${action}`,
          isGranted: true,
        })),
      },
    },
  });
  return render(
    <Provider store={store}>
      <ThemeProvider theme={createTheme(defaultSettings)}>{node}</ThemeProvider>
    </Provider>
  );
};

describe('academic setup states and actions', () => {
  beforeEach(() => {
    iconifyApi.setFetch((...args) => fetch(...args));
    mswServer.use(...iconApiHandlers);
  });
  it('shows readable progress and the next best action', () => {
    renderWithTheme(
      <AcademicSetupProgress
        counts={{ boards: 2, mediums: 3, stages: 2, standards: 0, divisions: 0 }}
      />
    );

    expect(screen.getByText('3 of 5 hierarchy levels are in use')).toBeVisible();
    expect(screen.getByText('Select a stage and add its first standard.')).toBeVisible();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    const levels = within(screen.getByRole('list', { name: 'Hierarchy levels' })).getAllByRole(
      'listitem'
    );
    expect(levels.map((level) => level.textContent)).toEqual([
      '2Boards',
      '3Mediums',
      '2Stages',
      '0Standards',
      '0Divisions',
    ]);
  });

  it('keeps stable progress geometry while counts load', () => {
    renderWithTheme(
      <AcademicSetupProgress
        counts={{ boards: 0, mediums: 0, stages: 0, standards: 0, divisions: 0 }}
        isLoading
      />
    );

    expect(screen.getAllByLabelText(/Loading .* count/)).toHaveLength(5);
    expect(screen.getByRole('region', { name: 'Setup Progress' })).toHaveAttribute(
      'aria-busy',
      'true'
    );
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
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

  it('does not expose editing or deletion with only an academic Add grant', () => {
    renderWithTheme(
      <AcademicActionButtons
        recordName="Primary"
        recordType="stage"
        addLabel="Add standard"
        onAdd={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
      ['Add']
    );
    expect(screen.getByRole('button', { name: 'Add standard' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Edit stage Primary' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Delete stage Primary' })).not.toBeInTheDocument();
  });

  it('visibly distinguishes creating a year from adding a board and routes each action correctly', () => {
    const createYear = vi.fn();
    const addBoard = vi.fn();
    const editYear = vi.fn();
    const year = { id: 'year-1', name: '2025-2026' };
    renderWithTheme(
      <AcademicYearContext
        years={[year]}
        selectedYearId={year.id}
        currentYear={year}
        isLoading={false}
        onCreateYear={createYear}
        onAddBoard={addBoard}
        onEditYear={editYear}
        onSelectYear={vi.fn()}
      />
    );
    const create = screen.getByRole('button', { name: 'Create academic year' });
    expect(create).toHaveTextContent('Academic year');
    fireEvent.click(create);
    expect(createYear).toHaveBeenCalledOnce();
    expect(addBoard).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Add board' }));
    expect(addBoard).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: 'Edit academic year 2025-2026' }));
    expect(editYear).toHaveBeenCalledOnce();
  });

  it('offers one create-year action when no academic year exists', () => {
    const createYear = vi.fn();
    renderWithTheme(
      <AcademicYearContext
        years={[]}
        selectedYearId=""
        isLoading={false}
        onCreateYear={createYear}
        onAddBoard={vi.fn()}
        onEditYear={vi.fn()}
        onSelectYear={vi.fn()}
      />
    );
    expect(screen.getAllByRole('button', { name: 'Create academic year' })).toHaveLength(1);
    expect(screen.queryByRole('button', { name: 'Add board' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Create academic year' }));
    expect(createYear).toHaveBeenCalledOnce();
  });
});
