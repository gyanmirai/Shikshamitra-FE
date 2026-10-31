'use client';

import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';

import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import React, { useRef, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';
import { shikshaMitraToast } from 'src/components/toast';
import { Cancel, CheckCircle } from '@mui/icons-material';
import CustomTooltip from 'src/components/custom-tooltip';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { financePermissions } from 'src/constants/finance-menu';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useConcessionApprovalPreflight } from 'src/screens/finance/hooks/useConcessionApprovalPreflight';
import { ConcessionStatusType } from 'src/enums/concession-status-type';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { isFinanceAdministratorSession } from 'src/utils/finance-admin-auto-approval';
import DocumentPreviewDialog from 'src/components/preview-document/DocumentPreviewDialog';
import {
  Box,
  Tab,
  Tabs,
  Card,
  Grid,
  Stack,
  Paper,
  Button,
  Skeleton,
  TextField,
  Typography,
  IconButton,
  DialogActions,
  FormHelperText,
  CircularProgress,
} from '@mui/material';
import {
  useRejectConcessionRequestMutation,
  useGetStudentConcessionDetailsQuery,
  useUploadConcessionDocumentsMutation,
  useDeleteConcessionApplicationMutation,
  useUploadConcessionDocumentFileMutation,
} from 'src/redux/finance/ConcessionManagement/concessionManagementApi';

import ConcessionItemCard from './ConcessionItemCard';
import StudentInformationAccordion from './StucentConcessionCard';
import ConcessionFeeHeadApprovalView from './ConcessionFeeHeadApprovalView';
import { canDecideConcession } from '../Concession/concessionDecisionEligibility';
import {
  getFileAccept,
  getDocumentConstraintText,
  validateConcessionDocumentFile,
} from '../Concession/Components/concessionDocumentUpload';

import type {
  IRequiredDocument,
  IConcessionRequestItem,
  IViewConcessionRequestProps,
} from './type';

// ─── Reject Reason Dialog ─────────────────────────────────────────────────────

interface IRejectDialogProps {
  open: boolean;
  onClose: () => void;
  selectedItem: IConcessionRequestItem | null;
}

const RejectReasonDialog: React.FC<IRejectDialogProps> = ({ open, onClose, selectedItem }) => {
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  const commandKey = useRef('');

  const [rejectConcession, { isLoading: isRejecting }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useRejectConcessionRequestMutation,
  });

  const handleReject = async () => {
    if (!reason.trim() || reason.trim().length < 10) {
      setReasonError('Reason must be at least 10 characters');
      return;
    }
    setReasonError('');
    const requestId = selectedItem?.studentConcessionTypeRequestId || selectedItem?.id;
    if (!requestId) return;
    await rejectConcession({
      studentConcessionTypeRequestId: requestId,
      body: {
        message: reason.trim(),
        requestConcurrencyStamp: selectedItem?.concurrencyStamp ?? '',
        idempotencyKey: (commandKey.current ||= window.crypto.randomUUID()),
      },
    }).unwrap();
    shikshaMitraToast.success({ message: 'Concession rejected successfully' });
    setReason('');
    commandKey.current = '';
    onClose();
  };

  const handleClose = () => {
    setReason('');
    setReasonError('');
    commandKey.current = '';
    onClose();
  };

  return (
    <>
      <DialogScrollContent>
        <ShakingTextField error={!!reasonError}>
          <TextField
            fullWidth
            multiline
            rows={3}
            size="small"
            label="Reason *"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (e.target.value.trim().length >= 10) setReasonError('');
            }}
            error={!!reasonError}
            helperText={reasonError}
          />
        </ShakingTextField>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          variant="outlined"
          size="small"
          color="inherit"
          onClick={handleClose}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Close
        </Button>
        <LoadingButton
          loading={isRejecting}
          variant="contained"
          size="small"
          color="error"
          onClick={handleReject}
          startIcon={<Cancel fontSize="small" />}
        >
          Reject
        </LoadingButton>
      </DialogActions>
    </>
  );
};

// ─── Stat Card ─────────────────────────────────────────────────────────────────

interface IStatCardProps {
  label: string;
  value: number;
  color?: 'default' | 'warning' | 'success' | 'error';
}

const StatCard: React.FC<IStatCardProps> = ({ label, value, color = 'default' }) => {
  const colorMap = {
    default: 'text.primary',
    warning: 'warning.main',
    success: 'success.main',
    error: 'error.main',
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        flex: 1,
        minWidth: 120,
        p: 1.5,
        borderRadius: 2,
        transition: 'box-shadow 0.2s ease',
        '&:hover': { boxShadow: 4 },
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}
      >
        {label}
      </Typography>
      <Typography variant="h4" sx={{ mt: 0.5, color: colorMap[color], fontWeight: 700 }}>
        {value}
      </Typography>
    </Paper>
  );
};

// ─── Admin Document Dialog ────────────────────────────────────────────────────
// Shows ALL required documents with upload option for pending ones and preview for uploaded ones

interface IAdminDocumentDialogProps {
  open: boolean;
  onClose: () => void;
  item: IConcessionRequestItem;
  /** Used as {id} in PUT /concession-request/{id}/documents */
  studentConcessionTypeRequestId: string;
  onRefresh?: () => void;
  canUpload: boolean;
}

const AdminDocumentDialog: React.FC<IAdminDocumentDialogProps> = ({
  open,
  onClose,
  item,
  studentConcessionTypeRequestId,
  onRefresh,
  canUpload,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{ url: string; name: string } | null>(null);

  const originalDocs = React.useMemo<IRequiredDocument[]>(
    () =>
      item.requiredDocuments?.length
        ? item.requiredDocuments
        : (item.submittedDocuments || []).map((document) => ({
            documentId: document.documentId,
            documentName: document.documentName,
            url: document.url,
            isUploaded: Boolean(document.url),
            isRequired: false,
            maxFileSizeBytes: 0,
            acceptedFormats: [],
          })),
    [item.requiredDocuments, item.submittedDocuments]
  );
  const [localDocs, setLocalDocs] = useState<IRequiredDocument[]>([]);
  const commandKey = useRef('');

  React.useEffect(() => {
    if (open) {
      setLocalDocs(originalDocs);
    }
  }, [open, originalDocs]);

  const [uploadFile, { isLoading: isUploading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUploadConcessionDocumentFileMutation,
  });

  const [saveDocuments, { isLoading: isSaving }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUploadConcessionDocumentsMutation,
  });

  // true when file upload is in progress (save only happens on Submit)
  const isBusy = isUploading || isSaving;
  // track if any local doc was modified vs original (enables Submit)
  const hasChanges = JSON.stringify(localDocs) !== JSON.stringify(originalDocs);

  const handleUploadClick = (docId: string) => {
    setUploadingDocId(docId);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !uploadingDocId) return;

    const requirement = localDocs.find((document) => document.documentId === uploadingDocId);
    const validationError = validateConcessionDocumentFile(file, requirement);
    if (validationError) {
      shikshaMitraToast.error({ message: validationError });
      setUploadingDocId(null);
      return;
    }

    try {
      const response = await uploadFile({
        concessionTypeId: item.concessionTypeId,
        documentId: uploadingDocId,
        file,
      }).unwrap();
      const uploadedUrl = response?.data?.url || response?.url;

      // Only update local state — user must click Submit to persist
      setLocalDocs((prev) =>
        prev.map((d) =>
          d.documentId === uploadingDocId ? { ...d, url: uploadedUrl, isUploaded: true } : d
        )
      );

      shikshaMitraToast.success({ message: 'File selected. Click Submit to save.' });
    } catch (error) {
      console.error('Upload failed:', error);
      shikshaMitraToast.error({ message: 'Upload failed' });
    } finally {
      setUploadingDocId(null);
    }
  };

  const handleSubmit = async () => {
    try {
      const payloadDocs = localDocs
        .filter((document) => document.isUploaded && document.url)
        .map((document) => ({
          documentId: document.documentId,
          url: document.url,
          status: 1,
        }));

      await saveDocuments({
        concessionRequestId: studentConcessionTypeRequestId,
        documents: payloadDocs,
        concurrencyStamp: item.concurrencyStamp,
        idempotencyKey: (commandKey.current ||= window.crypto.randomUUID()),
      }).unwrap();

      shikshaMitraToast.success({ message: 'Documents saved successfully' });
      if (onRefresh) onRefresh();
      onClose();
    } catch (error) {
      console.error('Save failed:', error);
      shikshaMitraToast.error({ message: 'Failed to save documents' });
    }
  };

  const mandatoryDocuments = localDocs.filter((document) => document.isRequired ?? true);
  const allMandatoryUploaded = mandatoryDocuments.every((document) => document.isUploaded);
  const documentHelperId = React.useId();

  return (
    <>
      <CustomDialog
        open={open}
        handleClose={onClose}
        title={
          <Box display="flex" alignItems="center" gap={1}>
            {item.concessionTypeName} — Documents
          </Box>
        }
        maxWidth="sm"
      >
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
          accept={getFileAccept(
            localDocs.find((document) => document.documentId === uploadingDocId)
          )}
        />
        <DialogScrollContent>
          <Stack spacing={1}>
            {localDocs.length === 0 && (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                No documents required for this concession.
              </Typography>
            )}
            {localDocs.map((doc) => (
              <Box
                key={doc.documentId}
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  border: '1px solid',
                  borderColor: doc.isUploaded ? 'success.light' : 'divider',
                  bgcolor: (theme) =>
                    doc.isUploaded
                      ? varAlpha(theme.palette.success.mainChannel, 0.06)
                      : varAlpha(theme.palette.grey['500Channel'], 0.04),
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {doc.documentName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {getDocumentConstraintText(doc)}
                    </Typography>
                    {doc.isUploaded ? (
                      <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                        <CheckCircle sx={{ fontSize: 14, color: 'success.main' }} />
                        <Typography variant="caption" color="success.main" fontWeight={600}>
                          Uploaded
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="caption" color="warning.main" fontWeight={500}>
                        Pending upload
                      </Typography>
                    )}
                  </Box>
                  <Box display="flex" gap={1} alignItems="center">
                    {doc.isUploaded && doc.url && (
                      <IconButton
                        size="small"
                        disabled={isBusy}
                        onClick={() => setPreviewDoc({ url: doc.url!, name: doc.documentName })}
                      >
                        <Iconify icon="carbon:view-filled" />
                      </IconButton>
                    )}
                    {canUpload && (
                      <LoadingButton
                        size="small"
                        variant="outlined"
                        color={doc.isUploaded ? 'inherit' : 'primary'}
                        // show spinner on THIS doc's button while uploading it;
                        // show generic disabled state while saving or uploading another doc
                        loading={
                          (isUploading && uploadingDocId === doc.documentId) ||
                          (isSaving && uploadingDocId === doc.documentId)
                        }
                        disabled={isBusy && uploadingDocId !== doc.documentId}
                        onClick={() => handleUploadClick(doc.documentId)}
                        aria-describedby={
                          (doc.isRequired ?? true) && !doc.isUploaded
                            ? `${documentHelperId}-${doc.documentId}-error`
                            : undefined
                        }
                        startIcon={<Iconify icon="eva:cloud-upload-outline" />}
                      >
                        {doc.isUploaded ? 'Replace' : 'Upload'}
                      </LoadingButton>
                    )}
                  </Box>
                </Box>
                {(doc.isRequired ?? true) && !doc.isUploaded && (
                  <FormHelperText
                    error
                    id={`${documentHelperId}-${doc.documentId}-error`}
                    sx={{ mx: 0 }}
                  >
                    {doc.documentName} is required.{' '}
                    {canUpload ? 'Upload this document before approval.' : ''}
                  </FormHelperText>
                )}
              </Box>
            ))}
          </Stack>
        </DialogScrollContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          {isBusy && (
            <Box display="flex" alignItems="center" gap={1} mr="auto">
              <CircularProgress size={14} />
              <Typography variant="caption" color="text.secondary">
                {isSaving ? 'Saving…' : 'Uploading…'}
              </Typography>
            </Box>
          )}
          <Button
            variant="outlined"
            size="small"
            disabled={isBusy}
            onClick={onClose}
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
          >
            Close
          </Button>
          {canUpload && (
            <LoadingButton
              variant="contained"
              size="small"
              color="primary"
              loading={isSaving}
              disabled={isUploading || !hasChanges}
              onClick={handleSubmit}
              startIcon={<Iconify icon={GlobalIcons.submit} />}
            >
              Submit
            </LoadingButton>
          )}
        </DialogActions>
      </CustomDialog>

      <DocumentPreviewDialog
        open={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        url={previewDoc?.url || ''}
        documentName={previewDoc?.name}
        directUrl
      />
    </>
  );
};

// ─── Concession Item Card ──────────────────────────────────────────────────────

// ─── Main Component ────────────────────────────────────────────────────────────

const ViewConcessionRequest: React.FC<IViewConcessionRequestProps> = ({
  student,
  onEdit,
  onClose,
}) => {
  const theme = useTheme();
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const currentUserId = currentUser?.sub as string | undefined;
  const isAdministrator = isFinanceAdministratorSession({ profile: currentUser });
  const canUploadDocuments = hasGrantedPermission(
    permissions,
    financePermissions.fees.concessionActions.uploadDocument
  );
  const [activeTab, setActiveTab] = useState('pending');
  const { checkApprovalEligibility, isCheckingApproval, checkingRequestId } =
    useConcessionApprovalPreflight();
  const docDialog = useBoolean();
  const deleteDialog = useBoolean();
  const rejectDialog = useBoolean();
  const [selectedItem, setSelectedItem] = useState<IConcessionRequestItem | null>(null);
  const deleteCommandKey = useRef('');
  // approvalView drives the in-place fee-head-wise approval screen
  const [approvalView, setApprovalView] = useState<{
    item: IConcessionRequestItem;
    mode: 'Approve' | 'Reverse';
  } | null>(null);

  const [deleteConcessionApplication, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteConcessionApplicationMutation,
  });
  const {
    data,
    isLoading: isLoadingConcessionData,
    isFetching: isFetchingConcessionData,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentConcessionDetailsQuery,
    params: { studentId: student?.studentId, academicYearId: currentYear?.id },
    options: { skip: !student?.studentId || !currentYear?.id },
  }) as { data: any; isLoading: boolean; isFetching: boolean };

  const allItems: IConcessionRequestItem[] = (data?.items || []).map((item: any) => ({
    ...item,
    id: item.id || item.concessionRequestId,
    studentConcessionTypeRequestId:
      item.studentConcessionTypeRequestId || item.concessionRequestId || item.id,
  }));

  const groupedStatuses: Record<string, ConcessionStatusType[]> = {
    pending: [ConcessionStatusType.Draft, ConcessionStatusType.Pending],
    approved: [
      ConcessionStatusType.Approved,
      ConcessionStatusType.PartiallyReversed,
      ConcessionStatusType.Reversed,
    ],
    rejected: [ConcessionStatusType.Rejected, ConcessionStatusType.Cancelled],
  };
  const filteredItems = allItems.filter((item) =>
    groupedStatuses[activeTab]?.includes(item.status)
  );

  const handleApproveClick = async (item: IConcessionRequestItem) => {
    if (!canDecideConcession(currentUserId, item.requesterId, item.submittedById, isAdministrator))
      return;
    const requestId = item.studentConcessionTypeRequestId || item.id || '';
    if (await checkApprovalEligibility(requestId)) setApprovalView({ item, mode: 'Approve' });
  };

  const handleRejectClick = (item: IConcessionRequestItem) => {
    if (!canDecideConcession(currentUserId, item.requesterId, item.submittedById, isAdministrator))
      return;
    setSelectedItem(item);
    rejectDialog.onTrue();
  };

  const handleOpenDocs = (item: IConcessionRequestItem) => {
    setSelectedItem(item);
    docDialog.onTrue();
  };

  const handleDelete = (item: IConcessionRequestItem) => {
    setSelectedItem(item);
    deleteCommandKey.current = window.crypto.randomUUID();
    deleteDialog.onTrue();
  };

  // ── Fee-head-wise approval screen (in-place) ───────────────────────────────
  if (approvalView) {
    return (
      <ConcessionFeeHeadApprovalView
        selectedItem={approvalView.item}
        mode={approvalView.mode}
        onBack={() => setApprovalView(null)}
      />
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Scrollbar sx={{ flex: 1, minHeight: 0, p: 1.5, containerType: 'inline-size' }}>
        {/* ── Stats Row ─────────────────────────────────────────────── */}
        {isFetchingConcessionData || isLoadingConcessionData ? (
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              p: 2,
              mb: 0.75,
              border: (t) => `1px solid ${t.palette.divider}`,
            }}
          >
            <Box display="flex" alignItems="center" mb={3} gap={1}>
              <Skeleton variant="circular" width={40} height={40} />
              <Box>
                <Skeleton variant="text" width={150} height={24} />
                <Skeleton variant="text" width={100} height={16} />
              </Box>
            </Box>
            <Grid container spacing={3}>
              {[...Array(4)].map((_, i) => (
                <Grid key={i} size={{ xs: 12, md: 3 }}>
                  <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
                </Grid>
              ))}
            </Grid>
          </Paper>
        ) : (
          <StudentInformationAccordion student={data?.studentDetails} />
        )}

        {/* ── Filter Tabs ───────────────────────────────────────────── */}
        <Box mb={1}>
          {isFetchingConcessionData || isLoadingConcessionData ? (
            <Stack direction="row" spacing={2} sx={{ py: 1 }}>
              {[...Array(4)].map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  width={100}
                  height={32}
                  sx={{ borderRadius: 1 }}
                />
              ))}
            </Stack>
          ) : (
            <Tabs
              value={activeTab}
              aria-label="Concession request statuses"
              variant="scrollable"
              scrollButtons="auto"
              onChange={(_e, v) => setActiveTab(v)}
              sx={{
                minHeight: 44,
                '& .MuiTabs-flexContainer': { gap: 2 },
                '& .MuiTab-root': { minHeight: 44, py: 1 },
                '@media (pointer: coarse)': {
                  minHeight: 44,
                  '& .MuiTab-root': { minHeight: 44 },
                },
                flexGrow: 1,
                pl: 0.5,
              }}
            >
              {[
                {
                  label: 'Pending',
                  value: 'pending',
                  count: allItems.filter((i) => groupedStatuses.pending.includes(i.status)).length,
                  color: 'warning' as LabelColor,
                },
                {
                  label: 'Approved',
                  value: 'approved',
                  count: allItems.filter((i) => groupedStatuses.approved.includes(i.status)).length,
                  color: 'success' as LabelColor,
                },
                {
                  label: 'Rejected',
                  value: 'rejected',
                  count: allItems.filter((i) => groupedStatuses.rejected.includes(i.status)).length,
                  color: 'error' as LabelColor,
                },
              ].map((tab) => (
                <Tab
                  key={String(tab.value)}
                  value={tab.value}
                  label={
                    <Box display="flex" justifyContent="center" gap={1} alignItems="center">
                      {tab.label}
                      <Label color={tab.color}>{tab.count}</Label>
                    </Box>
                  }
                />
              ))}
            </Tabs>
          )}
        </Box>

        {/* ── Cards Grid ────────────────────────────────────────────── */}
        {isFetchingConcessionData || isLoadingConcessionData ? (
          <Grid container spacing={1.5}>
            {[...Array(3)].map((_, i) => (
              <Grid
                key={i}
                size={12}
                sx={{ '@container (min-width: 760px)': { width: 'calc((100% - 12px) / 2)' } }}
              >
                <Card variant="outlined" sx={{ borderRadius: 2, height: 320, p: 1 }}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Box display="flex" gap={1} alignItems="center">
                      <Skeleton
                        variant="rectangular"
                        width={36}
                        height={36}
                        sx={{ borderRadius: 1.5 }}
                      />
                      <Box>
                        <Skeleton variant="text" width={120} height={20} />
                        <Skeleton variant="text" width={80} height={14} />
                      </Box>
                    </Box>
                    <Skeleton
                      variant="rectangular"
                      width={60}
                      height={24}
                      sx={{ borderRadius: 1 }}
                    />
                  </Box>
                  <Stack spacing={2}>
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
                    <Skeleton variant="text" width="80%" />
                    <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
                  </Stack>
                  <Box display="flex" gap={1} mt="auto" pt={2}>
                    <Skeleton
                      variant="rectangular"
                      sx={{ flex: 1, height: 32, borderRadius: 1.5 }}
                    />
                    <Skeleton
                      variant="rectangular"
                      sx={{ flex: 1, height: 32, borderRadius: 1.5 }}
                    />
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : filteredItems.length === 0 ? (
          <EmptyContent
            title="No concession applications found"
            description={
              allItems.length > 0
                ? `No ${activeTab} requests for this student. Choose another status tab to view their requests.`
                : 'This student has no concession requests yet.'
            }
            slotProps={{ img: { maxWidth: { xs: 88, sm: 192 } } }}
            sx={{ py: { xs: 4, sm: 6 }, height: 'auto' }}
          />
        ) : (
          <Grid container spacing={1.5} alignItems="flex-start" pb={0.5}>
            {filteredItems.map((item) => (
              <Grid
                key={item.studentConcessionTypeRequestId}
                size={12}
                sx={{ '@container (min-width: 760px)': { width: 'calc((100% - 12px) / 2)' } }}
              >
                <ConcessionItemCard
                  item={item}
                  onEdit={(request) => onEdit?.(request)}
                  onApprove={handleApproveClick}
                  approvalChecking={isCheckingApproval}
                  approvalLoading={
                    checkingRequestId === (item.studentConcessionTypeRequestId || item.id)
                  }
                  onReject={handleRejectClick}
                  onOpenDocs={handleOpenDocs}
                  onDelete={handleDelete}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Scrollbar>

      {/* ── Footer ────────────────────────────────────────────── */}
      <Box
        sx={{
          flexShrink: 0,
          borderTop: `1px solid ${theme.palette.divider}`,
          backdropFilter: 'blur(12px)',
          px: { xs: 2, md: 3 },
          py: 1.5,
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <Button
          variant="outlined"
          size="small"
          color="inherit"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={onClose}
        >
          Cancel
        </Button>
      </Box>
      <ConfirmDialog
        open={deleteDialog.value}
        onClose={() => {
          setSelectedItem(null);
          deleteDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete concession{' '}
            <strong>&quot;{selectedItem?.concessionTypeName}&quot;</strong>?
          </>
        }
        action={
          <LoadingButton
            startIcon={<Iconify icon="mdi:delete-outline" />}
            loading={isDeleteLoading}
            variant="contained"
            color="error"
            size="small"
            onClick={async () => {
              if (!selectedItem) return;
              await deleteConcessionApplication({
                concessionRequestId: selectedItem.studentConcessionTypeRequestId,
                requestConcurrencyStamp: selectedItem.concurrencyStamp,
                idempotencyKey:
                  deleteCommandKey.current ||
                  (deleteCommandKey.current = window.crypto.randomUUID()),
              });
              deleteDialog.onFalse();
              setSelectedItem(null);
            }}
            // startIcon={<Iconify icon={GlobalIcons.delete} />}
          >
            Yes
          </LoadingButton>
        }
      />
      {/* ── Reject Dialog ─────────────────────────────────────────────── */}
      <CustomDialog
        open={rejectDialog.value}
        handleClose={() => {
          rejectDialog.onFalse();
          setSelectedItem(null);
        }}
        maxWidth="xs"
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Reject Concession</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="You can provide a reason for rejecting the concession."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <RejectReasonDialog
          open={rejectDialog.value}
          onClose={() => {
            rejectDialog.onFalse();
            setSelectedItem(null);
          }}
          selectedItem={selectedItem}
        />
      </CustomDialog>

      {/* ── Admin Document Dialog ────────────────────────────────────────────── */}
      {selectedItem && docDialog.value && (
        <AdminDocumentDialog
          open={docDialog.value}
          item={selectedItem}
          studentConcessionTypeRequestId={selectedItem.studentConcessionTypeRequestId}
          canUpload={
            canUploadDocuments &&
            selectedItem.status === ConcessionStatusType.Draft &&
            Boolean(selectedItem.requiredDocuments?.length)
          }
          onClose={() => {
            docDialog.onFalse();
            setSelectedItem(null);
          }}
          onRefresh={() => {}}
        />
      )}
    </Box>
  );
};

export default ViewConcessionRequest;
