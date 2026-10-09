import type { AdmissionApplication } from 'src/redux/student/admissions/admission-applications-api';

import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import userEvent from '@testing-library/user-event';
import { screen, within, waitFor } from '@testing-library/react';

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
};
const path = '*/api/student/enrollment/admissions/applications/application-1';

it('records a reasoned rejection with the application concurrency token and no Review/Offer actions', async () => {
  let body: unknown;
  mswServer.use(
    http.get(`${path}/decision-history`, () => HttpResponse.json([])),
    http.post(`${path}/decision/reject`, async ({ request }) => {
      body = await request.json();
      return HttpResponse.json(application);
    })
  );
  const user = userEvent.setup();
  renderReviewUi(<ApplicationDecisionCard application={application} journeyCompleted={false} />, [
    'Students.Admissions.Applications.Add',
  ]);
  expect(screen.getByRole('button', { name: 'Approve' })).toBeEnabled();
  expect(screen.queryByRole('button', { name: /review|offer/i })).not.toBeInTheDocument();
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

it.each([true, false])(
  'offers finalization only for an approved completed journey (completed=%s)',
  (journeyCompleted) => {
    mswServer.use(
      http.get(`${path}/decision-history`, () => HttpResponse.json([])),
      http.get(`${path}/finalization-preview`, () =>
        HttpResponse.json({ canFinalize: true, items: [], possibleMatches: [] })
      )
    );
    renderReviewUi(
      <ApplicationDecisionCard
        application={{ ...application, status: 6 }}
        journeyCompleted={journeyCompleted}
      />,
      ['Students.Admissions.Applications.Add']
    );
    if (journeyCompleted)
      expect(screen.getByRole('button', { name: 'Finalize admission' })).toBeEnabled();
    else
      expect(screen.queryByRole('button', { name: 'Finalize admission' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /offer/i })).not.toBeInTheDocument();
  }
);

it('does not expose decisions or finalization without application manage permission', () => {
  mswServer.use(http.get(`${path}/decision-history`, () => HttpResponse.json([])));
  renderReviewUi(<ApplicationDecisionCard application={application} journeyCompleted />, [
    'Students.Admissions.Applications.View',
  ]);
  expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Finalize admission' })).not.toBeInTheDocument();
});
