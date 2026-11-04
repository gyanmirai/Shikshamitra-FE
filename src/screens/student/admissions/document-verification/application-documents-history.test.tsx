import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { screen } from '@testing-library/react';
import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import {
  documentSummary,
  documentEvidence,
  documentStagePath,
} from 'src/redux/student/admissions/document-test-fixture';

import { ApplicationDocuments } from './application-documents';
import { ApplicationDocumentsPanel } from './application-documents-panel';
import { documentStage, renderDocumentUi } from './document-ui-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
describe('document history and access', { timeout: 15000 }, () => {
  it('opens future document collection using server capabilities without allowing advancement', async () => {
    mswServer.use(
      http.get(documentStagePath, () =>
        HttpResponse.json({
          ...documentSummary,
          isActive: false,
          canCollectDuringForm: false,
          requirements: [{ ...documentSummary.requirements[0], canUpload: true }],
        })
      )
    );
    const future = { ...documentStage, status: 0 as const };
    renderDocumentUi(
      <ApplicationDocuments
        applicationId="application-1"
        stages={[future]}
        currentStage={{ ...documentStage, id: 'form-stage', documentVerificationEnabled: false }}
        selectedStageId={future.id}
        canAdvance
        advancing={false}
        onComplete={vi.fn()}
      />
    );
    expect(await screen.findByRole('button', { name: 'Upload Document' })).toBeEnabled();
    expect(screen.queryByRole('button', { name: 'Continue Admission' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Upload Document' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not fetch protected document evidence without View permission', () => {
    let requests = 0;
    mswServer.use(
      http.get(documentStagePath, () => {
        requests += 1;
        return HttpResponse.json(documentSummary);
      })
    );
    renderDocumentUi(
      <ApplicationDocumentsPanel applicationId="application-1" stage={documentStage} />,
      []
    );
    expect(screen.getByText(/Document access is required/)).toBeInTheDocument();
    expect(requests).toBe(0);
    expect(screen.queryByText('Birth Certificate')).not.toBeInTheDocument();
  });

  it('loads completed checklist history on expansion and never exposes mutation actions', async () => {
    let requests = 0;
    mswServer.use(
      http.get(documentStagePath, () => {
        requests += 1;
        return HttpResponse.json({
          ...documentSummary,
          requirements: [{ ...documentSummary.requirements[0], evidence: [documentEvidence] }],
        });
      })
    );
    renderDocumentUi(
      <ApplicationDocuments
        applicationId="application-1"
        stages={[{ ...documentStage, status: 2 }]}
        canAdvance
        advancing={false}
        onComplete={vi.fn()}
      />
    );
    expect(requests).toBe(0);
    await userEvent.click(screen.getByRole('button', { name: /Document History/ }));
    expect(await screen.findByText('birth-certificate.pdf')).toBeInTheDocument();
    expect(requests).toBe(1);
    expect(screen.queryByRole('button', { name: 'Upload Replacement' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Waive Requirement' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Continue Admission' })).not.toBeInTheDocument();
  });
});
