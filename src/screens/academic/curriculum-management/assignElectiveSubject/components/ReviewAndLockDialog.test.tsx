import { screen } from '@testing-library/react';
import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from 'src/test/test-utils';

import ReviewAndLockDialog from './ReviewAndLockDialog';

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} aria-hidden="true" />,
}));

vi.mock('src/components/customDialog', () => ({
  default: ({
    open,
    title,
    children,
  }: {
    open: boolean;
    title: React.ReactNode;
    children: React.ReactNode;
  }) =>
    open ? (
      <div role="dialog" aria-label="Review and Lock">
        {title}
        {children}
      </div>
    ) : null,
  DialogScrollContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  total: 3,
  assigned: 3,
  unassigned: 0,
  subjectCapacity: [
    { subjectId: 'computer-science', subjectName: 'Computer Science', assignedCount: 1 },
    { subjectId: 'pt', subjectName: 'PT', assignedCount: 2 },
  ],
  preferenceMatchPct: 100,
  canLock: true,
  hasUnsavedChanges: false,
  isLocked: false,
  isLocking: false,
  onConfirmLock: vi.fn(),
};

describe('ReviewAndLockDialog', () => {
  it('shows a neutral summary without informational banners and confirms the lock action', async () => {
    const user = userEvent.setup();
    const onConfirmLock = vi.fn();

    renderWithProviders(<ReviewAndLockDialog {...defaultProps} onConfirmLock={onConfirmLock} />);

    expect(screen.getByText('Review and Lock')).toBeVisible();
    expect(
      screen.queryByText('Confirm the final elective allocation before locking')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Ready to lock')).not.toBeInTheDocument();
    expect(screen.queryByText('Editing is restricted after locking')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText('Assignment summary')).toBeVisible();
    expect(screen.getByText('Students by elective subject')).toBeVisible();
    expect(screen.getByText('Computer Science')).toBeVisible();
    expect(screen.getByText('PT')).toBeVisible();
    expect(screen.getByRole('article', { name: 'Total students: 3' })).toBeVisible();
    expect(screen.getByRole('article', { name: 'Computer Science: 1 student' })).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Lock Assignments' }));

    expect(onConfirmLock).toHaveBeenCalledOnce();
  });

  it('shows incomplete counts and prevents locking without adding a status banner', () => {
    renderWithProviders(
      <ReviewAndLockDialog {...defaultProps} assigned={2} unassigned={1} canLock={false} />
    );

    expect(screen.getByRole('article', { name: 'Unassigned: 1' })).toBeVisible();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Lock Assignments' })).toBeDisabled();
  });

  it('prevents locking while assignment changes are unsaved', () => {
    renderWithProviders(<ReviewAndLockDialog {...defaultProps} canLock hasUnsavedChanges />);

    expect(screen.getByRole('button', { name: 'Lock Assignments' })).toBeDisabled();
  });
});
