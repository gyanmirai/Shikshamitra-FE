import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, within, waitFor } from '@testing-library/react';
import {
  documentSummary,
  documentEvidence,
  documentStagePath,
} from 'src/redux/student/admissions/document-test-fixture';

import { ApplicationDocumentsPanel } from './application-documents-panel';
import { documentStage, renderDocumentUi } from './document-ui-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
describe('applicant document checklist interactions', { timeout: 15000 }, () => {
  it.each([
    { grants: ['View'], canAdd: false, canWaive: false },
    { grants: ['View', 'Add'], canAdd: true, canWaive: false },
    { grants: ['View', 'Delete'], canAdd: false, canWaive: false },
    {
      grants: ['View', 'Upload', 'Review', 'RecordOriginal', 'Waive'],
      canAdd: false,
      canWaive: false,
    },
  ])('uses canonical document grants: $grants', async ({ grants, canAdd, canWaive }) => {
    mswServer.use(
      http.get(documentStagePath, () =>
        HttpResponse.json({
          ...documentSummary,
          requirements: [
            {
              ...documentSummary.requirements[0],
              canUpload: true,
              canRecordOriginal: true,
              canReview: true,
              canAccept: true,
              canWaive: true,
            },
          ],
        })
      )
    );
    renderDocumentUi(
      <ApplicationDocumentsPanel applicationId="application-1" stage={documentStage} />,
      grants
    );
    await screen.findByText('Birth certificate is required.');
    ['Upload document', 'Record original', 'Accept', 'Request replacement'].forEach((name) => {
      expect(Boolean(screen.queryByRole('button', { name }))).toBe(canAdd);
    });
    expect(Boolean(screen.queryByRole('button', { name: 'Waive requirement' }))).toBe(canWaive);
  });

  it('shows blockers, uploads a configured file and only enables Continue after confirmed completion', async () => {
    let accepted = false;
    let uploadName = '';
    let uploadStamp = '';
    mswServer.use(
      http.get(documentStagePath, () =>
        HttpResponse.json({
          ...documentSummary,
          canComplete: accepted,
          blockers: accepted ? [] : documentSummary.blockers,
          requirements: [
            {
              ...documentSummary.requirements[0],
              status: accepted ? 'accepted' : 'missing',
              canUpload: !accepted,
              evidence: accepted ? [{ ...documentEvidence, status: 'accepted' }] : [],
            },
          ],
        })
      ),
      http.post(
        `${documentStagePath}/requirements/BIRTH_CERTIFICATE/upload`,
        async ({ request }) => {
          const body = await request.formData();
          uploadStamp = String(body.get('concurrencyStamp'));
          uploadName = (body.get('file') as File).name;
          accepted = true;
          return HttpResponse.json(documentSummary);
        }
      )
    );
    const complete = vi.fn();
    renderDocumentUi(
      <ApplicationDocumentsPanel
        applicationId="application-1"
        stage={documentStage}
        canAdvance
        onComplete={complete}
      />
    );
    expect(await screen.findByText('Birth certificate is required.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue admission' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Upload document' }));
    const dialog = within(screen.getByRole('dialog'));
    await userEvent.upload(
      dialog.getByLabelText(/^Document/),
      new File(['%PDF-1.7'], 'birth.pdf', { type: 'application/pdf' })
    );
    await userEvent.click(dialog.getByRole('button', { name: 'Upload document' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(uploadName).toBe('birth.pdf');
    expect(uploadStamp).toBe('application-stamp');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Continue admission' })).toBeEnabled()
    );
    await userEvent.click(screen.getByRole('button', { name: 'Continue admission' }));
    expect(complete).toHaveBeenCalledOnce();
  });

  it('allows a reviewer to request replacement before the required original is seen, but cannot accept', async () => {
    let reason = '';
    let requests = 0;
    mswServer.use(
      http.get(documentStagePath, () =>
        HttpResponse.json({
          ...documentSummary,
          requirements: [
            {
              ...documentSummary.requirements[0],
              status: 'pendingReview',
              collectionMode: 'both',
              canReview: true,
              canAccept: false,
              evidence: [{ ...documentEvidence, originalSeen: false }],
            },
          ],
        })
      ),
      http.post(
        '*/api/student/enrollment/admissions/document-verification/evidence/evidence-1/review',
        async ({ request }) => {
          const { reason: submittedReason } = (await request.json()) as { reason: string };
          reason = submittedReason;
          requests += 1;
          return HttpResponse.json(documentSummary);
        }
      )
    );
    renderDocumentUi(
      <ApplicationDocumentsPanel applicationId="application-1" stage={documentStage} />
    );
    const replacement = await screen.findByRole('button', { name: 'Request replacement' });
    expect(screen.queryByRole('button', { name: 'Accept' })).not.toBeInTheDocument();
    await userEvent.click(replacement);
    const dialog = within(screen.getByRole('dialog'));
    await userEvent.click(dialog.getByRole('button', { name: 'Request replacement' }));
    expect(await dialog.findByText('Give a reason for this decision')).toBeInTheDocument();
    expect(requests).toBe(0);
    await userEvent.type(dialog.getByLabelText(/^Rejection reason/), 'The seal is unreadable.');
    await userEvent.click(dialog.getByRole('button', { name: 'Request replacement' }));
    await waitFor(() => expect(requests).toBe(1));
    expect(reason).toBe('The seal is unreadable.');
  });
});
