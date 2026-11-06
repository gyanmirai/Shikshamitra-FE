import type { CertificateResponse } from 'src/redux/student/records/student-record-documents-api';

import { vi, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import CertificatePreviewDialog from './certificate-preview-dialog';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('src/components/customDialog', () => ({
  default: ({ open, children, disableClose }: any) =>
    open ? (
      <div>
        <button type="button" disabled={disableClose}>
          Header close
        </button>
        {children}
      </div>
    ) : null,
  DialogScrollContent: ({ children }: any) => <div>{children}</div>,
}));

it('keeps read-only preparing previews closable from the header and footer', () => {
  render(
    <CertificatePreviewDialog open title="Preview" certificates={[]} busy onClose={vi.fn()} />
  );
  expect(screen.getByRole('button', { name: 'Header close' })).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Close' })).toBeEnabled();
});

it('locks header and footer closing during certificate writes', () => {
  render(
    <CertificatePreviewDialog
      open
      title="Preview"
      certificates={[]}
      busy
      closeLocked
      onClose={vi.fn()}
    />
  );
  expect(screen.getByRole('button', { name: 'Header close' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Close' })).toBeDisabled();
});

it.each([false, true])(
  'formats the issue date for structured=%s without changing the certificate data',
  (structured) => {
    const certificate: CertificateResponse = {
      certificateNo: 'CERT-1',
      certificateType: 'Bonafide',
      issueDate: '2026-10-30',
      status: 'Issued',
      student: { studentId: 'student-1', studentName: 'Aanya Patel' },
      template: {
        renderedHeaderContent: 'School',
        renderedFooterContent: 'Principal',
        document: structured
          ? { title: 'Bonafide', body: 'Student certificate', particulars: [] }
          : null,
      },
      certificateData: {},
    };
    render(
      <CertificatePreviewDialog
        open
        title="Preview"
        certificates={[certificate]}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText('Issue date: 30/10/2026')).toBeVisible();
    expect(certificate.issueDate).toBe('2026-10-30');
  }
);
