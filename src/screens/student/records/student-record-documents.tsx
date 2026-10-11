'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type { StudentDirectoryItem } from 'src/redux/student/records/student-records-types';
import type {
  IdCard,
  CertificateType,
  CertificateHistory,
  CertificateResponse,
} from 'src/redux/student/records/student-record-documents-api';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { fDate } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { CustomTabs } from 'src/components/custom-tabs';
import { shikshaMitraToast } from 'src/components/toast';
import { studentPaths } from 'src/constants/student-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import { FormBusyRegion } from 'src/components/form-busy-region';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { useGetStudentRecordTransitionsQuery } from 'src/redux/student/records/student-record-transitions-api';
import {
  Box,
  Tab,
  Stack,
  Alert,
  Paper,
  Button,
  TextField,
  Typography,
  DialogActions,
  LinearProgress,
} from '@mui/material';
import {
  downloadRecordPdf,
  useIssueRecordIdsMutation,
  useGetRecordIdHistoryQuery,
  usePreviewRecordIdsMutation,
  useVoidRecordDocumentMutation,
  useReprintRecordDocumentMutation,
  useIssueRecordCertificateMutation,
  useDownloadRecordDocumentMutation,
  usePreviewRecordCertificateMutation,
  useGetRecordCertificateHistoryQuery,
  useDuplicateRecordCertificateMutation,
} from 'src/redux/student/records/student-record-documents-api';

import { recordsQueryUrl } from './records-url-state';
import RecordDocumentTemplates from './record-document-templates';
import RecordDocumentFilters from './components/record-document-filters';
import DocumentHistoryActions from './components/document-history-actions';
import StudentICardBuilder from './student-icard-builder';

type HistoryRow = {
  id: string;
  number: string;
  type: string;
  date?: string | null;
  status: string;
};

export default function StudentRecordDocuments({
  fixedKind,
}: {
  fixedKind?: 'ids' | 'certificates';
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const kind = fixedKind ?? (params.get('view') === 'ids' ? 'ids' : 'certificates');
  const pageTitle =
    fixedKind === 'ids' ? 'Student I-Card' : fixedKind ? 'Certificates' : 'Documents & IDs';
  const studentId = params.get('student') ?? '';
  const canView = hasGrantedPermission(
    permissions,
    kind === 'ids' ? 'Students.Records.StudentICard.View' : 'Students.Records.Certificates.View'
  );
  const canIssue = hasGrantedPermission(
    permissions,
    kind === 'ids' ? 'Students.Records.StudentICard.Add' : 'Students.Records.Certificates.Add'
  );
  const canVoid = hasGrantedPermission(
    permissions,
    kind === 'ids' ? 'Students.Records.StudentICard.Delete' : 'Students.Records.Certificates.Delete'
  );
  const [certificateType, setCertificateType] = useState<CertificateType>(1);
  const [transitionId, setTransitionId] = useState('');
  const [reason, setReason] = useState('');
  const [certificatePreview, setCertificatePreview] = useState<CertificateResponse | null>(null);
  const [previewFingerprint, setPreviewFingerprint] = useState('');
  const [batch, setBatch] = useState<StudentDirectoryItem[]>([]);
  const [idPreview, setIdPreview] = useState<IdCard[]>([]);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [decision, setDecision] = useState<{
    action: 'Reprint' | 'Void' | 'Duplicate';
    row: HistoryRow;
  } | null>(null);
  const clientKey = useRef('');
  const copyKey = useRef('');
  const certificates = useGetRecordCertificateHistoryQuery(studentId, {
    skip: !studentId || !canView || kind !== 'certificates',
  });
  const ids = useGetRecordIdHistoryQuery(studentId, {
    skip: !studentId || !canView || kind !== 'ids',
  });
  const exits = useGetStudentRecordTransitionsQuery(
    { studentId, maxResultCount: 100 },
    {
      skip:
        !studentId ||
        certificateType !== 3 ||
        kind !== 'certificates' ||
        !hasGrantedPermission(permissions, 'Students.Records.Transitions.View'),
    }
  );
  const [previewCertificate, previewCertificateState] = usePreviewRecordCertificateMutation();
  const [issueCertificate, issueCertificateState] = useIssueRecordCertificateMutation();
  const [previewIds, previewIdsState] = usePreviewRecordIdsMutation();
  const [issueIds, issueIdsState] = useIssueRecordIdsMutation();
  const [download, downloadState] = useDownloadRecordDocumentMutation();
  const [reprint, reprintState] = useReprintRecordDocumentMutation();
  const [voidDocument, voidState] = useVoidRecordDocumentMutation();
  const [duplicate, duplicateState] = useDuplicateRecordCertificateMutation();
  const busy =
    previewCertificateState.isLoading ||
    issueCertificateState.isLoading ||
    previewIdsState.isLoading ||
    issueIdsState.isLoading ||
    downloadState.isLoading ||
    reprintState.isLoading ||
    voidState.isLoading ||
    duplicateState.isLoading;
  const request = {
    studentId,
    certificateType,
    transitionId: certificateType === 3 ? transitionId || undefined : undefined,
    certificateFields: { Reason: reason },
  };
  const fingerprint = JSON.stringify(request);
  const decisionForm = useFormik({
    initialValues: { reason: '' },
    validationSchema: Yup.object({
      reason: Yup.string()
        .trim()
        .min(5, 'Enter at least 5 characters.')
        .max(2000)
        .required('Enter a reason.'),
    }),
    onSubmit: async (values) => {
      if (!decision) return;
      setFailure(null);
      try {
        if (decision.action === 'Reprint')
          downloadRecordPdf(
            await reprint({ kind, id: decision.row.id, reason: values.reason.trim() }).unwrap(),
            `${decision.row.number}.pdf`
          );
        else if (decision.action === 'Void')
          await voidDocument({ kind, id: decision.row.id, reason: values.reason.trim() }).unwrap();
        else {
          copyKey.current ||= crypto.randomUUID();
          await duplicate({
            id: decision.row.id,
            reason: values.reason.trim(),
            idempotencyKey: copyKey.current,
          }).unwrap();
        }
        setDecision(null);
        copyKey.current = '';
        decisionForm.resetForm();
        shikshaMitraToast.success({ message: `${decision.action} recorded.` });
      } catch {
        setFailure(
          'The action could not be completed. Check your access and refresh the record before retrying.'
        );
      }
    },
  });
  const prepare = async () => {
    setFailure(null);
    try {
      clientKey.current = crypto.randomUUID();
      if (kind === 'certificates') {
        setCertificatePreview(await previewCertificate(request).unwrap());
        setPreviewFingerprint(fingerprint);
      } else setIdPreview(await previewIds({ studentIds: batch.map((s) => s.studentId) }).unwrap());
    } catch {
      setFailure(
        'Preview could not be prepared. The student may be restricted, onboarding may be incomplete, or the exit case may not meet the school rule.'
      );
    }
  };
  const issue = async () => {
    setFailure(null);
    try {
      if (kind === 'certificates') {
        await issueCertificate({ ...request, idempotencyKey: clientKey.current }).unwrap();
        setCertificatePreview(null);
      } else {
        await issueIds({
          studentIds: batch.map((s) => s.studentId),
          idempotencyKey: clientKey.current,
        }).unwrap();
        setIdPreview([]);
      }
      shikshaMitraToast.success({ message: 'Issued documents saved to history.' });
    } catch {
      setFailure(
        'Issuance failed. The request is safe to retry; refresh if the student or school rules changed.'
      );
    }
  };
  const history: HistoryRow[] =
    kind === 'ids'
      ? (ids.currentData ?? []).map((row: IdCard) => ({
          id: row.id!,
          number: row.cardNumber,
          type: 'Student ID',
          date: row.issuedAt,
          status: row.status,
        }))
      : (certificates.currentData ?? []).map((row: CertificateHistory) => ({
          id: row.certificateId,
          number: row.certificateNumber,
          type: row.certificateType,
          date: row.issueDate,
          status: row.status,
        }));
  const columns: IColumn[] = [
    { id: 'number', label: 'Document number', minWidth: 200 },
    { id: 'type', label: 'Type', minWidth: 120 },
    { id: 'date', label: 'Issued', minWidth: 130, render: (value) => (value ? fDate(value) : '—') },
    {
      id: 'status',
      label: 'Status',
      minWidth: 110,
      render: (value) => (
        <Label color={value === 'Cancelled' || value === 'Voided' ? 'error' : 'success'}>
          {value}
        </Label>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      isSort: false,
      isFilter: false,
      align: 'right',
      minWidth: 160,
      sticky: true,
      stickyPosition: 'right',
      excludeFromExport: true,
      render: (_value, data) => {
        const row = data as HistoryRow;
        const voided = ['Cancelled', 'Voided'].includes(row.status);
        const disabled = busy || voided;
        return (
          <DocumentHistoryActions
            number={row.number}
            actions={[
              {
                label: 'Download',
                icon: 'solar:download-minimalistic-bold',
                disabled,
                onClick: async () => {
                  try {
                    downloadRecordPdf(
                      await download({ kind, id: row.id }).unwrap(),
                      `${row.number}.pdf`
                    );
                  } catch {
                    setFailure('This document could not be downloaded.');
                  }
                },
              },
              ...(canIssue
                ? [
                    {
                      label: 'Reprint',
                      icon: 'solar:printer-bold',
                      disabled,
                      onClick: () => setDecision({ action: 'Reprint', row }),
                    },
                  ]
                : []),
              ...(canIssue && kind === 'certificates'
                ? [
                    {
                      label: 'Copy',
                      icon: 'solar:copy-bold',
                      disabled,
                      onClick: () => setDecision({ action: 'Duplicate', row }),
                    },
                  ]
                : []),
              ...(canVoid
                ? [
                    {
                      label: 'Void',
                      icon: 'solar:trash-bin-trash-bold',
                      disabled,
                      danger: true,
                      onClick: () => setDecision({ action: 'Void', row }),
                    },
                  ]
                : []),
            ]}
          />
        );
      },
    },
  ];
  const query = kind === 'ids' ? ids : certificates;
  return (
    <Box sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
      <CustomBreadcrumbs
        heading={pageTitle}
        description={
          fixedKind === 'ids'
            ? 'Preview, issue, and track student identity cards.'
            : fixedKind === 'certificates'
              ? 'Preview, issue, and track student certificates.'
              : 'Preview, issue, and track student certificates and identity cards.'
        }
        links={[
          { name: 'Student', href: studentPaths.dashboard },
          { name: 'Student Records', href: studentPaths.records.root },
          { name: pageTitle },
        ]}
        action={
          canIssue ? (
            <Button onClick={() => kind === 'ids' ? setBuilderOpen(true) : setTemplatesOpen(true)}>
              {kind === 'ids' ? 'Create Student I-Card' : 'Configure template'}
            </Button>
          ) : undefined
        }
      />
      {!fixedKind && (
        <Paper sx={{ borderRadius: 1.5, flexShrink: 0 }}>
          <CustomTabs
            value={kind}
            aria-label="Student documents"
            sx={{ borderRadius: 1.5 }}
            slotProps={{ flexContainer: { gap: 1 }, tab: { px: 1 } }}
          >
            <Tab
              value="certificates"
              label="Certificates"
              icon={<Iconify icon="solar:document-bold-duotone" />}
              iconPosition="start"
              component={RouterLink}
              href={recordsQueryUrl(pathname, params.toString(), { view: 'certificates' })}
              id="certificates-tab"
              aria-controls="documents-panel"
            />
            <Tab
              value="ids"
              label="Identity cards"
              icon={<Iconify icon="solar:card-bold-duotone" />}
              iconPosition="start"
              component={RouterLink}
              href={recordsQueryUrl(pathname, params.toString(), { view: 'ids' })}
              id="ids-tab"
              aria-controls="documents-panel"
            />
          </CustomTabs>
        </Paper>
      )}
      {!canView ? (
        <Alert severity="warning">You do not have permission to view this document type.</Alert>
      ) : (
        <Box
          id="documents-panel"
          role="tabpanel"
          aria-labelledby={fixedKind ? undefined : `${kind}-tab`}
          aria-label={fixedKind ? pageTitle : undefined}
          sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1 }}
        >
          <RecordDocumentFilters
            kind={kind}
            busy={busy}
            canIssue={canIssue && fixedKind !== 'ids'}
            certificateType={certificateType}
            reason={reason}
            transitionId={transitionId}
            exitsLoading={exits.isFetching}
            exitOptions={(exits.currentData?.items ?? [])
              .filter(
                (exit) =>
                  ['Withdraw', 'Transfer'].includes(exit.outcome) ||
                  (exit.outcome === 'Graduate' && exit.status === 'Applied')
              )
              .map((exit) => ({
                id: exit.id,
                label: `${exit.outcome} · ${fDate(exit.effectiveDate)} · ${exit.status}`,
              }))}
            batch={batch}
            previewDisabled={
              busy ||
              (kind === 'certificates'
                ? !studentId || (certificateType === 3 && !transitionId)
                : !batch.length)
            }
            issueDisabled={
              busy ||
              (kind === 'certificates'
                ? !certificatePreview || fingerprint !== previewFingerprint
                : !idPreview.length)
            }
            onSelect={(student) => {
              router.push(
                recordsQueryUrl(pathname, params.toString(), { student: student?.studentId }),
                { scroll: false }
              );
              setCertificatePreview(null);
              setTransitionId('');
              if (student && kind === 'ids' && fixedKind !== 'ids') {
                setBatch((previous) =>
                  previous.some((s) => s.studentId === student.studentId)
                    ? previous
                    : [...previous, student].slice(0, 100)
                );
                setIdPreview([]);
              }
            }}
            onCertificateTypeChange={(value) => {
              setCertificateType(value);
              setCertificatePreview(null);
            }}
            onReasonChange={setReason}
            onTransitionChange={setTransitionId}
            onRemoveStudent={(id) => {
              setBatch((previous) => previous.filter((s) => s.studentId !== id));
              setIdPreview([]);
            }}
            onPreview={prepare}
            onIssue={issue}
          />
          {certificateType === 3 &&
            kind === 'certificates' &&
            !hasGrantedPermission(permissions, 'Students.Records.Transitions.View') && (
              <Alert severity="info">
                Leaving certificates require access to the linked exit case. Contact a staff member
                with transition access.
              </Alert>
            )}
          {failure && (
            <Alert severity="error" onClose={() => setFailure(null)}>
              {failure}
            </Alert>
          )}
          {query.isError && (
            <Alert severity="error" action={<Button onClick={() => query.refetch()}>Retry</Button>}>
              Issue history could not be loaded.
            </Alert>
          )}
          {(busy || query.isFetching) && <LinearProgress aria-label="Loading documents" />}
          {certificatePreview && fingerprint === previewFingerprint && (
            <Paper variant="outlined" sx={{ p: 1.5 }}>
              <Typography variant="subtitle2">
                Preview for {certificatePreview.student.studentName}
              </Typography>
              <Typography variant="body2">
                {certificatePreview.template.renderedHeaderContent}
              </Typography>
              <Typography variant="body2">
                {certificatePreview.template.renderedFooterContent}
              </Typography>
            </Paper>
          )}
          {idPreview.length > 0 && (
            <Box
              sx={{ maxHeight: 240, overflow: 'auto', flexShrink: 0 }}
              aria-label="Identity card preview"
            >
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                {idPreview.map((card) => (
                  <Paper
                    key={card.studentId}
                    variant="outlined"
                    sx={{ p: 1.5, minWidth: 240, maxWidth: 320 }}
                  >
                    <Typography variant="subtitle2">{card.templateSnapshot.schoolName}</Typography>
                    <Typography variant="caption">{card.templateSnapshot.headerText}</Typography>
                    {card.templateSnapshot.showPhoto && (
                      <Typography variant="caption" display="block">
                        {card.hasPhoto
                          ? 'Photo on file will be included.'
                          : 'No student photo on file.'}
                      </Typography>
                    )}
                    {card.templateSnapshot.fields.map((field) => (
                      <Typography key={field} variant="body2">
                        {field.replace(/([A-Z])/g, ' $1').trim()}:{' '}
                        {card.studentSnapshot[field] ?? '—'}
                      </Typography>
                    ))}
                    <Typography variant="caption">{card.templateSnapshot.footerText}</Typography>
                  </Paper>
                ))}
              </Stack>
            </Box>
          )}
          <CustomizableTable
            tableId={`student-record-${kind}-history`}
            tableTitle="Issued document history"
            columns={columns}
            data={history}
            isLoading={query.isLoading}
            isPagination
            isSearch
            noDataText={
              studentId
                ? 'No documents have been issued for this student.'
                : 'Select a student to see issued history.'
            }
            wrapperProps={{
              sx: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' },
            }}
            tableContainerProps={{ sx: { height: 1 } }}
          />
        </Box>
      )}
      <RecordDocumentTemplates
        open={templatesOpen}
        kind={kind}
        certificateType={certificateType}
        onClose={() => setTemplatesOpen(false)}
      />
      <CustomDialog fullScreen hasForm={false} title="Create Student I-Card" open={builderOpen} handleClose={() => setBuilderOpen(false)}>
        <Box sx={{ flex: 1, minHeight: 0, p: 1, bgcolor: 'background.neutral' }}>
          {builderOpen && <StudentICardBuilder onClose={() => setBuilderOpen(false)} />}
        </Box>
      </CustomDialog>
      <CustomDialog
        open={!!decision}
        handleClose={() => {
          if (!busy) {
            setDecision(null);
            copyKey.current = '';
            decisionForm.resetForm();
          }
        }}
        title={`${decision?.action ?? 'Review'} ${decision?.row.number ?? 'document'}`}
        maxWidth="sm"
        disableClose={busy}
        hasUnsavedChanges={decisionForm.dirty}
        onSubmit={(event) => {
          event.preventDefault();
          decisionForm.submitForm();
        }}
      >
        <DialogScrollContent>
          <FormBusyRegion busy={busy} label="Recording document decision…">
            <Stack spacing={2}>
              <Typography variant="body2">
                {decision?.action === 'Void'
                  ? 'This document will remain in history and further downloads will be blocked.'
                  : decision?.action === 'Duplicate'
                    ? 'Create a new numbered copy from the saved original details.'
                    : 'Print the original saved document with the same number.'}
              </Typography>
              <TextField
                disabled={busy}
                label="Reason"
                required
                multiline
                minRows={2}
                name="reason"
                value={decisionForm.values.reason}
                onChange={decisionForm.handleChange}
                onBlur={decisionForm.handleBlur}
                error={!!decisionForm.touched.reason && !!decisionForm.errors.reason}
                helperText={decisionForm.touched.reason && decisionForm.errors.reason}
              />
              {failure && <Alert severity="error">{failure}</Alert>}
            </Stack>
          </FormBusyRegion>
        </DialogScrollContent>
        <DialogActions>
          <Button
            disabled={busy}
            onClick={() => {
              setDecision(null);
              copyKey.current = '';
              decisionForm.resetForm();
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color={decision?.action === 'Void' ? 'error' : 'primary'}
            type="submit"
            loading={busy}
            disabled={busy}
          >
            {decision?.action ?? 'Save'}
          </Button>
        </DialogActions>
      </CustomDialog>
    </Box>
  );
}
