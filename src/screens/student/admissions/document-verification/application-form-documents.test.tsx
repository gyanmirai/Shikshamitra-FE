import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { screen } from '@testing-library/react';
import { it, vi, expect, describe } from 'vitest';
import {
  documentSummary,
  documentStagePath,
} from 'src/redux/student/admissions/document-test-fixture';

import { ApplicationFormDocuments } from './application-form-documents';
import { documentStage, renderDocumentUi } from './document-ui-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

function respondWithCollection() {
  mswServer.use(
    http.get(documentStagePath, () =>
      HttpResponse.json({
        ...documentSummary,
        isActive: false,
        canCollectDuringForm: true,
        requirements: documentSummary.requirements.map((item) => ({ ...item, canWaive: false })),
      })
    )
  );
}

describe('documents collected during the application form', () => {
  it('shows the linked checklist with upload only, without verification or advance actions', async () => {
    respondWithCollection();
    renderDocumentUi(
      <ApplicationFormDocuments
        applicationId="application-1"
        stages={[{ ...documentStage, documentCollectionAvailable: true }]}
        unsaved={false}
        saving={false}
      />
    );
    expect(await screen.findByRole('button', { name: 'Upload document' })).toBeEnabled();
    expect(screen.queryByRole('button', { name: 'Accept' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /waive/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Continue admission' })).not.toBeInTheDocument();
  });

  it.each([
    { unsaved: true, saving: false },
    { unsaved: false, saving: true },
  ])('prevents upload while form answers are dirty or saving: %j', async ({ unsaved, saving }) => {
    respondWithCollection();
    renderDocumentUi(
      <ApplicationFormDocuments
        applicationId="application-1"
        stages={[{ ...documentStage, documentCollectionAvailable: true }]}
        unsaved={unsaved}
        saving={saving}
      />
    );
    expect(await screen.findByRole('button', { name: 'Upload document' })).toBeDisabled();
    if (unsaved)
      expect(screen.getByText(/Save your form answers before uploading/)).toBeInTheDocument();
  });

  it('does not offer early collection for an unlinked document stage', () => {
    renderDocumentUi(
      <ApplicationFormDocuments
        applicationId="application-1"
        stages={[documentStage]}
        unsaved={false}
        saving={false}
      />
    );
    expect(screen.queryByText('Supporting documents')).not.toBeInTheDocument();
  });
});
