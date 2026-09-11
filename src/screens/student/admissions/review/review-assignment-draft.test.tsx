import type { ReviewDraft } from 'src/redux/student/admissions/admission-review-types';

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

import { reviewDraftValues } from './review-model';
import { renderReviewUi } from './review-ui-test-fixture';
import { ReviewEditorDialog } from './review-editor-dialog';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

it('starts fresh after assignment and requires the reviewer’s own rationale and confirmations', async () => {
  const requests: ReviewDraft[] = [];
  mswServer.use(
    http.post(`${reviewPath}/submit`, async ({ request }) => {
      requests.push((await request.json()) as ReviewDraft);
      return HttpResponse.json({
        ...reviewSummary,
        latestRecord: reviewRecord,
        status: 'submitted',
      });
    })
  );
  const onClose = vi.fn();
  const user = userEvent.setup();
  renderReviewUi(
    <ReviewEditorDialog
      summary={{
        ...reviewSummary,
        latestRecord: {
          ...reviewRecord,
          status: 'assignment',
          reason: 'Reassigned because of staff leave.',
          notes: 'Administrative handover notes.',
          checklist: [{ ...reviewRecord.checklist[0], notes: 'Previous reviewer confirmation.' }],
        },
      }}
      onClose={onClose}
      onReload={vi.fn()}
    />
  );
  const dialog = within(screen.getByRole('dialog'));
  expect(dialog.getByLabelText('Recommendation reason')).toHaveValue('');
  expect(dialog.getByLabelText('Review notes')).toHaveValue('');
  expect(dialog.getByRole('checkbox', { name: 'Identity confirmed *' })).not.toBeChecked();
  expect(dialog.getByLabelText('Notes: Identity confirmed')).toHaveValue('');
  expect(dialog.queryByText('Recommend approval')).not.toBeInTheDocument();
  expect(dialog.queryByText('Reassigned because of staff leave.')).not.toBeInTheDocument();
  await user.click(dialog.getByRole('combobox', { name: 'Recommendation' }));
  await user.click(await screen.findByRole('option', { name: 'Recommend approval' }));
  await user.click(dialog.getByRole('checkbox', { name: 'Identity confirmed *' }));
  await user.click(dialog.getByRole('button', { name: 'Submit recommendation' }));
  expect(
    await dialog.findByText('Explain the reason for your recommendation.')
  ).toBeInTheDocument();
  expect(requests).toHaveLength(0);
  await user.type(
    dialog.getByLabelText('Recommendation reason'),
    'I checked the current evidence.'
  );
  await user.click(dialog.getByRole('button', { name: 'Submit recommendation' }));
  await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  expect(requests).toEqual([
    {
      concurrencyStamp: 'application-stamp',
      notes: '',
      recommendation: 'approve',
      reason: 'I checked the current evidence.',
      checklist: [{ code: 'IDENTITY', checked: true, notes: '' }],
    },
  ]);
}, 20000);

it.each(['draft', 'submitted'] as const)(
  'preserves the reviewer’s %s when reopening the editor',
  (status) => {
    expect(
      reviewDraftValues({ ...reviewSummary, latestRecord: { ...reviewRecord, status } })
    ).toEqual({
      notes: reviewRecord.notes,
      reason: reviewRecord.reason,
      recommendation: reviewRecord.recommendation,
      checklist: [{ code: 'IDENTITY', checked: true, notes: '' }],
    });
  }
);
