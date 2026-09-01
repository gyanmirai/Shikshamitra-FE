'use client';

import type { LabelColor } from 'src/components/label';

import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import { formatNumber } from 'src/utils/formate_number';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Cancel, Visibility, CheckCircle } from '@mui/icons-material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import DocumentPreviewDialog from 'src/components/preview-document/DocumentPreviewDialog';
import { ConcessionStatusType, ConcessionStatusTypeColors } from 'src/enums/concession-status-type';
import {
  Box,
  Tab,
  Tabs,
  Card,
  Grid,
  Chip,
  Stack,
  Paper,
  Button,
  Divider,
  Tooltip,
  Skeleton,
  TextField,
  Typography,
  IconButton,
  CardContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import {
  useRejectConcessionRequestMutation,
  useGetStudentConcessionDetailsQuery,
  useUploadConcessionDocumentsMutation,
  useDeleteConcessionApplicationMutation,
  useUploadConcessionDocumentFileMutation,
} from 'src/redux/finance/ConcessionManagement/concessionManagementApi';

import StudentInformationAccordion from './StucentConcessionCard';
import ConcessionFeeHeadApprovalView from './ConcessionFeeHeadApprovalView';
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
      body: { message: reason },
    }).unwrap();
    shikshaMitraToast.success({ message: 'Concession rejected successfully' });
    setReason('');
    onClose();
  };

  const handleClose = () => {
    setReason('');
    setReasonError('');
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
}

const AdminDocumentDialog: React.FC<IAdminDocumentDialogProps> = ({
  open,
  onClose,
  item,
  studentConcessionTypeRequestId,
  onRefresh,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{ url: string; name: string } | null>(null);

  // Local docs state - initialised from requiredDocuments
  const [localDocs, setLocalDocs] = useState<IRequiredDocument[]>([]);

  React.useEffect(() => {
    if (open) {
      setLocalDocs(item.requiredDocuments || []);
    }
  }, [open, item.requiredDocuments]);

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
  const hasChanges = JSON.stringify(localDocs) !== JSON.stringify(item.requiredDocuments || []);

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
        <Box sx={{ p: 2, minHeight: 150 }}>
          <Stack spacing={1.5}>
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
                      startIcon={<Iconify icon="eva:cloud-upload-outline" />}
                    >
                      {doc.isUploaded ? 'Replace' : 'Upload'}
                    </LoadingButton>
                  </Box>
                </Box>
              </Box>
            ))}
          </Stack>

          {!allMandatoryUploaded && mandatoryDocuments.length > 0 && (
            <Box
              mt={2}
              px={1.5}
              py={1}
              sx={{
                borderRadius: 1,
                bgcolor: (theme) => varAlpha(theme.palette.warning.mainChannel, 0.08),
                border: '1px solid',
                borderColor: 'warning.light',
              }}
            >
              <Typography variant="caption" color="warning.dark" fontWeight={600}>
                Upload all mandatory documents before the application can be approved.
              </Typography>
            </Box>
          )}
        </Box>
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
        </DialogActions>
      </CustomDialog>

      <DocumentPreviewDialog
        open={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        url={previewDoc?.url || ''}
        documentName={previewDoc?.name}
      />
    </>
  );
};

// ─── Concession Item Card ──────────────────────────────────────────────────────

interface IConcessionCardProps {
  item: IConcessionRequestItem;
  onApprove: (item: IConcessionRequestItem) => void;
  onReject: (item: IConcessionRequestItem) => void;
  onCancel: (item: IConcessionRequestItem) => void;
  onOpenDocs: (item: IConcessionRequestItem) => void;
  onDelete: (item: IConcessionRequestItem) => void;
}

const ConcessionItemCard: React.FC<IConcessionCardProps> = ({
  item,
  onApprove,
  onReject,
  onCancel,
  onOpenDocs,
  onDelete,
}) => {
  const [previewDoc, setPreviewDoc] = useState<{ url: string; name: string } | null>(null);
  const isApproved = item.status === ConcessionStatusType.Approved;
  const isRejected = item.status === ConcessionStatusType.Rejected;
  const isCancelled = item.status === ConcessionStatusType.Cancelled;
  const statusLabel = ConcessionStatusType[item.status] as keyof typeof ConcessionStatusType;
  const statusColor = ConcessionStatusTypeColors[item.status as ConcessionStatusType] as LabelColor;

  // Use requiredDocuments if available, otherwise fall back to submittedDocuments
  const requiredDocs = item.requiredDocuments || [];
  const uploadedDocs = requiredDocs.filter((d) => d.isUploaded && d.url);
  const mandatoryDocs = requiredDocs.filter((document) => document.isRequired ?? true);
  const allMandatoryDocsUploaded = mandatoryDocs.every((document) => document.isUploaded);
  const pendingCount = mandatoryDocs.filter((document) => !document.isUploaded).length;

  // For cards with no requiredDocuments, fall back to checking submittedDocuments
  const hasRequiredDocs = requiredDocs.length > 0;
  const displayDocs = hasRequiredDocs ? uploadedDocs : (item.submittedDocuments || []).slice(0, 1);

  // Approve should be disabled if any required document is not uploaded
  const approveDisabled = isApproved || isRejected || isCancelled || !allMandatoryDocsUploaded;

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderTop: '4px solid',
        borderTopColor: (theme) =>
          isApproved
            ? theme.vars.palette.success.light
            : isRejected
              ? theme.vars.palette.error.light
              : theme.vars.palette.warning.light,
      }}
    >
      <CardContent sx={{ p: 1.5, flex: 1 }}>
        {/* Header */}
        <Box display="flex" alignItems="flex-start" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <Box>
              <Typography variant="subtitle1" fontWeight={600} lineHeight={1.2}>
                {item.concessionTypeName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(item.createdAt).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </Typography>
            </Box>
          </Box>
          <Label color={statusColor} variant="soft" sx={{ flexShrink: 0 }}>
            {statusLabel}
          </Label>
        </Box>
        <Divider />
        {/* Concession Amount */}
        <Box
          mb={1}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            borderRadius: 1,
          }}
        >
          <Typography variant="body2" fontWeight={700}>
            Concession Amount
          </Typography>
          <Typography variant="h6" fontWeight={800}>
            {formatNumber(item.totalAmount, 'INR')}
          </Typography>
        </Box>

        {/* Documents section - only show uploaded docs + See All */}
        <Box mb={1.5}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.75}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ letterSpacing: 1, fontWeight: 700 }}
              >
                Documents
              </Typography>
              {hasRequiredDocs && (
                <Chip
                  size="small"
                  label={`${uploadedDocs.length}/${requiredDocs.length}`}
                  color={allMandatoryDocsUploaded ? 'success' : 'warning'}
                  sx={{ height: 18, fontSize: '10px' }}
                />
              )}
            </Box>
            {hasRequiredDocs && (
              <Button
                size="small"
                onClick={() => onOpenDocs(item)}
                sx={{ fontSize: '11px', textTransform: 'none', height: 24 }}
              >
                See All
              </Button>
            )}
          </Box>

          {/* Show only uploaded docs (max 1) in the card */}
          {displayDocs.length > 0 ? (
            <Stack spacing={0.5}>
              {(hasRequiredDocs ? displayDocs.slice(0, 1) : displayDocs).map((doc: any) => (
                <Box
                  key={doc.documentId}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 1,
                    bgcolor: (theme) => varAlpha(theme.palette.success.mainChannel, 0.06),
                    border: '1px solid',
                    borderColor: 'success.light',
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <CheckCircle sx={{ fontSize: 14, color: 'success.main' }} />
                    <Typography variant="caption" fontWeight={500}>
                      {doc.documentName}
                    </Typography>
                  </Box>

                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewDoc({ url: doc.url, name: doc.documentName });
                    }}
                  >
                    <Visibility sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              ))}
              {/* Show pending count hint */}
              {hasRequiredDocs && pendingCount > 0 && (
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: (theme) => varAlpha(theme.palette.warning.mainChannel, 0.08),
                  }}
                >
                  <Iconify
                    icon="mdi:clock-outline"
                    width={13}
                    sx={{ color: 'warning.main', flexShrink: 0 }}
                  />
                  <Typography variant="caption" color="warning.dark" fontWeight={500}>
                    {pendingCount} document{pendingCount > 1 ? 's' : ''} pending — click{' '}
                    <strong>See All</strong> to upload
                  </Typography>
                </Box>
              )}
            </Stack>
          ) : hasRequiredDocs ? (
            // No uploaded docs yet
            <Box
              display="flex"
              alignItems="center"
              gap={1}
              sx={{
                px: 1.5,
                py: 0.75,
                borderRadius: 1,
                bgcolor: (theme) => varAlpha(theme.palette.warning.mainChannel, 0.08),
              }}
            >
              <Iconify icon="mdi:file-alert-outline" width={14} sx={{ color: 'warning.main' }} />
              <Typography variant="caption" color="warning.dark" fontWeight={500}>
                No documents uploaded — click <strong>See All</strong> to upload
              </Typography>
            </Box>
          ) : (
            <Typography variant="caption" color="text.disabled">
              No documents required
            </Typography>
          )}
        </Box>

        <DocumentPreviewDialog
          open={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
          url={previewDoc?.url || ''}
          documentName={previewDoc?.name}
        />

        {/* Message */}
        {item.message && (
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1,
              bgcolor: isApproved
                ? (theme) => varAlpha(theme.palette.success.mainChannel, 0.08)
                : (theme) => varAlpha(theme.palette.error.mainChannel, 0.06),
              mb: 1.5,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {isApproved ? 'Approved message:' : 'Remark:'}
            </Typography>
            <Typography variant="body2" fontWeight={500}>
              {item.message}
            </Typography>
          </Box>
        )}

        {/* Approved at */}
        {isApproved && item.approvedAt && (
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            sx={{
              p: 1,
              borderRadius: 1,
              bgcolor: (theme) => varAlpha(theme.palette.success.mainChannel, 0.08),
            }}
          >
            <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
            <Typography variant="caption" color="success.dark" fontWeight={600}>
              Approved on{' '}
              {new Date(item.approvedAt).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </Typography>
          </Box>
        )}
      </CardContent>

      {/* Action Buttons */}
      <Box
        sx={{
          px: 1,
          pb: 1,
          display: 'flex',
          gap: 1,
          alignItems: 'flex-start',
        }}
      >
        {/* Approve button with tooltip when docs are missing */}
        <Tooltip
          title={
            !allMandatoryDocsUploaded && !isApproved && !isRejected && !isCancelled
              ? `Upload all mandatory documents first — click "See All" to upload pending documents`
              : ''
          }
          placement="top"
          arrow
        >
          {/* span needed so tooltip works on disabled button */}
          <span style={{ flex: 1 }}>
            <LoadingButton
              fullWidth
              size="small"
              variant={isApproved ? 'soft' : 'contained'}
              color="success"
              disabled={approveDisabled}
              startIcon={<CheckCircle fontSize="small" />}
              onClick={() => onApprove(item)}
            >
              Approve
            </LoadingButton>
          </span>
        </Tooltip>
        <LoadingButton
          fullWidth
          size="small"
          variant="soft"
          color="error"
          disabled={isApproved || isRejected || isCancelled}
          startIcon={<Cancel fontSize="small" />}
          onClick={() => onReject(item)}
        >
          Reject
        </LoadingButton>
        <LoadingButton
          fullWidth
          size="small"
          variant="soft"
          color="warning"
          disabled={!isApproved}
          startIcon={<Iconify icon="mdi:cancel" width={16} />}
          onClick={() => onCancel(item)}
        >
          Cancel
        </LoadingButton>
        <IconButton
          onClick={() => onDelete(item)}
          color="error"
          disabled={item.status !== ConcessionStatusType.Pending}
          sx={{ mt: -0.5 }}
        >
          <Iconify icon={GlobalIcons.delete} />
        </IconButton>
      </Box>
    </Card>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────

const ViewConcessionRequest: React.FC<IViewConcessionRequestProps> = ({ student, onClose }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('all');
  const docDialog = useBoolean();
  const deleteDialog = useBoolean();
  const rejectDialog = useBoolean();
  const [selectedItem, setSelectedItem] = useState<IConcessionRequestItem | null>(null);
  // approvalView drives the in-place fee-head-wise approval screen
  const [approvalView, setApprovalView] = useState<{
    item: IConcessionRequestItem;
    mode: 'Approve' | 'Cancel';
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
    params: { studentId: student?.studentId },
    options: { skip: !student?.studentId },
  }) as { data: any; isLoading: boolean; isFetching: boolean };

  const allItems: IConcessionRequestItem[] = (data?.items || []).map((item: any) => ({
    ...item,
    id: item.id || item.concessionRequestId,
    studentConcessionTypeRequestId:
      item.studentConcessionTypeRequestId || item.concessionRequestId || item.id,
  }));

  const filteredItems =
    activeTab === 'all' ? allItems : allItems.filter((i) => Number(i.status) === Number(activeTab));

  const handleApproveClick = (item: IConcessionRequestItem) => {
    setApprovalView({ item, mode: 'Approve' });
  };

  const handleRejectClick = (item: IConcessionRequestItem) => {
    setSelectedItem(item);
    rejectDialog.onTrue();
  };

  const handleCancelClick = (item: IConcessionRequestItem) => {
    setApprovalView({ item, mode: 'Cancel' });
  };

  const handleOpenDocs = (item: IConcessionRequestItem) => {
    setSelectedItem(item);
    docDialog.onTrue();
  };

  const handleDelete = (item: IConcessionRequestItem) => {
    setSelectedItem(item);
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
      <Scrollbar sx={{ flex: 1, p: 1 }}>
        {/* ── Stats Row ─────────────────────────────────────────────── */}
        {isFetchingConcessionData || isLoadingConcessionData ? (
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              p: 2,
              mb: 2,
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
              onChange={(_e, v) => setActiveTab(v)}
              sx={{
                '& .MuiTabs-flexContainer': { gap: 2 },
                flexGrow: 1,
                pl: 1,
              }}
            >
              {[
                {
                  label: 'All',
                  value: 'all',
                  count: allItems.length,
                  color: 'default' as LabelColor,
                },
                {
                  label: 'Pending',
                  value: ConcessionStatusType.Pending,
                  count: allItems.filter((i) => i.status === ConcessionStatusType.Pending).length,
                  color: 'warning' as LabelColor,
                },
                {
                  label: 'Approved',
                  value: ConcessionStatusType.Approved,
                  count: allItems.filter((i) => i.status === ConcessionStatusType.Approved).length,
                  color: 'success' as LabelColor,
                },
                {
                  label: 'Rejected',
                  value: ConcessionStatusType.Rejected,
                  count: allItems.filter((i) => i.status === ConcessionStatusType.Rejected).length,
                  color: 'error' as LabelColor,
                },
                {
                  label: 'Cancelled',
                  value: ConcessionStatusType.Cancelled,
                  count: allItems.filter((i) => i.status === ConcessionStatusType.Cancelled).length,
                  color: 'error' as LabelColor,
                },
              ].map((tab) => (
                <Tab
                  key={String(tab.value)}
                  value={tab.value}
                  sx={{ fontSize: '12px' }}
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
          <Grid container spacing={2}>
            {[...Array(3)].map((_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
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
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            py={8}
            gap={1}
          >
            <Iconify
              icon="solar:inbox-line-bold-duotone"
              width={48}
              sx={{ color: 'text.disabled' }}
            />
            <Typography color="text.disabled" variant="body2">
              No concession applications found
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2} pb={1}>
            {filteredItems.map((item) => (
              <Grid key={item.studentConcessionTypeRequestId} size={{ xs: 12, sm: 6, md: 4 }}>
                <ConcessionItemCard
                  item={item}
                  onApprove={handleApproveClick}
                  onReject={handleRejectClick}
                  onCancel={handleCancelClick}
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
            loading={isDeleteLoading}
            variant="contained"
            color="error"
            size="small"
            onClick={async () => {
              await deleteConcessionApplication(selectedItem?.studentConcessionTypeRequestId || '');
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
