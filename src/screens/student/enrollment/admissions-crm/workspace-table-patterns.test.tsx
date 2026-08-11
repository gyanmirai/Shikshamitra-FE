import { TextField } from '@mui/material';
import { vi, it, expect, describe } from 'vitest';
import { renderWithProviders } from 'src/test/test-utils';
import { screen, fireEvent } from '@testing-library/react';

import {
  enrollmentActionsColumn,
  enrollmentTableWrapperSx,
  EnrollmentTableEmptyState,
  enrollmentWorkspaceRootSx,
  enrollmentTableContainerSx,
  EnrollmentWorkspaceErrorState,
  EnrollmentWorkspaceFilterPanel,
  EnrollmentWorkspaceLoadingState,
  enrollmentEmbeddedTableContainerSx,
} from './workspace-table-patterns';

describe('Enrollment workspace table patterns', () => {
  it('keeps the complete desktop flex-height chain and mobile page scrolling contract', () => {
    expect(enrollmentWorkspaceRootSx).toMatchObject({
      flex: 1,
      height: '100%',
      minHeight: 0,
      overflow: { xs: 'auto', md: 'hidden' },
    });
    expect(enrollmentTableWrapperSx).toMatchObject({
      flex: 1,
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
    });
    expect(enrollmentTableContainerSx).toMatchObject({
      height: '100%',
      minHeight: { xs: 320, md: 0 },
    });
    expect(enrollmentEmbeddedTableContainerSx).toMatchObject({
      minHeight: 320,
      height: 'auto',
    });
  });

  it('keeps the project-standard sticky actions column geometry', () => {
    expect(enrollmentActionsColumn).toMatchObject({
      width: 112,
      minWidth: 104,
      sticky: true,
      stickyPosition: 'right',
      stickyOnMobile: false,
    });
  });

  it('renders compact filters with an explicit clear action', () => {
    const onClear = vi.fn();
    renderWithProviders(
      <EnrollmentWorkspaceFilterPanel onClear={onClear}>
        <TextField id="workspace-filter" label="Owner" size="small" />
      </EnrollmentWorkspaceFilterPanel>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(onClear).toHaveBeenCalledOnce();
  });

  it('keeps every filter within its responsive grid cell', () => {
    renderWithProviders(
      <EnrollmentWorkspaceFilterPanel>
        <TextField id="responsive-workspace-filter" label="Assignee" size="small" />
      </EnrollmentWorkspaceFilterPanel>
    );

    const filter = screen.getByLabelText('Assignee');
    expect(filter.closest('.MuiFormControl-root')).toHaveStyle({ width: '100%' });
  });

  it('uses a consistent, descriptive empty state', () => {
    renderWithProviders(
      <EnrollmentTableEmptyState title="Queue cleared" description="No applicants need action." />
    );

    expect(screen.getByText('Queue cleared')).toBeVisible();
    expect(screen.getByText('No applicants need action.')).toBeVisible();
  });

  it('keeps route-level loading inside the Enrollment workspace geometry', () => {
    renderWithProviders(<EnrollmentWorkspaceLoadingState />);

    expect(screen.getByRole('status', { name: 'Loading Enrollment workspace' })).toBeVisible();
  });

  it('runs the retry action while idle', () => {
    const onRetry = vi.fn();

    renderWithProviders(
      <EnrollmentWorkspaceErrorState message="Inquiry leads could not be loaded." onRetry={onRetry} />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(onRetry).toHaveBeenCalledOnce();
    expect(screen.getByRole('alert')).toHaveAttribute('aria-busy', 'false');
  });

  it('announces and displays retry progress', () => {
    renderWithProviders(
      <EnrollmentWorkspaceErrorState
        message="Inquiry leads could not be loaded."
        onRetry={vi.fn()}
        isRetrying
      />
    );

    expect(screen.getByRole('alert')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('button', { name: 'Retrying…' })).toBeDisabled();
    expect(screen.getByRole('progressbar', { name: 'Retrying request' })).toBeVisible();
  });
});
