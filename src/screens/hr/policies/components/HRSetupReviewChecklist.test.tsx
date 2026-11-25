import type { HrSetupReview } from 'src/redux/hr/hr-setup-review-api';

import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

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
  const ui = (year?: string) => (
    <Provider store={store}>
      <HRSetupReviewChecklist academicYearId={year} />
    </Provider>
  );
  const result = render(ui(academicYearId));
  return { ...result, setYear: (year: string) => result.rerender(ui(year)) };
};
const openSchoolReview = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Review School Policies' }));
const openSample = () =>
  fireEvent.click(screen.getByRole('button', { name: 'Check Policies for One Staff Member' }));

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

describe('optional HR policy evidence', () => {
  it('keeps technical validity, legacy provenance and review evidence separate', () => {
    mount();
    openSchoolReview();
    expect(screen.getAllByText('Defaults available')).toHaveLength(3);
    expect(screen.getByText('Active calendars available')).toBeInTheDocument();
    expect(screen.getAllByText('No review recorded')).toHaveLength(4);
    expect(screen.getAllByText(/Starter provenance not recorded/)).toHaveLength(4);
    expect(screen.getByText(/Recording a review is optional/)).toBeTruthy();
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
    openSchoolReview();
    expect(screen.getAllByText(/Zero leave allocation/)).toHaveLength(4);
    expect(screen.getAllByText(/Starter setup recorded/)).toHaveLength(4);
    expect(screen.queryByText('Reviewed for this school')).toBeNull();
  });
  it('records only the exact displayed fingerprint and revision without actor or tenant input', async () => {
    mount();
    openSchoolReview();
    fireEvent.click(screen.getByRole('button', { name: 'Record work calendars review' }));
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
    openSchoolReview();
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
    openSchoolReview();
    expect(screen.getAllByRole('status')).toHaveLength(4);
    expect(screen.queryByText('Defaults available')).toBeNull();
  });
  it('presents a retryable read error without claiming missing settings', () => {
    mocks.query.mockReturnValue({ currentData: undefined, isError: true, refetch: mocks.refetch });
    mount();
    openSchoolReview();
    expect(screen.getAllByRole('alert')).toHaveLength(4);
    fireEvent.click(screen.getAllByRole('button', { name: 'Retry' })[0]);
    expect(mocks.refetch).toHaveBeenCalledOnce();
    expect(screen.queryByText('Defaults missing')).toBeNull();
  });
  it('keeps conflicts visible, refreshes for review, and never automatically acknowledges a replacement', async () => {
    mocks.record.mockReturnValue({ unwrap: () => Promise.reject(new Error('conflict')) });
    mount();
    openSchoolReview();
    fireEvent.click(screen.getByRole('button', { name: 'Record work calendars review' }));
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
      openSample();
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
    openSchoolReview();
    expect(screen.getAllByText('Previous review is out of date')).toHaveLength(4);
    expect(screen.getAllByText(/Synthetic reviewer/)).toHaveLength(4);
    expect(
      (
        screen.getByRole('button', {
          name: 'Record work calendars review',
        }) as HTMLButtonElement
      ).disabled
    ).toBe(true);
  });
  it('loads school evidence and the staff sample only after their own first expansion', () => {
    mount();
    expect(mocks.query).not.toHaveBeenCalled();
    const schoolReview = screen.getByRole('button', { name: 'Review School Policies' });
    expect(schoolReview).toHaveAttribute('aria-expanded', 'false');
    expect(schoolReview).toHaveAttribute('aria-controls');

    openSchoolReview();
    expect(schoolReview).toHaveAttribute('aria-expanded', 'true');
    expect(mocks.query.mock.calls.map(([arg]) => arg.section)).toEqual([
      'calendar',
      'attendance',
      'payroll',
      'leave',
    ]);
    mocks.query.mockClear();
    openSample();
    expect(mocks.query.mock.calls.map(([arg]) => arg)).toEqual([
      { academicYearId: 'year-1', section: 'sample', newSample: undefined },
    ]);
    expect(mocks.record).not.toHaveBeenCalled();
  });

  it('never retries an old acknowledgement when switching years and returning', async () => {
    let rejectPrevious!: (reason: Error) => void;
    mocks.record.mockReturnValue({
      unwrap: () =>
        new Promise((_resolve, reject) => {
          rejectPrevious = reject;
        }),
    });
    const { setYear } = mount();
    openSchoolReview();
    fireEvent.click(screen.getByRole('button', { name: 'Record work calendars review' }));
    setYear('year-2');
    expect(screen.getByRole('button', { name: 'Review School Policies' })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
    openSchoolReview();
    expect(mocks.query).toHaveBeenCalledWith(
      expect.objectContaining({ academicYearId: 'year-2', section: 'calendar' }),
      expect.anything()
    );
    setYear('year-1');
    openSchoolReview();
    await act(async () => rejectPrevious(new Error('conflict')));
    expect(screen.queryByText(/Review was not recorded/)).not.toBeInTheDocument();
    expect(mocks.refetch).not.toHaveBeenCalled();
    expect(mocks.record).toHaveBeenCalledOnce();
  });

  it('records the staff and date displayed by the sample only after acknowledgement', async () => {
    mocks.query.mockImplementation((args) => ({
      currentData: { ...snapshot, ...args, employeeId: 'sample-staff', date: '2026-04-01' },
      refetch: mocks.refetch,
    }));
    mount();
    openSample();
    expect(mocks.record).not.toHaveBeenCalled();
    fireEvent.click(
      screen.getByRole('button', { name: 'Record automatic staff and date sample review' })
    );
    await waitFor(() =>
      expect(mocks.record).toHaveBeenCalledExactlyOnceWith({
        academicYearId: 'year-1',
        section: 'sample',
        fingerprint: snapshot.fingerprint,
        concurrencyStamp: snapshot.concurrencyStamp,
        employeeId: 'sample-staff',
        date: '2026-04-01',
      })
    );
  });

  it('retains the result of a save completed after collapse without stealing focus', async () => {
    let resolveSave!: (value: HrSetupReview) => void;
    mocks.record.mockReturnValue({
      unwrap: () =>
        new Promise((resolve) => {
          resolveSave = resolve;
        }),
    });
    mount();
    const schoolReview = screen.getByRole('button', { name: 'Review School Policies' });
    openSchoolReview();
    fireEvent.click(screen.getByRole('button', { name: 'Record work calendars review' }));
    schoolReview.focus();
    openSchoolReview();
    await act(async () => resolveSave(snapshot));
    expect(schoolReview).toHaveFocus();
    openSchoolReview();
    expect(screen.getByText('Review recorded.')).toBeVisible();
  });
});
