import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import userEvent from '@testing-library/user-event';
import { screen, within, waitFor, fireEvent } from '@testing-library/react';
import {
  documentSummary,
  documentStagePath,
} from 'src/redux/student/admissions/document-test-fixture';

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
  fireEvent.change(
    dialog.getByRole('button', { name: 'Drop files here or browse' }).querySelector('input')!,
    { target: { files: [file] } }
  );
  expect(await dialog.findByRole('alert')).toHaveTextContent('File exceeds the 1 MB size limit.');
}, 15000);

it('keeps one dropped file local, clears it on removal and submits a reselected policy-sized file', async () => {
  const submitted: { name: string; size: number; notes: string }[] = [];
  mswServer.use(
    http.post(`${documentStagePath}/requirements/BIRTH_CERTIFICATE/upload`, async ({ request }) => {
      const body = await request.formData();
      const file = body.get('file') as File;
      submitted.push({ name: file.name, size: file.size, notes: String(body.get('notes')) });
      return HttpResponse.json(documentSummary);
    })
  );
  const onSuccess = vi.fn();
  renderDocumentUi(
    <DocumentActionDialog
      action="upload"
      summary={documentSummary}
      requirement={documentSummary.requirements[0]}
      onClose={vi.fn()}
      onSuccess={onSuccess}
    />
  );
  const dialog = within(screen.getByRole('dialog'));
  const dropzone = dialog.getByRole('button', { name: 'Drop files here or browse' });
  const file = new File([new Uint8Array(6 * 1024 * 1024)], 'birth.pdf', {
    type: 'application/pdf',
  });
  fireEvent.drop(dropzone, {
    dataTransfer: {
      files: [file, new File(['ignored'], 'second.pdf', { type: 'application/pdf' })],
    },
  });
  expect(await dialog.findByText('birth.pdf')).toBeVisible();
  expect(dialog.queryByText('second.pdf')).not.toBeInTheDocument();
  expect(dialog.getByRole('button', { name: 'Preview birth.pdf' })).toBeEnabled();
  expect(submitted).toEqual([]);
  await userEvent.click(dialog.getByRole('button', { name: 'Remove birth.pdf' }));
  expect(await dialog.findByRole('alert')).toHaveTextContent('Choose a document to upload');
  expect(dialog.queryByText('birth.pdf')).not.toBeInTheDocument();
  fireEvent.change(dropzone.querySelector('input')!, { target: { files: [file] } });
  await userEvent.type(dialog.getByLabelText('Notes'), 'Certificate copy');
  await userEvent.click(dialog.getByRole('button', { name: 'Upload Document' }));
  await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  expect(submitted).toEqual([{ name: 'birth.pdf', size: 6291456, notes: 'Certificate copy' }]);
}, 15000);

it('shows unsupported dropped-file feedback and preserves the previous valid selection', async () => {
  renderDocumentUi(
    <DocumentActionDialog
      action="upload"
      summary={documentSummary}
      requirement={documentSummary.requirements[0]}
      onClose={vi.fn()}
    />
  );
  const dialog = within(screen.getByRole('dialog'));
  const dropzone = dialog.getByRole('button', { name: 'Drop files here or browse' });
  fireEvent.drop(dropzone, {
    dataTransfer: { files: [new File(['pdf'], 'birth.pdf', { type: 'application/pdf' })] },
  });
  expect(await dialog.findByText('birth.pdf')).toBeVisible();
  fireEvent.drop(dropzone, {
    dataTransfer: { files: [new File(['text'], 'birth.txt', { type: 'text/plain' })] },
  });
  expect(await dialog.findByRole('alert')).toHaveTextContent('Allowed formats: pdf');
  expect(dialog.getByText('birth.pdf')).toBeVisible();
  expect(dialog.queryByText('birth.txt')).not.toBeInTheDocument();
}, 15000);

it('locks selection, removal, preview and close while the document upload is in progress', async () => {
  let releaseUpload!: () => void;
  const uploadPending = new Promise<void>((resolve) => {
    releaseUpload = resolve;
  });
  mswServer.use(
    http.post(`${documentStagePath}/requirements/BIRTH_CERTIFICATE/upload`, async () => {
      await uploadPending;
      return HttpResponse.json(documentSummary);
    })
  );
  const onClose = vi.fn();
  const onSuccess = vi.fn();
  renderDocumentUi(
    <DocumentActionDialog
      action="upload"
      summary={documentSummary}
      requirement={documentSummary.requirements[0]}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
  const dialog = within(screen.getByRole('dialog'));
  const dropzone = dialog.getByRole('button', { name: 'Drop files here or browse' });
  fireEvent.change(dropzone.querySelector('input')!, {
    target: { files: [new File(['pdf'], 'birth.pdf', { type: 'application/pdf' })] },
  });
  await userEvent.click(dialog.getByRole('button', { name: 'Upload Document' }));
  await waitFor(() => expect(dropzone).toHaveAttribute('aria-disabled', 'true'));
  expect(dropzone.querySelector('input')).toBeDisabled();
  expect(dialog.getByRole('button', { name: 'Remove birth.pdf' })).toBeDisabled();
  expect(dialog.getByRole('button', { name: 'Preview birth.pdf' })).toBeDisabled();
  expect(dialog.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  expect(dialog.getByRole('button', { name: 'close' })).toBeDisabled();
  fireEvent.drop(dropzone, {
    dataTransfer: { files: [new File(['other'], 'replacement.pdf', { type: 'application/pdf' })] },
  });
  expect(dialog.queryByText('replacement.pdf')).not.toBeInTheDocument();
  expect(onClose).not.toHaveBeenCalled();
  releaseUpload();
  await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
}, 15000);
