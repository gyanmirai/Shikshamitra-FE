'use client';

import type { LabelColor } from 'src/components/label';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import React, { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import { formatNumber } from 'src/utils/formate_number';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Cancel, Visibility, CheckCircle } from '@mui/icons-material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { ConcessionStatusType, ConcessionStatusTypeColors } from 'src/enums/concession-status-type';
import {
  Box,
  Card,
  Grid,
  Stack,
  Alert,
  Button,
  Divider,
  Skeleton,
  TextField,
  Typography,
  IconButton,
  DialogActions,
} from '@mui/material';
import {
  useRejectConcessionRequestMutation,
  useApproveConcessionRequestMutation,
  useGetStudentConcessionDetailsQuery,
} from 'src/redux/finance/ConcessionManagement/concessionManagementApi';

import StudentInformationAccordion from './StucentConcessionCard';
import DocumentDialog from '../Concession/Components/DocumentDialog';

import type { IConcessionRequestItem, IViewConcessionRequestProps } from './type';

// ── Dummy data for the detail view ──────────────────────────────────────────
const DUMMY_CONCESSION_DETAIL = {
  studentDetails: {
    studentId: 'stu-001',
    name: 'Riya Patel',
    rollNo: '12',
    grNumber: 'GR1023',
    standardName: '10',
    divisionName: 'A',
    boardMedium: 'CBSE / English',
  },
  concessionBasicDetail: {
    totalApplications: 3,
    pendingApplications: 1,
    approvedApplications: 1,
    rejectedApplications: 1,
  },
  items: [
    {
      studentConcessionTypeRequestId: 'sctr-001',
      concessionTypeId: 'ct-001',
      concessionTypeName: 'Merit Scholarship',
      status: ConcessionStatusType.Pending,
      totalAmount: 5000,
      feeHeads: [
        {
          feeHeadId: 'fh-1',
          feeHeadName: 'Tuition Fee',
          amount: 3000,
          netAmount: 22000,
          description: '',
        },
        {
          feeHeadId: 'fh-2',
          feeHeadName: 'Library Fee',
          amount: 1000,
          netAmount: 4000,
          description: '',
        },
        {
          feeHeadId: 'fh-3',
          feeHeadName: 'Lab Fee',
          amount: 1000,
          netAmount: 7000,
          description: '',
        },
      ],
      submittedDocuments: [
        {
          documentId: 'doc-1',
          documentName: 'Merit Certificate',
          url: '/docs/merit-cert.pdf',
          uploadedAt: '2026-04-10',
          status: 1,
        },
        {
          documentId: 'doc-2',
          documentName: 'Academic Records',
          url: '/docs/academic.pdf',
          uploadedAt: '2026-04-10',
          status: 1,
        },
      ],
      createdAt: '2026-04-10T09:00:00.000Z',
      updatedAt: '2026-04-10T09:00:00.000Z',
      message: '',
      approvedAt: '',
      isDocumentUploaded: true,
      remarks: 'Student has secured 95% in last year exams.',
      totalFees: 45000,
      paidFees: 15000,
      pendingFees: 30000,
    },
    {
      studentConcessionTypeRequestId: 'sctr-002',
      concessionTypeId: 'ct-002',
      concessionTypeName: 'Sibling Discount',
      status: ConcessionStatusType.Approved,
      totalAmount: 4000,
      feeHeads: [
        {
          feeHeadId: 'fh-1',
          feeHeadName: 'Tuition Fee',
          amount: 2500,
          netAmount: 22500,
          description: '',
        },
        {
          feeHeadId: 'fh-4',
          feeHeadName: 'Sports Fee',
          amount: 1500,
          netAmount: 2500,
          description: '',
        },
      ],
      submittedDocuments: [
        {
          documentId: 'doc-3',
          documentName: 'Sibling Certificate',
          url: '/docs/sibling.pdf',
          uploadedAt: '2026-03-05',
          status: 1,
        },
      ],
      createdAt: '2026-03-01T09:00:00.000Z',
      updatedAt: '2026-03-10T09:00:00.000Z',
      message: 'Approved as per sibling policy.',
      approvedAt: '2026-03-10T09:00:00.000Z',
      isDocumentUploaded: true,
      remarks: '',
      totalFees: 45000,
      paidFees: 15000,
      pendingFees: 30000,
    },
    {
      studentConcessionTypeRequestId: 'sctr-003',
      concessionTypeId: 'ct-003',
      concessionTypeName: 'EWS Concession',
      status: ConcessionStatusType.Rejected,
      totalAmount: 10000,
      feeHeads: [
        {
          feeHeadId: 'fh-1',
          feeHeadName: 'Tuition Fee',
          amount: 7000,
          netAmount: 18000,
          description: '',
        },
        {
          feeHeadId: 'fh-2',
          feeHeadName: 'Library Fee',
          amount: 3000,
          netAmount: 2000,
          description: '',
        },
      ],
      submittedDocuments: [],
      createdAt: '2026-02-15T09:00:00.000Z',
      updatedAt: '2026-02-20T09:00:00.000Z',
      message: 'Income certificate expired. Please resubmit.',
      approvedAt: '',
      isDocumentUploaded: false,
      remarks: 'Family income below threshold',
      totalFees: 45000,
      paidFees: 15000,
      pendingFees: 30000,
    },
  ],
};

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
      reason: isReject
        ? Yup.string()
            .required('Reason is required')
            .min(10, 'Reason must be at least 10 characters')
        : Yup.string(),
    }),
    enableReinitialize: true,
    onSubmit: async (values) => {
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
    <>
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
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
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
          color={isReject ? 'error' : 'success'}
          onClick={(e: any) => formik.handleSubmit(e)}
          startIcon={isReject ? <Cancel fontSize="small" /> : <CheckCircle fontSize="small" />}
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
  value: number | string;
  color?: 'default' | 'warning' | 'success' | 'error' | 'primary';
  icon?: string;
}

const StatCard: React.FC<IStatCardProps> = ({ label, value, color = 'default', icon }) => {
  const colorMap = {
    default: 'text.primary',
    warning: 'warning.main',
    success: 'success.main',
    error: 'error.main',
    primary: 'primary.main',
  };

  return (
    <Card
      variant="outlined"
      sx={{
        flex: 1,
        minWidth: 120,
        p: 1.5,
        borderRadius: 2,
        boxShadow: 'none',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        {icon && (
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              bgcolor: (theme) =>
                varAlpha(theme.palette[color === 'default' ? 'primary' : color].mainChannel, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Iconify icon={icon} width={18} sx={{ color: colorMap[color] }} />
          </Box>
        )}
        <Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}
          >
            {label}
          </Typography>
          <Typography variant="h5" sx={{ color: colorMap[color], fontWeight: 700 }}>
            {value}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────

const ViewConcessionRequest: React.FC<IViewConcessionRequestProps> = ({ student, onClose }) => {
  const confirmDialog = useBoolean();
  const docDialog = useBoolean();
  const [selectedItem, setSelectedItem] = useState<IConcessionRequestItem | null>(null);
  const [dialogMode, setDialogMode] = useState<'Approve' | 'Reject'>('Approve');

  const {
    data: apiData,
    isLoading: isLoadingConcessionData,
    isFetching: isFetchingConcessionData,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentConcessionDetailsQuery,
    params: { studentId: student?.studentId },
    options: { skip: !student?.studentId },
  }) as { data: any; isLoading: boolean; isFetching: boolean };

  // Use API data if available, otherwise fall back to dummy
  const data = apiData || DUMMY_CONCESSION_DETAIL;
  const isLoading = isLoadingConcessionData || isFetchingConcessionData;

  const stats = data?.concessionBasicDetail;
  const allItems: IConcessionRequestItem[] = useMemo(() => data?.items || [], [data?.items]);

  // The view is per-concession-request, so show all items for this student
  const currentItem = useMemo(
    () =>
      allItems.find(
        (i) => i.studentConcessionTypeRequestId === student?.studentConcessionTypeRequestId
      ) || allItems[0],
    [allItems, student?.studentConcessionTypeRequestId]
  );

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

  const statusLabel = ConcessionStatusType[
    currentItem?.status
  ] as keyof typeof ConcessionStatusType;
  const statusColor = ConcessionStatusTypeColors[
    currentItem?.status as ConcessionStatusType
  ] as LabelColor;
  const isApproved = currentItem?.status === ConcessionStatusType.Approved;
  const isRejected = currentItem?.status === ConcessionStatusType.Rejected;
  const isPending = currentItem?.status === ConcessionStatusType.Pending;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Scrollbar sx={{ flex: 1, p: 2 }}>
        {isLoading ? (
          /* ── Loading Skeleton ─────────────────────────────────── */
          <Stack spacing={2}>
            <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
            <Box display="flex" gap={2}>
              {[...Array(4)].map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  sx={{ flex: 1, height: 80, borderRadius: 2 }}
                />
              ))}
            </Box>
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
          </Stack>
        ) : (
          <Stack spacing={1}>
            {/* ── Student Info ─────────────────────────────────── */}
            <StudentInformationAccordion student={data?.studentDetails} />

            {/* ── Stats Row ────────────────────────────────────── */}
            {stats && (
              <Box display="flex" gap={1} flexWrap="wrap">
                <StatCard
                  label="Total Applications"
                  value={stats.totalApplications}
                  icon="mdi:file-document-multiple-outline"
                />
                <StatCard
                  label="Pending"
                  value={stats.pendingApplications}
                  color="warning"
                  icon="mdi:clock-outline"
                />
                <StatCard
                  label="Approved"
                  value={stats.approvedApplications}
                  color="success"
                  icon="mdi:check-circle-outline"
                />
                <StatCard
                  label="Rejected"
                  value={stats.rejectedApplications}
                  color="error"
                  icon="mdi:close-circle-outline"
                />
              </Box>
            )}

            {/* ── Concession Detail Card ───────────────────────── */}
            {currentItem && (
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  borderColor: isApproved
                    ? 'success.light'
                    : isRejected
                      ? 'error.light'
                      : 'divider',
                }}
              >
                {/* Card Header */}
                <Box
                  sx={{
                    p: 1,
                    bgcolor: isApproved
                      ? (theme) => varAlpha(theme.palette.success.mainChannel, 0.04)
                      : isRejected
                        ? (theme) => varAlpha(theme.palette.error.mainChannel, 0.04)
                        : 'grey.50',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1.5,
                        bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Iconify icon="mdi:tag-outline" width={22} sx={{ color: 'primary.main' }} />
                    </Box>
                    <Box>
                      <Typography variant="h6">{currentItem.concessionTypeName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Requested on{' '}
                        {new Date(currentItem.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Typography>
                    </Box>
                  </Stack>
                  <Label
                    color={statusColor}
                    variant="soft"
                    sx={{ fontSize: '13px', px: 2, py: 0.5 }}
                  >
                    {statusLabel}
                  </Label>
                </Box>

                <Divider />

                <Box sx={{ p: 1 }}>
                  <Grid container spacing={3}>
                    {/* ── Concession Summary ──────────────────── */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography
                        variant="overline"
                        color="text.secondary"
                        sx={{ letterSpacing: 1, fontWeight: 700, display: 'block', pb: 1 }}
                      >
                        Concession Summary
                      </Typography>

                      <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                        <Box
                          sx={{
                            px: 2,
                            py: 1.5,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Typography variant="subtitle2" fontWeight={700}>
                            Concession Amount
                          </Typography>
                          <Typography variant="subtitle2" fontWeight={800} color="error.main">
                            − {formatNumber(currentItem.totalAmount, 'INR')}
                          </Typography>
                        </Box>
                      </Card>

                      {/* Fee overview cards */}
                      <Grid container spacing={1.5} mt={1}>
                        <Grid size={{ xs: 4 }}>
                          <Card
                            variant="outlined"
                            sx={{ p: 1, borderRadius: 1.5, textAlign: 'center' }}
                          >
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                              Total Fees
                            </Typography>
                            <Typography variant="body1" fontWeight={700}>
                              {formatNumber((currentItem as any).totalFees || 45000, 'INR')}
                            </Typography>
                          </Card>
                        </Grid>
                        <Grid size={{ xs: 4 }}>
                          <Card
                            variant="outlined"
                            sx={{
                              p: 1,
                              borderRadius: 1.5,
                              textAlign: 'center',
                              borderColor: 'success.light',
                            }}
                          >
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                              Paid
                            </Typography>
                            <Typography variant="body1" fontWeight={700} color="success.main">
                              {formatNumber((currentItem as any).paidFees || 15000, 'INR')}
                            </Typography>
                          </Card>
                        </Grid>
                        <Grid size={{ xs: 4 }}>
                          <Card
                            variant="outlined"
                            sx={{
                              p: 1,
                              borderRadius: 1.5,
                              textAlign: 'center',
                              borderColor: 'warning.light',
                            }}
                          >
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                              Pending
                            </Typography>
                            <Typography variant="body1" fontWeight={700} color="warning.main">
                              {formatNumber((currentItem as any).pendingFees || 30000, 'INR')}
                            </Typography>
                          </Card>
                        </Grid>
                      </Grid>
                    </Grid>

                    {/* ── Documents & Info ─────────────────────── */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      {/* Documents */}
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography
                          variant="overline"
                          color="text.secondary"
                          sx={{ letterSpacing: 1, fontWeight: 700, display: 'block' }}
                        >
                          Documents
                        </Typography>
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => handleOpenDocs(currentItem)}
                          sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
                        >
                          View All Documents
                        </Button>
                      </Box>

                      {currentItem.submittedDocuments?.length > 0 ? (
                        <Stack spacing={1} mb={2}>
                          {currentItem.submittedDocuments.map((doc) => (
                            <Box
                              key={doc.documentId}
                              display="flex"
                              alignItems="center"
                              justifyContent="space-between"
                              sx={{
                                px: 2,
                                py: 1,
                                borderRadius: 1.5,
                                bgcolor: (theme) =>
                                  varAlpha(theme.palette.grey['500Channel'], 0.06),
                                border: '1px solid',
                                borderColor: 'divider',
                              }}
                            >
                              <Box display="flex" alignItems="center" gap={1}>
                                <Iconify
                                  icon="mdi:file-document-outline"
                                  width={18}
                                  sx={{ color: 'primary.main' }}
                                />
                                <Box>
                                  <Typography variant="body2" fontWeight={600}>
                                    {doc.documentName}
                                  </Typography>
                                  {doc.uploadedAt && (
                                    <Typography variant="caption" color="text.secondary">
                                      Uploaded:{' '}
                                      {new Date(doc.uploadedAt).toLocaleDateString('en-IN', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                      })}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                              {doc.url && (
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(
                                      `${process.env.NEXT_PUBLIC_API_URL}${doc.url}`,
                                      '_blank'
                                    );
                                  }}
                                  sx={{
                                    bgcolor: (theme) =>
                                      varAlpha(theme.palette.primary.mainChannel, 0.08),
                                  }}
                                >
                                  <Visibility sx={{ fontSize: 18, color: 'primary.main' }} />
                                </IconButton>
                              )}
                            </Box>
                          ))}
                        </Stack>
                      ) : (
                        <Box
                          sx={{
                            py: 3,
                            mb: 2,
                            borderRadius: 1.5,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            bgcolor: (theme) => varAlpha(theme.palette.grey['500Channel'], 0.04),
                            border: '1px dashed',
                            borderColor: 'divider',
                          }}
                        >
                          <Iconify
                            icon="mdi:file-document-remove-outline"
                            width={32}
                            sx={{ color: 'text.disabled', mb: 0.5 }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            No documents submitted
                          </Typography>
                        </Box>
                      )}

                      {/* Approval / Rejection message */}
                      {currentItem.message && (
                        <Alert
                          severity={isApproved ? 'success' : 'error'}
                          variant="outlined"
                          sx={{ borderRadius: 1.5, mb: 2 }}
                          icon={
                            isApproved ? (
                              <CheckCircle fontSize="small" />
                            ) : (
                              <Cancel fontSize="small" />
                            )
                          }
                        >
                          <Typography variant="caption" color="text.secondary" display="block">
                            {isApproved ? 'Approval Message' : 'Rejection Reason'}
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {currentItem.message}
                          </Typography>
                        </Alert>
                      )}

                      {/* Approved at */}
                      {isApproved && currentItem.approvedAt && (
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={1}
                          sx={{
                            p: 1.5,
                            borderRadius: 1.5,
                            bgcolor: (theme) => varAlpha(theme.palette.success.mainChannel, 0.08),
                          }}
                        >
                          <CheckCircle sx={{ fontSize: 18, color: 'success.main' }} />
                          <Typography variant="body2" color="success.dark" fontWeight={600}>
                            Approved on{' '}
                            {new Date(currentItem.approvedAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </Typography>
                        </Box>
                      )}

                      {/* Warning for missing documents */}
                      {!currentItem.isDocumentUploaded && isPending && (
                        <Alert severity="warning" sx={{ borderRadius: 1.5, mt: 1 }}>
                          <Typography variant="body2">
                            Documents are not uploaded. You can only approve or reject after
                            documents are submitted.
                          </Typography>
                        </Alert>
                      )}
                    </Grid>
                  </Grid>
                </Box>
              </Card>
            )}

            {/* ── Other Concession Requests ────────────────────── */}
            {allItems.length > 1 && (
              <Box>
                <Typography variant="subtitle2" fontWeight={700} mb={1}>
                  Other Concession Requests
                </Typography>
                <Grid container spacing={2}>
                  {allItems
                    .filter(
                      (i) =>
                        i.studentConcessionTypeRequestId !==
                        currentItem?.studentConcessionTypeRequestId
                    )
                    .map((item) => {
                      const itemStatus = ConcessionStatusType[
                        item.status
                      ] as keyof typeof ConcessionStatusType;
                      const itemColor = ConcessionStatusTypeColors[
                        item.status as ConcessionStatusType
                      ] as LabelColor;
                      return (
                        <Grid key={item.studentConcessionTypeRequestId} size={{ xs: 12, sm: 6 }}>
                          <Card
                            variant="outlined"
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              cursor: 'default',
                            }}
                          >
                            <Box
                              display="flex"
                              justifyContent="space-between"
                              alignItems="center"
                              mb={1}
                            >
                              <Typography variant="subtitle2" fontWeight={700}>
                                {item.concessionTypeName}
                              </Typography>
                              <Label color={itemColor} variant="soft">
                                {itemStatus}
                              </Label>
                            </Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2" color="text.secondary">
                                Concession Amount
                              </Typography>
                              <Typography variant="body2" fontWeight={700} color="error.main">
                                {formatNumber(item.totalAmount, 'INR')}
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.disabled" mt={0.5}>
                              {new Date(item.createdAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </Typography>
                          </Card>
                        </Grid>
                      );
                    })}
                </Grid>
              </Box>
            )}
          </Stack>
        )}
      </Scrollbar>

      {/* ── Footer Actions ───────────────────────────────────────── */}
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          display: 'flex',
          justifyContent: 'flex-end',
          boxShadow: 'var(--shadows-10)',
        }}
      >
        {isPending && currentItem && (
          <Stack direction="row" spacing={1.5}>
            <LoadingButton
              size="small"
              variant="contained"
              color="error"
              disabled={!currentItem.isDocumentUploaded}
              startIcon={<Cancel fontSize="small" />}
              onClick={() => handleRejectClick(currentItem)}
            >
              Reject
            </LoadingButton>
            <LoadingButton
              size="small"
              variant="contained"
              color="success"
              disabled={!currentItem.isDocumentUploaded}
              startIcon={<CheckCircle fontSize="small" />}
              onClick={() => handleApproveClick(currentItem)}
            >
              Approve
            </LoadingButton>
          </Stack>
        )}
      </Box>

      {/* ── Reason Dialog ────────────────────────────────────────── */}
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
              {dialogMode === 'Reject' ? 'Reject Concession' : 'Approve Concession'}
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

      {/* ── Document Dialog ────────────────────────────────────────── */}
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
