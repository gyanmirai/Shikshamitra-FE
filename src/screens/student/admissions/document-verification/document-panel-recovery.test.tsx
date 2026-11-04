import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import userEvent from '@testing-library/user-event';
import { screen, within, waitFor, fireEvent } from '@testing-library/react';
import {
  documentSummary,
  documentStagePath,
} from 'src/redux/student/admissions/document-test-fixture';

import { ApplicationDocumentsPanel } from './application-documents-panel';
import { documentStage, renderDocumentUi } from './document-ui-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
it('keeps a selected file and notes when both upload and background checklist refresh fail', async () => {
  let failed = false;
  let reads = 0;
  mswServer.use(
    http.get(documentStagePath, () => {
      reads += 1;
      return failed
        ? HttpResponse.json({ detail: 'Checklist temporarily unavailable' }, { status: 503 })
        : HttpResponse.json(documentSummary);
    }),
    http.post(`${documentStagePath}/requirements/BIRTH_CERTIFICATE/upload`, () => {
      failed = true;
      return HttpResponse.json(
        { detail: 'Document storage is temporarily unavailable. Try again.' },
        { status: 503 }
      );
    })
  );
  renderDocumentUi(
    <ApplicationDocumentsPanel applicationId="application-1" stage={documentStage} />
  );
  await userEvent.click(await screen.findByRole('button', { name: 'Upload Document' }));
  const dialog = within(screen.getByRole('dialog'));
  const file = new File(['%PDF-1.7'], 'birth.pdf', { type: 'application/pdf' });
  fireEvent.change(dialog.getByRole('group', { name: 'Document' }).querySelector('input')!, {
    target: { files: [file] },
  });
  await userEvent.type(dialog.getByLabelText('Notes'), 'Keep this replacement');
  await userEvent.click(dialog.getByRole('button', { name: 'Upload Document' }));
  expect(
    await dialog.findByText('Document storage is temporarily unavailable. Try again.')
  ).toBeInTheDocument();
  await waitFor(() => expect(reads).toBe(2));
  expect(dialog.getByRole('button', { name: 'Upload Document' })).toBeEnabled();
  expect(dialog.getByLabelText('Notes')).toHaveValue('Keep this replacement');
  expect(dialog.getByText('birth.pdf')).toBeVisible();
  expect(screen.getByRole('dialog')).toBeInTheDocument();
}, 15000);
