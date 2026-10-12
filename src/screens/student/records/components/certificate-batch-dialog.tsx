import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type { CertificateType, CertificateResponse } from 'src/redux/student/records/student-record-documents-api';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import CustomizableTable from 'src/components/customizabaleTable';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Stack, Alert, Button, TextField, DialogActions } from '@mui/material';
import {
  downloadRecordPdf, useVoidRecordDocumentMutation, useReprintRecordDocumentMutation,
  useGetRecordCertificateBatchQuery, useDownloadRecordDocumentMutation, useDuplicateRecordCertificateMutation,
} from 'src/redux/student/records/student-record-documents-api';

import DocumentHistoryActions from './document-history-actions';
import CertificatePreviewDialog from './certificate-preview-dialog';

export default function CertificateBatchDialog({ batchId, certificateType, label, onClose }: {
  batchId: string; certificateType: CertificateType; label: string; onClose: () => void;
}) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canIssue = hasGrantedPermission(permissions, 'Students.Records.Certificates.Add');
  const canVoid = hasGrantedPermission(permissions, 'Students.Records.Certificates.Delete');
  const query = useGetRecordCertificateBatchQuery({ batchId, certificateType });
  const [view, setView] = useState<CertificateResponse | null>(null);
  const [decision, setDecision] = useState<{ action: 'Reprint' | 'Duplicate' | 'Void'; certificate: CertificateResponse } | null>(null);
  const [error, setError] = useState('');
  const [download, downloadState] = useDownloadRecordDocumentMutation();
  const [reprint, reprintState] = useReprintRecordDocumentMutation();
  const [voidDocument, voidState] = useVoidRecordDocumentMutation();
  const [duplicate, duplicateState] = useDuplicateRecordCertificateMutation();
  const key = useRef('');
  const busy = downloadState.isLoading || reprintState.isLoading || voidState.isLoading || duplicateState.isLoading;
  const closeDecision = () => { setDecision(null); setError(''); key.current = ''; form.resetForm(); };
  const form = useFormik({ initialValues: { reason: '' }, validationSchema: Yup.object({ reason: Yup.string().trim().min(5, 'Enter at least 5 characters.').max(2000).required('Enter a reason.') }),
    onSubmit: async values => {
      if (!decision?.certificate.certificateId) return;
      setError(''); const id = decision.certificate.certificateId;
      try {
        if (decision.action === 'Reprint') downloadRecordPdf(await reprint({ kind: 'certificates', id, reason: values.reason.trim() }).unwrap(), `${decision.certificate.certificateNo}.pdf`);
        else if (decision.action === 'Void') await voidDocument({ kind: 'certificates', id, reason: values.reason.trim() }).unwrap();
        else { key.current ||= crypto.randomUUID(); await duplicate({ id, reason: values.reason.trim(), idempotencyKey: key.current }).unwrap(); }
        shikshaMitraToast.success({ message: `${decision.action} recorded.` }); closeDecision();
      } catch { setError('The certificate action could not be completed. Refresh and retry.'); }
    },
  });
  const downloadCertificate = async (certificate: CertificateResponse) => {
    if (!certificate.certificateId) return;
    setError('');
    try { downloadRecordPdf(await download({ kind: 'certificates', id: certificate.certificateId }).unwrap(), `${certificate.certificateNo}.pdf`); }
    catch { setError('The certificate PDF could not be downloaded. Try again.'); }
  };
  const columns: IColumn[] = [
    { id: 'student.studentName', label: 'Student', filterType: 'string' },
    { id: 'certificateNo', label: 'Certificate number', filterType: 'string' },
    { id: 'student.grNo', label: 'GR number', filterType: 'string' },
    { id: 'student.className', label: 'Class', filterType: 'string' },
    { id: 'student.divisionName', label: 'Division', filterType: 'string' },
    { id: 'status', label: 'Status', filterType: 'string', render: value => <Label color={value === 'Cancelled' ? 'error' : 'success'}>{value === 'Cancelled' ? 'Voided' : value}</Label> },
    { id: 'actions', label: 'Actions', isFilter: false, isSort: false, excludeFromExport: true, sticky: true,
      render: (_, row) => {
        const certificate = row as CertificateResponse; const cancelled = certificate.status === 'Cancelled';
        return <DocumentHistoryActions number={certificate.certificateNo} actions={[
          { label: 'View', icon: 'solar:eye-bold', disabled: busy, onClick: () => setView(certificate) },
          { label: 'Download', icon: 'solar:download-bold', disabled: busy || cancelled, onClick: () => { downloadCertificate(certificate); } },
          ...(canIssue ? [{ label: 'Reprint', icon: 'solar:printer-bold', disabled: busy || cancelled, onClick: () => setDecision({ action: 'Reprint' as const, certificate }) },
            { label: 'Duplicate', icon: 'solar:copy-bold', disabled: busy || cancelled, onClick: () => setDecision({ action: 'Duplicate' as const, certificate }) }] : []),
          ...(canVoid ? [{ label: 'Void', icon: 'solar:trash-bin-trash-bold', danger: true, disabled: busy || cancelled, onClick: () => setDecision({ action: 'Void' as const, certificate }) }] : []),
        ]} />;
      } },
  ];
  return (
    <CustomDialog open handleClose={onClose} title={`${label} certificates — students`} maxWidth="lg" hasForm={false} disableClose={busy} hasUnsavedChanges={false}>
      <DialogScrollContent>
        <Stack spacing={1}>
          {error && !decision && <Alert severity="error">{error}</Alert>}
          <Box sx={{ height: 420, minHeight: 0 }}><CustomizableTable tableId="certificate-batch-students" tableTitle="Generated certificates for students"
            columns={columns} data={query.currentData?.certificates ?? []} isLoading={query.isFetching} isPagination isSearch
            noDataText="No certificates are available in this batch."
            errorContent={query.isError ? <Alert severity="error" action={<Button onClick={() => query.refetch()}>Retry</Button>}>The student list could not be loaded.</Alert> : undefined}
            wrapperProps={{ sx: { height: 1 } }} tableContainerProps={{ sx: { height: 1 } }} /></Box>
        </Stack>
      </DialogScrollContent>
      <DialogActions><Button onClick={onClose} disabled={busy}>Close</Button></DialogActions>
      <CertificatePreviewDialog open={!!view} title="Generated certificate" certificates={view ? [view] : []} onClose={() => setView(null)} />
      <CustomDialog open={!!decision} handleClose={closeDecision} title={`${decision?.action ?? 'Review'} ${decision?.certificate.certificateNo ?? 'certificate'}`}
        maxWidth="sm" disableClose={busy} hasUnsavedChanges={form.dirty} onSubmit={event => { event.preventDefault(); form.submitForm(); }}>
        <DialogScrollContent><Stack spacing={2}><TextField label="Reason" required multiline minRows={2} name="reason" value={form.values.reason}
          onChange={form.handleChange} onBlur={form.handleBlur} disabled={busy} error={!!form.touched.reason && !!form.errors.reason}
          helperText={form.touched.reason && form.errors.reason} />{error && <Alert severity="error">{error}</Alert>}</Stack></DialogScrollContent>
        <DialogActions><Button onClick={closeDecision} disabled={busy}>Cancel</Button><Button type="submit" variant="contained"
          color={decision?.action === 'Void' ? 'error' : 'primary'} loading={busy} disabled={busy}>{decision?.action ?? 'Save'}</Button></DialogActions>
      </CustomDialog>
    </CustomDialog>
  );
}
