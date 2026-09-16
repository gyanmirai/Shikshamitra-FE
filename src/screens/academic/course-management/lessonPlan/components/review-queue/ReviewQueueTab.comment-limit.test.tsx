import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { screen, within, waitFor, fireEvent } from '@testing-library/react';

import { reviewUrl, renderReviewQueue, prepareReviewNetwork } from './review-comment-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
beforeEach(prepareReviewNetwork);

describe('review queue comment length', () => {
  it('shows the native limit and count, and submits exactly 1024 request-change characters', async () => {
    const payloads: unknown[] = [];
    mswServer.use(
      http.post(`${reviewUrl}/request-changes`, async ({ request }) => {
        payloads.push(await request.json());
        return HttpResponse.json({});
      })
    );
    renderReviewQueue();
    fireEvent.click(await screen.findByRole('button', { name: 'Change' }));
    const dialog = within(await screen.findByRole('dialog', { name: 'Request Changes' }));
    const comment = dialog.getByRole('textbox', { name: 'Review Remarks / Comments' });
    expect(comment).toHaveAttribute('maxlength', '1024');
    expect(dialog.getByText('0 / 1024')).toBeInTheDocument();
    const feedback = 'a'.repeat(1024);
    fireEvent.change(comment, { target: { value: feedback } });
    expect(dialog.getByText('1024 / 1024')).toBeInTheDocument();
    fireEvent.click(dialog.getByRole('button', { name: 'Submit Request' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(payloads).toEqual([{ comment: feedback }]);
  });

  it.each([
    ['Change', 'Submit Request', 'request-changes'],
    ['Approve', 'Confirm Approve', 'approve'],
    ['Reject', 'Confirm Reject', 'reject'],
  ])(
    'caps oversized %s input at 1024 and submits the capped value through Ctrl+Enter',
    async (action, submitLabel, endpoint) => {
      const payloads: unknown[] = [];
      mswServer.use(
        http.post(`${reviewUrl}/${endpoint}`, async ({ request }) => {
          payloads.push(await request.json());
          return HttpResponse.json({});
        })
      );
      renderReviewQueue();
      fireEvent.click(await screen.findByRole('button', { name: action }));
      const dialog = within(await screen.findByRole('dialog'));
      const comment = dialog.getByRole('textbox', { name: 'Review Remarks / Comments' });
      // Clipboard/browser integrations can deliver an input event beyond native maxLength.
      const feedback = 'a'.repeat(1024);
      fireEvent.change(comment, { target: { value: `${feedback}overflow` } });
      expect(comment).toHaveValue(feedback);
      expect(dialog.getByText('1024 / 1024')).toBeInTheDocument();
      expect(payloads).toHaveLength(0);
      expect(comment).toHaveAttribute('aria-invalid', 'false');
      expect(dialog.getByRole('button', { name: submitLabel })).toBeEnabled();
      fireEvent.keyDown(comment, { key: 'Enter', ctrlKey: true });
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(payloads).toEqual([{ comment: feedback }]);
    }
  );

  it('preserves complete emoji and does not retain half a surrogate at the limit', async () => {
    const payloads: unknown[] = [];
    mswServer.use(
      http.post(`${reviewUrl}/request-changes`, async ({ request }) => {
        payloads.push(await request.json());
        return HttpResponse.json({});
      })
    );
    renderReviewQueue();
    fireEvent.click(await screen.findByRole('button', { name: 'Change' }));
    const dialog = within(await screen.findByRole('dialog'));
    const comment = dialog.getByRole('textbox', { name: 'Review Remarks / Comments' });
    const completeEmoji = `${'a'.repeat(1022)}😀`;
    fireEvent.change(comment, { target: { value: completeEmoji } });
    expect(comment).toHaveValue(completeEmoji);
    expect(dialog.getByText('1024 / 1024')).toBeInTheDocument();
    const feedback = 'a'.repeat(1023);
    fireEvent.change(comment, { target: { value: `${feedback}😀` } });
    expect(comment).toHaveValue(feedback);
    expect(dialog.getByText('1023 / 1024')).toBeInTheDocument();
    fireEvent.click(dialog.getByRole('button', { name: 'Submit Request' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(payloads).toEqual([{ comment: feedback }]);
  });
});
