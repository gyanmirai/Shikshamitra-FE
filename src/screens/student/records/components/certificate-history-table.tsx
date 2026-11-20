import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type {
  CertificateHistory,
  CertificateResponse,
} from 'src/redux/student/records/student-record-documents-api';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useRef, useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import { fDate, formatStr } from 'src/utils/format-time';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import { StudentFeedback } from 'src/components/student-feedback';
import { FormSectionCard } from 'src/components/form-section-card';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import { Box, Button, TextField, Typography, DialogActions } from '@mui/material';
import {
  downloadRecordPdf,
  useVoidRecordDocumentMutation,
  useLazyGetRecordCertificateQuery,
  useReprintRecordDocumentMutation,
  useDownloadRecordDocumentMutation,
  useGetRecordCertificateHistoryQuery,
  useDuplicateRecordCertificateMutation,
} from 'src/redux/student/records/student-record-documents-api';

import { recordsQueryUrl } from '../records-url-state';
import CertificatePreviewDialog from './certificate-preview-dialog';

type Decision = { action: 'Reprint' | 'Issue duplicate' | 'Void'; certificate: CertificateHistory };

export default function CertificateHistoryTable({ studentId }: { studentId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canView = hasGrantedPermission(permissions, 'Students.Records.Certificates.View');
  const canIssue =
    canView && hasGrantedPermission(permissions, 'Students.Records.Certificates.Add');
  const query = useGetRecordCertificateHistoryQuery(studentId, { skip: !canView || !studentId });
  const [getCertificate, getState] = useLazyGetRecordCertificateQuery();
  const [download, downloadState] = useDownloadRecordDocumentMutation();
  const [reprint, reprintState] = useReprintRecordDocumentMutation();
  const [duplicate, duplicateState] = useDuplicateRecordCertificateMutation();
  const [voidCertificate, voidState] = useVoidRecordDocumentMutation();
  const [view, setView] = useState<CertificateResponse | null>(null);
  const [decision, setDecision] = useState<Decision | null>(null);
  const duplicateKey = useRef('');
  const pendingDuplicates = useRef(new Map<string, { key: string; reason: string }>());
  const pendingDuplicate =
    decision?.action === 'Issue duplicate' &&
    pendingDuplicates.current.has(decision.certificate.certificateId);
  const actionPending = useRef(false);
  const [pendingAction, setPendingAction] = useState(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const busy =
    pendingAction ||
    downloadState.isLoading ||
    reprintState.isLoading ||
    duplicateState.isLoading ||
    voidState.isLoading;
  const form = useFormik({
    initialValues: { reason: '' },
    validationSchema: Yup.object({
      reason: Yup.string()
        .trim()
        .required('Enter a reason.')
        .min(5, 'Enter at least 5 characters.')
        .max(2000, 'Use no more than 2000 characters.'),
    }),
    onSubmit: async ({ reason }) => {
      if (!canIssue || !decision || actionPending.current) return;
      actionPending.current = true;
      setPendingAction(true);
      const id = decision.certificate.certificateId;
      try {
        if (decision.action === 'Reprint') {
          const pdf = await reprint({ kind: 'certificates', id, reason: reason.trim() }).unwrap();
          if (mounted.current)
            downloadRecordPdf(pdf, `${decision.certificate.certificateNumber}.pdf`);
        } else if (decision.action === 'Void') {
          await voidCertificate({ kind: 'certificates', id, reason: reason.trim() }).unwrap();
        } else {
          duplicateKey.current ||= crypto.randomUUID();
          pendingDuplicates.current.set(id, { key: duplicateKey.current, reason: reason.trim() });
          const certificate = await duplicate({
            id,
            reason: reason.trim(),
            idempotencyKey: duplicateKey.current,
          }).unwrap();
          pendingDuplicates.current.delete(id);
          if (mounted.current) setView(certificate);
        }
        if (mounted.current) {
          shikshaMitraToast.success({ message: `${decision.action} recorded.` });
          closeDecision();
        }
      } catch {
        if (mounted.current)
          shikshaMitraToast.error({
            message:
              decision.action === 'Issue duplicate'
                ? 'The duplicate could not be confirmed and may already have been issued. Retry this request to recover it safely, or review student history.'
                : `${decision.action} could not be completed. Your reason is retained; try again.`,
          });
      } finally {
        actionPending.current = false;
        if (mounted.current) setPendingAction(false);
      }
    },
  });
  const guard = useUnsavedNavigation(!!decision && (form.dirty || !!pendingDuplicate), {
    push: router.push,
    blockNavigation: busy || form.isSubmitting,
    guardContextChanges: true,
    description: pendingDuplicate
      ? 'The duplicate may already have been issued. Retry this request or review student history before starting another. Closing does not cancel an issued certificate.'
      : undefined,
  });
  const closeDecision = () => {
    setDecision(null);
    duplicateKey.current = '';
    form.resetForm();
  };
  const requestClose = () => guard.requestNavigation(closeDecision);
  const openDecision = (action: Decision['action'], certificate: CertificateHistory) => {
    const pending =
      action === 'Issue duplicate'
        ? pendingDuplicates.current.get(certificate.certificateId)
        : undefined;
    duplicateKey.current = pending?.key ?? '';
    form.resetForm({ values: { reason: pending?.reason ?? '' } });
    setDecision({ action, certificate });
  };
  const read = async (certificate: CertificateHistory) => {
    try {
      const data = await getCertificate(certificate.certificateId).unwrap();
      if (mounted.current) setView(data);
    } catch {
      if (mounted.current)
        shikshaMitraToast.error({
          message: 'The saved certificate could not be opened. Try View again.',
        });
    }
  };
  const downloadSaved = async (certificate: CertificateHistory) => {
    try {
      const pdf = await download({ kind: 'certificates', id: certificate.certificateId }).unwrap();
      if (mounted.current) downloadRecordPdf(pdf, `${certificate.certificateNumber}.pdf`);
    } catch {
      if (mounted.current)
        shikshaMitraToast.error({
          message: 'The certificate PDF could not be downloaded. Try Download again.',
        });
    }
  };
  const columns: IColumn[] = [
    {
      id: 'certificateType',
      label: 'Certificate',
      filterType: 'enum',
      enumOptions: [
        { value: 'Bonafide', label: 'Bonafide' },
        { value: 'Character', label: 'Character' },
        { value: 'FirstTrial', label: 'First Trial' },
        { value: 'Leaving', label: 'Leaving' },
      ],
      render: (value) => (value === 'FirstTrial' ? 'First Trial' : value),
    },
    { id: 'certificateNumber', label: 'Certificate number', filterType: 'string' },
    {
      id: 'issueDate',
      label: 'Issued',
      filterType: 'date',
      render: (value) => fDate(value, formatStr.split.date),
    },
    {
      id: 'status',
      label: 'Status',
      filterType: 'enum',
      enumOptions: [
        { value: 'Generated', label: 'Generated' },
        { value: 'Printed', label: 'Printed' },
        { value: 'Cancelled', label: 'Voided' },
      ],
      render: (value) => (
        <Label color={value === 'Cancelled' ? 'error' : 'success'}>
          {value === 'Cancelled' ? 'Voided' : value}
        </Label>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      isFilter: false,
      isSort: false,
      excludeFromExport: true,
      sticky: true,
      render: (_, row) => {
        const certificate = row as CertificateHistory;
        const supported = certificate.supportedActions ?? [];
        const blocked = busy || form.isSubmitting || getState.isFetching;
        const actions = [
          {
            id: 'view',
            label: 'View',
            ariaLabel: `View ${certificate.certificateNumber}`,
            tooltip: `View ${certificate.certificateNumber}`,
            icon: GlobalIcons.eye,
            disabled: blocked,
            onClick: () => read(certificate),
          },
          ...(certificate.status !== 'Cancelled' && supported.includes('Download')
            ? [
                {
                  id: 'download',
                  label: 'Download',
                  ariaLabel: `Download ${certificate.certificateNumber}`,
                  tooltip: `Download ${certificate.certificateNumber}`,
                  icon: GlobalIcons.download,
                  disabled: blocked,
                  onClick: () => downloadSaved(certificate),
                },
              ]
            : []),
          ...(canIssue && certificate.status !== 'Cancelled'
            ? (
                [
                  ['Reprint', 'Reprint', GlobalIcons.printer],
                  ['Duplicate', 'Issue duplicate', GlobalIcons.copy],
                  ['Void', 'Void', GlobalIcons.delete],
                ] as const
              )
                .filter(([key]) => supported.includes(key))
                .map(([key, label, icon]) => ({
                  id: key,
                  label,
                  ariaLabel: `${label} ${certificate.certificateNumber}`,
                  tooltip: `${label} ${certificate.certificateNumber}`,
                  icon,
                  disabled: blocked,
                  onClick: () => openDecision(label, certificate),
                }))
            : []),
        ];
        return (
          <AdaptiveThreeDotsActions
            actions={actions}
            directActionLimit={2}
            collapseOnOverflow={false}
            moreLabel={`More actions for ${certificate.certificateNumber}`}
            placement="right-top"
            sx={{ justifyContent: 'flex-end' }}
          />
        );
      },
    },
  ];
  const requestedType = params.get('type');
  const type =
    requestedType && ['Bonafide', 'Character', 'FirstTrial', 'Leaving'].includes(requestedType)
      ? requestedType
      : 'all';
  const rows = (canView && !query.isError ? (query.currentData ?? []) : []).filter(
    (item) => type === 'all' || item.certificateType === type
  );
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, gap: 1 }}>
      <Box sx={{ px: 1, flexShrink: 0, maxWidth: 280 }}>
        <CustomSelect
          size="small"
          label="Certificate type"
          value={type}
          options={[
            { id: 'all', name: 'All types' },
            ...['Bonafide', 'Character', 'FirstTrial', 'Leaving'].map((id) => ({
              id,
              name: id === 'FirstTrial' ? 'First Trial' : id,
            })),
          ]}
          valueKey="id"
          labelKey="name"
          onChange={(value) =>
            router.replace(
              recordsQueryUrl(pathname, params.toString(), {
                type: value === 'all' ? undefined : String(value),
                student: studentId,
              }),
              { scroll: false }
            )
          }
          formControlProps={{ fullWidth: true }}
        />
      </Box>
      <Box
        sx={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      >
        <CustomizableTable
          tableId="student-certificate-history"
          tableTitle="Student certificate history"
          columns={columns}
          data={rows}
          isSearch
          isPagination
          isLoading={query.isFetching && !query.currentData}
          isRefreshing={query.isFetching && !!query.currentData}
          noDataText="No certificates match this view."
          errorContent={
            query.isError ? (
              <StudentFeedback
                notificationKey="student-certificate-history-failed"
                presentation="toast"
                severity="error"
                toastAction={
                  <Button size="small" color="inherit" onClick={() => query.refetch()}>
                    Retry history
                  </Button>
                }
              >
                Certificate history could not be loaded.
              </StudentFeedback>
            ) : undefined
          }
          wrapperProps={{ sx: { flex: 1, minHeight: 0 } }}
          tableContainerProps={{ sx: { height: 1 } }}
        />
      </Box>
      <CertificatePreviewDialog
        open={!!view}
        title="Generated Certificate"
        certificates={view ? [view] : []}
        closeLocked={busy || form.isSubmitting}
        onClose={() => setView(null)}
      />
      <CustomDialog
        open={!!decision}
        handleClose={requestClose}
        title={`${decision?.action ?? 'Review'} Certificate${decision ? `: ${decision.certificate.certificateNumber}` : ''}`}
        titleInfo={
          decision?.action === 'Reprint'
            ? 'Reprint the saved certificate with its original number. The reason is recorded.'
            : decision?.action === 'Issue duplicate'
              ? 'Issue a new numbered duplicate from the saved certificate snapshot. The reason is recorded.'
              : 'Void this certificate with a recorded reason. A voided certificate cannot be downloaded or reprinted.'
        }
        maxWidth="sm"
        disableClose={busy || form.isSubmitting}
        guardUnsavedChanges={false}
        onSubmit={(event) => {
          event.preventDefault();
          form.submitForm();
        }}
      >
        <DialogScrollContent>
          {pendingDuplicate && (
            <Typography role="status" variant="body2">
              The duplicate may already have been issued. Retry with this saved reason to recover
              the same request.
            </Typography>
          )}
          {!canIssue && (
            <Typography role="alert" variant="body2">
              You no longer have permission to perform this certificate action.
            </Typography>
          )}
          <FormSectionCard
            title="Certificate Action"
            icon={GlobalIcons.admissionDetails}
            descriptionTooltip="Record why this action is needed for the identified certificate."
          >
            <ShakingTextField error={!!form.touched.reason && !!form.errors.reason}>
              <TextField
                fullWidth
                required
                size="small"
                label="Reason"
                name="reason"
                multiline
                minRows={2}
                value={form.values.reason}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                disabled={!canIssue || busy || form.isSubmitting || !!duplicateKey.current}
                error={!!form.touched.reason && !!form.errors.reason}
                helperText={form.touched.reason && form.errors.reason}
              />
            </ShakingTextField>
          </FormSectionCard>
        </DialogScrollContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            disabled={busy || form.isSubmitting}
            onClick={requestClose}
          >
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            color="inherit"
            type="submit"
            disabled={!canIssue || busy || form.isSubmitting}
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            loading={busy || form.isSubmitting}
          >
            {decision?.action ?? 'Submit'}
          </Button>
        </DialogActions>
      </CustomDialog>
      {guard.confirmation}
    </Box>
  );
}
