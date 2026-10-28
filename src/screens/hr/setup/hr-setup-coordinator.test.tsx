import { useState } from 'react';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';

import { HrSetupCoordinator } from './hr-setup-coordinator';
import { HrSetupSessionProvider } from './hr-setup-session';

const mocks = vi.hoisted(() => ({
  state: {
    auth: {
      user: { sub: 'operator', tenantid: 'school' },
      loading: false,
      permissionsInitialized: true,
      permissions: [{ name: 'HR.Employee.EmployeeList.Add', isGranted: true }],
      sessionContext: { tenantId: 'school' },
    },
    globalState: { currentYear: { id: 'year' } },
  },
  query: {
    currentData: { isReady: false, checks: [], academicYearId: 'year', availableYears: [] },
    isError: false,
    isFetching: false,
    refetch: vi.fn(),
  },
  read: vi.fn(),
}));
vi.mock('react-redux', () => ({
  useSelector: (select: (state: typeof mocks.state) => unknown) => select(mocks.state),
}));
vi.mock('src/redux/hr/hr-setup-readiness-api', () => ({
  useGetHrSetupReadinessQuery: (...args: unknown[]) => {
    mocks.read(...args);
    return mocks.query;
  },
}));
vi.mock('next/dynamic', () => ({
  default: () =>
    function Wizard({ onClose, error }: { onClose: () => void; error: boolean }) {
      return (
        <div role="dialog" aria-label="Complete HR Setup">
          {error && <p>Unable to check HR setup</p>}
          <button type="button" onClick={onClose}>
            Close for now
          </button>
        </div>
      );
    },
}));

function Workspace() {
  const [hr, setHr] = useState(true);
  return (
    <HrSetupSessionProvider>
      <button type="button" onClick={() => setHr((value) => !value)}>
        Navigate
      </button>
      {hr && <HrSetupCoordinator />}
    </HrSetupSessionProvider>
  );
}

describe('HR setup reminder lifetime', () => {
  beforeEach(() => {
    cleanup();
    mocks.read.mockClear();
    mocks.state.auth.permissions = [{ name: 'HR.Employee.EmployeeList.Add', isGranted: true }];
    mocks.state.auth.user = { sub: 'operator', tenantid: 'school' };
    mocks.state.globalState.currentYear.id = 'year';
    mocks.query.currentData.isReady = false;
    mocks.query.isError = false;
  });
  it('shows on a direct HR entry and remains dismissed across HR re-entry', () => {
    render(<Workspace />);
    expect(screen.getByRole('dialog')).toBeTruthy();
    fireEvent.click(screen.getByText('Close for now'));
    fireEvent.click(screen.getByText('Navigate'));
    fireEvent.click(screen.getByText('Navigate'));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(mocks.read.mock.calls.at(-1)?.[1].skip).toBe(true);
  });
  it('returns after a new document lifetime', () => {
    const view = render(<Workspace />);
    fireEvent.click(screen.getByText('Close for now'));
    view.unmount();
    render(<Workspace />);
    expect(screen.getByRole('dialog')).toBeTruthy();
  });
  it.each(['user', 'tenant', 'year'])('does not carry dismissal into another %s', (change) => {
    const view = render(<Workspace />);
    fireEvent.click(screen.getByText('Close for now'));
    if (change === 'user') mocks.state.auth.user.sub = 'another-operator';
    if (change === 'tenant') mocks.state.auth.user.tenantid = 'another-school';
    if (change === 'year') mocks.state.globalState.currentYear.id = 'another-year';
    view.rerender(<Workspace />);
    expect(screen.getByRole('dialog')).toBeTruthy();
  });
  it('excludes employee self-service and never queries its setup', () => {
    mocks.state.auth.permissions = [
      { name: 'HR.LeaveManagement.LeaveCenter.Add', isGranted: true },
    ];
    render(<Workspace />);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(mocks.read.mock.calls.at(-1)?.[1].skip).toBe(true);
  });
  it('does not show the popup for a ready school', () => {
    mocks.query.currentData.isReady = true;
    render(<Workspace />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });
  it('waits for an existing form dialog to close before opening setup', async () => {
    const existing = document.createElement('div');
    existing.setAttribute('role', 'dialog');
    existing.setAttribute('aria-modal', 'true');
    existing.setAttribute('aria-label', 'Existing staff form');
    document.body.appendChild(existing);
    render(<Workspace />);
    expect(screen.queryByRole('dialog', { name: 'Complete HR Setup' })).toBeNull();
    existing.remove();
    expect(await screen.findByRole('dialog', { name: 'Complete HR Setup' })).toBeTruthy();
  });
  it('reports a failed check without claiming configuration is missing', () => {
    mocks.query.isError = true;
    render(<Workspace />);
    expect(screen.getByText('Unable to check HR setup')).toBeTruthy();
    fireEvent.click(screen.getByText('Close for now'));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
