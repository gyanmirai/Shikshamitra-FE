import type { AdmissionApplication } from 'src/redux/student/admissions/admission-applications-api';

import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import userEvent from '@testing-library/user-event';
import { screen, within, waitFor } from '@testing-library/react';
import { reviewSummary } from 'src/redux/student/admissions/review-test-fixture';

import { renderReviewUi } from './review-ui-test-fixture';
import { ApplicationDecisionCard } from '../application-detail/application-decision-card';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
const application: AdmissionApplication = {
  id: 'application-1',
  applicationNumber: 'APP-TEST',
  applicantId: 'applicant-1',
  applicantName: 'Test applicant',
  admissionCycleId: 'cycle-1',
  admissionOfferingId: 'offering-1',
  status: 1,
  concurrencyStamp: 'stamp',
  reviewDecision: reviewSummary.decision,
};
const path = '*/api/student/enrollment/admissions/applications/application-1';

it('blocks managed approval while permitting a server-authorized rejection through the existing decision endpoint', async () => {
  let body: unknown;
  mswServer.use(
    http.get(`${path}/decision-history`, () => HttpResponse.json([])),
    http.post(`${path}/decision/reject`, async ({ request }) => {
      body = await request.json();
      return HttpResponse.json(application);
    })
  );
  const user = userEvent.setup();
  renderReviewUi(
    <ApplicationDecisionCard
      application={{
        ...application,
        reviewDecision: { ...reviewSummary.decision, canReject: true },
      }}
    />,
    ['Students.Admissions.Applications.Add']
  );
  expect(screen.getByRole('button', { name: 'Approve' })).toBeDisabled();
  expect(screen.getByText('Submit a fresh recommendation.')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Reject' }));
  const dialog = within(screen.getByRole('dialog'));
  await user.type(
    dialog.getByLabelText('Reason *'),
    'The submitted evidence does not meet the criteria.'
  );
  await user.click(dialog.getByRole('button', { name: 'Reject application' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(body).toEqual({
    concurrencyStamp: 'stamp',
    reason: 'The submitted evidence does not meet the criteria.',
  });
});

it('exposes authorized reaffirmation after an accepted offer and keeps finalization blocked until Review is satisfied', async () => {
  let approvals = 0;
  mswServer.use(
    http.get(`${path}/decision-history`, () => HttpResponse.json([])),
    http.get(`${path}/finalization-preview`, () =>
      HttpResponse.json({ canFinalize: false, blockers: ['Refresh Review.'], possibleMatches: [] })
    ),
    http.post(`${path}/decision/approve`, () => {
      approvals += 1;
      return HttpResponse.json(application);
    })
  );
  const user = userEvent.setup();
  renderReviewUi(
    <ApplicationDecisionCard
      application={{
        ...application,
        status: 8,
        reviewDecision: { ...reviewSummary.decision, canApprove: true },
      }}
    />,
    ['Students.Admissions.Applications.Add']
  );
  expect(screen.getByRole('button', { name: 'Finalize admission' })).toBeDisabled();
  await user.click(screen.getByRole('button', { name: 'Reaffirm approval' }));
  expect(approvals).toBe(0);
  await user.click(
    within(screen.getByRole('dialog')).getByRole('button', { name: 'Approve application' })
  );
  await waitFor(() => expect(approvals).toBe(1));
});

it('preserves basic approval for legacy applications without a managed Review flag', () => {
  mswServer.use(http.get(`${path}/decision-history`, () => HttpResponse.json([])));
  renderReviewUi(
    <ApplicationDecisionCard application={{ ...application, reviewDecision: undefined }} />,
    ['Students.Admissions.Applications.Add']
  );
  expect(screen.getByRole('button', { name: 'Approve' })).toBeEnabled();
  expect(screen.queryByText('Submit a fresh recommendation.')).not.toBeInTheDocument();
});
