import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import userEvent from '@testing-library/user-event';
import { screen, within, waitFor } from '@testing-library/react';
import {
  eligibilityPath,
  eligibilitySummary,
  eligibilityException,
  eligibilityEvaluation,
} from 'src/redux/student/admissions/eligibility-test-fixture';

import { ApplicationEligibilityPanel } from './application-eligibility-panel';
import { eligibilityStage, renderEligibilityUi } from './eligibility-ui-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

it('requires an exception reason, retains it after failure, and keeps the captured application stamp', async () => {
  let failed = false;
  const requests: unknown[] = [];
  mswServer.use(
    http.get(eligibilityPath, () =>
      failed
        ? HttpResponse.json({ detail: 'Refresh unavailable' }, { status: 503 })
        : HttpResponse.json({
            ...eligibilitySummary,
            status: 'ineligible',
            canRequestException: true,
            latestEvaluation: eligibilityEvaluation,
          })
    ),
    http.post(`${eligibilityPath}/evaluations/evaluation-1/exceptions`, async ({ request }) => {
      requests.push(await request.json());
      failed = true;
      return HttpResponse.json(
        { detail: 'Application changed. Refresh eligibility before requesting an exception.' },
        { status: 409 }
      );
    })
  );
  const user = userEvent.setup();
  renderEligibilityUi(
    <ApplicationEligibilityPanel applicationId="application-1" stage={eligibilityStage} />
  );
  await user.click(await screen.findByRole('button', { name: 'Request an exception' }));
  const dialog = within(screen.getByRole('dialog'));
  await user.click(dialog.getByRole('button', { name: 'Request an exception' }));
  expect(await dialog.findByText('Give a reason for this decision')).toBeInTheDocument();
  expect(requests).toHaveLength(0);
  await user.click(dialog.getByLabelText('Reason *'));
  await user.paste('Please review the transfer circumstances.');
  await user.click(dialog.getByRole('button', { name: 'Request an exception' }));
  expect(await dialog.findByText(/Application changed/)).toBeInTheDocument();
  expect(await screen.findByText('Unable to load this enrollment data.')).toBeInTheDocument();
  expect(dialog.getByLabelText('Reason *')).toHaveValue(
    'Please review the transfer circumstances.'
  );
  expect(requests).toEqual([
    { concurrencyStamp: 'application-stamp', reason: 'Please review the transfer circumstances.' },
  ]);
}, 15000);

it('records an independent reviewer decision with a reason and the scoped exception id', async () => {
  let body: unknown;
  mswServer.use(
    http.get(eligibilityPath, () =>
      HttpResponse.json({
        ...eligibilitySummary,
        status: 'ineligible',
        canReviewException: true,
        latestEvaluation: { ...eligibilityEvaluation, exceptions: [eligibilityException] },
      })
    ),
    http.post(`${eligibilityPath}/exceptions/exception-1/review`, async ({ request }) => {
      body = await request.json();
      return HttpResponse.json(eligibilitySummary);
    })
  );
  const user = userEvent.setup();
  renderEligibilityUi(
    <ApplicationEligibilityPanel applicationId="application-1" stage={eligibilityStage} />
  );
  await user.click(await screen.findByRole('button', { name: 'Decline exception' }));
  const dialog = within(screen.getByRole('dialog'));
  await user.click(dialog.getByLabelText('Reason *'));
  await user.paste('The configured minimum applies to this application.');
  await user.click(dialog.getByRole('button', { name: 'Decline exception' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(body).toEqual({
    concurrencyStamp: 'application-stamp',
    decision: 'rejected',
    reason: 'The configured minimum applies to this application.',
  });
}, 15000);

it('hides review actions from the requester even with general review permission', async () => {
  mswServer.use(
    http.get(eligibilityPath, () =>
      HttpResponse.json({
        ...eligibilitySummary,
        status: 'ineligible',
        canReviewException: false,
        blockers: ['A different authorized reviewer must decide this exception.'],
        latestEvaluation: {
          ...eligibilityEvaluation,
          exceptions: [{ ...eligibilityException, canReview: false }],
        },
      })
    )
  );
  renderEligibilityUi(
    <ApplicationEligibilityPanel applicationId="application-1" stage={eligibilityStage} />
  );
  expect(await screen.findByText('Pending review')).toBeInTheDocument();
  expect(
    screen.getByText('A different authorized reviewer must decide this exception.')
  ).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Approve exception' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Decline exception' })).not.toBeInTheDocument();
});
