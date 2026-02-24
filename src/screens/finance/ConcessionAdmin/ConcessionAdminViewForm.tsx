'use client';

import type { LabelColor } from 'src/components/label';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import { formatNumber } from 'src/utils/formate_number';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ShakingTextField from 'src/components/shaking-text-field';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Cancel, Visibility, CheckCircle } from '@mui/icons-material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { ConcessionStatusType, ConcessionStatusTypeColors } from 'src/enums/concession-status-type';
import {
  Box,
  Tab,
  Tabs,
  Card,
  Grid,
  Stack,
  Paper,
  Button,
  Divider,
  Skeleton,
  TextField,
  Typography,
  IconButton,
  CardContent,
  DialogActions,
} from '@mui/material';
import {
  concessionManagementApi,
  useRejectConcessionRequestMutation,
  useApproveConcessionRequestMutation,
  useGetStudentConcessionDetailsQuery,
  useDeleteConcessionApplicationMutation,
} from 'src/redux/finance/ConcessionManagement/concessionManagementApi';

import StudentInformationAccordion from './StucentConcessionCard';
import DocumentDialog from '../Concession/Components/DocumentDialog';

import type { IConcessionRequestItem, IViewConcessionRequestProps } from './type';

// ─── Reason Dialog ────────────────────────────────────────────────────────────

interface IReasonDialogProps {
  open: boolean;
  mode: 'Approve' | 'Reject';
  onClose: () => void;
  selectedItem: IConcessionRequestItem | null;
}

const ReasonDialog: React.FC<IReasonDialogProps> = ({ open, mode, onClose, selectedItem }) => {
  const isReject = mode === 'Reject';
  const [approveConcession, { isLoading: isApproving }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useApproveConcessionRequestMutation,
  });

  const [rejectConcession, { isLoading: isRejecting }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useRejectConcessionRequestMutation,
  });
  const formik = useFormik({
    initialValues: { reason: '' },
    validationSchema: Yup.object({
      reason: isReject ? Yup.string().required('Reason is required') : Yup.string(),
    }),
    enableReinitialize: true,
    onSubmit: async (values, helpers) => {
      if (isReject) {
        await rejectConcession({
          studentConcessionTypeRequestId: selectedItem?.studentConcessionTypeRequestId,
          body: { message: values.reason },
        }).unwrap();
        shikshaMitraToast.success({ message: 'Concession rejected successfully' });
      } else {
        await approveConcession({
          studentConcessionTypeRequestId: selectedItem?.studentConcessionTypeRequestId,
          body: { message: values.reason },
        }).unwrap();
        shikshaMitraToast.success({ message: 'Concession approved successfully' });
      }
      onClose();
    },
  });

  return (
    <DialogScrollContent>
      <ShakingTextField error={!!(formik.touched.reason && formik.errors.reason)}>
        <TextField
          fullWidth
          multiline
          rows={3}
          size="small"
          label={`Reason${isReject ? ' *' : ' (optional)'}`}
          name="reason"
          value={formik.values.reason}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.reason && Boolean(formik.errors.reason)}
          helperText={formik.touched.reason && formik.errors.reason}
        />
      </ShakingTextField>
      <DialogActions>
        <Button
          variant="outlined"
          size="small"
          onClick={onClose}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Cancel
        </Button>
        <LoadingButton
          loading={isApproving || isRejecting}
          variant="contained"
          size="small"
          disabled={!selectedItem?.isDocumentUploaded}
          color={isReject ? 'error' : 'success'}
          onClick={(e: any) => formik.handleSubmit(e)}
          startIcon={isReject ? <Cancel fontSize="small" /> : <CheckCircle fontSize="small" />}
        >
          {mode}
        </LoadingButton>
      </DialogActions>
    </DialogScrollContent>
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
    <Card
      variant="outlined"
      sx={{
        flex: 1,
        minWidth: 120,
        p: 1,
        borderRadius: 2,
        boxShadow: 'none',
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
    </Card>
  );
};

// ─── Document Dialog ──────────────────────────────────────────────────────────
// Shared component used from ../Concession/Components/DocumentDialog

// ─── Shared Document Dialog component used ────────────────────────────────────
// ─── Concession Item Card ──────────────────────────────────────────────────────

interface IConcessionCardProps {
  item: IConcessionRequestItem;
  onApprove: (item: IConcessionRequestItem) => void;
  onReject: (item: IConcessionRequestItem) => void;
  onOpenDocs: (item: IConcessionRequestItem) => void;
  onDelete: (item: IConcessionRequestItem) => void;
}

const ConcessionItemCard: React.FC<IConcessionCardProps> = ({
  item,
  onApprove,
  onReject,
  onOpenDocs,
  onDelete,
}) => {
  const isApproved = item.status === ConcessionStatusType.Approved;
  const isRejected = item.status === ConcessionStatusType.Rejected;
  const statusLabel = ConcessionStatusType[item.status] as keyof typeof ConcessionStatusType;
  const statusColor = ConcessionStatusTypeColors[item.status as ConcessionStatusType] as LabelColor;

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: isApproved
          ? (theme) => varAlpha(theme.palette.success.mainChannel, 0.04)
          : isRejected
            ? (theme) => varAlpha(theme.palette.error.mainChannel, 0.04)
            : 'background.paper',
        borderColor: isApproved ? 'success.light' : isRejected ? 'error.light' : 'divider',
      }}
    >
      <CardContent sx={{ p: 1, pb: '12px !important', flex: 1 }}>
        {/* Header */}
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Iconify icon="mdi:tag-outline" width={20} sx={{ color: 'primary.main' }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
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

        {/* Fee Heads */}
        {item.feeHeads?.length > 0 && (
          <Box mb={2}>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ letterSpacing: 1, fontWeight: 700, display: 'block', mb: 1 }}
            >
              Fee Heads
            </Typography>
            <Stack spacing={0.75}>
              {item.feeHeads.map((fh) => (
                <Box
                  key={fh.feeHeadId}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="body2" color="text.primary">
                    {fh.feeHeadName}
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="text.secondary">
                    {formatNumber(fh.amount, 'INR')}
                  </Typography>
                </Box>
              ))}
              <Divider sx={{ my: 0.5 }} />
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" fontWeight={700}>
                  Concession Total
                </Typography>
                <Typography variant="body2" fontWeight={800} color="success.main">
                  {formatNumber(item.totalAmount, 'INR')}
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}

        {/* Submitted Documents */}
        <Box mb={2}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ letterSpacing: 1, fontWeight: 700 }}
            >
              Submitted Documents
            </Typography>
            <Button
              size="small"
              onClick={() => onOpenDocs(item)}
              sx={{ fontSize: '11px', textTransform: 'none', height: 24 }}
            >
              See All
            </Button>
          </Box>
          <Stack spacing={0.75}>
            {item.submittedDocuments?.length > 0 ? (
              item.submittedDocuments.map((doc) => (
                <Box
                  key={doc.documentId}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 1,
                    bgcolor: (theme) => varAlpha(theme.palette.grey['500Channel'], 0.06),
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <Iconify
                      icon="mdi:file-document-outline"
                      width={16}
                      sx={{ color: 'text.disabled' }}
                    />
                    <Typography variant="caption" fontWeight={500}>
                      {doc.documentName}
                    </Typography>
                  </Box>
                  {doc.url && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(doc.url, '_blank');
                      }}
                    >
                      <Visibility sx={{ fontSize: 18 }} />
                    </IconButton>
                  )}
                </Box>
              ))
            ) : (
              <Box
                sx={{
                  py: 2,
                  borderRadius: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  bgcolor: (theme) => varAlpha(theme.palette.grey['500Channel'], 0.04),
                  border: '1px dashed',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  No documents submitted
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>

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
            gap={0.75}
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
          px: 2,
          pb: 2,
          display: 'flex',
          gap: 1,
        }}
      >
        <LoadingButton
          fullWidth
          size="small"
          variant={isApproved ? 'soft' : 'contained'}
          color="success"
          disabled={isApproved || isRejected || !item.isDocumentUploaded}
          startIcon={<CheckCircle fontSize="small" />}
          onClick={() => onApprove(item)}
        >
          {isApproved ? 'Approved' : 'Approve'}
        </LoadingButton>
        <LoadingButton
          fullWidth
          size="small"
          variant="soft"
          color="error"
          disabled={isApproved || isRejected || !item.isDocumentUploaded}
          startIcon={<Cancel fontSize="small" />}
          onClick={() => onReject(item)}
        >
          {isRejected ? 'Rejected' : 'Reject'}
        </LoadingButton>
        <IconButton onClick={() => onDelete(item)} color="error">
          <Iconify icon={GlobalIcons.delete} />
        </IconButton>
      </Box>
    </Card>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────

const ViewConcessionRequest: React.FC<IViewConcessionRequestProps> = ({ student, onClose }) => {
  const [activeTab, setActiveTab] = useState('all');
  const confirmDialog = useBoolean();
  const docDialog = useBoolean();
  const deleteDialog = useBoolean();
  const [selectedItem, setSelectedItem] = useState<IConcessionRequestItem | null>(null);
  const [dialogMode, setDialogMode] = useState<'Approve' | 'Reject'>('Approve');
  const [deleteConcessionApplication, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteConcessionApplicationMutation,
  });
  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentConcessionDetailsQuery,
    params: { studentId: student?.studentId },
    options: { skip: !student?.studentId },
  }) as { data: any; isLoading: boolean };

  const stats = data?.concessionBasicDetail;
  const allItems: IConcessionRequestItem[] = data?.items || [];

  const filteredItems =
    activeTab === 'all' ? allItems : allItems.filter((i) => Number(i.status) === Number(activeTab));

  const handleApproveClick = (item: IConcessionRequestItem) => {
    setSelectedItem(item);
    setDialogMode('Approve');
    confirmDialog.onTrue();
  };

  const handleRejectClick = (item: IConcessionRequestItem) => {
    setSelectedItem(item);
    setDialogMode('Reject');
    confirmDialog.onTrue();
  };

  const handleOpenDocs = (item: IConcessionRequestItem) => {
    setSelectedItem(item);
    docDialog.onTrue();
  };

  const handleDelete = (item: IConcessionRequestItem) => {
    setSelectedItem(item);
    deleteDialog.onTrue();
  };

  const { confirmWithUndo } = useConfirmWithUndo();

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Scrollbar sx={{ flex: 1, p: 1 }}>
        {/* ── Stats Row ─────────────────────────────────────────────── */}
        {isLoading ? (
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              p: 2,
              mb: 2,
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box display="flex" alignItems="center" mb={3} gap={1.5}>
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

        {isLoading ? (
          <Box display="flex" gap={2} mb={3}>
            {[...Array(4)].map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                sx={{ flex: 1, height: 80, borderRadius: 2 }}
              />
            ))}
          </Box>
        ) : stats ? (
          <Box display="flex" gap={2} mb={1} flexWrap="wrap">
            <StatCard label="Total Applications" value={stats.totalApplications} />
            <StatCard label="Pending Review" value={stats.pendingApplications} color="warning" />
            <StatCard label="Approved" value={stats.approvedApplications} color="success" />
            <StatCard label="Rejected" value={stats.rejectedApplications} color="error" />
          </Box>
        ) : null}

        {/* ── Filter Tabs ───────────────────────────────────────────── */}
        <Box mb={1}>
          {isLoading ? (
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
        {isLoading ? (
          <Grid container spacing={2}>
            {[...Array(3)].map((_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card variant="outlined" sx={{ borderRadius: 2, height: 320, p: 1 }}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Box display="flex" gap={1.5} alignItems="center">
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
          <Grid container spacing={2}>
            {filteredItems.map((item) => (
              <Grid key={item.studentConcessionTypeRequestId} size={{ xs: 12, sm: 6, md: 4 }}>
                <ConcessionItemCard
                  item={item}
                  onApprove={handleApproveClick}
                  onReject={handleRejectClick}
                  onOpenDocs={handleOpenDocs}
                  onDelete={handleDelete}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Scrollbar>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          display: 'flex',
          justifyContent: 'flex-end',
          boxShadow: 'var(--shadows-10)',
        }}
      >
        <Button variant="outlined" size="small" color="inherit" onClick={onClose}>
          Close
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
            Are you sure you want to delete book{' '}
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
              confirmWithUndo({
                item: selectedItem,
                onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
                  dispatchFn(
                    concessionManagementApi.util.updateQueryData(
                      'getStudentConcessionDetails',
                      undefined,
                      (draft: any) => {
                        const index = draft.items?.findIndex(
                          (b: any) =>
                            b.studentConcessionTypeRequestId ===
                            selectedItem?.studentConcessionTypeRequestId
                        );
                        setDeleteIndex(index);
                        if (index !== -1) {
                          draft.items.splice(index, 1);
                        }
                      }
                    )
                  ),
                onUndoRestore: (dispatchFn, index) =>
                  dispatchFn(
                    concessionManagementApi.util.updateQueryData(
                      'getStudentConcessionDetails',
                      undefined,
                      (draft: any) => {
                        if (!draft.items) return;
                        draft.items.splice(index, 0, selectedItem?.studentConcessionTypeRequestId);
                      }
                    )
                  ),
                onCommit: () =>
                  deleteConcessionApplication(selectedItem?.studentConcessionTypeRequestId || ''),
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
      {/* ── Reason Dialog ────────────────────────────────────────────── */}
      <CustomDialog
        open={confirmDialog.value}
        handleClose={onClose}
        maxWidth="xs"
        title={
          <Box display="flex" alignItems="center" gap={1}>
            {dialogMode === 'Reject' ? (
              <Cancel sx={{ color: 'error.main' }} />
            ) : (
              <CheckCircle sx={{ color: 'success.main' }} />
            )}
            <Typography variant="h6">
              {dialogMode === 'Reject' ? 'Reject Concession' : 'Approve Concession'}
            </Typography>
          </Box>
        }
      >
        <ReasonDialog
          open={confirmDialog.value}
          mode={dialogMode}
          onClose={() => {
            confirmDialog.onFalse();
            setSelectedItem(null);
          }}
          selectedItem={selectedItem}
        />
      </CustomDialog>

      {/* ── Document Dialog ────────────────────────────────────────────── */}
      {selectedItem && (
        <DocumentDialog
          open={docDialog.value}
          concessionId={selectedItem.concessionTypeId}
          concessionName={selectedItem.concessionTypeName}
          studentConcessionRequestId={student?.concessionRequestId}
          submittedDocuments={selectedItem.submittedDocuments}
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
