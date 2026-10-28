import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { setPermissions } from 'src/redux/auth/authSlice';
import { act, screen, within, waitFor, fireEvent } from '@testing-library/react';
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
    expect(dialog.queryByRole('textbox', { name: 'Notes' })).not.toBeInTheDocument();
    expect(dialog.queryByRole('textbox', { name: /reason/i })).not.toBeInTheDocument();
    await userEvent.click(dialog.getByRole('button', { name: 'Approve' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(submitted).toEqual({
      decision: 'accepted',
      concurrencyStamp: 'application-stamp',
    });
    await waitFor(() => expect(reads).toBe(2));
  });

  it('requires a rejection reason and retains it when review and background refresh fail', async () => {
    let failed = false;
    let reads = 0;
    let submitted: unknown;
    mswServer.use(
      http.get(documentStagePath, () => {
        reads += 1;
        return failed
          ? HttpResponse.json({ detail: 'Checklist temporarily unavailable' }, { status: 503 })
          : HttpResponse.json(reviewSummary());
      }),
      http.post(`${documentPath}/evidence/evidence-1/review`, async ({ request }) => {
        submitted = await request.json();
        failed = true;
        return HttpResponse.json(
          { detail: 'The evidence changed. Reopen this document before reviewing it.' },
          { status: 409 }
        );
      })
    );
    const preview = await openReview();
    await userEvent.click(preview.getByRole('button', { name: 'Reject' }));
    const dialog = within(screen.getByRole('dialog', { name: 'Reject Document' }));
    await userEvent.click(dialog.getByRole('button', { name: 'Reject document' }));
    expect(await dialog.findByText('Give a reason for this decision')).toBeVisible();
    expect(submitted).toBeUndefined();
    await userEvent.type(
      dialog.getByRole('textbox', { name: 'Rejection reason' }),
      ' Replace blurred scan '
    );
    await userEvent.click(dialog.getByRole('button', { name: 'Reject document' }));
    expect(
      await dialog.findByText('The evidence changed. Reopen this document before reviewing it.')
    ).toBeVisible();
    await waitFor(() => expect(reads).toBe(2));
    expect(dialog.getByRole('textbox', { name: 'Rejection reason' })).toHaveValue(
      ' Replace blurred scan '
    );
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
    const approve = dialog.getByRole('button', { name: 'Approve' });
    try {
      await userEvent.dblClick(approve);
      await waitFor(() => expect(reviews).toBe(1));
      expect(approve).toBeDisabled();
      expect(dialog.queryByRole('textbox', { name: 'Notes' })).not.toBeInTheDocument();
      expect(dialog.getByRole('button', { name: 'Close' })).toBeDisabled();
      expect(dialog.getByRole('button', { name: 'Reject' })).toBeDisabled();
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
    const preview = await openReview();
    await userEvent.click(preview.getByRole('button', { name: 'Reject' }));
    const dialog = within(screen.getByRole('dialog', { name: 'Reject Document' }));
    await userEvent.type(
      dialog.getByRole('textbox', { name: 'Rejection reason' }),
      'Version one is unclear'
    );
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
    await userEvent.click(dialog.getByRole('button', { name: 'Reject document' }));
    expect(
      await dialog.findByText('Refresh the changed evidence before reviewing it.')
    ).toBeVisible();
    expect(submitted).toEqual({
      decision: 'rejected',
      concurrencyStamp: 'application-stamp',
      reason: 'Version one is unclear',
    });
    expect(screen.getByText('birth-certificate.pdf · Version 1')).toBeInTheDocument();
  });

  it('returns to the same preview without a mutation when rejection is cancelled', async () => {
    let reviews = 0;
    mswServer.use(
      http.get(documentStagePath, () => HttpResponse.json(reviewSummary())),
      http.post(`${documentPath}/evidence/evidence-1/review`, () => {
        reviews += 1;
        return HttpResponse.json(reviewSummary());
      })
    );
    const preview = await openReview();
    const history = preview.getByRole('button', { name: 'Evidence history (1)' });
    await userEvent.click(preview.getByRole('button', { name: 'Reject' }));
    const dialog = within(screen.getByRole('dialog', { name: 'Reject Document' }));
    await userEvent.click(dialog.getByRole('button', { name: 'Cancel' }));
    expect(
      screen.getByRole('dialog', { name: 'Birth certificate · Document Review' })
    ).toBeVisible();
    expect(preview.getByRole('button', { name: 'Evidence history (1)' })).toBe(history);
    expect(preview.getByRole('button', { name: 'Reject' })).toHaveFocus();
    expect(reviews).toBe(0);
    expect(preview.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('retains the upload draft and blocks submission when collection permission is removed', async () => {
    let uploads = 0;
    mswServer.use(
      http.get(documentStagePath, () => HttpResponse.json(documentSummary)),
      http.post(`${documentStagePath}/requirements/BIRTH_CERTIFICATE/upload`, () => {
        uploads += 1;
        return HttpResponse.json(documentSummary);
      })
    );
    const store = renderDocumentUi(
      <ApplicationDocumentsPanel
        applicationId="application-1"
        stage={documentStage}
        layout="table"
      />
    );
    await userEvent.click(
      await screen.findByRole('button', { name: 'Upload document for Birth certificate' })
    );
    const dialog = within(screen.getByRole('dialog'));
    const file = new File(['%PDF'], 'birth.pdf', { type: 'application/pdf' });
    await userEvent.upload(dialog.getByLabelText(/^Document/), file);
    act(() => {
      store.dispatch(
        setPermissions([{ name: 'Students.Admissions.Documents.View', isGranted: true }])
      );
    });
    expect(dialog.getByRole('button', { name: 'Upload document' })).toBeDisabled();
    fireEvent.submit(dialog.getByRole('button', { name: 'Upload document' }).closest('form')!);
    expect(
      await dialog.findByText(
        'This action is no longer available. Refresh the checklist before continuing.'
      )
    ).toBeVisible();
    expect((dialog.getByLabelText(/^Document/) as HTMLInputElement).files?.[0]).toBe(file);
    expect(uploads).toBe(0);
  });
});
