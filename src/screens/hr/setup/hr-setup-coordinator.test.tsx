import { it, vi, expect, describe, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';

import { HrSetupCoordinator } from './hr-setup-coordinator';

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
        <div role="dialog" aria-label="Let’s Complete Your HR Setup">
          {error && <p>Unable to check HR setup</p>}
          <button type="button" onClick={onClose}>
            Close for now
          </button>
        </div>
      );
    },
}));

describe('On-demand HR setup checks', () => {
  beforeEach(() => {
    cleanup();
    mocks.read.mockClear();
    mocks.state.auth.permissions = [{ name: 'HR.Employee.EmployeeList.Add', isGranted: true }];
    mocks.state.auth.user = { sub: 'operator', tenantid: 'school' };
    mocks.state.globalState.currentYear.id = 'year';
    mocks.query.isError = false;
  });

  it.each([
    [true, 'HR setup is complete.'],
    [false, 'Your school has HR setup items remaining.'],
    [null, 'No current HR setup result for this academic year.'],
  ] as const)('uses the dashboard flag %s without fetching details', (savedReady, message) => {
    render(<HrSetupCoordinator savedReady={savedReady} />);
    expect(screen.getByText(message)).toBeTruthy();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(mocks.read.mock.lastCall?.[1].skip).toBe(true);
  });

  it('checks on click and refreshes the saved status when closing', () => {
    const onChecked = vi.fn();
    render(<HrSetupCoordinator onChecked={onChecked} />);
    fireEvent.click(screen.getByRole('button', { name: 'Check HR setup' }));
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(mocks.read.mock.lastCall?.[1].skip).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'Close for now' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(mocks.read.mock.lastCall?.[1].skip).toBe(true);
    expect(onChecked).toHaveBeenCalledOnce();
  });

  it.each(['user', 'tenant', 'year'])('closes the check when the %s changes', (change) => {
    const view = render(<HrSetupCoordinator />);
    fireEvent.click(screen.getByRole('button', { name: 'Check HR setup' }));
    if (change === 'user') mocks.state.auth.user.sub = 'another-operator';
    if (change === 'tenant') mocks.state.auth.user.tenantid = 'another-school';
    if (change === 'year') mocks.state.globalState.currentYear.id = 'another-year';
    view.rerender(<HrSetupCoordinator />);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(mocks.read.mock.lastCall?.[1].skip).toBe(true);
  });

  it('continues an explicit check when the first academic year is selected', () => {
    mocks.state.globalState.currentYear.id = '';
    const view = render(<HrSetupCoordinator />);
    fireEvent.click(screen.getByRole('button', { name: 'Check HR setup' }));
    mocks.state.globalState.currentYear.id = 'year';
    view.rerender(<HrSetupCoordinator />);
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(mocks.read.mock.lastCall).toEqual([
      expect.objectContaining({ academicYearId: 'year' }),
      expect.objectContaining({ skip: false }),
    ]);
  });

  it('excludes employee self-service and skips its setup query', () => {
    mocks.state.auth.permissions = [
      { name: 'HR.LeaveManagement.LeaveCenter.Add', isGranted: true },
    ];
    render(<HrSetupCoordinator />);
    expect(screen.queryByRole('button', { name: 'Check HR setup' })).toBeNull();
    expect(mocks.read.mock.lastCall?.[1].skip).toBe(true);
  });

  it('reports a failed check after the operator opens it', () => {
    mocks.query.isError = true;
    render(<HrSetupCoordinator />);
    expect(screen.queryByText('Unable to check HR setup')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Check HR setup' }));
    expect(screen.getByText('Unable to check HR setup')).toBeTruthy();
  });
});
