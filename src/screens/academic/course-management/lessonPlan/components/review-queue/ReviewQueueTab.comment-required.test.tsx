import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { screen, within, waitFor, fireEvent } from '@testing-library/react';

import { reviewUrl, renderReviewQueue, prepareReviewNetwork } from './review-comment-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
beforeEach(prepareReviewNetwork);

describe('review comment requirements remain unchanged', () => {
  it.each([
    ['Change', 'Submit Request', 'Please describe the changes required.'],
    ['Reject', 'Confirm Reject', 'Rejection reason is required.'],
  ])('%s still requires a non-whitespace comment', async (action, submitLabel, requiredMessage) => {
    const mutation = vi.fn(() => HttpResponse.json({}));
    mswServer.use(http.post(`${reviewUrl}/:action`, mutation));
    renderReviewQueue();
    fireEvent.click(await screen.findByRole('button', { name: action }));
    const dialog = within(await screen.findByRole('dialog'));
    fireEvent.click(dialog.getByRole('button', { name: submitLabel }));
    expect(dialog.getByText(requiredMessage)).toBeInTheDocument();
    const comment = dialog.getByRole('textbox', { name: 'Review Remarks / Comments' });
    fireEvent.change(comment, { target: { value: ' \n\t ' } });
    fireEvent.keyDown(comment, { key: 'Enter', ctrlKey: true });
    expect(dialog.getByText(requiredMessage)).toBeInTheDocument();
    expect(comment).toHaveAttribute('aria-invalid', 'true');
    expect(mutation).not.toHaveBeenCalled();
  });

  it('still approves without an optional comment', async () => {
    const payloads: unknown[] = [];
    mswServer.use(
      http.post(`${reviewUrl}/approve`, async ({ request }) => {
        payloads.push(await request.json());
        return HttpResponse.json({});
      })
    );
    renderReviewQueue();
    fireEvent.click(await screen.findByRole('button', { name: 'Approve' }));
    const dialog = within(await screen.findByRole('dialog'));
    fireEvent.click(dialog.getByRole('button', { name: 'Confirm Approve' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(payloads).toEqual([{ comment: '' }]);
  });
});
