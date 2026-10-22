import type { ApplicationDocumentVerification } from 'src/redux/student/admissions/admission-document-types';

import { http, HttpResponse } from 'msw';
import { addIcon } from '@iconify/react';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, within, cleanup, waitFor, fireEvent } from '@testing-library/react';
import { renderDocumentUi } from 'src/screens/student/admissions/document-verification/document-ui-test-fixture';
import {
  documentPath,
  documentSummary,
  documentEvidence,
} from 'src/redux/student/admissions/document-test-fixture';

import { StudentOnboardingDocumentWorkspace } from './student-onboarding-document-workspace';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
const responsive = vi.hoisted(() => ({ compact: false }));
vi.mock('src/hooks/use-responsive', () => ({ useResponsive: () => responsive.compact }));
const createUrl = vi.fn(() => 'blob:student-private-preview');
const revokeUrl = vi.fn();
const endpoint = `${documentPath}/evidence/evidence-1/download`;
addIcon('mdi:lock-outline', { body: '<path d="M0 0h16v16H0z"/>', width: 16, height: 16 });
beforeEach(() => {
  responsive.compact = false;
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
const permissions = {
  view: true,
  download: true,
  upload: true,
  original: true,
  review: true,
  waive: false,
};
function uploadedSummary(): ApplicationDocumentVerification {
  return {
    ...documentSummary,
    blockers: [],
    requirements: [
      {
        ...documentSummary.requirements[0],
        status: 'accepted',
        canUpload: false,
        canReview: false,
        evidence: [{ ...documentEvidence, status: 'accepted' }],
      },
    ],
  };
}
function renderWorkspace({
  summary = uploadedSummary(),
  readOnly = false,
  disabled = false,
  access = permissions,
  onAction = vi.fn(),
} = {}) {
  const store = renderDocumentUi(
    <StudentOnboardingDocumentWorkspace
      summary={summary}
      permissions={access}
      disabled={disabled}
      readOnly={readOnly}
      onAction={onAction}
    />
  );
  return { store, onAction };
}

it('uses three compact columns and only icon actions without changing document status', () => {
  renderWorkspace();
  const table = screen.getByRole('table');
  expect(within(table).getAllByRole('columnheader')).toHaveLength(3);
  expect(within(table).getByText('Accepted')).toBeVisible();
  expect(screen.getByText('1 of 1 required documents resolved')).toBeVisible();
  const view = screen.getByRole('button', { name: 'View Birth certificate' });
  const download = screen.getByRole('button', { name: 'Download Birth certificate' });
  const history = screen.getByRole('button', { name: 'History for Birth certificate' });
  [view, download, history].forEach((button) => expect(button).toHaveTextContent(''));
  const actionCell = view.closest('td')!;
  expect(actionCell).toHaveStyle({ textAlign: 'left' });
  expect(within(table).getAllByRole('columnheader')[2]).toHaveStyle({ textAlign: 'left' });
  expect(view.closest('.MuiBox-root')).toHaveStyle({ justifyContent: 'flex-start' });
  expect(screen.queryByText('Admission documents · Read-only')).not.toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'Documents' })).not.toBeInTheDocument();
  const nameCell = within(table).getByText('Birth certificate').closest('td')!;
  expect(nameCell).toHaveTextContent(/^Birth certificate$/);
  expect(within(table).queryByText('birth-certificate.pdf')).not.toBeInTheDocument();
  expect(within(table).queryByText(/Version/)).not.toBeInTheDocument();
  expect(
    screen.queryByText('This document verification stage is read-only.')
  ).not.toBeInTheDocument();
});

it('keeps Document and icon Actions readable on mobile while retaining status in the document cell', () => {
  responsive.compact = true;
  renderWorkspace();
  const table = screen.getByRole('table');
  expect(within(table).getAllByRole('columnheader')).toHaveLength(2);
  expect(within(table).getByText('Birth certificate')).toBeVisible();
  const row = within(table).getAllByRole('row')[1];
  const cells = within(row).getAllByRole('cell');
  expect(within(cells[0]).getByText('Accepted')).toBeVisible();
  expect(within(cells[1]).getByRole('button', { name: 'View Birth certificate' })).toBeVisible();
  expect(within(table).queryByRole('button', { name: 'Sort by Status' })).not.toBeInTheDocument();
});

it('loads only selected protected evidence in a dialog and releases the private URL on close', async () => {
  const request = vi.fn();
  mswServer.use(
    http.get(endpoint, () => {
      request();
      return new HttpResponse('private image', { headers: { 'Content-Type': 'image/png' } });
    })
  );
  const { store } = renderWorkspace();
  expect(request).not.toHaveBeenCalled();
  const view = screen.getByRole('button', { name: 'View Birth certificate' });
  await userEvent.click(view);
  const image = await screen.findByRole('img', { name: 'Birth certificate preview' });
  expect(image).toHaveAttribute('src', 'blob:student-private-preview');
  const dialog = screen.getByRole('dialog', { name: 'Birth certificate' });
  expect(within(dialog).getByRole('img', { name: 'Birth certificate preview' })).toBe(image);
  expect(dialog.contains(document.activeElement)).toBe(true);
  expect(JSON.stringify(store.getState().api)).not.toContain('blob:student-private-preview');
  await userEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
  expect(screen.getByText('125%')).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: 'Fit to page' }));
  expect(screen.getByText('100%')).toBeVisible();
  await userEvent.click(within(dialog).getByRole('button', { name: 'close' }));
  expect(screen.queryByRole('img', { name: 'Birth certificate preview' })).not.toBeInTheDocument();
  expect(revokeUrl).toHaveBeenCalledWith('blob:student-private-preview');
  await waitFor(() => expect(view).toHaveFocus());
});

it('embeds an authorized PDF with fallback instead of treating it as an image', async () => {
  mswServer.use(
    http.get(
      endpoint,
      () => new HttpResponse('%PDF-1.7', { headers: { 'Content-Type': 'application/pdf' } })
    )
  );
  renderWorkspace();
  await userEvent.click(screen.getByRole('button', { name: 'View Birth certificate' }));
  expect(await screen.findByTitle('Birth certificate preview')).toHaveAttribute(
    'data',
    'blob:student-private-preview'
  );
  expect(
    screen.getByText('Your browser cannot display this PDF. Download it to open it.')
  ).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Zoom in' })).not.toBeInTheDocument();
});

it('keeps Close during a failed preview and retries the authenticated request', async () => {
  let requests = 0;
  mswServer.use(
    http.get(endpoint, () => {
      requests += 1;
      return requests === 1
        ? HttpResponse.json({ detail: 'Unavailable' }, { status: 503 })
        : new HttpResponse('image', { headers: { 'Content-Type': 'image/jpeg' } });
    })
  );
  renderWorkspace();
  await userEvent.click(screen.getByRole('button', { name: 'View Birth certificate' }));
  await userEvent.click(await screen.findByRole('button', { name: 'Retry preview' }));
  expect(await screen.findByRole('img', { name: 'Birth certificate preview' })).toBeVisible();
  expect(requests).toBe(2);
});

it('handles unsupported formats and image decode failure without an unsafe URL', async () => {
  mswServer.use(
    http.get(endpoint, () => new HttpResponse('text', { headers: { 'Content-Type': 'text/html' } }))
  );
  renderWorkspace();
  await userEvent.click(screen.getByRole('button', { name: 'View Birth certificate' }));
  expect(await screen.findByText(/Preview is unavailable for this format/)).toBeVisible();
  expect(createUrl).not.toHaveBeenCalled();
  mswServer.use(
    http.get(
      endpoint,
      () => new HttpResponse('image', { headers: { 'Content-Type': 'image/jpeg' } })
    )
  );
  await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'close' }));
  await userEvent.click(screen.getByRole('button', { name: 'View Birth certificate' }));
  fireEvent.error(await screen.findByRole('img', { name: 'Birth certificate preview' }));
  expect(screen.getByText('Unable to preview this document.')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Retry preview' })).toBeEnabled();
});

it('preserves uploaded copy when a later original was recorded and shows all evidence history', async () => {
  const summary = uploadedSummary();
  summary.requirements[0].evidence.push({
    ...documentEvidence,
    id: 'original-2',
    kind: 'original',
    versionNumber: 2,
    fileName: undefined,
    canDownload: false,
    originalSeen: true,
  });
  renderWorkspace({ summary });
  expect(screen.getByRole('button', { name: 'View Birth certificate' })).toBeEnabled();
  await userEvent.click(screen.getByRole('button', { name: 'History for Birth certificate' }));
  const history = await screen.findByRole('dialog');
  expect(within(history).getByText('Physical original recorded')).toBeVisible();
  expect(within(history).getByText('birth-certificate.pdf')).toBeVisible();
  expect(within(history).getByText('Version 2 · Latest')).toBeVisible();
});

it('keeps missing requirements honest and exposes only permitted write actions', async () => {
  const onAction = vi.fn();
  renderWorkspace({ summary: documentSummary, onAction });
  expect(screen.getByText('Missing')).toBeVisible();
  expect(screen.getByRole('button', { name: /View Birth certificate:/ })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Download Birth certificate' })).toBeDisabled();
  await userEvent.click(screen.getByRole('button', { name: 'More actions for Birth certificate' }));
  await userEvent.click(screen.getByRole('menuitem', { name: 'Upload document' }));
  expect(onAction).toHaveBeenCalledWith('upload', documentSummary.requirements[0]);
  expect(screen.queryByRole('menuitem', { name: /waiv/i })).not.toBeInTheDocument();
});

it('respects read-only and access guards without fetching private bytes', async () => {
  const request = vi.fn();
  mswServer.use(
    http.get(endpoint, () => {
      request();
      return new HttpResponse('secret');
    })
  );
  renderWorkspace({ summary: documentSummary, readOnly: true });
  expect(screen.queryByRole('button', { name: /More actions/ })).not.toBeInTheDocument();
  cleanup();
  renderWorkspace({ access: { ...permissions, view: false, download: false } });
  expect(screen.getByRole('button', { name: /View Birth certificate:/ })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Download Birth certificate' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'History for Birth certificate' })).toBeDisabled();
  expect(request).not.toHaveBeenCalled();
});

it('locks document mutation menu while the parent operation is busy', async () => {
  renderWorkspace({ summary: documentSummary, disabled: true });
  await userEvent.click(screen.getByRole('button', { name: 'More actions for Birth certificate' }));
  expect(screen.getByRole('menuitem', { name: 'Upload document' })).toHaveAttribute(
    'aria-disabled',
    'true'
  );
});

it('downloads the selected copy through the existing authenticated endpoint', async () => {
  const request = vi.fn();
  const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  mswServer.use(
    http.get(endpoint, () => {
      request();
      return new HttpResponse('download bytes', { headers: { 'Content-Type': 'application/pdf' } });
    })
  );
  renderWorkspace();
  await userEvent.click(screen.getByRole('button', { name: 'Download Birth certificate' }));
  await waitFor(() => expect(click).toHaveBeenCalledOnce());
  expect(request).toHaveBeenCalledOnce();
  expect(
    screen.queryByRole('region', { name: 'Birth certificate document preview' })
  ).not.toBeInTheDocument();
});

it('keeps real document blockers visible even when no write action is currently available', () => {
  const summary = uploadedSummary();
  summary.blockers = ['Independent review is still required.'];
  summary.requirements[0].status = 'pendingReview';
  renderWorkspace({ summary });
  expect(screen.getByRole('alert')).toHaveTextContent('Independent review is still required.');
  expect(screen.getByText('0 of 1 required documents resolved')).toBeVisible();
});

it('omits the redundant inactive-stage read-only notice without hiding document status', () => {
  const summary = uploadedSummary();
  summary.isActive = false;
  summary.blockers = ['This document verification stage is read-only.'];
  renderWorkspace({ summary });
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(screen.queryByText('Admission documents · Read-only')).not.toBeInTheDocument();
  expect(screen.getByText('1 of 1 required documents resolved')).toBeVisible();
});

it('retains genuine missing or approval blockers alongside an inactive-stage read-only notice', () => {
  const summary = uploadedSummary();
  summary.isActive = false;
  summary.requirements[0].status = 'missing';
  summary.blockers = [
    'This document verification stage is read-only.',
    'Birth certificate is required.',
    'Approval is pending.',
  ];
  renderWorkspace({ summary });
  expect(screen.getByRole('alert')).toHaveTextContent(
    'Birth certificate is required. Approval is pending.'
  );
  expect(screen.getByRole('alert')).not.toHaveTextContent(
    'This document verification stage is read-only.'
  );
  expect(screen.getByText('Missing')).toBeVisible();
});

it('hides not-applicable documents by default and closes their preview when hidden again', async () => {
  mswServer.use(
    http.get(
      endpoint,
      () => new HttpResponse('image', { headers: { 'Content-Type': 'image/png' } })
    )
  );
  const summary = uploadedSummary();
  summary.requirements[0].status = 'notRequired';
  summary.requirements[0].isRequired = false;
  summary.requirements[0].canUpload = false;
  renderWorkspace({ summary });
  expect(screen.queryByRole('button', { name: 'View Birth certificate' })).not.toBeInTheDocument();
  expect(createUrl).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole('button', { name: 'Show not applicable (1)' }));
  expect(screen.getByText('Not applicable')).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: 'View Birth certificate' }));
  expect(await screen.findByRole('img', { name: 'Birth certificate preview' })).toBeVisible();
  await userEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'close' }));
  await userEvent.click(screen.getByRole('button', { name: 'Hide not applicable (1)' }));
  expect(screen.queryByRole('img', { name: 'Birth certificate preview' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'View Birth certificate' })).not.toBeInTheDocument();
  expect(revokeUrl).toHaveBeenCalledWith('blob:student-private-preview');
  await userEvent.click(screen.getByRole('button', { name: 'Show not applicable (1)' }));
  expect(screen.queryByRole('img', { name: 'Birth certificate preview' })).not.toBeInTheDocument();
});

it('opens a modal on mobile and restores the View button focus after Escape', async () => {
  responsive.compact = true;
  mswServer.use(
    http.get(
      endpoint,
      () => new HttpResponse('image', { headers: { 'Content-Type': 'image/png' } })
    )
  );
  renderWorkspace();
  const view = screen.getByRole('button', { name: 'View Birth certificate' });
  await userEvent.click(view);
  const dialog = screen.getByRole('dialog', { name: 'Birth certificate' });
  expect(dialog).toHaveAttribute('aria-modal', 'true');
  expect(await screen.findByRole('img', { name: 'Birth certificate preview' })).toBeVisible();
  await userEvent.keyboard('{Escape}');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(revokeUrl).toHaveBeenCalledWith('blob:student-private-preview');
  await waitFor(() => expect(view).toHaveFocus());
});
