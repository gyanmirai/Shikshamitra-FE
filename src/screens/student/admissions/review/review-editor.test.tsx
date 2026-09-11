import type {
  ReviewDraft,
  ReviewSummary,
} from 'src/redux/student/admissions/admission-review-types';

import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import userEvent from '@testing-library/user-event';
import { screen, within, waitFor } from '@testing-library/react';
import {
  reviewPath,
  reviewRecord,
  reviewSummary,
} from 'src/redux/student/admissions/review-test-fixture';

import { ApplicationReviewPanel } from './application-review-panel';
import { reviewStage, renderReviewUi } from './review-ui-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

it('saves incomplete draft, submits required confirmations using the refreshed stamp, and waits for a decision', async () => {
  let summary: ReviewSummary = reviewSummary;
  const requests: { action: string; body: ReviewDraft & { concurrencyStamp: string } }[] = [];
  mswServer.use(
    http.get(reviewPath, () => HttpResponse.json({ data: summary })),
    http.post(`${reviewPath}/*`, async ({ request }) => {
      const body = (await request.json()) as ReviewDraft & { concurrencyStamp: string };
      const action = new URL(request.url).pathname.split('/').at(-1) ?? '';
      requests.push({ action, body });
      summary = {
        ...summary,
        concurrencyStamp: `stamp-${requests.length}`,
        status: action === 'draft' ? 'draft' : 'submitted',
        latestRecord: {
          ...reviewRecord,
          status: action === 'draft' ? 'draft' : 'submitted',
          ...body,
          checklist: body.checklist.map((item) => ({
            ...item,
            name: 'Identity confirmed',
            required: true,
          })),
        },
      };
      return HttpResponse.json({ data: summary });
    })
  );
  const onComplete = vi.fn();
  const user = userEvent.setup();
  renderReviewUi(
    <ApplicationReviewPanel
      applicationId="application-1"
      stage={reviewStage}
      canAdvance
      onComplete={onComplete}
    />
  );
  await user.click(await screen.findByRole('button', { name: 'Review and recommend' }));
  const dialog = within(screen.getByRole('dialog'));
  await user.type(dialog.getByLabelText('Review notes'), 'Waiting for confirmation.');
  await user.click(dialog.getByRole('button', { name: 'Save draft' }));
  await waitFor(() => expect(requests).toHaveLength(1));
  expect(requests[0].body.recommendation).toBeNull();
  await waitFor(() =>
    expect(dialog.getByRole('button', { name: 'Submit recommendation' })).toBeEnabled()
  );
  await user.click(dialog.getByRole('button', { name: 'Submit recommendation' }));
  expect(await dialog.findByText('Choose a recommendation before submitting.')).toBeInTheDocument();
  await user.click(dialog.getByRole('combobox', { name: 'Recommendation' }));
  await user.click(await screen.findByRole('option', { name: 'Recommend approval' }));
  await user.type(
    dialog.getByLabelText('Recommendation reason'),
    'The identity matches the evidence.'
  );
  await user.click(dialog.getByRole('button', { name: 'Submit recommendation' }));
  expect(
    await dialog.findByText('Confirm every required checklist item before submitting.')
  ).toBeInTheDocument();
  await user.click(dialog.getByRole('checkbox', { name: 'Identity confirmed *' }));
  await user.click(dialog.getByRole('button', { name: 'Submit recommendation' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(requests).toHaveLength(2);
  expect(requests[1]).toMatchObject({
    action: 'submit',
    body: {
      concurrencyStamp: 'stamp-1',
      recommendation: 'approve',
      reason: 'The identity matches the evidence.',
      checklist: [{ code: 'IDENTITY', checked: true }],
    },
  });
  expect(await screen.findByText('Awaiting decision')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Continue admission' })).toBeDisabled();
  expect(onComplete).not.toHaveBeenCalled();
}, 20000);
