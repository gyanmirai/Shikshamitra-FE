import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import userEvent from '@testing-library/user-event';
import { screen, within, waitFor } from '@testing-library/react';
import { reviewPath, reviewSummary } from 'src/redux/student/admissions/review-test-fixture';

import { renderReviewUi } from './review-ui-test-fixture';
import { ReviewAssignmentDialog } from './review-assignment-dialog';
import { ReviewCorrectionDialog } from './review-correction-dialog';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

it.each(['assignment', 'correction'] as const)(
  '%s preserves failed edits, cancels discard, then reloads and submits with the fresh stamp',
  async (kind) => {
    const bodies: { concurrencyStamp: string; reason: string }[] = [];
    mswServer.use(
      http.get('*/api/student/enrollment/admissions/reviews/reviewers', () =>
        HttpResponse.json([])
      ),
      http.post(
        `${reviewPath}/${kind === 'assignment' ? 'assignment' : 'request-correction'}`,
        async ({ request }) => {
          const body = (await request.json()) as { concurrencyStamp: string; reason: string };
          bodies.push(body);
          return body.concurrencyStamp === 'application-stamp'
            ? HttpResponse.json({ error: { message: 'The review changed.' } }, { status: 409 })
            : HttpResponse.json(reviewSummary);
        }
      )
    );
    const onClose = vi.fn();
    const onReload = vi.fn().mockResolvedValue({
      ...reviewSummary,
      concurrencyStamp: 'fresh-stamp',
      canRequestCorrection: true,
    });
    const props = { summary: { ...reviewSummary, canRequestCorrection: true }, onClose, onReload };
    const user = userEvent.setup();
    renderReviewUi(
      kind === 'assignment' ? (
        <ReviewAssignmentDialog {...props} />
      ) : (
        <ReviewCorrectionDialog {...props} />
      )
    );
    const dialog = within(screen.getByRole('dialog'));
    const field = kind === 'assignment' ? 'Reason *' : 'Correction instructions *';
    const action = kind === 'assignment' ? 'Save assignment' : 'Request corrections';
    await user.type(dialog.getByLabelText(field), 'My original reason.');
    await user.click(dialog.getByRole('button', { name: action }));
    expect(await dialog.findByText(/Your edits are still here/)).toBeInTheDocument();
    expect(dialog.getByLabelText(field)).toHaveValue('My original reason.');
    expect(onClose).not.toHaveBeenCalled();
    await user.click(dialog.getByRole('button', { name: 'Reload latest review' }));
    await user.click(
      within(await screen.findByRole('dialog', { name: 'Reload the latest review?' })).getByRole(
        'button',
        { name: 'Cancel' }
      )
    );
    expect(onReload).not.toHaveBeenCalled();
    await user.click(dialog.getByRole('button', { name: 'Reload latest review' }));
    await user.click(
      within(await screen.findByRole('dialog', { name: 'Reload the latest review?' })).getByRole(
        'button',
        { name: 'Discard edits and reload' }
      )
    );
    await waitFor(() => expect(dialog.getByLabelText(field)).toHaveValue(''));
    await user.type(dialog.getByLabelText(field), 'Confirmed after refreshing.');
    await user.click(dialog.getByRole('button', { name: action }));
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    expect(bodies).toMatchObject([
      { concurrencyStamp: 'application-stamp', reason: 'My original reason.' },
      { concurrencyStamp: 'fresh-stamp', reason: 'Confirmed after refreshing.' },
    ]);
  },
  20000
);
