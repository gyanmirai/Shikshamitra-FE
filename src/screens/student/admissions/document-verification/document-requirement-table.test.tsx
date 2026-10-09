import type { ApplicationDocumentVerification } from 'src/redux/student/admissions/admission-document-types';

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

import { ApplicationDocuments } from './application-documents';
import { ApplicationDocumentsPanel } from './application-documents-panel';
import { documentStage, renderDocumentUi } from './document-ui-test-fixture';
import { getDocumentTableFile, getDocumentTableFormat } from './document-table-model';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

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
  it('renders configured requirements and formats with disabled missing-file controls', async () => {
    renderTable();
    const table = await screen.findByRole('table');
    ['Document Name', 'Format', 'Status', 'Upload', 'View', 'Download'].forEach((name) =>
      expect(within(table).getByText(name)).toBeInTheDocument()
    );
    expect(within(table).getByText('PDF', { exact: true })).toBeInTheDocument();
    expect(within(table).queryByText('Accepted: PDF')).not.toBeInTheDocument();
    expect(within(table).getByText('Missing')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'View document details for Birth certificate' })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Download document for Birth certificate' })
    ).toBeDisabled();
    await userEvent.click(
      screen.getByRole('button', { name: 'Upload document for Birth certificate' })
    );
    expect(await screen.findByRole('dialog', { name: 'Upload document' })).toBeInTheDocument();
    expect(screen.getByText('PDF · Maximum 10 MB')).toBeInTheDocument();
    await userEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Upload document' })
    );
    expect(await screen.findByText('Choose a document to upload')).toBeInTheDocument();
  });

  it('retains uploaded copy after original collection and opens full evidence details', async () => {
    renderTable(reviewedSummary());
    await screen.findByRole('table');
    expect(screen.getByText('Accepted: PDF')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Download document for Birth certificate' })
    ).toBeEnabled();
    await userEvent.click(
      screen.getByRole('button', { name: 'View document details for Birth certificate' })
    );
    const details = await screen.findByRole('dialog', {
      name: 'Birth certificate · Document Details',
    });
    expect(within(details).getByText('Version 2 · Latest')).toBeInTheDocument();
    expect(within(details).getByText('birth-certificate.pdf')).toBeInTheDocument();
    expect(within(details).getByText('Physical original recorded')).toBeInTheDocument();
  });

  it('respects independent review, existing collection guards and canonical waiver permission', async () => {
    renderTable(reviewedSummary());
    await screen.findByRole('table');
    await userEvent.click(
      screen.getByRole('button', { name: 'More actions for Birth certificate' })
    );
    expect(screen.queryByRole('menuitem', { name: 'Accept document' })).not.toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Request replacement' })).toBeEnabled();
    expect(screen.getByRole('menuitem', { name: 'Record physical original' })).toBeEnabled();
    await userEvent.click(screen.getByRole('menuitem', { name: 'Waive requirement' }));
    expect(await screen.findByRole('dialog', { name: 'Waive requirement' })).toBeInTheDocument();
  });

  it('downloads the selected uploaded copy through the existing protected evidence endpoint', async () => {
    const createObjectURL = vi.fn(() => 'blob:private-document');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal(
      'URL',
      class extends URL {
        static createObjectURL = createObjectURL;

        static revokeObjectURL = revokeObjectURL;
      }
    );
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    let evidenceRequests = 0;
    mswServer.use(
      http.get(
        '*/api/student/enrollment/admissions/document-verification/evidence/evidence-1/download',
        () => {
          evidenceRequests += 1;
          return new HttpResponse(new Blob(['private file'], { type: 'application/pdf' }));
        }
      )
    );
    renderTable(reviewedSummary());
    await screen.findByRole('table');
    await userEvent.click(
      screen.getByRole('button', { name: 'Download document for Birth certificate' })
    );
    await waitFor(() => expect(click).toHaveBeenCalledOnce());
    expect(evidenceRequests).toBe(1);
    expect(createObjectURL).toHaveBeenCalledOnce();
    await waitFor(() => expect(revokeObjectURL).toHaveBeenCalledWith('blob:private-document'), {
      timeout: 2000,
    });
  });

  it('keeps historical evidence available while all mutations are locked', async () => {
    renderTable(reviewedSummary(), ['View', 'Add', 'Delete'], true);
    await screen.findByRole('table');
    expect(
      screen.getByRole('button', { name: 'Upload replacement for Birth certificate' })
    ).toBeDisabled();
    await userEvent.click(
      screen.getByRole('button', { name: 'More actions for Birth certificate' })
    );
    expect(screen.queryByRole('menuitem', { name: 'Request replacement' })).not.toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: 'Waive requirement' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('menuitem', { name: 'Evidence history (2)' }));
    expect(
      await screen.findByRole('dialog', { name: 'Birth certificate · Document Details' })
    ).toBeInTheDocument();
  });

  it('does not infer review grants or download access, and does not offer policy-forbidden waivers', async () => {
    const summary = reviewedSummary();
    summary.policy = { ...summary.policy!, allowWaivers: false };
    summary.requirements[0].evidence[0] = { ...documentEvidence, canDownload: false };
    renderTable(summary, ['View', 'Delete']);
    await screen.findByRole('table');
    expect(
      screen.getByRole('button', { name: 'Upload replacement for Birth certificate' })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Download document for Birth certificate' })
    ).toBeDisabled();
    await userEvent.click(
      screen.getByRole('button', { name: 'More actions for Birth certificate' })
    );
    expect(screen.getAllByRole('menuitem')).toHaveLength(1);
    expect(screen.getByRole('menuitem', { name: 'Evidence history (2)' })).toBeInTheDocument();
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
    ['Upload', 'View', 'Download', 'Actions'].forEach((name) => {
      expect(
        within(within(table).getByRole('columnheader', { name })).queryByRole('button')
      ).not.toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Filter Status' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
    expect(within(table).getByText('Document 25')).toBeInTheDocument();
    expect(within(table).getAllByRole('row')).toHaveLength(2);
    await userEvent.type(screen.getByRole('textbox', { name: 'Search documents' }), 'Document 12');
    expect(within(table).getByText('Document 12')).toBeInTheDocument();
    expect(within(table).queryByText('Document 25')).not.toBeInTheDocument();
  });

  it('locks current-step mutations while busy and retains permitted read access', async () => {
    const summary = reviewedSummary();
    summary.requirements[0].canAccept = true;
    renderTable(summary, ['View', 'Add', 'Delete'], false, true);
    await screen.findByRole('table');
    expect(
      screen.getByRole('button', { name: 'Upload replacement for Birth certificate' })
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'View document details for Birth certificate' })
    ).toBeEnabled();
    expect(
      screen.getByRole('button', { name: 'Download document for Birth certificate' })
    ).toBeEnabled();
    await userEvent.click(
      screen.getByRole('button', { name: 'More actions for Birth certificate' })
    );
    [
      'Accept document',
      'Request replacement',
      'Record physical original',
      'Waive requirement',
    ].forEach((name) => {
      expect(screen.getByRole('menuitem', { name })).toHaveAttribute('aria-disabled', 'true');
    });
    expect(screen.getByRole('menuitem', { name: 'Evidence history (2)' })).not.toHaveAttribute(
      'aria-disabled',
      'true'
    );
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

  it('offers Accept only when the current evidence and reviewer are eligible', async () => {
    const summary = reviewedSummary();
    summary.requirements[0].canAccept = true;
    renderTable(summary, ['View', 'Add']);
    await screen.findByRole('table');
    await userEvent.click(
      screen.getByRole('button', { name: 'More actions for Birth certificate' })
    );
    expect(screen.getByRole('menuitem', { name: 'Accept document' })).not.toHaveAttribute(
      'aria-disabled',
      'true'
    );
    expect(screen.queryByRole('menuitem', { name: 'Waive requirement' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('menuitem', { name: 'Accept document' }));
    expect(await screen.findByRole('dialog', { name: 'Accept document' })).toBeInTheDocument();
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
    expect(
      screen.getByRole('button', { name: 'Upload replacement for Birth certificate' })
    ).toBeDisabled();
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
