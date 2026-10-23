import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import base64ToFile from 'src/utils/base64ToFile';
import UploadButton from 'src/components/upload-button';
import { useResponsive } from 'src/hooks/use-responsive';
import { shikshaMitraToast } from 'src/components/toast';
import { useRef, useMemo, useState, useEffect } from 'react';
import { hasGrantedPermission } from 'src/utils/permissions';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { StudentFeedback } from 'src/components/student-feedback';
import CustomizableTable from 'src/components/customizabaleTable';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Stack, Button, Skeleton, Typography, LinearProgress } from '@mui/material';
import { useGetStudentAdmissionEvidenceQuery } from 'src/redux/student/admissions/student-admission-evidence-api';
import { useDownloadAdmissionDocumentMutation } from 'src/redux/student/admissions/admission-document-download-api';
import { useDocumentPermissions } from 'src/screens/student/admissions/document-verification/use-document-permissions';
import { DocumentEvidenceHistory } from 'src/screens/student/admissions/document-verification/document-evidence-history';
import {
  useGetProfileStudentDocumentQuery,
  useGetProfileStudentDocumentsQuery,
  useUploadProfileStudentDocumentMutation,
  useDownloadProfileStudentDocumentMutation,
} from 'src/redux/student/records/student-profile-information-api';

import {
  buildStudentDocumentRows,
  studentDocumentUploadError,
  studentDocumentUploadPayload,
  studentStatusAllowsDocumentUpload,
  canRetainStudentDocumentsAfterFailure,
} from './student-document-table-model';

import type { StudentTabsComponentType } from '.';
import type { StudentDocumentTableRow } from './student-document-table-model';

const statusOptions = [
  'Uploaded',
  'Missing',
  'Pending review',
  'Accepted',
  'Needs resubmission',
  'Waived',
].map((value) => ({ value, label: value }));
const failureMessage = (failure: unknown, fallback: string) => {
  const { detail } = parseApiProblemDetail(failure);
  return detail === 'Something went wrong' ? fallback : detail;
};

function StudentDocumentPreview({
  studentId,
  documentId,
}: {
  studentId: string;
  documentId: string;
}) {
  const query = useGetProfileStudentDocumentQuery({ studentId, documentId });
  const file = query.currentData;
  const url = useMemo(() => {
    if (!file?.content || !file.contentType) return '';
    try {
      return URL.createObjectURL(base64ToFile(`data:${file.contentType};base64,${file.content}`));
    } catch {
      return '';
    }
  }, [file]);
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url]
  );
  if (query.isLoading || (query.isFetching && !file))
    return <Skeleton variant="rounded" height={320} />;
  if (query.isError || !url)
    return (
      <StudentFeedback
        notificationKey="STU-0740"
        presentation="toast"
        severity="error"
        action={
          <Button size="small" color="inherit" onClick={query.refetch}>
            Retry preview
          </Button>
        }
      >
        Unable to preview this document.
      </StudentFeedback>
    );
  if (!file?.contentType.startsWith('image/') && file?.contentType !== 'application/pdf')
    return (
      <StudentFeedback notificationKey="STU-0741" presentation="inline" severity="info">
        Preview is unavailable for this file format. Use Download to open the document.
      </StudentFeedback>
    );
  return file?.contentType === 'application/pdf' ? (
    <Box
      component="iframe"
      src={url}
      title="Student document"
      sx={{ width: 1, height: '65vh', border: 0 }}
    />
  ) : (
    <Box
      component="img"
      src={url}
      alt="Student document"
      sx={{ width: 1, maxHeight: '65vh', objectFit: 'contain' }}
    />
  );
}

const Document = ({ student }: StudentTabsComponentType) => {
  const compact = useResponsive('down', 'md');
  const studentId = student.id;
  const grants = useSelector((state: RootState) => state.auth.permissions);
  const admissionPermissions = useDocumentPermissions();
  const canView = hasGrantedPermission(grants, 'Students.Records.StudentList.View');
  const registrationAllowsUpload = studentStatusAllowsDocumentUpload(student.status);
  const canUpload =
    registrationAllowsUpload && hasGrantedPermission(grants, 'Students.Records.StudentList.Add');
  const canViewEvidence = canView && admissionPermissions.view;
  const documents = useGetProfileStudentDocumentsQuery(
    { studentId },
    { skip: !studentId || !canView, refetchOnMountOrArgChange: true, refetchOnReconnect: true }
  );
  const evidence = useGetStudentAdmissionEvidenceQuery(studentId, {
    skip: !studentId || !canViewEvidence,
    refetchOnMountOrArgChange: true,
    refetchOnReconnect: true,
  });
  const [uploadDocument] = useUploadProfileStudentDocumentMutation();
  const [downloadDocument] = useDownloadProfileStudentDocumentMutation();
  const [downloadEvidence] = useDownloadAdmissionDocumentMutation();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const activeStudent = useRef(studentId);
  const busyUpload = useRef(false);
  const busyDownload = useRef(false);
  activeStudent.current = studentId;
  useEffect(() => {
    activeStudent.current = studentId;
    setSelectedId(null);
    setUploadErrors({});
    setUploadingId(null);
    setDownloadingId(null);
    return () => {
      activeStudent.current = '';
    };
  }, [studentId]);
  const data = useMemo(
    () =>
      buildStudentDocumentRows(
        canView &&
          (!documents.isError || canRetainStudentDocumentsAfterFailure(documents.error)) &&
          Array.isArray(documents.currentData)
          ? documents.currentData
          : [],
        canViewEvidence &&
          (!evidence.isError || canRetainStudentDocumentsAfterFailure(evidence.error))
          ? (evidence.currentData ?? [])
          : []
      ),
    [
      canView,
      canViewEvidence,
      documents.currentData,
      documents.isError,
      documents.error,
      evidence.currentData,
      evidence.isError,
      evidence.error,
    ]
  );
  const selected = data.find((row) => row.id === selectedId);

  const upload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    row: StudentDocumentTableRow
  ) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file || !row.document || !canUpload || busyUpload.current) return;
    busyUpload.current = true;
    setUploadingId(row.id);
    setUploadErrors((current) => {
      const next = { ...current };
      delete next[row.id];
      return next;
    });
    try {
      const body = await studentDocumentUploadPayload(file, row.document.documentTypeId);
      if (activeStudent.current !== studentId) return;
      await uploadDocument({ studentId, body }).unwrap();
      if (activeStudent.current === studentId)
        shikshaMitraToast.success({ message: `${row.name} uploaded successfully` });
    } catch (failure) {
      if (activeStudent.current === studentId) {
        const message =
          studentDocumentUploadError(failure, row.name) ??
          failureMessage(failure, `Failed to upload ${row.name}.`);
        setUploadErrors((current) => ({ ...current, [row.id]: message }));
        shikshaMitraToast.error({ message });
      }
    } finally {
      busyUpload.current = false;
      if (activeStudent.current === studentId) setUploadingId(null);
      input.value = '';
    }
  };

  const download = async (row: StudentDocumentTableRow) => {
    if (busyDownload.current || !row.canDownload) return;
    busyDownload.current = true;
    setDownloadingId(row.id);
    try {
      if (row.evidence) {
        const latest = row.evidence.at(-1)!;
        await downloadEvidence({
          studentId,
          evidenceId: latest.id,
          fileName: latest.fileName!,
        }).unwrap();
      } else if (row.document?.uploadedDocumentId) {
        await downloadDocument({
          studentId,
          documentId: row.document.uploadedDocumentId,
        }).unwrap();
      }
    } catch (failure) {
      if (activeStudent.current === studentId)
        shikshaMitraToast.error({
          message: failureMessage(failure, 'Unable to download this document. Please try again.'),
        });
    } finally {
      busyDownload.current = false;
      if (activeStudent.current === studentId) setDownloadingId(null);
    }
  };

  const columns: IColumn[] = [
    {
      id: 'name',
      label: 'Name',
      minWidth: compact ? 136 : 180,
      width: compact ? 136 : undefined,
      cellSx: compact ? { px: 1, whiteSpace: 'normal' } : undefined,
      headerSx: compact ? { px: 1 } : undefined,
      render: (_, row) => (
        <Stack spacing={0.5}>
          <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
            {row.name}
          </Typography>
          {uploadErrors[row.id] && (
            <Typography variant="caption" color="error.main" sx={{ overflowWrap: 'anywhere' }}>
              {uploadErrors[row.id]}
            </Typography>
          )}
        </Stack>
      ),
    },
    {
      id: 'source',
      label: 'Source',
      minWidth: 110,
      filterType: 'enum',
      enumOptions: ['Student record', 'Admission'].map((value) => ({ label: value, value })),
    },
    {
      id: 'file',
      label: 'File',
      minWidth: 180,
      cellSx: { overflowWrap: 'anywhere', whiteSpace: 'normal' },
    },
    {
      id: 'recordedAt',
      label: 'Recorded',
      minWidth: 155,
      filterType: 'dateTime',
      render: (value) => (value ? fDateTime(value) : '—'),
    },
    {
      id: 'status',
      label: 'Status',
      width: compact ? 80 : 120,
      minWidth: compact ? 80 : 120,
      cellSx: { px: 1 },
      headerSx: { px: 1 },
      sticky: !compact,
      stickyPosition: 'right',
      filterType: 'enum',
      enumOptions: statusOptions,
      render: (value) => (
        <Label
          color={
            value === 'Accepted' || value === 'Uploaded'
              ? 'success'
              : value === 'Needs resubmission'
                ? 'error'
                : value === 'Missing' || value === 'Pending review'
                  ? 'warning'
                  : 'default'
          }
          sx={{
            whiteSpace: 'normal',
            textAlign: 'center',
            maxWidth: '100%',
            overflowWrap: 'anywhere',
            height: 'auto',
            minHeight: 24,
            py: 0.25,
          }}
        >
          {value}
        </Label>
      ),
    },
    {
      id: 'actions',
      label: 'Actions',
      width: compact ? 156 : 126,
      minWidth: compact ? 156 : 126,
      cellSx: { px: 1 },
      headerSx: { px: 1 },
      align: 'right',
      sticky: true,
      stickyPosition: 'right',
      isFilter: false,
      isSort: false,
      excludeFromExport: true,
      render: (_, value) => {
        const row = value as StudentDocumentTableRow;
        return (
          <ThreeDotsActions
            showViewIcon
            viewIcon="mdi:eye-outline"
            viewLabel={`View ${row.name}`}
            disableViewIcon={!row.canView}
            handleViewClick={() => setSelectedId(row.id)}
            showThreeDots={Boolean(row.document)}
            moreLabel={`More actions for ${row.name}`}
            sx={{
              justifyContent: 'flex-end',
              gap: compact ? 0.5 : 1,
              ...(compact && {
                '& .MuiIconButton-root': { width: 44, height: 44, minWidth: 44, minHeight: 44 },
              }),
            }}
            directActions={[
              {
                id: 'download',
                label: `Download ${row.name}`,
                icon: 'mdi:download',
                disabled: !row.canDownload || Boolean(downloadingId),
                tooltip: !row.canDownload
                  ? 'No downloadable file is available.'
                  : downloadingId === row.id
                    ? 'Downloading…'
                    : `Download ${row.name}`,
                onClick: async () => {
                  await download(row);
                },
              },
            ]}
            actions={({ popover }) =>
              row.document ? (
                <Box sx={{ p: 1 }}>
                  <UploadButton
                    size="small"
                    fullWidth
                    disabled={!canUpload || Boolean(uploadingId)}
                    startIcon={<Iconify icon="mdi:upload" />}
                    fileInputProps={{
                      'aria-label': `Upload ${row.name}`,
                      disabled: !canUpload || Boolean(uploadingId),
                    }}
                    onChange={async (event) => {
                      if (event.currentTarget.files?.length) {
                        await upload(event, row);
                        popover.onClose();
                      }
                    }}
                  >
                    {uploadingId === row.id
                      ? 'Uploading…'
                      : row.document.isUploaded
                        ? 'Upload replacement'
                        : 'Upload document'}
                  </UploadButton>
                  {!canUpload && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', maxWidth: 240, mt: 1 }}
                    >
                      {registrationAllowsUpload
                        ? 'Student record update access is required to upload documents.'
                        : 'Student documents can be uploaded during registration.'}
                    </Typography>
                  )}
                </Box>
              ) : null
            }
          />
        );
      },
    },
  ];
  const isLoading = documents.isLoading || (canViewEvidence && evidence.isLoading);
  const isFetching = documents.isFetching || (canViewEvidence && evidence.isFetching);
  const failures = (
    <Stack spacing={1} sx={{ width: 1 }}>
      {documents.isError && (
        <StudentFeedback
          notificationKey="STU-0745"
          presentation="toast"
          severity="error"
          action={
            <Button size="small" color="inherit" onClick={documents.refetch}>
              Retry Student Documents
            </Button>
          }
        >
          Unable to load student documents.
        </StudentFeedback>
      )}
      {canViewEvidence && evidence.isError && (
        <StudentFeedback
          notificationKey="STU-0746"
          presentation="toast"
          severity="error"
          action={
            <Button size="small" color="inherit" onClick={evidence.refetch}>
              Retry Admission Documents
            </Button>
          }
        >
          Unable to load admission documents.
        </StudentFeedback>
      )}
    </Stack>
  );
  return (
    <Box sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
      {!canView ? (
        <StudentFeedback notificationKey="STU-0747" presentation="inline" severity="info">
          Student document access is unavailable.
        </StudentFeedback>
      ) : (
        <>
          {isFetching && !isLoading && <LinearProgress aria-label="Refreshing student documents" />}
          {!canViewEvidence && (
            <StudentFeedback notificationKey="STU-0748" presentation="inline" severity="info">
              Admission document access is required to view retained admission documents.
            </StudentFeedback>
          )}
          {data.length > 0 &&
            (documents.isError || (canViewEvidence && evidence.isError)) &&
            failures}
          <CustomizableTable
            key={studentId}
            tableTitle="Student documents"
            tableId="student-profile-documents"
            data={data}
            columns={columns}
            isLoading={isLoading}
            searchFieldProps={{
              placeholder: 'Search documents...',
              inputProps: { 'aria-label': 'Search student documents' },
            }}
            searchableFields={['name', 'source', 'file', 'status']}
            noDataText="No documents are available for this student."
            errorContent={
              !isLoading &&
              data.length === 0 &&
              (documents.isError || (canViewEvidence && evidence.isError))
                ? failures
                : undefined
            }
            wrapperProps={{
              sx: {
                flex: 1,
                minHeight: 0,
                minWidth: 0,
                ...(compact && {
                  '& .MuiPaper-root:has(> .MuiTablePagination-root)': {
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    gap: 0.5,
                    p: 1,
                  },
                  '& .MuiPaper-root:has(> .MuiTablePagination-root) > .MuiFormControlLabel-root': {
                    alignSelf: 'flex-start',
                    m: 0,
                    minHeight: 44,
                  },
                  '& .MuiTablePagination-root': { width: 1, overflow: 'visible' },
                  '& .MuiTablePagination-root .MuiTablePagination-toolbar': {
                    height: 'auto',
                    minHeight: 44,
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    columnGap: 0.5,
                    rowGap: 0.5,
                    px: 0,
                  },
                  '& .MuiTablePagination-root .MuiTablePagination-spacer': { display: 'none' },
                  '& .MuiTablePagination-root .MuiTablePagination-selectLabel': { m: 0 },
                  '& .MuiTablePagination-root .MuiTablePagination-input': { m: 0, minWidth: 56 },
                  '& .MuiTablePagination-root .MuiTablePagination-displayedRows': {
                    flex: '1 0 calc(100% - 96px)',
                    m: 0,
                  },
                  '& .MuiTablePagination-root .MuiTablePagination-actions': {
                    display: 'flex',
                    flexShrink: 0,
                    m: 0,
                  },
                  '& .MuiTablePagination-root .MuiTablePagination-actions .MuiIconButton-root': {
                    width: 44,
                    height: 44,
                    minWidth: 44,
                    minHeight: 44,
                  },
                }),
              },
            }}
            tableContainerProps={{
              'aria-label': 'Student documents',
              sx: { height: 1, minHeight: 0 },
            }}
          />
        </>
      )}
      {selected && canView && (
        <CustomDialog
          open
          title={selected.name}
          handleClose={() => setSelectedId(null)}
          hasForm={false}
          guardUnsavedChanges={false}
          maxWidth={selected.evidence ? 'sm' : 'md'}
        >
          <DialogScrollContent>
            {selected.evidence && canViewEvidence ? (
              <DocumentEvidenceHistory
                evidence={selected.evidence}
                studentId={studentId}
                allowDownload={admissionPermissions.download}
              />
            ) : selected.document?.uploadedDocumentId ? (
              <StudentDocumentPreview
                studentId={studentId}
                documentId={selected.document.uploadedDocumentId}
              />
            ) : null}
          </DialogScrollContent>
        </CustomDialog>
      )}
    </Box>
  );
};

export default Document;
