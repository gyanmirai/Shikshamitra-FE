import { it, vi, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, within } from '@testing-library/react';
import { documentSummary } from 'src/redux/student/admissions/document-test-fixture';

import { renderDocumentUi } from './document-ui-test-fixture';
import { DocumentActionDialog } from './document-action-dialog';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
it('shows and enforces effective catalog restrictions returned for the applicant requirement', async () => {
  renderDocumentUi(
    <DocumentActionDialog
      action="upload"
      summary={documentSummary}
      onClose={vi.fn()}
      requirement={{
        ...documentSummary.requirements[0],
        allowedExtensions: ['pdf'],
        maxFileSizeMb: 1,
      }}
    />
  );
  const dialog = within(screen.getByRole('dialog'));
  expect(dialog.getByText('PDF · Maximum 1 MB')).toBeInTheDocument();
  const file = new File([new Uint8Array(2 * 1024 * 1024)], 'certificate.pdf', {
    type: 'application/pdf',
  });
  await userEvent.upload(dialog.getByLabelText(/^Document/), file);
  await userEvent.click(dialog.getByRole('button', { name: 'Upload document' }));
  expect(await dialog.findByText('Choose a file no larger than 1 MB')).toBeInTheDocument();
}, 15000);
