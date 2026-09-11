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

import { renderReviewUi } from './review-ui-test-fixture';
import { ReviewEditorDialog } from './review-editor-dialog';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

it('keeps edits and captured stamp after a conflict; reload requires explicit discard and adopts the fresh record', async () => {
  let submitted: unknown;
  mswServer.use(
    http.post(`${reviewPath}/submit`, async ({ request }) => {
      submitted = await request.json();
      return HttpResponse.json(
        { error: { message: 'Another reviewer changed this application.' } },
        { status: 409 }
      );
    })
  );
  const onClose = vi.fn();
  const onReload = vi.fn().mockResolvedValue({
    ...reviewSummary,
    concurrencyStamp: 'new-stamp',
    latestRecord: { ...reviewRecord, reason: 'New saved reason' },
  });
  const user = userEvent.setup();
  renderReviewUi(
    <ReviewEditorDialog
      summary={{ ...reviewSummary, latestRecord: reviewRecord }}
      onClose={onClose}
      onReload={onReload}
    />
  );
  const dialog = within(screen.getByRole('dialog'));
  await user.clear(dialog.getByLabelText('Recommendation reason'));
  await user.type(dialog.getByLabelText('Recommendation reason'), 'My checked evidence.');
  await user.click(dialog.getByRole('button', { name: 'Submit recommendation' }));
  expect(await dialog.findByText(/Your edits are still here/)).toBeInTheDocument();
  expect(dialog.getByLabelText('Recommendation reason')).toHaveValue('My checked evidence.');
  expect(submitted).toMatchObject({
    concurrencyStamp: 'application-stamp',
    reason: 'My checked evidence.',
  });
  expect(onClose).not.toHaveBeenCalled();
  await user.click(dialog.getByRole('button', { name: 'Reload latest review' }));
  const confirmation = within(
    await screen.findByRole('dialog', { name: 'Reload the latest review?' })
  );
  await user.click(confirmation.getByRole('button', { name: 'Cancel' }));
  expect(onReload).not.toHaveBeenCalled();
  await user.click(dialog.getByRole('button', { name: 'Reload latest review' }));
  await user.click(
    within(await screen.findByRole('dialog', { name: 'Reload the latest review?' })).getByRole(
      'button',
      { name: 'Discard edits and reload' }
    )
  );
  await waitFor(() =>
    expect(dialog.getByLabelText('Recommendation reason')).toHaveValue('New saved reason')
  );
  expect(onReload).toHaveBeenCalledOnce();
  expect(dialog.queryByText(/Your edits are still here/)).not.toBeInTheDocument();
});

it('protects unsaved notes when closing without leaking the page-wide dirty guard', async () => {
  const onClose = vi.fn();
  const user = userEvent.setup();
  renderReviewUi(
    <ReviewEditorDialog summary={reviewSummary} onClose={onClose} onReload={vi.fn()} />
  );
  const dialog = within(screen.getByRole('dialog'));
  await user.type(dialog.getByLabelText('Review notes'), 'Still reviewing.');
  await user.click(dialog.getByRole('button', { name: 'close' }));
  const confirmation = within(
    await screen.findByRole('dialog', { name: 'Discard unsaved changes?' })
  );
  await user.click(confirmation.getByRole('button', { name: 'Cancel' }));
  expect(onClose).not.toHaveBeenCalled();
  expect(dialog.getByLabelText('Review notes')).toHaveValue('Still reviewing.');
});

it('preserves edits when an explicitly confirmed reload itself fails', async () => {
  mswServer.use(http.post(`${reviewPath}/submit`, () => HttpResponse.json({}, { status: 409 })));
  const user = userEvent.setup();
  renderReviewUi(
    <ReviewEditorDialog
      summary={{ ...reviewSummary, latestRecord: reviewRecord }}
      onClose={vi.fn()}
      onReload={vi.fn().mockRejectedValue(new Error('Offline'))}
    />
  );
  const dialog = within(screen.getByRole('dialog'));
  await user.type(dialog.getByLabelText('Review notes'), 'Keep this note.');
  await user.click(dialog.getByRole('button', { name: 'Submit recommendation' }));
  await user.click(await dialog.findByRole('button', { name: 'Reload latest review' }));
  await user.click(
    within(await screen.findByRole('dialog', { name: 'Reload the latest review?' })).getByRole(
      'button',
      { name: 'Discard edits and reload' }
    )
  );
  expect(
    await dialog.findByText('Unable to reload the review. Your edits are still here. Try again.')
  ).toBeInTheDocument();
  expect(dialog.getByLabelText('Review notes')).toHaveValue(`${reviewRecord.notes}Keep this note.`);
});
