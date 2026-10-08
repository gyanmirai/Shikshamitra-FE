import { vi, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { SalaryEditorDialog } from './salary-editor-dialog';

const mocks = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock('src/routes/hooks', () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock('src/redux/hr/employeeApi', () => ({
  useGetEmployeeByIdQuery: () => ({
    currentData: { id: 'employee-1', fullName: 'Test Staff', status: 0 },
    isLoading: false,
  }),
}));
vi.mock('src/components/customDialog', () => ({
  default: ({ children, title, handleClose, disableClose }: any) => (
    <div role="dialog" aria-label={title}>
      <button type="button" disabled={disableClose} onClick={handleClose}>
        Dismiss
      </button>
      {children}
    </div>
  ),
  DialogScrollContent: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('./SalaryStructureBuilder', async () => {
  const { createPortal } = await import('react-dom');
  return {
    SalaryStructureBuilder: ({ actionContainer, onEditorStateChange }: any) => (
      <>
        <button type="button" onClick={() => onEditorStateChange({ dirty: true, busy: false })}>
          Change input
        </button>
        <button type="button" onClick={() => onEditorStateChange({ dirty: true, busy: true })}>
          Start saving
        </button>
        {actionContainer &&
          createPortal(<button type="button">Save salary</button>, actionContainer)}
      </>
    ),
  };
});
beforeEach(() => vi.clearAllMocks());
it('shows the salary footer and monthly payroll link without a month or legacy component editor', () => {
  render(<SalaryEditorDialog employeeId="employee-1" handleClose={vi.fn()} />);
  expect(screen.getByText('Test Staff')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Save salary' })).toBeVisible();
  expect(screen.queryByText('Save one-time components')).not.toBeInTheDocument();
  expect(
    screen.getByRole('link', { name: 'Manage one-time adjustments in monthly payroll' })
  ).toHaveAttribute('href', '/hr/payroll/run-payroll');
});
it('keeps the salary draft when dismissal is cancelled and closes only after discard', () => {
  const close = vi.fn();
  render(<SalaryEditorDialog employeeId="employee-1" handleClose={close} />);
  fireEvent.click(screen.getByRole('button', { name: 'Change input' }));
  fireEvent.click(screen.getByRole('button', { name: /^Close$/ }));
  expect(close).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
  expect(screen.getByRole('button', { name: 'Change input' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: /^Close$/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
  expect(close).toHaveBeenCalledTimes(1);
});
it('guards monthly payroll navigation and blocks dismissal while saving', () => {
  const close = vi.fn();
  render(<SalaryEditorDialog employeeId="employee-1" handleClose={close} />);
  fireEvent.click(screen.getByRole('button', { name: 'Change input' }));
  fireEvent.click(
    screen.getByRole('link', { name: 'Manage one-time adjustments in monthly payroll' })
  );
  expect(mocks.push).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
  fireEvent.click(screen.getByRole('button', { name: 'Start saving' }));
  expect(screen.getByRole('button', { name: /^Close$/ })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Dismiss' })).toBeDisabled();
});
