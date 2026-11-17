import type { CertificateResponse } from 'src/redux/student/records/student-record-documents-api';

import { it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import CertificateDocumentPreview from './certificate-document-preview';

const logo = 'data:image/png;base64,iVBORw0KGgo=';
const banner = 'data:image/jpeg;base64,/9j/2w==';
const certificate: CertificateResponse = {
  certificateNo: 'BON-001',
  certificateType: 'Bonafide',
  issueDate: '2026-11-16',
  status: 'Draft',
  student: { studentId: 'student-1', studentName: 'Demo Student' },
  organization: { organizationName: 'Example School', address: 'Recorded campus address' },
  template: {
    renderedHeaderContent: '',
    renderedFooterContent: '',
    document: { title: 'Bonafide Certificate', body: 'Verified student record.', particulars: [] },
  },
  certificateData: {},
};

it('uses the configured certificate logo with the recorded school name and address', () => {
  render(
    <CertificateDocumentPreview certificate={{ ...certificate, branding: { logoDataUrl: logo } }} />
  );
  expect(screen.getByRole('img', { name: 'School logo' })).toHaveAttribute('src', logo);
  expect(screen.getByText('Example School')).toBeVisible();
  expect(screen.getByText('Recorded campus address')).toBeVisible();
});

it('uses a full letterhead banner without repeating a second logo and school heading', () => {
  render(
    <CertificateDocumentPreview
      certificate={{
        ...certificate,
        branding: { logoDataUrl: logo, bannerDataUrl: banner },
      }}
    />
  );
  expect(screen.getByRole('img', { name: 'School letterhead' })).toHaveAttribute('src', banner);
  expect(screen.queryByRole('img', { name: 'School logo' })).not.toBeInTheDocument();
  expect(screen.queryByText('Example School')).not.toBeInTheDocument();
  expect(screen.getByText('Bonafide Certificate')).toBeVisible();
});

it('keeps the printable document white in dark app mode', () => {
  render(
    <ThemeProvider theme={createTheme({ palette: { mode: 'dark' } })}>
      <CertificateDocumentPreview certificate={certificate} />
    </ThemeProvider>
  );
  const paper = screen.getByLabelText('Certificate preview for Demo Student');
  expect(paper).toHaveStyle({ backgroundColor: '#fff' });
});

it('falls back to recorded school text without inventing branding when no images are configured', () => {
  render(<CertificateDocumentPreview certificate={certificate} />);
  expect(screen.getByText('Example School')).toBeVisible();
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
  expect(screen.queryByText(/placeholder/i)).not.toBeInTheDocument();
});
