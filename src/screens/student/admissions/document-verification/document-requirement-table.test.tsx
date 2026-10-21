import type { ApplicationDocumentVerification } from 'src/redux/student/admissions/admission-document-types';

import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import userEvent from '@testing-library/user-event';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { screen, within, waitFor, fireEvent } from '@testing-library/react';
import {
  documentSummary,
  documentEvidence,
  documentStagePath,
} from 'src/redux/student/admissions/document-test-fixture';

import { ApplicationDocuments } from './application-documents';
import { ApplicationDocumentsPanel } from './application-documents-panel';
import { documentStage, renderDocumentUi } from './document-ui-test-fixture';
import { getDocumentTableFile, getDocumentTableFormat } from './document-table-model';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

beforeEach(() => {
  mswServer.use(
    http.get(
      '*/api/student/enrollment/admissions/document-verification/evidence/evidence-1/download',
      () => new HttpResponse(null, { status: 403 })
    )
  );
});

function stubDocumentUrls(objectUrl: string) {
  const createObjectURL = vi.fn(() => objectUrl);
  const revokeObjectURL = vi.fn();
  vi.stubGlobal(
    'URL',
    class extends URL {
      static createObjectURL = createObjectURL;

      static revokeObjectURL = revokeObjectURL;
    }
  );
  return { createObjectURL, revokeObjectURL };
}

function renderTable(
  summary = documentSummary,
  permissions = ['View', 'Add', 'Delete'],
  historical = false,
  disabled = false
) {
  mswServer.use(http.get(documentStagePath, () => HttpResponse.json(summary)));
  renderDocumentUi(
    <ApplicationDocumentsPanel
      applicationId="application-1"
      stage={documentStage}
      layout="table"
      historical={historical}
      disabled={disabled}
    />,
    permissions
  );
}

function reviewedSummary(): ApplicationDocumentVerification {
  return {
    ...documentSummary,
    requirements: [
      {
        ...documentSummary.requirements[0],
        status: 'pendingReview',
        canAccept: false,
        canReview: true,
        canRecordOriginal: true,
        evidence: [
          documentEvidence,
          {
            ...documentEvidence,
            id: 'original-2',
            versionNumber: 2,
            kind: 'original',
            fileName: undefined,
            canDownload: false,
            originalSeen: true,
          },
        ],
      },
    ],
  };
}

describe('admission document table', { timeout: 15000 }, () => {
  it('shows pending requirements honestly when the workflow allows onboarding deferral', async () => {
    mswServer.use(
      http.get(documentStagePath, () =>
        HttpResponse.json({ ...documentSummary, canComplete: true })
      )
    );
    renderDocumentUi(
      <ApplicationDocumentsPanel
        applicationId="application-1"
        stage={documentStage}
        layout="table"
        canAdvance
        onComplete={vi.fn()}
      />
    );
    await screen.findByRole('table');
    expect(screen.queryByText('Birth certificate is required.')).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Complete these pending documents in Student Onboarding/)
    ).not.toBeInTheDocument();
    expect(screen.getByText('0 of 1 required documents resolved')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Continue admission' })).toBeEnabled();
    expect(screen.queryByText(/Document requirements are complete/)).not.toBeInTheDocument();
  });

  it('shows completion only after document blockers are resolved', async () => {
    renderTable({
      ...documentSummary,
      canComplete: true,
      blockers: [],
      requirements: [{ ...documentSummary.requirements[0], status: 'accepted' }],
    });
    await screen.findByRole('table');
    expect(screen.queryByText(/Document requirements are complete/)).not.toBeInTheDocument();
    expect(screen.getByText('1 of 1 required documents resolved')).toBeVisible();
    expect(screen.queryByText(/Complete these pending documents/)).not.toBeInTheDocument();
  });

  it('keeps only an icon-only View action and opens collection inside the review dialog', async () => {
    renderTable();
    const table = await screen.findByRole('table');
    ['Document Name', 'Format', 'Status', 'Actions'].forEach((name) =>
      expect(within(table).getByText(name)).toBeInTheDocument()
    );
    expect(within(table).queryByText('Accepted: PDF')).not.toBeInTheDocument();
    expect(within(table).getByText('Missing')).toBeInTheDocument();
    const view = screen.getByRole('button', { name: 'View document for Birth certificate' });
    expect(view).toBeEnabled();
    expect(view).toHaveTextContent('');
    const row = within(table).getAllByRole('row')[1];
    expect(within(row).getAllByRole('button')).toEqual([view]);
    await userEvent.hover(view);
    expect(
      await screen.findByRole('tooltip', { name: 'View document for Birth certificate' })
    ).toBeVisible();
    await userEvent.click(view);
    const dialog = await screen.findByRole('dialog', {
      name: 'Birth certificate · Document Review',
    });
    expect(within(dialog).getByText('No document uploaded')).toBeVisible();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Upload document' }));
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(within(dialog).getByText('PDF · Maximum 10 MB')).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Upload document' }));
    expect(await screen.findByText('Choose a document to upload')).toBeInTheDocument();
  });

  it('retains the uploaded copy and shows the latest original and evidence history in View', async () => {
    renderTable(reviewedSummary());
    await screen.findByRole('table');
    expect(screen.getByText('PDF', { exact: true })).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'View document for Birth certificate' })
    );
    const dialog = await screen.findByRole('dialog', {
      name: 'Birth certificate · Document Review',
    });
    expect(within(dialog).getByText('Latest evidence · Version 2')).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Evidence history (2)' }));
    expect(within(dialog).getByText('Version 2 · Latest')).toBeInTheDocument();
    expect(within(dialog).getByText('birth-certificate.pdf')).toBeInTheDocument();
    expect(within(dialog).getAllByText('Physical original recorded')).toHaveLength(2);
  });

  it('opens actual uploaded bytes on View instead of evidence history and restores focus on Close', async () => {
    stubDocumentUrls('blob:uploaded-copy');
    mswServer.use(
      http.get(
        '*/api/student/enrollment/admissions/document-verification/evidence/evidence-1/download',
        () => new HttpResponse('uploaded image', { headers: { 'Content-Type': 'image/png' } })
      )
    );
    renderTable(reviewedSummary());
    const view = await screen.findByRole('button', {
      name: 'View document for Birth certificate',
    });
    await userEvent.click(view);
    expect(
      await screen.findByRole('img', { name: 'Birth certificate document preview' })
    ).toHaveAttribute('src', 'blob:uploaded-copy');
    expect(screen.getAllByText('Physical original recorded')[0]).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(view).toHaveFocus();
  });

  it('respects independent review and collection/waiver permissions inside View', async () => {
    renderTable(reviewedSummary());
    await userEvent.click(
      await screen.findByRole('button', { name: 'View document for Birth certificate' })
    );
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Reject' })).toBeEnabled();
    expect(within(dialog).getByRole('button', { name: 'Record physical original' })).toBeEnabled();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Waive requirement' }));
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(within(dialog).getByRole('textbox', { name: 'Reason' })).toBeInTheDocument();
  });

  it('previews and downloads the selected copy through the protected evidence endpoint', async () => {
    stubDocumentUrls('blob:private-document');
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    let evidenceRequests = 0;
    mswServer.use(
      http.get(
        '*/api/student/enrollment/admissions/document-verification/evidence/evidence-1/download',
        () => {
          evidenceRequests += 1;
          return new HttpResponse('private file', {
            headers: { 'Content-Type': 'application/pdf' },
          });
        }
      )
    );
    renderTable(reviewedSummary());
    await userEvent.click(
      await screen.findByRole('button', { name: 'View document for Birth certificate' })
    );
    await screen.findByTitle('Birth certificate document preview');
    expect(evidenceRequests).toBe(1);
    await userEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Download' })
    );
    await waitFor(() => expect(click).toHaveBeenCalledOnce());
    expect(evidenceRequests).toBe(2);
  });

  it('keeps historical evidence available while all mutations are locked', async () => {
    renderTable(reviewedSummary(), ['View', 'Add', 'Delete'], true);
    await userEvent.click(
      await screen.findByRole('button', { name: 'View document for Birth certificate' })
    );
    const dialog = screen.getByRole('dialog');
    expect(
      within(dialog).queryByRole('button', {
        name: /Upload replacement|Reject|Approve|Waive requirement|Record physical original/,
      })
    ).not.toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Evidence history (2)' })).toBeEnabled();
  });

  it('does not infer review/download grants or offer policy-forbidden waivers', async () => {
    const summary = reviewedSummary();
    summary.policy = { ...summary.policy!, allowWaivers: false };
    summary.requirements[0].evidence[0] = { ...documentEvidence, canDownload: false };
    let downloads = 0;
    mswServer.use(
      http.get(
        '*/api/student/enrollment/admissions/document-verification/evidence/evidence-1/download',
        () => {
          downloads += 1;
          return HttpResponse.error();
        }
      )
    );
    renderTable(summary, ['View', 'Delete']);
    await userEvent.click(
      await screen.findByRole('button', { name: 'View document for Birth certificate' })
    );
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Preview unavailable')).toBeVisible();
    expect(
      within(dialog).queryByRole('button', {
        name: /Upload|Approve|Reject|Waive requirement|Record physical original|Download/,
      })
    ).not.toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Evidence history (2)' })).toBeEnabled();
    expect(downloads).toBe(0);
  });

  it('renders all configured rows without a hidden ten-row limit', async () => {
    renderTable({
      ...documentSummary,
      requirements: Array.from({ length: 12 }, (_, index) => ({
        ...documentSummary.requirements[0],
        code: `DOCUMENT_${index}`,
        name: `Document ${index}`,
      })),
    });
    const table = await screen.findByRole('table');
    expect(within(table).getAllByRole('row')).toHaveLength(13);
    expect(within(table).getByText('Document 11')).toBeInTheDocument();
  });

  it('pages larger configured checklists and keeps file-action headers free of sort/filter controls', async () => {
    renderTable({
      ...documentSummary,
      requirements: Array.from({ length: 26 }, (_, index) => ({
        ...documentSummary.requirements[0],
        code: `DOCUMENT_${index}`,
        name: `Document ${index}`,
      })),
    });
    const table = await screen.findByRole('table');
    expect(within(table).getAllByRole('row')).toHaveLength(26);
    expect(within(table).queryByText('Document 25')).not.toBeInTheDocument();
    ['Actions'].forEach((name) => {
      expect(
        within(within(table).getByRole('columnheader', { name })).queryByRole('button')
      ).not.toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Filter Status' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
    expect(within(table).getByText('Document 25')).toBeInTheDocument();
    expect(within(table).getAllByRole('row')).toHaveLength(2);
    fireEvent.change(screen.getByRole('textbox', { name: 'Search documents' }), {
      target: { value: 'Document 12' },
    });
    expect(within(table).getByText('Document 12')).toBeInTheDocument();
    expect(within(table).queryByText('Document 25')).not.toBeInTheDocument();
  });

  it('locks current-step mutations while busy and retains permitted read access', async () => {
    const summary = reviewedSummary();
    summary.requirements[0].canAccept = true;
    renderTable(summary, ['View', 'Add', 'Delete'], false, true);
    await userEvent.click(
      await screen.findByRole('button', { name: 'View document for Birth certificate' })
    );
    const dialog = screen.getByRole('dialog');
    [
      'Upload replacement',
      'Approve',
      'Reject',
      'Record physical original',
      'Waive requirement',
    ].forEach((name) => {
      expect(within(dialog).getByRole('button', { name })).toBeDisabled();
    });
    expect(within(dialog).getByRole('button', { name: 'Evidence history (2)' })).toBeEnabled();
  });

  it('returns to a valid page when not-applicable requirements are hidden', async () => {
    renderTable({
      ...documentSummary,
      requirements: [
        documentSummary.requirements[0],
        ...Array.from({ length: 25 }, (_, index) => ({
          ...documentSummary.requirements[0],
          code: `NOT_APPLICABLE_${index}`,
          name: `Not applicable document ${index}`,
          status: 'notRequired' as const,
          isRequired: false,
        })),
      ],
    });
    await screen.findByRole('table');
    await userEvent.click(screen.getByRole('button', { name: /Show documents not applicable/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
    expect(
      within(screen.getByRole('table')).queryByText('Birth certificate')
    ).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Hide documents not applicable/ }));
    expect(within(screen.getByRole('table')).getByText('Birth certificate')).toBeInTheDocument();
  });

  it('offers Approve only inside View when the evidence and reviewer are eligible', async () => {
    const summary = reviewedSummary();
    summary.requirements[0].canAccept = true;
    renderTable(summary, ['View', 'Add']);
    const view = await screen.findByRole('button', { name: 'View document for Birth certificate' });
    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument();
    await userEvent.click(view);
    const dialog = screen.getByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Approve' }));
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
    expect(within(dialog).getByRole('textbox', { name: 'Notes' })).toBeInTheDocument();
    expect(
      within(dialog).queryByRole('button', { name: 'Waive requirement' })
    ).not.toBeInTheDocument();
  });

  it('opts into one selected completed stage as read-only without fetching current documents', async () => {
    const completed = { ...documentStage, status: 2 };
    const current = { ...documentStage, id: 'new-stage', name: 'Current documents' };
    let currentCalls = 0;
    mswServer.use(
      http.get(documentStagePath, () => HttpResponse.json(reviewedSummary())),
      http.get(
        '*/api/student/enrollment/admissions/document-verification/applications/application-1/stages/new-stage',
        () => {
          currentCalls += 1;
          return HttpResponse.json(documentSummary);
        }
      )
    );
    renderDocumentUi(
      <ApplicationDocuments
        applicationId="application-1"
        stages={[completed, current]}
        currentStage={current}
        selectedStageId={completed.id}
        layout="table"
        canAdvance
        advancing={false}
        onComplete={vi.fn()}
      />
    );
    await screen.findByRole('table');
    expect(screen.queryByText('Current documents')).not.toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'View document for Birth certificate' })
    );
    expect(
      within(screen.getByRole('dialog')).queryByRole('button', { name: 'Upload replacement' })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Continue admission' })).not.toBeInTheDocument();
    expect(currentCalls).toBe(0);
  });

  it('keeps existing consumers on cards by default', async () => {
    mswServer.use(http.get(documentStagePath, () => HttpResponse.json(documentSummary)));
    renderDocumentUi(
      <ApplicationDocumentsPanel applicationId="application-1" stage={documentStage} />
    );
    await screen.findByRole('button', { name: 'Upload document' });
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});

describe('document table file metadata', () => {
  it('selects the newest file and never falls back around its download denial', () => {
    const requirement = reviewedSummary().requirements[0];
    requirement.evidence.push({
      ...documentEvidence,
      id: 'replacement',
      versionNumber: 3,
      canDownload: false,
      fileName: 'replacement.jpg',
    });
    expect(getDocumentTableFile(requirement)?.id).toBe('replacement');
    expect(getDocumentTableFile(requirement)?.canDownload).toBe(false);
    expect(getDocumentTableFormat(requirement, documentSummary.policy)).toMatchObject({
      actual: 'JPG',
      accepted: 'PDF',
    });
  });
  it('does not invent a format for missing files or physical originals', () => {
    expect(
      getDocumentTableFormat(
        { ...documentSummary.requirements[0], collectionMode: 'original', code: 'ORIGINAL' },
        null
      )
    ).toMatchObject({ actual: undefined, accepted: undefined, fallback: 'Physical original' });
  });
});
