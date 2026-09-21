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
const path = '*/api/student/enrollment/admissions/applications/application-1';
const application: AdmissionApplication = {
  id: 'application-1',
  applicationNumber: 'APP-TEST',
  applicantId: 'applicant-1',
  applicantName: 'Test applicant',
  admissionCycleId: 'cycle-1',
  admissionOfferingId: 'offering-1',
  status: 1,
  concurrencyStamp: 'old-stamp',
  reviewDecision: { ...reviewSummary.decision, canReject: true },
};

it.each([true, false])(
  'recovers a decision conflict using the explicit latest application and respects canReject=%s',
  async (stillAllowed) => {
    let reloads = 0;
    const bodies: { concurrencyStamp: string; reason: string }[] = [];
    mswServer.use(
      http.get(`${path}/decision-history`, () => HttpResponse.json([])),
      http.get(path, () => {
        reloads += 1;
        return HttpResponse.json({
          data: {
            ...application,
            concurrencyStamp: 'fresh-stamp',
            reviewDecision: { ...application.reviewDecision, canReject: stillAllowed },
          },
        });
      }),
      http.post(`${path}/decision/reject`, async ({ request }) => {
        const body = (await request.json()) as { concurrencyStamp: string; reason: string };
        bodies.push(body);
        return body.concurrencyStamp === 'old-stamp'
          ? HttpResponse.json({ error: { message: 'Application changed.' } }, { status: 409 })
          : HttpResponse.json(application);
      })
    );
    const user = userEvent.setup();
    renderReviewUi(<ApplicationDecisionCard application={application} />, [
      'Students.Admissions.Applications.Add',
    ]);
    await user.click(screen.getByRole('button', { name: 'Reject' }));
    const dialog = within(screen.getByRole('dialog'));
    await user.type(dialog.getByLabelText('Reason *'), 'Original decision reason.');
    await user.click(dialog.getByRole('button', { name: 'Reject application' }));
    expect(await dialog.findByText(/Unable to confirm the decision/)).toBeInTheDocument();
    expect(dialog.getByLabelText('Reason *')).toHaveValue('Original decision reason.');
    expect(dialog.getByRole('button', { name: 'Reject application' })).toBeDisabled();
    await user.click(dialog.getByRole('button', { name: 'Reload latest application' }));
    await user.click(
      within(
        await screen.findByRole('dialog', { name: 'Reload the latest application?' })
      ).getByRole('button', { name: 'Cancel' })
    );
    expect(reloads).toBe(0);
    await user.click(dialog.getByRole('button', { name: 'Reload latest application' }));
    await user.click(
      within(
        await screen.findByRole('dialog', { name: 'Reload the latest application?' })
      ).getByRole('button', { name: 'Discard edits and reload' })
    );
    await waitFor(() => expect(dialog.getByLabelText('Reason *')).toHaveValue(''));
    if (!stillAllowed) {
      expect(dialog.getByRole('button', { name: 'Reject application' })).toBeDisabled();
      expect(bodies).toHaveLength(1);
      return;
    }
    await user.type(dialog.getByLabelText('Reason *'), 'Reason after checking current evidence.');
    await user.click(dialog.getByRole('button', { name: 'Reject application' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(bodies).toEqual([
      { concurrencyStamp: 'old-stamp', reason: 'Original decision reason.' },
      { concurrencyStamp: 'fresh-stamp', reason: 'Reason after checking current evidence.' },
    ]);
  },
  20000
);
