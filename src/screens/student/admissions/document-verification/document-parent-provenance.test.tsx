import { it, vi, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { DocumentEvidenceHistory } from './document-evidence-history';

vi.mock('./document-download-button', () => ({ DocumentDownloadButton: () => null }));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));

it('identifies parent evidence without inventing a staff submitter and tolerates legacy or malformed attribution', () => {
  const evidence = {
    id: 'e',
    versionNumber: 1,
    kind: 'upload',
    fileName: 'certificate.pdf',
    submittedAt: '2026-11-04T10:00:00Z',
    submittedBy: null,
    status: 'pendingReview',
    canDownload: false,
    originalSeen: false,
    reviews: [],
    parentRegistrationId: 'request',
    parentContactJson: JSON.stringify({
      relationship: 'mother',
      fullName: 'Saved Mother',
      email: 'mother@example.test',
    }),
  };
  const { rerender } = render(
    <DocumentEvidenceHistory evidence={[evidence] as any} allowDownload={false} />
  );
  expect(screen.getByText(/Uploaded by parent/)).toHaveTextContent('Saved Mother');
  expect(screen.queryByText(/Uploaded by staff/)).not.toBeInTheDocument();
  rerender(
    <DocumentEvidenceHistory
      evidence={[{ ...evidence, parentContactJson: '{invalid' }] as any}
      allowDownload={false}
    />
  );
  expect(screen.getByText('Uploaded by parent')).toBeVisible();
});
