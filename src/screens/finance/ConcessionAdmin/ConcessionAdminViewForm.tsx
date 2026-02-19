'use client';

import type { LabelColor } from 'src/components/label';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { formatNumber } from 'src/utils/formate_number';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Cancel, OpenInNew, CheckCircle } from '@mui/icons-material';
import { ConcessionStatusType, ConcessionStatusTypeColors } from 'src/enums/concession-status-type';
import {
  Box,
  Tab,
  Tabs,
  Card,
  Grid,
  Link,
  Stack,
  Button,
  Divider,
  Skeleton,
  TextField,
  Typography,
  CardContent,
  DialogActions,
} from '@mui/material';
import {
  useRejectConcessionRequestMutation,
  useGetStudentConcessionDetailsQuery,
  useApproveConcessionRequestMutation,
} from 'src/redux/finance/ConcessionManagement/concessionManagementApi';

import StudentInformationAccordion from './StucentConcessionCard';

import type { IConcessionRequestItem, IViewConcessionRequestProps } from './type';

// ─── Reason Dialog ────────────────────────────────────────────────────────────

interface IReasonDialogProps {
  open: boolean;
  mode: 'Approve' | 'Reject';
  loading: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

const ReasonDialog: React.FC<IReasonDialogProps> = ({ open, mode, loading, onClose, onSubmit }) => {
  const isReject = mode === 'Reject';

  const formik = useFormik({
    initialValues: { reason: '' },
    validationSchema: Yup.object({
      reason: isReject ? Yup.string().required('Reason is required') : Yup.string(),
    }),
    enableReinitialize: true,
    onSubmit: (values, helpers) => {
      onSubmit(values.reason);
      helpers.resetForm();
    },
  });

  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      maxWidth="xs"
      title={
        <Box display="flex" alignItems="center" gap={1}>
          {isReject ? (
            <Cancel sx={{ color: 'error.main' }} />
          ) : (
            <CheckCircle sx={{ color: 'success.main' }} />
          )}
          <Typography variant="h6">
            {isReject ? 'Reject Concession' : 'Approve Concession'}
          </Typography>
        </Box>
      }
    >
      <Box sx={{ p: 2 }}>
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
      </Box>
      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button variant="outlined" size="small" onClick={onClose}>
          Cancel
        </Button>
        <LoadingButton
          loading={loading}
          variant="contained"
          size="small"
          color={isReject ? 'error' : 'success'}
          onClick={() => formik.handleSubmit()}
          startIcon={isReject ? <Cancel fontSize="small" /> : <CheckCircle fontSize="small" />}
        >
          {mode}
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
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
        p: 2,
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

// ─── Concession Item Card ──────────────────────────────────────────────────────

interface IConcessionCardProps {
  item: IConcessionRequestItem;
  onApprove: (item: IConcessionRequestItem) => void;
  onReject: (item: IConcessionRequestItem) => void;
}

const ConcessionItemCard: React.FC<IConcessionCardProps> = ({ item, onApprove, onReject }) => {
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
      <CardContent sx={{ p: 2, pb: '12px !important', flex: 1 }}>
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
        {item.submittedDocuments?.length > 0 && (
          <Box mb={2}>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ letterSpacing: 1, fontWeight: 700, display: 'block', mb: 1 }}
            >
              Submitted Documents
            </Typography>
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
                  {doc.documentUrl && (
                    <Link
                      href={doc.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="none"
                    >
                      <Typography
                        variant="caption"
                        color="success.main"
                        fontWeight={600}
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}
                      >
                        Preview <OpenInNew sx={{ fontSize: 11 }} />
                      </Typography>
                    </Link>
                  )}
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
          pb: 2,
          display: 'flex',
          gap: 1,
        }}
      >
        <Button
          fullWidth
          size="small"
          variant={isApproved ? 'soft' : 'contained'}
          color="success"
          disabled={isApproved || isRejected}
          startIcon={<CheckCircle fontSize="small" />}
          onClick={() => onApprove(item)}
          sx={{ borderRadius: 1.5 }}
        >
          {isApproved ? 'Approved' : 'Approve'}
        </Button>
        <Button
          fullWidth
          size="small"
          variant="soft"
          color="error"
          disabled={isApproved || isRejected}
          startIcon={<Cancel fontSize="small" />}
          onClick={() => onReject(item)}
          sx={{ borderRadius: 1.5 }}
        >
          Reject
        </Button>
      </Box>
    </Card>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────

const ViewConcessionRequest: React.FC<IViewConcessionRequestProps> = ({ student, onClose }) => {
  const [activeTab, setActiveTab] = useState(ConcessionStatusType.Pending);
  const [reasonDialog, setReasonDialog] = useState<{
    open: boolean;
    mode: 'Approve' | 'Reject';
    item: IConcessionRequestItem | null;
  }>({ open: false, mode: 'Approve', item: null });

  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentConcessionDetailsQuery,
    params: { studentId: '3a1f1588-c98b-e9eb-8af9-ecaa17cdba6b' },
  }) as { data: any; isLoading: boolean };

  const [approveConcession, { isLoading: isApproving }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useApproveConcessionRequestMutation,
  });

  const [rejectConcession, { isLoading: isRejecting }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useRejectConcessionRequestMutation,
  });

  const stats = data?.concessionBasicDetail;
  const allItems: IConcessionRequestItem[] = data?.items || [];

  const filteredItems = allItems.filter((i) => i.status === activeTab);

  const handleApproveClick = (item: IConcessionRequestItem) => {
    setReasonDialog({ open: true, mode: 'Approve', item });
  };

  const handleRejectClick = (item: IConcessionRequestItem) => {
    setReasonDialog({ open: true, mode: 'Reject', item });
  };

  const handleReasonSubmit = async (reason: string) => {
    if (!reasonDialog.item) return;
    try {
      if (reasonDialog.mode === 'Approve') {
        await approveConcession({
          studentConcessionTypeRequestId: reasonDialog.item.studentConcessionTypeRequestId,
          body: { message: reason },
        }).unwrap();
        shikshaMitraToast.success({ message: 'Concession approved successfully' });
      } else {
        await rejectConcession({
          studentConcessionTypeRequestId: reasonDialog.item.studentConcessionTypeRequestId,
          body: { message: reason },
        }).unwrap();
        shikshaMitraToast.success({ message: 'Concession rejected successfully' });
      }
      setReasonDialog({ open: false, mode: 'Approve', item: null });
    } catch (err: any) {
      shikshaMitraToast.error({ message: err?.data?.message || 'Something went wrong' });
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Scrollbar sx={{ flex: 1, px: 2.5, pt: 2.5, pb: 2 }}>
        {/* ── Stats Row ─────────────────────────────────────────────── */}
        <StudentInformationAccordion student={data?.studentDetails} />
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
          <Box display="flex" gap={2} mb={3} flexWrap="wrap">
            <StatCard label="Total Applications" value={stats.totalApplications} />
            <StatCard label="Pending Review" value={stats.pendingApplications} color="warning" />
            <StatCard label="Approved" value={stats.approvedApplications} color="success" />
            <StatCard label="Rejected" value={stats.rejectedApplications} color="error" />
          </Box>
        ) : null}

        {/* ── Filter Tabs ───────────────────────────────────────────── */}
        <Box mb={2.5}>
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
        </Box>

        {/* ── Cards Grid ────────────────────────────────────────────── */}
        {isLoading ? (
          <Grid container spacing={2}>
            {[...Array(3)].map((_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                <Skeleton variant="rectangular" sx={{ height: 320, borderRadius: 2 }} />
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

      {/* ── Reason Dialog ────────────────────────────────────────────── */}
      <ReasonDialog
        open={reasonDialog.open}
        mode={reasonDialog.mode}
        loading={isApproving || isRejecting}
        onClose={() => setReasonDialog({ open: false, mode: 'Approve', item: null })}
        onSubmit={handleReasonSubmit}
      />
    </Box>
  );
};

export default ViewConcessionRequest;
