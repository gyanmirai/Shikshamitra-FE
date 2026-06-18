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
  useRejectConcessionRequestMutation,
  useGetStudentConcessionDetailsQuery,
  useDeleteConcessionApplicationMutation,
} from 'src/redux/finance/ConcessionManagement/concessionManagementApi';
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

import StudentInformationAccordion from './StucentConcessionCard';
import DocumentDialog from '../Concession/Components/DocumentDialog';
import ConcessionFeeHeadApprovalView from './ConcessionFeeHeadApprovalView';

import type { IConcessionRequestItem, IViewConcessionRequestProps } from './type';

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

// ─── Document Dialog ──────────────────────────────────────────────────────────
// Shared component used from ../Concession/Components/DocumentDialog

// ─── Shared Document Dialog component used ────────────────────────────────────
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

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        // bgcolor: isApproved
        //   ? (theme) => varAlpha(theme.palette.success.mainChannel, 0.04)
        //   : isRejected
        //     ? (theme) => varAlpha(theme.palette.error.mainChannel, 0.04)
        //     : isCancelled
        //       ? (theme) => varAlpha(theme.palette.warning.mainChannel, 0.04)
        //       : 'background.paper',
        // borderColor: isApproved
        //   ? 'success.light'
        //   : isRejected
        //     ? 'error.light'
        //     : isCancelled
        //       ? 'warning.light'
        //       : 'divider',
      }}
    >
      <CardContent sx={{ p: 1.5, flex: 1 }}>
        {/* Header */}
        <Box display="flex" alignItems="flex-start" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1.5}>
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

        {/* Submitted Documents */}
        {item.submittedDocuments?.length > 0 && (
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
              {item.submittedDocuments.map((doc) => (
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

                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewDoc({ url: doc.url, name: doc.documentName });
                    }}
                  >
                    <Visibility sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              ))}
            </Stack>
          </Box>
        )}

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
          px: 1,
          pb: 1,
          display: 'flex',
          gap: 1,
          alignItems: 'flex-start',
        }}
      >
        <LoadingButton
          fullWidth
          size="small"
          variant={isApproved ? 'soft' : 'contained'}
          color="success"
          disabled={isApproved || isRejected || isCancelled}
          startIcon={<CheckCircle fontSize="small" />}
          onClick={() => onApprove(item)}
        >
          Approve
        </LoadingButton>
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

        {isFetchingConcessionData || isLoadingConcessionData ? (
          <Box display="flex" gap={2} mb={3}>
            {[...Array(4)].map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                sx={{ flex: 1, height: 80, borderRadius: 2 }}
              />
            ))}
          </Box>
        ) : data?.concessionBasicDetail ? (
          <Box display="flex" gap={2} mb={1} flexWrap="wrap">
            <StatCard
              label="Total Applications"
              value={data?.concessionBasicDetail.totalApplications}
            />
            <StatCard
              label="Pending Review"
              value={data?.concessionBasicDetail.pendingApplications}
              color="warning"
            />
            <StatCard
              label="Approved"
              value={data?.concessionBasicDetail.approvedApplications}
              color="success"
            />
            <StatCard
              label="Rejected"
              value={data?.concessionBasicDetail.rejectedApplications}
              color="error"
            />
          </Box>
        ) : null}

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
