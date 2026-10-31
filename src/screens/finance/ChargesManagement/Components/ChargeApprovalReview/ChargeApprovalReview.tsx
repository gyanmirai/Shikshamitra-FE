'use client';

import { motion } from 'framer-motion';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import LoadingButton from '@mui/lab/LoadingButton';
import { Scrollbar } from 'src/components/scrollbar';
import { shikshaMitraToast } from 'src/components/toast';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import React, { useState, useEffect, useCallback } from 'react';
import {
  Alert,
  Box,
  Grid,
  Chip,
  Paper,
  Stack,
  Button,
  Divider,
  Skeleton,
  Typography,
} from '@mui/material';
import {
  useGetChargeByIdQuery,
  useRejectChargeMutation,
  useApproveChargeMutation,
} from 'src/redux/finance/ChargeManagement/chargeApi';

import StudentChargeReviewTable from './StudentChargeReviewTable';
import ChargeApprovalConfirmationDialog from './ChargeApprovalConfirmationDialog';
import RequestorInfoCard from '../ChargesManage/Component/ViewChargeComponent/RequestorInfoCard';
import ChargeViewDetailsCard from '../ChargesManage/Component/ViewChargeComponent/ChargeDetailsCard';

import type { IApprovalReviewStudent, IChargeApprovalReviewProps } from './types';
import { useChargePermissions } from '../../useChargePermissions';

/**
 * ChargeApprovalReview Component
 * Main component for reviewing and approving/rejecting charges
 */
const ChargeApprovalReview: React.FC<IChargeApprovalReviewProps> = ({
  chargeId,
  mode,
  open,
  onClose,
}) => {
  const theme = useTheme();
  const isRejectMode = mode === 'reject';
  const permissions = useChargePermissions();

  // State for student selection and confirmation dialog
  const [students, setStudents] = useState<IApprovalReviewStudent[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);

  // Fetch charge details
  const {
    data: chargeData,
    isLoading: chargeLoading,
    isError: chargeError,
    refetch: refetchCharge,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetChargeByIdQuery,
    params: { id: chargeId },
    options: {
      skip: !chargeId || !open,
    },
  });

  // Approval/Rejection mutations
  const [approveCharge, { isLoading: approveLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useApproveChargeMutation,
  });

  const [rejectCharge, { isLoading: rejectLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useRejectChargeMutation,
  });

  const isSubmitLoading = approveLoading || rejectLoading;

  // Initialize students when charge data loads
  useEffect(() => {
    if (chargeData?.chargeId && open) {
      // Extract students from charge data
      const pendingStudents = (chargeData.students ?? [])
        .filter((s: any) => s.status === 0)
        .map((s: any): IApprovalReviewStudent => ({
          studentId: s.studentId || '',
          studentName: s.studentName || '',
          grNumber: s.grNumber,
          rollNumber: s.rollNumber,
          standardName: s.standardName,
          divisionName: s.divisionName,
        }));

      const chargeStudents =
        pendingStudents.length > 0
          ? pendingStudents
          : chargeData.student
            ? [
                {
                  studentId: chargeData.student.studentId || '',
                  studentName: chargeData.student.studentName || '',
                  grNumber: chargeData.student.grNumber,
                  rollNumber: chargeData.student.rollNumber,
                  standardName: chargeData.student.standardName,
                  divisionName: chargeData.student.divisionName,
                },
              ]
            : [];

      setStudents(chargeStudents);
      setSelectedStudentIds([]);
    }
  }, [chargeData, open]);

  const handleStudentSelect = useCallback((studentId: string, isChecked: boolean) => {
    setSelectedStudentIds((prev) => {
      if (isChecked) {
        return [...prev, studentId];
      }
      return prev.filter((id) => id !== studentId);
    });
  }, []);

  const handleApproveClick = useCallback(() => {
    if (!permissions.canApprove || !chargeData?.availableActions?.includes('Approve')) {
      shikshaMitraToast.error({ message: 'You are not allowed to approve this charge.' });
      return;
    }
    if (selectedStudentIds.length === 0) {
      shikshaMitraToast.error({
        message: 'Please select at least one student for approval',
      });
      return;
    }
    setConfirmationDialogOpen(true);
  }, [selectedStudentIds.length, permissions.canApprove, chargeData?.availableActions]);

  const handleRejectClick = useCallback(() => {
    if (!permissions.canReject || !chargeData?.availableActions?.includes('Reject')) {
      shikshaMitraToast.error({ message: 'You are not allowed to reject this charge.' });
      return;
    }
    if (selectedStudentIds.length === 0) {
      shikshaMitraToast.error({
        message: 'Please select at least one student for rejection',
      });
      return;
    }
    setConfirmationDialogOpen(true);
  }, [selectedStudentIds.length, permissions.canReject, chargeData?.availableActions]);

  const handleConfirmation = useCallback(
    async (notes: string) => {
      try {
        const payload = {
          id: chargeId,
          body: {
            studentIds: selectedStudentIds,
            concurrencyStamp: chargeData?.concurrencyStamp ?? '',
            ...(isRejectMode ? { rejectionReason: notes } : { approvalNotes: notes }),
          },
        };

        if (isRejectMode) {
          const result = await rejectCharge(payload).unwrap();
          if (!result?.success) {
            shikshaMitraToast.error({
              message: result?.message || `Failed to ${isRejectMode ? 'reject' : 'approve'} charge`,
            });
            return;
          }
          shikshaMitraToast.success({
            message: `Charge rejected successfully for ${selectedStudentIds.length} student${selectedStudentIds.length !== 1 ? 's' : ''}`,
          });
        } else {
          const result = await approveCharge(payload).unwrap();
          if (!result?.success) {
            shikshaMitraToast.error({
              message: result?.message || `Failed to ${isRejectMode ? 'reject' : 'approve'} charge`,
            });
            return;
          }
          shikshaMitraToast.success({
            message: `Charge approved successfully for ${selectedStudentIds.length} student${selectedStudentIds.length !== 1 ? 's' : ''}`,
          });
        }

        setConfirmationDialogOpen(false);
        onClose();
      } catch (error: any) {
        console.error('Error during confirmation:', error);
        shikshaMitraToast.error({
          message:
            error?.data?.error?.message ||
            `Failed to ${isRejectMode ? 'reject' : 'approve'} charge`,
        });
      }
    },
    [
      chargeId,
      selectedStudentIds,
      isRejectMode,
      approveCharge,
      rejectCharge,
      onClose,
      chargeData?.concurrencyStamp,
    ]
  );

  if (!open) return null;

  if (chargeLoading) {
    return (
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={200} sx={{ mb: 2, borderRadius: 1 }} />
        <Skeleton variant="rectangular" height={200} sx={{ mb: 2, borderRadius: 1 }} />
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 1 }} />
      </Box>
    );
  }

  if (chargeError || !chargeData) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetchCharge()}>
              Retry
            </Button>
          }
        >
          Charge details could not be loaded. Refresh the data or return to the charge list.
        </Alert>
        <Button onClick={onClose} variant="outlined" size="small" sx={{ mt: 2 }}>
          Back to charges
        </Button>
      </Box>
    );
  }

  const requiredAction = isRejectMode ? 'Reject' : 'Approve';
  const hasActionPermission = isRejectMode ? permissions.canReject : permissions.canApprove;
  const isActionAvailable =
    hasActionPermission && chargeData.availableActions?.includes(requiredAction);

  if (!isActionAvailable) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">
          This charge is not available for {requiredAction.toLowerCase()} by the current user.
        </Alert>
        <Button onClick={onClose} variant="outlined" size="small" sx={{ mt: 2 }}>
          Back to charges
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        display="flex"
        flexDirection="column"
        height="100%"
      >
        <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <ChargeViewDetailsCard charge={chargeData} />
              </Grid>
              {chargeData.requestor && (
                <Grid size={{ xs: 12 }}>
                  <RequestorInfoCard charge={chargeData} />
                </Grid>
              )}
              {/* Class & Division Information */}
              {(chargeData?.student?.standardName || chargeData?.student?.divisionName) && (
                <Grid size={{ xs: 12 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      transition: 'box-shadow 0.2s ease',
                      '&:hover': { boxShadow: 4 },
                    }}
                  >
                    <Stack direction="row" alignItems="center" gap={1} mb={2}>
                      <Iconify
                        icon="solar:book-bold-duotone"
                        width={18}
                        sx={{ color: 'primary.main' }}
                      />
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>
                          Class & Division Information
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Academic structure details
                        </Typography>
                      </Box>
                    </Stack>
                    <Divider sx={{ mb: 2 }} />

                    <Stack direction="row" gap={1} flexWrap="wrap">
                      {chargeData?.student?.standardName && (
                        <Chip
                          label={`Class: ${chargeData.student.standardName}`}
                          size="small"
                          variant="outlined"
                          icon={<Iconify icon="solar:book-bold" />}
                        />
                      )}
                      {chargeData?.student?.divisionName && (
                        <Chip
                          label={`Division: ${chargeData.student.divisionName}`}
                          size="small"
                          variant="outlined"
                          icon={<Iconify icon="solar:users-group-rounded-bold" />}
                        />
                      )}
                    </Stack>
                  </Paper>
                </Grid>
              )}

              {/* Student List Table */}
              <Grid size={{ xs: 12 }}>
                <StudentChargeReviewTable
                  students={students}
                  selectedStudentIds={selectedStudentIds}
                  onStudentSelect={handleStudentSelect}
                  isLoading={chargeLoading}
                />
              </Grid>
            </Grid>
          </Box>
        </Scrollbar>

        {/* Sticky Footer Action Bar */}
        <Box
          sx={{
            flexShrink: 0,
            borderTop: `1px solid ${theme.palette.divider}`,
            backdropFilter: 'blur(12px)',
            px: { xs: 2, md: 3 },
            py: 1.5,
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="flex-end" flexWrap="wrap" gap={1}>
            <Stack direction="row" spacing={1.5} flexWrap="wrap">
              {/* Info about selected students */}
              <Box sx={{ mr: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Selected: <strong>{selectedStudentIds.length}</strong> of{' '}
                  <strong>{students.length}</strong> students
                </Typography>
              </Box>

              {/* Action Buttons */}
              <Box
                component="form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (isRejectMode) {
                    handleRejectClick();
                  } else {
                    handleApproveClick();
                  }
                }}
              >
                <Stack direction="row" spacing={1.5}>
                  <Button
                    onClick={onClose}
                    variant="outlined"
                    size="small"
                    startIcon={<Iconify icon={GlobalIcons.cancel} />}
                  >
                    Cancel
                  </Button>
                  <LoadingButton
                    type="submit"
                    variant="soft"
                    color={isRejectMode ? 'error' : 'success'}
                    startIcon={
                      <Iconify icon={isRejectMode ? GlobalIcons.cancel : GlobalIcons.tick} />
                    }
                    size="small"
                    onClick={(e: any) => {
                      e.preventDefault();
                      if (isRejectMode) {
                        handleRejectClick();
                      } else {
                        handleApproveClick();
                      }
                    }}
                  >
                    {isRejectMode ? 'Reject Charge' : 'Approve Charge'}
                  </LoadingButton>
                </Stack>
              </Box>
            </Stack>
          </Box>
        </Box>
      </Box>

      {/* Confirmation Dialog */}
      <ChargeApprovalConfirmationDialog
        open={confirmationDialogOpen}
        mode={mode}
        chargeId={chargeId}
        chargeName={chargeData?.categoryName || 'Charge'}
        totalStudents={students.length}
        selectedStudents={selectedStudentIds.length}
        onConfirm={handleConfirmation}
        onCancel={() => setConfirmationDialogOpen(false)}
        isLoading={isSubmitLoading}
      />
    </Box>
  );
};

export default ChargeApprovalReview;
