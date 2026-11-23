import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, within, waitFor, fireEvent } from '@testing-library/react';
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
vi.mock('src/routes/hooks', () => ({ useRouter: () => ({ push: vi.fn() }) }));
describe('applicant document checklist interactions', { timeout: 15000 }, () => {
  it('shows skeletons inside the checklist columns on the first request', async () => {
    let finish!: () => void;
    const pending = new Promise<void>((resolve) => {
      finish = resolve;
    });
    mswServer.use(
      http.get(documentStagePath, async () => {
        await pending;
        return HttpResponse.json(documentSummary);
      })
    );
    renderDocumentUi(
      <ApplicationDocumentsPanel applicationId="application-1" stage={documentStage} layout="table" />
    );

    try {
      expect(screen.getByRole('status', { name: 'Loading Document Checklist' })).toBeInTheDocument();
      const table = within(screen.getByRole('table', { name: 'Document Requirements table' }));
      expect(table.getAllByRole('columnheader').map((header) => header.textContent?.trim())).toEqual([
        'Document Name',
        'Format',
        'Status',
        'Actions',
      ]);
      const [, firstBodyRow] = table.getAllByRole('row');
      expect(within(firstBodyRow).getAllByRole('cell')).toHaveLength(4);
      expect(firstBodyRow.querySelectorAll('.MuiSkeleton-root')).toHaveLength(4);
      expect(table.queryByText('No Applicable Document Requirements.')).not.toBeInTheDocument();
    } finally {
      finish();
    }
    expect(await screen.findByRole('row', { name: /Birth certificate/ })).toBeVisible();
    expect(screen.queryByRole('status', { name: 'Loading Document Checklist' })).not.toBeInTheDocument();
  });

  it.each([false, true])('scopes manual refresh feedback to its button (request failed: %s)', async (fails) => {
    let finish!: () => void;
    const pending = new Promise<void>((resolve) => {
      finish = resolve;
    });
    let reads = 0;
    mswServer.use(
      http.get(documentStagePath, async () => {
        reads += 1;
        if (reads > 1) {
          await pending;
          if (fails) return HttpResponse.json({ detail: 'Checklist temporarily unavailable' }, { status: 503 });
        }
        return HttpResponse.json(documentSummary);
      })
    );
    renderDocumentUi(
      <ApplicationDocumentsPanel applicationId="application-1" stage={documentStage} layout="table" />
    );

    const row = await screen.findByRole('row', { name: /Birth certificate/ });
    const refresh = screen.getByRole('button', { name: 'Refresh' });
    try {
      await userEvent.dblClick(refresh);
      await waitFor(() => expect(reads).toBe(2));
      expect(refresh).toBeDisabled();
      expect(within(refresh).getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByRole('row', { name: /Birth certificate/ })).toBe(row);
      expect(screen.queryByRole('status', { name: 'Refreshing Document Checklist' })).not.toBeInTheDocument();
    } finally {
      finish();
    }
    await waitFor(() => expect(refresh).toBeEnabled());
    expect(within(refresh).queryByRole('progressbar')).not.toBeInTheDocument();
    if (fails) expect(row).not.toBeInTheDocument();
    else expect(screen.getByRole('row', { name: /Birth certificate/ })).toBe(row);
  });

  it.each(['Upload Document', 'Upload Replacement'])(
    'keeps loading on the %s submit and retains the row on the resulting checklist refresh',
    async (label) => {
      let finishUpload!: () => void;
      let finishRefresh!: () => void;
      const pendingUpload = new Promise<void>((resolve) => {
        finishUpload = resolve;
      });
      const pendingRefresh = new Promise<void>((resolve) => {
        finishRefresh = resolve;
      });
      const summary = label === 'Upload Replacement'
        ? { ...documentSummary, requirements: [{ ...documentSummary.requirements[0], evidence: [documentEvidence] }] }
        : documentSummary;
      let reads = 0;
      let uploads = 0;
      mswServer.use(
        http.get(documentStagePath, async () => {
          reads += 1;
          if (reads > 1) await pendingRefresh;
          return HttpResponse.json(summary);
        }),
        http.post(`${documentStagePath}/requirements/BIRTH_CERTIFICATE/upload`, async () => {
          uploads += 1;
          await pendingUpload;
          return HttpResponse.json(summary);
        })
      );
      renderDocumentUi(
        <ApplicationDocumentsPanel applicationId="application-1" stage={documentStage} layout="table" />
      );
      const row = await screen.findByRole('row', { name: /Birth certificate/ });
      await userEvent.click(within(row).getByRole('button', { name: `${label} for Birth certificate` }));
      const dialog = within(screen.getByRole('dialog'));
      fireEvent.change(dialog.getByRole('group', { name: 'Document' }).querySelector('input')!, {
        target: { files: [new File(['%PDF-1.7'], 'birth.pdf', { type: 'application/pdf' })] },
      });
      const submit = dialog.getByRole('button', { name: 'Upload Document' });

      try {
        await userEvent.dblClick(submit);
        await waitFor(() => expect(uploads).toBe(1));
        expect(submit).toBeDisabled();
        expect(within(submit).getByRole('progressbar')).toBeInTheDocument();

        finishUpload();
        await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
        await waitFor(() => expect(reads).toBe(2));
        expect(screen.getByRole('row', { name: /Birth certificate/ })).toBe(row);
        expect(within(row).getByRole('button', { name: `${label} for Birth certificate` })).toBeDisabled();
        expect(within(screen.getByRole('button', { name: 'Refresh' })).queryByRole('progressbar')).not.toBeInTheDocument();
        expect(screen.queryByRole('status', { name: 'Refreshing Document Checklist' })).not.toBeInTheDocument();
      } finally {
        finishUpload();
        finishRefresh();
      }
      await waitFor(() => expect(within(row).getByRole('button', { name: `${label} for Birth certificate` })).toBeEnabled());
    }
  );

  it.each([false, true])(
    'uses server readiness and exposes blockers in table layout (ready: %s)',
    async (ready) => {
      const onComplete = vi.fn();
      const onReadinessChange = vi.fn();
      const blocker =
        'Configure an eligible next-stage route before completing document verification.';
      mswServer.use(
        http.get(documentStagePath, () =>
          HttpResponse.json({
            ...documentSummary,
            canComplete: ready,
            blockers: ready ? [] : [blocker],
            requirements: [
              {
                ...documentSummary.requirements[0],
                status: 'accepted',
                evidence: [{ ...documentEvidence, status: 'accepted' }],
              },
            ],
          })
        )
      );
      renderDocumentUi(
        <ApplicationDocumentsPanel
          applicationId="application-1"
          stage={documentStage}
          layout="table"
          canAdvance
          onComplete={onComplete}
          onReadinessChange={onReadinessChange}
        />
      );
      await screen.findByText('Accepted');
      const button = screen.getByRole('button', { name: 'Continue Admission' });
      if (ready) {
        expect(button).toBeEnabled();
        await userEvent.click(button);
        expect(onComplete).toHaveBeenCalledOnce();
      } else {
        expect(button).toBeDisabled();
        await userEvent.hover(screen.getByRole('button', { name: 'Document verification help' }));
        expect(await screen.findByText(blocker)).toBeVisible();
        expect(onComplete).not.toHaveBeenCalled();
      }
      await waitFor(() =>
        expect(onReadinessChange).toHaveBeenLastCalledWith(
          expect.objectContaining({ canComplete: ready, concurrencyStamp: 'application-stamp' })
        )
      );
    }
  );
  it.each([false, true])(
    'keeps parent document requests inside the editable Documents owner (historical: %s)',
    async (historical) => {
      mswServer.use(
        http.get(documentStagePath, () => HttpResponse.json(documentSummary)),
        http.get(
          '*/api/student/enrollment/admissions/applications/application-1/parent-registration',
          () =>
            HttpResponse.json({
              applicationId: 'application-1',
              concurrencyStamp: 'stamp',
              recipients: [],
              request: null,
              canRequestDocumentCorrections: true,
              availableDocuments: [
                { stageInstanceId: documentStage.id, code: 'BIRTH', name: 'Birth certificate' },
              ],
            })
        )
      );
      renderDocumentUi(
        <ApplicationDocumentsPanel
          applicationId="application-1"
          stage={documentStage}
          historical={historical}
        />,
        [
          'View',
          'Add',
          'Students.Admissions.Applications.View',
          'Students.Admissions.Applications.Edit',
        ]
      );
      await screen.findByText('Birth certificate');
      if (historical)
        expect(
          screen.queryByRole('button', { name: 'Request parent documents' })
        ).not.toBeInTheDocument();
      else
        expect(
          await screen.findByRole('button', { name: 'Request parent documents' })
        ).toBeEnabled();
      expect(
        screen.queryByRole('button', { name: 'Send registration link' })
      ).not.toBeInTheDocument();
    }
  );
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
    ['Upload Document', 'Record Original', 'Accept', 'Request Replacement'].forEach((name) => {
      expect(Boolean(screen.queryByRole('button', { name }))).toBe(canAdd);
    });
    expect(Boolean(screen.queryByRole('button', { name: 'Waive Requirement' }))).toBe(canWaive);
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
    expect(screen.getByRole('button', { name: 'Continue Admission' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Upload Document' }));
    const dialog = within(screen.getByRole('dialog'));
    fireEvent.change(dialog.getByRole('group', { name: 'Document' }).querySelector('input')!, {
      target: { files: [new File(['%PDF-1.7'], 'birth.pdf', { type: 'application/pdf' })] },
    });
    await userEvent.click(dialog.getByRole('button', { name: 'Upload Document' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(uploadName).toBe('birth.pdf');
    expect(uploadStamp).toBe('application-stamp');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Continue Admission' })).toBeEnabled()
    );
    await userEvent.click(screen.getByRole('button', { name: 'Continue Admission' }));
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
    const replacement = await screen.findByRole('button', { name: 'Request Replacement' });
    expect(screen.queryByRole('button', { name: 'Accept' })).not.toBeInTheDocument();
    await userEvent.click(replacement);
    const dialog = within(screen.getByRole('dialog'));
    await userEvent.click(dialog.getByRole('button', { name: 'Request Replacement' }));
    expect(await dialog.findByText('Give a reason for this decision')).toBeInTheDocument();
    expect(requests).toBe(0);
    await userEvent.type(dialog.getByLabelText(/^Rejection Reason/), 'The seal is unreadable.');
    await userEvent.click(dialog.getByRole('button', { name: 'Request Replacement' }));
    await waitFor(() => expect(requests).toBe(1));
    expect(reason).toBe('The seal is unreadable.');
  });
});
