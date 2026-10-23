import { useState } from 'react';
import { it, vi, expect, describe } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import ConcessionDocumentList from './ConcessionDocumentList';

const state = vi.hoisted(() => ({ upload: vi.fn() }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/preview-document/DocumentPreviewDialog', () => ({ default: () => null }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({ type }: any) =>
    type === 'query' ? { isLoading: false } : [state.upload, { isLoading: false }],
}));
vi.mock('src/redux/finance/concessionType', () => ({ useGetConcessionTypeByIdQuery: vi.fn() }));
vi.mock('src/redux/finance/ConcessionManagement/concessionManagementApi', () => ({
  useUploadConcessionDocumentFileMutation: vi.fn(),
}));

const requirements = [
  {
    documentId: 'proof',
    documentName: 'Income proof',
    isRequired: true,
    acceptedFormats: [4],
    maxFileSizeBytes: 1024 * 1024,
  },
];
function Documents() {
  const [documents, setDocuments] = useState<any[]>([]);
  return (
    <ConcessionDocumentList
      concessionId="type"
      concessionName="Concession"
      submittedDocuments={documents}
      onSave={setDocuments}
      requirements={requirements}
    />
  );
}

describe('concession supporting documents', () => {
  it('identifies missing required documents and updates the adjacent status and filename after upload and remove', async () => {
    state.upload.mockReturnValue({
      unwrap: () => Promise.resolve({ url: '/files/income-proof.pdf' }),
    });
    render(<Documents />);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Required documents missing: Income proof.'
    );
    expect(screen.getByText('Not uploaded')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Upload Income proof' })).toBeEnabled();
    fireEvent.change(screen.getByLabelText('Choose Income proof file'), {
      target: { files: [new File(['proof'], 'income-proof.pdf', { type: 'application/pdf' })] },
    });
    await waitFor(() => expect(screen.getByText('Uploaded · income-proof.pdf')).toBeVisible());
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Replace Income proof' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Remove Income proof' }));
    expect(screen.getByText('Not uploaded')).toBeVisible();
    expect(screen.getByRole('alert')).toHaveTextContent('Income proof');
  });
});
