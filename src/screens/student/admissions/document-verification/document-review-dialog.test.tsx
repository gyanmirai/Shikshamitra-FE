import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, within, waitFor, fireEvent } from '@testing-library/react';
import {
  documentPath,
  documentSummary,
  documentEvidence,
  documentStagePath,
} from 'src/redux/student/admissions/document-test-fixture';

import { ApplicationDocumentsPanel } from './application-documents-panel';
import { documentStage, renderDocumentUi } from './document-ui-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

function reviewSummary() {
  return {
    ...documentSummary,
    requirements: [
      {
        ...documentSummary.requirements[0],
        status: 'pendingReview' as const,
        canAccept: true,
        canReview: true,
        // Metadata review must remain possible when a protected file is unavailable.
        evidence: [{ ...documentEvidence, canDownload: false }],
      },
    ],
  };
}

async function openReview() {
  renderDocumentUi(
    <ApplicationDocumentsPanel applicationId="application-1" stage={documentStage} layout="table" />
  );
  await userEvent.click(
    await screen.findByRole('button', { name: 'View document for Birth certificate' })
  );
  return within(screen.getByRole('dialog'));
}

describe('document review commands', { timeout: 15000 }, () => {
  it('approves the pinned evidence with the existing concurrency contract and closes on success', async () => {
    const summary = reviewSummary();
    let submitted: unknown;
    let reads = 0;
    mswServer.use(
      http.get(documentStagePath, () => {
        reads += 1;
        return HttpResponse.json(summary);
      }),
      http.post(`${documentPath}/evidence/evidence-1/review`, async ({ request }) => {
        submitted = await request.json();
        return HttpResponse.json(summary);
      })
    );
    const dialog = await openReview();
    await userEvent.click(dialog.getByRole('button', { name: 'Approve' }));
    await userEvent.type(dialog.getByRole('textbox', { name: 'Notes' }), ' Checked original ');
    await userEvent.click(dialog.getByRole('button', { name: 'Approve' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(submitted).toEqual({
      decision: 'accepted',
      concurrencyStamp: 'application-stamp',
      reason: 'Checked original',
    });
    await waitFor(() => expect(reads).toBe(2));
  });

  it('requires a rejection reason and retains it when review and background refresh fail', async () => {
    let failed = false;
    let submitted: unknown;
    mswServer.use(
      http.get(documentStagePath, () =>
        failed
          ? HttpResponse.json({ detail: 'Checklist temporarily unavailable' }, { status: 503 })
          : HttpResponse.json(reviewSummary())
      ),
      http.post(`${documentPath}/evidence/evidence-1/review`, async ({ request }) => {
        submitted = await request.json();
        failed = true;
        return HttpResponse.json(
          { detail: 'The evidence changed. Reopen this document before reviewing it.' },
          { status: 409 }
        );
      })
    );
    const dialog = await openReview();
    await userEvent.click(dialog.getByRole('button', { name: 'Reject' }));
    await userEvent.click(dialog.getByRole('button', { name: 'Reject' }));
    expect(await dialog.findByText('Give a reason for this decision')).toBeVisible();
    expect(submitted).toBeUndefined();
    await userEvent.type(dialog.getByRole('textbox', { name: 'Reason' }), ' Replace blurred scan ');
    await userEvent.click(dialog.getByRole('button', { name: 'Reject' }));
    expect(
      await dialog.findByText('The evidence changed. Reopen this document before reviewing it.')
    ).toBeVisible();
    expect(await screen.findByText('Unable to load this enrollment data.')).toBeInTheDocument();
    expect(dialog.getByRole('textbox', { name: 'Reason' })).toHaveValue(' Replace blurred scan ');
    expect(submitted).toEqual({
      decision: 'rejected',
      concurrencyStamp: 'application-stamp',
      reason: 'Replace blurred scan',
    });
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
  });

  it('locks competing controls and dismissal while one review request is pending', async () => {
    let release: (() => void) | undefined;
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    let reviews = 0;
    mswServer.use(
      http.get(documentStagePath, () => HttpResponse.json(reviewSummary())),
      http.post(`${documentPath}/evidence/evidence-1/review`, async () => {
        reviews += 1;
        await pending;
        return HttpResponse.json(reviewSummary());
      })
    );
    const dialog = await openReview();
    await userEvent.click(dialog.getByRole('button', { name: 'Approve' }));
    const approve = dialog.getByRole('button', { name: 'Approve' });
    try {
      await userEvent.dblClick(approve);
      await waitFor(() => expect(reviews).toBe(1));
      expect(approve).toBeDisabled();
      expect(dialog.getByRole('textbox', { name: 'Notes' })).toBeDisabled();
      expect(dialog.getByRole('button', { name: 'Cancel' })).toBeDisabled();
      expect(dialog.getByRole('button', { name: 'close' })).toBeDisabled();
      expect(dialog.getByRole('button', { name: 'Evidence history (1)' })).toBeDisabled();
      await userEvent.keyboard('{Escape}');
      fireEvent.click(approve);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(reviews).toBe(1);
    } finally {
      release?.();
    }
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('does not replace the reviewed evidence/stamp after a checklist refresh', async () => {
    let summary = reviewSummary();
    let submitted: unknown;
    mswServer.use(
      http.get(documentStagePath, () => HttpResponse.json(summary)),
      http.post(`${documentPath}/evidence/evidence-1/review`, async ({ request }) => {
        submitted = await request.json();
        return HttpResponse.json(
          { detail: 'Refresh the changed evidence before reviewing it.' },
          { status: 409 }
        );
      })
    );
    const dialog = await openReview();
    await userEvent.click(dialog.getByRole('button', { name: 'Reject' }));
    await userEvent.type(dialog.getByRole('textbox', { name: 'Reason' }), 'Version one is unclear');
    summary = {
      ...summary,
      concurrencyStamp: 'new-stamp',
      requirements: [
        {
          ...summary.requirements[0],
          evidence: [
            { ...documentEvidence, id: 'evidence-2', versionNumber: 2, canDownload: false },
          ],
        },
      ],
    };
    // The checklist stays mounted behind the dialog; a refresh must not silently retarget a decision.
    fireEvent.click(screen.getByRole('button', { name: 'Refresh', hidden: true }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Refresh', hidden: true })).toBeEnabled()
    );
    await userEvent.click(dialog.getByRole('button', { name: 'Reject' }));
    expect(
      await dialog.findByText('Refresh the changed evidence before reviewing it.')
    ).toBeVisible();
    expect(submitted).toEqual({
      decision: 'rejected',
      concurrencyStamp: 'application-stamp',
      reason: 'Version one is unclear',
    });
    expect(dialog.getByText('Latest evidence · Version 1')).toBeInTheDocument();
  });
});
