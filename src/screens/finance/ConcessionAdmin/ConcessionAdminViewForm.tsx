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
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { FeeMonthOptions } from 'src/enums/fee-collection-type';
import ShakingTextField from 'src/components/shaking-text-field';
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
  Checkbox,
  Skeleton,
  TextField,
  Typography,
  IconButton,
  CardContent,
  DialogActions,
} from '@mui/material';
import {
  useCancelConcessionRequestMutation,
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
  mode: 'Approve' | 'Reject' | 'Cancel';
  onClose: () => void;
  selectedItem: IConcessionRequestItem | null;
}

const ReasonDialog: React.FC<IReasonDialogProps> = ({ open, mode, onClose, selectedItem }) => {
  const isReject = mode === 'Reject';
  const isCancel = mode === 'Cancel';
  const needsReason = isReject || isCancel;

  const [approveConcession, { isLoading: isApproving }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useApproveConcessionRequestMutation,
  });

  const [rejectConcession, { isLoading: isRejecting }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useRejectConcessionRequestMutation,
  });

  const [cancelConcession, { isLoading: isCancelling }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCancelConcessionRequestMutation,
  });

  const formik = useFormik({
    initialValues: { reason: '', months: [] as number[] },
    validationSchema: Yup.object({
      reason: needsReason
        ? Yup.string()
            .required('Reason is required')
            .min(10, 'Reason must be at least 10 characters')
        : Yup.string().optional(),
      months: isReject
        ? Yup.array().optional()
        : Yup.array().of(Yup.number()).min(1, 'Please select at least one month'),
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
      const body = { message: values.reason, months: values.months };
      if (isReject) {
        await rejectConcession({
          studentConcessionTypeRequestId: selectedItem?.studentConcessionTypeRequestId,
          body,
        }).unwrap();
        shikshaMitraToast.success({ message: 'Concession rejected successfully' });
      } else if (isCancel) {
        await cancelConcession({
          studentConcessionTypeRequestId: selectedItem?.studentConcessionTypeRequestId,
          body,
        }).unwrap();
        shikshaMitraToast.success({ message: 'Concession cancelled successfully' });
      } else {
        await approveConcession({
          studentConcessionTypeRequestId: selectedItem?.studentConcessionTypeRequestId,
          body,
        }).unwrap();
        shikshaMitraToast.success({ message: 'Concession approved successfully' });
      }
      onClose();
    },
  });

  const toggleMonth = (value: number) => {
    const curr = formik.values.months;
    formik.setFieldValue(
      'months',
      curr.includes(value) ? curr.filter((m) => m !== value) : [...curr, value]
    );
  };

  return (
    <>
      <DialogScrollContent>
        {/* ── Month Selection (Approve & Cancel only) ───────────────────────────────────── */}
        {!isReject && (
          <Box mb={2}>
            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, mb: 1 }}>
              Select Months *
            </Typography>
            <Grid container spacing={1}>
              {FeeMonthOptions.map((month) => {
                const selected = formik.values.months.includes(month.value);
                return (
                  <Grid key={month.value} size={{ xs: 3 }}>
                    <Paper
                      variant="outlined"
                      onClick={() => toggleMonth(month.value)}
                      sx={{
                        p: '8px 10px',
                        borderRadius: 1,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        userSelect: 'none',
                        bgcolor: selected
                          ? (theme) => varAlpha(theme.palette.primary.mainChannel, 0.1)
                          : 'background.paper',
                        borderColor: selected ? 'primary.main' : 'divider',
                        transition: 'all 0.15s',
                      }}
                    >
                      <Checkbox
                        size="small"
                        checked={selected}
                        onChange={() => toggleMonth(month.value)}
                        sx={{ p: 0, '& .MuiSvgIcon-root': { fontSize: 16 } }}
                      />
                      <Typography variant="body2" fontWeight={600}>
                        {month.label.slice(0, 3)}
                      </Typography>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
            {formik.touched.months && formik.errors.months && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                {formik.errors.months as string}
              </Typography>
            )}
          </Box>
        )}

        {/* ── Reason ────────────────────────────────────────────── */}
        <ShakingTextField error={!!(formik.touched.reason && formik.errors.reason)}>
          <TextField
            fullWidth
            multiline
            rows={3}
            size="small"
            label={`Reason${needsReason ? ' *' : ' (optional)'}`}
            name="reason"
            value={formik.values.reason}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.reason && Boolean(formik.errors.reason)}
            helperText={formik.touched.reason && formik.errors.reason}
          />
        </ShakingTextField>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          variant="outlined"
          size="small"
          onClick={onClose}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Close
        </Button>
        <LoadingButton
          loading={isApproving || isRejecting || isCancelling}
          variant="contained"
          size="small"
          color={isReject || isCancel ? 'error' : 'success'}
          onClick={(e: any) => formik.handleSubmit(e)}
          startIcon={
            isReject || isCancel ? <Cancel fontSize="small" /> : <CheckCircle fontSize="small" />
          }
        >
          {mode}
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
        bgcolor: isApproved
          ? (theme) => varAlpha(theme.palette.success.mainChannel, 0.04)
          : isRejected
            ? (theme) => varAlpha(theme.palette.error.mainChannel, 0.04)
            : isCancelled
              ? (theme) => varAlpha(theme.palette.warning.mainChannel, 0.04)
              : 'background.paper',
        borderColor: isApproved
          ? 'success.light'
          : isRejected
            ? 'error.light'
            : isCancelled
              ? 'warning.light'
              : 'divider',
      }}
    >
      <CardContent sx={{ p: 1, flex: 1 }}>
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

        {/* Concession Amount */}
        <Box
          mb={2}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            p: 1.5,
            borderRadius: 1,
            bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.06),
          }}
        >
          <Typography variant="body2" fontWeight={700}>
            Concession Amount
          </Typography>
          <Typography variant="h6" fontWeight={800} color="success.main">
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
                      window.open(`${process.env.NEXT_PUBLIC_API_URL}${doc.url}`, '_blank');
                    }}
                  >
                    <Visibility sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              ))}
            </Stack>
          </Box>
        )}

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
          disabled={isApproved || isRejected || isCancelled}
          startIcon={<Iconify icon="mdi:cancel" width={16} />}
          onClick={() => onCancel(item)}
        >
          Cancel
        </LoadingButton>
        <IconButton onClick={() => onDelete(item)} color="error" sx={{ mt: -0.5 }}>
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
  const [dialogMode, setDialogMode] = useState<'Approve' | 'Reject' | 'Cancel'>('Approve');
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

  // Dummy data for development
  const dummyItems: IConcessionRequestItem[] = [
    {
      studentConcessionTypeRequestId: 'dummy-1',
      concessionTypeId: 'ct-1',
      concessionTypeName: 'Merit Scholarship',
      status: ConcessionStatusType.Pending,
      totalAmount: 15000,
      feeHeads: [],
      submittedDocuments: [
        { documentId: 'd1', documentName: 'Marksheet.pdf', url: '', uploadedAt: '2026-04-10' },
      ],
      createdAt: '2026-04-01T00:00:00Z',
      updatedAt: '2026-04-01T00:00:00Z',
      message: '',
      approvedAt: '',
      isDocumentUploaded: true,
    },
    {
      studentConcessionTypeRequestId: 'dummy-2',
      concessionTypeId: 'ct-2',
      concessionTypeName: 'Sibling Discount',
      status: ConcessionStatusType.Approved,
      totalAmount: 8500,
      feeHeads: [],
      submittedDocuments: [
        {
          documentId: 'd2',
          documentName: 'Sibling ID Proof.pdf',
          url: '',
          uploadedAt: '2026-03-20',
        },
      ],
      createdAt: '2026-03-15T00:00:00Z',
      updatedAt: '2026-03-18T00:00:00Z',
      message: 'Approved based on sibling verification',
      approvedAt: '2026-03-18T00:00:00Z',
      isDocumentUploaded: true,
    },
    {
      studentConcessionTypeRequestId: 'dummy-3',
      concessionTypeId: 'ct-3',
      concessionTypeName: 'Financial Aid',
      status: ConcessionStatusType.Rejected,
      totalAmount: 20000,
      feeHeads: [],
      submittedDocuments: [],
      createdAt: '2026-02-10T00:00:00Z',
      updatedAt: '2026-02-15T00:00:00Z',
      message: 'Incomplete documentation provided',
      approvedAt: '',
      isDocumentUploaded: false,
    },
  ];

  const allItems: IConcessionRequestItem[] = data?.items?.length ? data.items : dummyItems;

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

  const handleCancelClick = (item: IConcessionRequestItem) => {
    setSelectedItem(item);
    setDialogMode('Cancel');
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
      {/* ── Reason Dialog ────────────────────────────────────────────── */}
      <CustomDialog
        open={confirmDialog.value}
        handleClose={() => {
          confirmDialog.onFalse();
          setSelectedItem(null);
        }}
        maxWidth="xs"
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h6">
              {dialogMode === 'Reject'
                ? 'Reject Concession'
                : dialogMode === 'Cancel'
                  ? 'Cancel Concession'
                  : 'Approve Concession'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                dialogMode === 'Reject'
                  ? 'Reject the concession application'
                  : 'Approve the concession application'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
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
