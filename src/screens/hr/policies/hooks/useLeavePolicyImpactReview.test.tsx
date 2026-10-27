import React from 'react';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

import { useLeavePolicyImpactReview } from './useLeavePolicyImpactReview';

import type { LeaveImpactReview, LeaveReviewApproval } from '../leave-impact.types';

const api = vi.hoisted(() => ({ preview: vi.fn(), details: vi.fn(), approved: vi.fn() }));
vi.mock('src/redux/hr/leaveApi', () => ({
  usePreviewLeavePolicyImpactMutation: () => [api.preview],
  useGetLeavePolicyImpactDetailsMutation: () => [api.details],
}));
vi.mock('../components/HRPolicySharedUI', () => ({
  DrawerHeader: ({ title }: { title: string }) => <h2>{title}</h2>,
}));

const request = {
  academicYearId: 'year',
  policyId: 'policy',
  action: 'update' as const,
  asOfDate: '2026-08-15',
  fromDate: '2026-08-01',
  toDate: '2026-08-31',
  expectedVersion: 3,
  proposal: { policyTitle: 'Exact proposal' },
};
const review = (): LeaveImpactReview => ({
  action: 'update',
  currentVersion: 3,
  proposedVersion: 4,
  requiresConfirmation: true,
  confirmationToken: 'bound-token',
  warnings: [],
  blockingWarnings: [],
  differences: [
    {
      fieldKey: 'rules.Paid.leaveCount',
      fieldLabel: 'Paid: Leave count',
      fromDisplayValue: '0',
      toDisplayValue: '12',
    },
  ],
  impact: {
    asOfDate: request.asOfDate,
    fromDate: request.fromDate,
    toDate: request.toDate,
    calculatedAt: request.asOfDate,
    fingerprint: 'fingerprint',
    completeness: 'reference_assessment_complete',
    limitation: 'No salary recalculation.',
    payrollPeriods: [],
    measures: {
      effectiveStaff: {
        status: 'calculated',
        count: 0,
        definition: 'Actual resolved staff',
        scope: 'as_of_date',
        drilldownKey: 'effectiveStaff',
      },
      changedBalanceRows: {
        status: 'not_calculated',
        count: null,
        definition: 'Balance outcomes are unavailable',
        scope: 'requested_window',
      },
    },
  },
});
function Harness({ year = 'year' }: { year?: string }) {
  const { requestReview, drawer } = useLeavePolicyImpactReview(year);
  return (
    <>
      <button
        type="button"
        onClick={async () => {
          const result: LeaveReviewApproval | null = await requestReview({
            ...request,
            academicYearId: year,
          });
          api.approved(result);
        }}
      >
        Review
      </button>
      {drawer}
    </>
  );
}
beforeEach(() => {
  vi.clearAllMocks();
  api.preview.mockReturnValue({ unwrap: () => Promise.resolve(review()) });
});

describe('authoritative leave review', () => {
  it.each(['close', 'replace', 'year'] as const)(
    'clears paged drilldown state on %s before a fresh assessment and ignores late records',
    async (transition) => {
      const records = (skipCount: number) => ({
        totalCount: 60,
        assessedTotalCount: 60,
        redactedCount: 0,
        isScopeRestricted: false,
        items: [{ id: `old-${skipCount}`, label: `Old record ${skipCount}`, status: 'resolved' }],
      });
      api.details.mockImplementation(({ skipCount }: { skipCount: number }) => ({
        unwrap: () => Promise.resolve(records(skipCount)),
      }));
      const view = render(<Harness />);
      fireEvent.click(screen.getByText('Review'));
      fireEvent.click(await screen.findByRole('button', { name: 'View records' }));
      await screen.findByText('Old record 0 | resolved');
      fireEvent.click(screen.getByRole('button', { name: 'Next' }));
      await screen.findByText('Old record 20 | resolved');
      expect(screen.getByRole('button', { name: 'Previous' })).toBeEnabled();
      let finish!: (value: ReturnType<typeof records>) => void;
      api.details.mockReturnValueOnce({
        unwrap: () =>
          new Promise<ReturnType<typeof records>>((done) => {
            finish = done;
          }),
      });
      fireEvent.click(screen.getByRole('button', { name: 'Next' }));
      await screen.findByText(/Loading records/);
      if (transition === 'close') fireEvent.click(screen.getByRole('button', { name: 'Close' }));
      if (transition === 'year') view.rerender(<Harness year="other" />);
      const fresh = review();
      fresh.impact.fingerprint = 'fresh-assessment';
      api.preview.mockReturnValue({ unwrap: () => Promise.resolve(fresh) });
      fireEvent.click(screen.getByText('Review'));
      await screen.findByRole('button', { name: 'View records' });
      expect(screen.queryByText('Effective Staff records')).not.toBeInTheDocument();
      expect(screen.queryByText(/Loading records/)).not.toBeInTheDocument();
      expect(screen.queryByText('Old record 20 | resolved')).not.toBeInTheDocument();
      await act(async () => finish(records(40)));
      expect(screen.queryByText('Old record 40 | resolved')).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'View records' }));
      await screen.findByText('Old record 0 | resolved');
      expect(api.details).toHaveBeenLastCalledWith(
        expect.objectContaining({ fingerprint: 'fresh-assessment', skipCount: 0 })
      );
      expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    }
  );
  it('keeps a calculated zero distinct from unavailable outcomes and binds approval to the exact scope', async () => {
    render(<Harness />);
    fireEvent.click(screen.getByText('Review'));
    await screen.findByText('Effective Staff: 0');
    expect(screen.getByText('Changed Balance Rows: Not calculated')).toBeInTheDocument();
    expect(screen.getByText('0 to 12')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm and save' }));
    await waitFor(() =>
      expect(api.approved).toHaveBeenCalledWith({
        impactToken: 'bound-token',
        impactScope: {
          asOfDate: request.asOfDate,
          fromDate: request.fromDate,
          toDate: request.toDate,
          expectedVersion: 3,
        },
      })
    );
    expect(api.preview).toHaveBeenCalledWith(request);
  });
  it('blocks partial assessments and missing required tokens', async () => {
    const partial = review();
    partial.impact.completeness = 'partial';
    partial.confirmationToken = undefined;
    api.preview.mockReturnValue({ unwrap: () => Promise.resolve(partial) });
    render(<Harness />);
    fireEvent.click(screen.getByText('Review'));
    expect(await screen.findByRole('button', { name: 'Confirm and save' })).toBeDisabled();
    expect(api.approved).not.toHaveBeenCalled();
  });
  it('shows scoped record totals and never displays a drilldown error as an empty result', async () => {
    api.details.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          totalCount: 0,
          assessedTotalCount: 80,
          redactedCount: 80,
          isScopeRestricted: true,
          items: [],
        }),
    });
    render(<Harness />);
    fireEvent.click(screen.getByText('Review'));
    fireEvent.click(await screen.findByRole('button', { name: 'View records' }));
    await screen.findByText('0 accessible of 80 assessed; 80 outside your read scope.');
    expect(api.details).toHaveBeenCalledWith(
      expect.objectContaining({
        fingerprint: 'fingerprint',
        assessment: request,
        maxResultCount: 20,
      })
    );
    api.details.mockReturnValue({ unwrap: () => Promise.reject(new Error('Denied')) });
    fireEvent.click(screen.getByRole('button', { name: 'View records' }));
    await screen.findByText(/Denied|Could not load records/);
    expect(
      screen.queryByText('0 accessible of 80 assessed; 80 outside your read scope.')
    ).not.toBeInTheDocument();
  });
  it('cancels pending reviews on year switch and discards a late response', async () => {
    let finish!: (value: LeaveImpactReview) => void;
    api.preview.mockReturnValue({
      unwrap: () =>
        new Promise<LeaveImpactReview>((done) => {
          finish = done;
        }),
    });
    const view = render(<Harness />);
    fireEvent.click(screen.getByText('Review'));
    view.rerender(<Harness year="other" />);
    await waitFor(() => expect(api.approved).toHaveBeenCalledWith(null));
    await act(async () => finish(review()));
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Confirm and save' })).not.toBeInTheDocument()
    );
  });
});
