import { vi, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import RecordDocumentTemplates from './record-document-templates';
import CertificateBatchDialog from './components/certificate-batch-dialog';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

const mocks = vi.hoisted(() => ({ close: vi.fn(), save: vi.fn() }));
vi.mock('react-redux', () => ({
  useSelector: (select: any) =>
    select({
      auth: { permissions: [{ name: 'Students.Records.Certificates.Add', isGranted: true }] },
    }),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock('src/components/customDialog', () => ({
  default: ({ open, title, children, handleClose }: any) =>
    open ? (
      <section role="dialog" aria-label={title}>
        <button type="button" onClick={handleClose}>
          Close form
        </button>
        {children}
      </section>
    ) : null,
  DialogScrollContent: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('./components/certificate-identity-assets', () => ({
  CertificateIdentityAssets: () => null,
}));
vi.mock('src/screens/setting/school-identity/components/template-identity-asset', () => ({
  TemplateIdentityAsset: () => null,
}));
vi.mock('./components/certificate-preview-dialog', () => ({ default: () => null }));
vi.mock('./components/document-history-actions', () => ({
  default: ({ actions }: any) => (
    <>
      {actions.map((action: any) => (
        <button type="button" key={action.label} onClick={action.onClick}>
          {action.label}
        </button>
      ))}
    </>
  ),
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: ({ columns, data }: any) => (
    <>
      {data.map((row: any) => (
        <div key={row.certificateId}>
          {columns.find((column: any) => column.id === 'actions')?.render(null, row)}
        </div>
      ))}
    </>
  ),
}));
vi.mock('src/redux/student/records/student-record-documents-api', () => ({
  useGetRecordIdTemplateQuery: () => ({}),
  useSaveRecordIdTemplateMutation: () => [vi.fn(), {}],
  useGetRecordCertificateTemplateQuery: () => ({
    currentData: {
      certificateType: 1,
      headerContent: 'School',
      footerContent: 'Text',
      schoolAddress: 'Old address',
      isActive: true,
    },
  }),
  useSaveRecordCertificateTemplateMutation: () => [
    (input: unknown) => ({ unwrap: () => mocks.save(input) }),
    {},
  ],
  useGetRecordCertificateBatchQuery: () => ({
    currentData: {
      certificates: [
        {
          certificateId: 'cert-1',
          certificateNo: 'CERT-1',
          status: 'Issued',
          student: { studentName: 'Asha' },
        },
      ],
    },
  }),
  useDownloadRecordDocumentMutation: () => [vi.fn(), {}],
  useReprintRecordDocumentMutation: () => [vi.fn(), {}],
  useVoidRecordDocumentMutation: () => [vi.fn(), {}],
  useDuplicateRecordCertificateMutation: () => [vi.fn(), {}],
  downloadRecordPdf: vi.fn(),
}));

it('protects changed certificate template fields through Cancel and header close', () => {
  render(
    <RecordDocumentTemplates open kind="certificates" certificateType={1} onClose={mocks.close} />
  );
  fireEvent.change(screen.getByRole('textbox', { name: 'School address' }), {
    target: { value: 'New address' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(mocks.close).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
  expect(screen.getByRole('textbox', { name: 'School address' })).toHaveValue('New address');
  fireEvent.click(screen.getByRole('button', { name: 'Close form' }));
  fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
  expect(mocks.close).toHaveBeenCalledTimes(1);
  expect(mocks.save).not.toHaveBeenCalled();
});

it('retains a certificate action reason until the user explicitly discards it', () => {
  render(
    <CertificateBatchDialog
      batchId="batch-1"
      certificateType={1}
      label="Bonafide"
      onClose={vi.fn()}
    />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Reprint' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Reason' }), {
    target: { value: 'Printer jam recovery' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
  expect(screen.getByRole('textbox', { name: 'Reason' })).toHaveValue('Printer jam recovery');
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
  expect(screen.queryByRole('textbox', { name: 'Reason' })).not.toBeInTheDocument();
});
