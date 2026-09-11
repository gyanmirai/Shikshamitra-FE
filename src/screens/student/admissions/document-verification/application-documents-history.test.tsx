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
    expect(screen.queryByText('Birth certificate')).not.toBeInTheDocument();
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
    await userEvent.click(screen.getByRole('button', { name: /Document history/ }));
    expect(await screen.findByText('birth-certificate.pdf')).toBeInTheDocument();
    expect(requests).toBe(1);
    expect(screen.queryByRole('button', { name: 'Upload replacement' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Waive requirement' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Continue admission' })).not.toBeInTheDocument();
  });
});
