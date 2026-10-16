import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, cleanup, waitFor, fireEvent } from '@testing-library/react';
import { documentPath, documentEvidence } from 'src/redux/student/admissions/document-test-fixture';

import { renderDocumentUi } from './document-ui-test-fixture';
import { DocumentPreviewDialog } from './document-preview-dialog';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

const endpoint = `${documentPath}/evidence/evidence-1/download`;
const createUrl = vi.fn(() => 'blob:private-preview');
const revokeUrl = vi.fn();
beforeEach(() => {
  createUrl.mockClear();
  revokeUrl.mockClear();
  vi.stubGlobal(
    'URL',
    class extends URL {
      static createObjectURL = createUrl;

      static revokeObjectURL = revokeUrl;
    }
  );
});

function renderPreview() {
  return renderDocumentUi(
    <DocumentPreviewDialog name="Birth certificate" evidence={documentEvidence} onClose={vi.fn()} />
  );
}

it('previews the protected image bytes with zoom and fit and releases the URL on close', async () => {
  mswServer.use(
    http.get(
      endpoint,
      () =>
        new HttpResponse('private image bytes', {
          headers: { 'Content-Type': 'image/png' },
        })
    )
  );
  const store = renderPreview();
  const image = await screen.findByRole('img', { name: 'Birth certificate document preview' });
  expect(image).toHaveAttribute('src', 'blob:private-preview');
  expect(screen.getByText('birth-certificate.pdf · Copy version 1')).toBeInTheDocument();
  Object.defineProperty(image, 'naturalWidth', { configurable: true, value: 1000 });
  fireEvent.load(image);
  await userEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
  expect(screen.getByText('125%')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Fit to page' }));
  expect(screen.getByText('Fit', { exact: true })).toBeInTheDocument();
  expect(JSON.stringify(store.getState().api)).not.toContain('blob:private-preview');
  expect(JSON.stringify(store.getState().api)).not.toContain('private image bytes');
  cleanup();
  expect(revokeUrl).toHaveBeenCalledWith('blob:private-preview');
});

it('embeds a PDF from the same authorized endpoint with a native viewer fallback', async () => {
  mswServer.use(
    http.get(
      endpoint,
      () =>
        new HttpResponse('%PDF-1.7', {
          headers: { 'Content-Type': 'application/pdf' },
        })
    )
  );
  renderPreview();
  const pdf = await screen.findByTitle('Birth certificate document preview');
  expect(pdf).toHaveAttribute('type', 'application/pdf');
  expect(pdf).toHaveAttribute('data', 'blob:private-preview');
  expect(screen.queryByRole('button', { name: 'Zoom in' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Download' })).toBeEnabled();
});

it('retains Close during loading and recovers from a failed request through Retry', async () => {
  let requests = 0;
  mswServer.use(
    http.get(endpoint, () => {
      requests += 1;
      return requests === 1
        ? HttpResponse.json({ detail: 'Unavailable' }, { status: 503 })
        : new HttpResponse('image', { headers: { 'Content-Type': 'image/jpeg' } });
    })
  );
  renderPreview();
  expect(screen.getByLabelText('Loading document preview')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Close' })).toBeEnabled();
  await userEvent.click(await screen.findByRole('button', { name: 'Retry preview' }));
  expect(
    await screen.findByRole('img', { name: 'Birth certificate document preview' })
  ).toBeInTheDocument();
  expect(requests).toBe(2);
});

it('shows an actionable error if an image cannot decode and retries with a fresh URL', async () => {
  mswServer.use(
    http.get(
      endpoint,
      () =>
        new HttpResponse('image', {
          headers: { 'Content-Type': 'image/png' },
        })
    )
  );
  renderPreview();
  fireEvent.error(await screen.findByRole('img', { name: 'Birth certificate document preview' }));
  await userEvent.click(screen.getByRole('button', { name: 'Retry preview' }));
  await screen.findByRole('img', { name: 'Birth certificate document preview' });
  expect(createUrl).toHaveBeenCalledTimes(2);
  expect(revokeUrl).toHaveBeenCalledWith('blob:private-preview');
});

it('never renders a file or creates a URL after the server denies access', async () => {
  mswServer.use(http.get(endpoint, () => HttpResponse.json({ detail: 'Denied' }, { status: 403 })));
  renderPreview();
  expect(await screen.findByText('Unable to preview this document.')).toBeInTheDocument();
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
  expect(createUrl).not.toHaveBeenCalled();
});

it('rejects active HTML even when the saved metadata claims PDF', async () => {
  mswServer.use(
    http.get(
      endpoint,
      () =>
        new HttpResponse('<script>private</script>', {
          headers: { 'Content-Type': 'text/html' },
        })
    )
  );
  renderPreview();
  expect(await screen.findByText(/Preview is unavailable for this format/)).toBeInTheDocument();
  expect(createUrl).not.toHaveBeenCalled();
  expect(screen.queryByTitle('Birth certificate document preview')).not.toBeInTheDocument();
});

it('cancels an unfinished preview without leaving a late object URL', async () => {
  let release!: () => void;
  let started = false;
  let completed = false;
  const responseReady = new Promise<void>((resolve) => {
    release = resolve;
  });
  mswServer.use(
    http.get(endpoint, async () => {
      started = true;
      await responseReady;
      completed = true;
      return new HttpResponse('image', { headers: { 'Content-Type': 'image/png' } });
    })
  );
  renderPreview();
  await waitFor(() => expect(started).toBe(true));
  cleanup();
  release();
  await waitFor(() => expect(completed).toBe(true));
  expect(createUrl).not.toHaveBeenCalled();
});
