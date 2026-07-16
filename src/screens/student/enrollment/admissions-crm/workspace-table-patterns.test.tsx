import { TextField } from '@mui/material';
import { vi, it, expect, describe } from 'vitest';
import { renderWithProviders } from 'src/test/test-utils';
import { screen, fireEvent } from '@testing-library/react';

import {
  enrollmentActionsColumn,
  EnrollmentTableEmptyState,
  EnrollmentWorkspaceFilterPanel,
} from './workspace-table-patterns';

describe('Enrollment workspace table patterns', () => {
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
});
