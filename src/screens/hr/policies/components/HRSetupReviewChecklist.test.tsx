import type { HrSetupReview } from 'src/redux/hr/hr-setup-review-api';

import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { HRSetupReviewChecklist } from './HRSetupReviewChecklist';

const mocks = vi.hoisted(() => ({
  query: vi.fn(),
  record: vi.fn(),
  refetch: vi.fn(),
  saving: false,
}));
vi.mock('src/redux/hr/hr-setup-review-api', () => ({
  useGetHrSetupReviewQuery: mocks.query,
  useRecordHrSetupReviewMutation: () => [mocks.record, { isLoading: mocks.saving }],
}));
const snapshot: HrSetupReview = {
  academicYearId: 'year-1',
  section: 'calendar',
  configurationState: 'valid',
  reviewState: 'record_not_present',
  fingerprint: 'a'.repeat(64),
  concurrencyStamp: 'revision-1',
  canReview: true,
  starterInitialized: false,
  tenantStarterEnabled: false,
  details: ['Synthetic school calendar'],
  notices: [],
};
const navigation = [
  'HR.Policies.Calendars',
  'HR.Policies.Attendance',
  'HR.Policies.Payroll',
  'HR.Policies.PolicyAssignment',
];
const grants = ['HR.Policies.View', 'HR.LeaveManagement.Setting.LeavePolicy.View', ...navigation];
const mount = (permissions = grants, academicYearId: string | undefined = 'year-1') => {
  const store = configureStore({
    reducer: {
      auth: () => ({ permissions: permissions.map((name) => ({ name, isGranted: true })) }),
    },
  });
  return render(
    <Provider store={store}>
      <HRSetupReviewChecklist academicYearId={academicYearId} />
    </Provider>
  );
};
beforeEach(() => {
  vi.clearAllMocks();
  mocks.saving = false;
  mocks.query.mockImplementation((args) => ({
    currentData: { ...snapshot, ...args },
    isFetching: false,
    isError: false,
    refetch: mocks.refetch,
  }));
  mocks.record.mockReturnValue({ unwrap: () => Promise.resolve(snapshot) });
});

describe('advisory school HR review checklist', () => {
  it('keeps technical validity, legacy provenance and review evidence separate', () => {
    mount();
    expect(screen.getAllByText('Defaults available')).toHaveLength(4);
    expect(screen.getAllByText('Review needed · no record')).toHaveLength(5);
    expect(screen.getAllByText(/Starter provenance not recorded/)).toHaveLength(5);
    expect(screen.getByText(/This checklist is advisory/)).toBeTruthy();
    expect(screen.queryByText('Reviewed for this school')).toBeNull();
  });
  it('never guesses completed review from starter provenance or zero allocation', () => {
    mocks.query.mockImplementation((args) => ({
      currentData: {
        ...snapshot,
        ...args,
        starterInitialized: true,
        notices: ['Zero leave allocation needs review. Recording does not add days.'],
      },
      refetch: mocks.refetch,
    }));
    mount();
    expect(screen.getAllByText(/Zero leave allocation/)).toHaveLength(5);
    expect(screen.getAllByText(/Starter setup recorded/)).toHaveLength(5);
    expect(screen.queryByText('Reviewed for this school')).toBeNull();
  });
  it('records only the exact displayed fingerprint and revision without actor or tenant input', async () => {
    mount();
    fireEvent.click(
      screen.getByRole('button', { name: 'Record calendar and workweek review', hidden: true })
    );
    await waitFor(() => expect(mocks.record).toHaveBeenCalledTimes(1));
    expect(mocks.record).toHaveBeenCalledWith({
      academicYearId: 'year-1',
      section: 'calendar',
      fingerprint: snapshot.fingerprint,
      concurrencyStamp: snapshot.concurrencyStamp,
      employeeId: undefined,
      date: undefined,
    });
    await waitFor(() => expect(screen.getByText('Review recorded.')).toBeTruthy());
  });
  it('does not issue unscoped or unauthorized queries', () => {
    const view = mount([], undefined);
    expect(mocks.query).not.toHaveBeenCalled();
    view.unmount();
    mount(['HR.Policies.Edit']);
    expect(mocks.query).not.toHaveBeenCalled();
  });
  it('requires the exact leave View grant and both views for the sample', () => {
    mount(['HR.Policies.View', ...navigation]);
    expect(mocks.query.mock.calls.map(([arg]) => arg.section)).toEqual([
      'calendar',
      'attendance',
      'payroll',
    ]);
  });
  it('does not display a previous year result while a new scope loads', () => {
    mocks.query.mockReturnValue({
      data: snapshot,
      currentData: undefined,
      isFetching: true,
      refetch: mocks.refetch,
    });
    mount();
    expect(screen.getAllByRole('status', { hidden: true })).toHaveLength(5);
    expect(screen.queryByText('Defaults available')).toBeNull();
  });
  it('presents a retryable read error without claiming missing settings', () => {
    mocks.query.mockReturnValue({ currentData: undefined, isError: true, refetch: mocks.refetch });
    mount();
    expect(screen.getAllByRole('alert', { hidden: true })).toHaveLength(5);
    fireEvent.click(screen.getAllByRole('button', { name: 'Retry', hidden: true })[0]);
    expect(mocks.refetch).toHaveBeenCalledOnce();
    expect(screen.queryByText('Defaults missing')).toBeNull();
  });
  it('keeps conflicts visible, refreshes for review, and never automatically acknowledges a replacement', async () => {
    mocks.record.mockReturnValue({ unwrap: () => Promise.reject(new Error('conflict')) });
    mount();
    fireEvent.click(
      screen.getByRole('button', { name: 'Record calendar and workweek review', hidden: true })
    );
    await waitFor(() => expect(screen.getByText(/Review was not recorded/)).toBeTruthy());
    expect(mocks.refetch).toHaveBeenCalledOnce();
    expect(mocks.record).toHaveBeenCalledOnce();
    expect(screen.queryByText('Review recorded.')).toBeNull();
  });
  it.each(['no_staff', 'deferred'] as const)(
    'keeps %s distinct from a successful sample check',
    (configurationState) => {
      mocks.query.mockImplementation((args) => ({
        currentData: { ...snapshot, ...args, configurationState, canReview: false },
        refetch: mocks.refetch,
      }));
      mount();
      expect(screen.queryByText('Sample resolved')).toBeNull();
      expect(screen.queryByRole('button', { name: /Record/, hidden: true })).toBeNull();
    }
  );
  it('shows stale actor/time evidence separately and disables writes during a refresh', () => {
    mocks.query.mockImplementation((args) => ({
      currentData: {
        ...snapshot,
        ...args,
        reviewState: 'stale',
        reviewedBy: 'actor-1',
        reviewedByName: 'Synthetic reviewer',
        reviewedAt: '2026-06-01T10:00:00Z',
      },
      isFetching: true,
      refetch: mocks.refetch,
    }));
    mount();
    expect(screen.getAllByText('Review needed · settings changed')).toHaveLength(5);
    expect(screen.getAllByText(/Synthetic reviewer/)).toHaveLength(5);
    expect(
      (
        screen.getByRole('button', {
          name: 'Record calendar and workweek review',
          hidden: true,
        }) as HTMLButtonElement
      ).disabled
    ).toBe(true);
  });
  it('uses native keyboard-operable disclosure and precise settings links', () => {
    const view = mount();
    const summary = view.container.querySelector('summary')!;
    expect(summary.parentElement?.tagName).toBe('DETAILS');
    const links = screen.getAllByRole('link', { hidden: true });
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/hr/calendars',
      '/hr/attendance',
      '/hr/leave-policies',
      '/hr/payrollPolicies',
      '/hr/assignments',
    ]);
  });
});
