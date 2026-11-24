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
    expect(screen.getAllByText('Defaults available')).toHaveLength(3);
    expect(screen.getByText('Active calendars available')).toBeInTheDocument();
    expect(screen.getAllByText('Review needed · no record')).toHaveLength(5);
    expect(screen.getAllByText(/Starter provenance not recorded/)).toHaveLength(5);
    expect(screen.getByText(/Optional guidance for the selected academic year/)).toBeTruthy();
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
    fireEvent.click(screen.getByRole('button', { name: 'Policy Setup Guide' }));
    fireEvent.click(screen.getByRole('button', { name: 'Record calendar and workweek review' }));
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
    fireEvent.click(screen.getByRole('button', { name: 'Policy Setup Guide' }));
    expect(screen.getAllByRole('alert')).toHaveLength(5);
    fireEvent.click(screen.getAllByRole('button', { name: 'Retry' })[0]);
    expect(mocks.refetch).toHaveBeenCalledOnce();
    expect(screen.queryByText('Defaults missing')).toBeNull();
  });
  it('keeps conflicts visible, refreshes for review, and never automatically acknowledges a replacement', async () => {
    mocks.record.mockReturnValue({ unwrap: () => Promise.reject(new Error('conflict')) });
    mount();
    fireEvent.click(screen.getByRole('button', { name: 'Policy Setup Guide' }));
    fireEvent.click(screen.getByRole('button', { name: 'Record calendar and workweek review' }));
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
      fireEvent.click(screen.getByRole('button', { name: 'Policy Setup Guide' }));
      expect(screen.queryByText('Sample resolved')).toBeNull();
      expect(screen.queryByRole('button', { name: /Record/ })).toBeNull();
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
    fireEvent.click(screen.getByRole('button', { name: 'Policy Setup Guide' }));
    expect(screen.getAllByText('Review needed · settings changed')).toHaveLength(5);
    expect(screen.getAllByText(/Synthetic reviewer/)).toHaveLength(5);
    expect(
      (
        screen.getByRole('button', {
          name: 'Record calendar and workweek review',
        }) as HTMLButtonElement
      ).disabled
    ).toBe(true);
  });
  it('shows the policy relationships and ordered settings links even when evidence fails to load', () => {
    mocks.query.mockReturnValue({ currentData: undefined, isError: true, refetch: mocks.refetch });
    mount();
    const disclosure = screen.getByRole('button', { name: 'Policy Setup Guide' });
    expect(disclosure).toHaveAttribute('aria-expanded', 'false');
    expect(disclosure).toHaveAttribute('aria-controls');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();

    fireEvent.click(disclosure);
    expect(disclosure).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getAllByRole('link').map((link) => [link.textContent, link.getAttribute('href')])
    ).toEqual([
      ['Work Calendars', '/hr/calendars'],
      ['Attendance Policies', '/hr/attendance'],
      ['Payroll Policies', '/hr/payrollPolicies'],
      ['Leave Policies', '/hr/leave-policies'],
      ['Policy Assignments', '/hr/assignments'],
    ]);
    expect(screen.getByText(/payroll calendar and workday rules/)).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Review Evidence' })).toBeVisible();
  });

  it('explains leave day counting to a leave-only reader without exposing other links or evidence', () => {
    mount(['HR.LeaveManagement.Setting.LeavePolicy.View', ...navigation]);
    fireEvent.click(screen.getByRole('button', { name: 'Policy Setup Guide' }));
    expect(screen.getAllByRole('link').map((link) => link.textContent)).toEqual(['Leave Policies']);
    expect(screen.getByText(/payroll calendar and workday rules/)).toBeVisible();
    expect(mocks.query.mock.calls.map(([arg]) => arg.section)).toEqual(['leave']);
  });

  it('offers assignment navigation without using the sample as an assignment review', () => {
    mount(['HR.Policies.View', ...navigation]);
    fireEvent.click(screen.getByRole('button', { name: 'Policy Setup Guide' }));
    expect(screen.getByRole('link', { name: 'Policy Assignments' })).toHaveAttribute(
      'href',
      '/hr/assignments'
    );
    expect(
      screen.queryByRole('heading', { name: 'Sample staff and date check' })
    ).not.toBeInTheDocument();
  });
});
