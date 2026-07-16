'use client';

import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import LoadingButton from '@mui/lab/LoadingButton';
import { Scrollbar } from 'src/components/scrollbar';
import { shikshaMitraToast } from 'src/components/toast';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { InfoItem } from 'src/screens/academic/homework-assignment-management/homeworkCreation/component/viewHomeworkDetails';
import {
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

import type { IApprovalReviewStudent, IChargeApprovalReviewProps } from './types';

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

  // State for student selection and confirmation dialog
  const [students, setStudents] = useState<IApprovalReviewStudent[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);

  // Fetch charge details
  const { data: chargeData, isLoading: chargeLoading } = useQueryAndMutation({
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
        .map(
          (s: any): IApprovalReviewStudent => ({
            studentId: s.studentId || '',
            studentName: s.studentName || '',
            grNumber: s.grNumber,
            rollNumber: s.rollNumber,
            standardName: s.standardName,
            divisionName: s.divisionName,
          })
        );

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
      setSelectedStudentIds(chargeStudents.map((s: IApprovalReviewStudent) => s.studentId));
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
    if (selectedStudentIds.length === 0) {
      shikshaMitraToast.error({
        message: 'Please select at least one student for approval',
      });
      return;
    }
    setConfirmationDialogOpen(true);
  }, [selectedStudentIds.length]);

  const handleRejectClick = useCallback(() => {
    if (selectedStudentIds.length === 0) {
      shikshaMitraToast.error({
        message: 'Please select at least one student for rejection',
      });
      return;
    }
    setConfirmationDialogOpen(true);
  }, [selectedStudentIds.length]);

  const handleConfirmation = useCallback(
    async (notes: string) => {
      try {
        const payload = {
          id: chargeId,
          body: {
            studentIds: selectedStudentIds,
            ...(isRejectMode ? { rejectionReason: notes } : { approvalNotes: notes }),
          },
        };

        if (isRejectMode) {
          const result: any = await rejectCharge(payload);
          if (result?.error) {
            shikshaMitraToast.error({
              message: `Failed to ${isRejectMode ? 'reject' : 'approve'} charge`,
            });
            return;
          }
          if (!result?.data?.success) {
            shikshaMitraToast.error({
              message:
                result?.data?.message || `Failed to ${isRejectMode ? 'reject' : 'approve'} charge`,
            });
            return;
          }
          shikshaMitraToast.success({
            message: `Charge rejected successfully for ${selectedStudentIds.length} student${selectedStudentIds.length !== 1 ? 's' : ''}`,
          });
        } else {
          const result: any = await approveCharge(payload);
          if (result?.error) {
            shikshaMitraToast.error({
              message: `Failed to ${isRejectMode ? 'reject' : 'approve'} charge`,
            });
            return;
          }
          if (!result?.data?.success) {
            shikshaMitraToast.error({
              message:
                result?.data?.message || `Failed to ${isRejectMode ? 'reject' : 'approve'} charge`,
            });
            return;
          }
          shikshaMitraToast.success({
            message: `Charge approved successfully for ${selectedStudentIds.length} student${selectedStudentIds.length !== 1 ? 's' : ''}`,
          });
        }

        setConfirmationDialogOpen(false);
        onClose();
      } catch (error) {
        console.error('Error during confirmation:', error);
        shikshaMitraToast.error({
          message: `Failed to ${isRejectMode ? 'reject' : 'approve'} charge`,
        });
      }
    },
    [chargeId, selectedStudentIds, isRejectMode, approveCharge, rejectCharge, onClose]
  );

  const formattedDueDate = useMemo(
    () => (chargeData?.dueDate ? dayjs(chargeData.dueDate).format('DD-MM-YYYY') : '-'),
    [chargeData?.dueDate]
  );

  const formattedCreatedDate = useMemo(
    () => (chargeData?.appliedOn ? dayjs(chargeData.appliedOn).format('DD-MM-YYYY') : '-'),
    [chargeData?.appliedOn]
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
              {/* Charge Information Card */}
              <Grid size={{ xs: 12 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    transition: 'box-shadow 0.2s ease',
                    '&:hover': { boxShadow: 4 },
                  }}
                >
                  {/* Header */}
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={1.5}
                  >
                    <Stack direction="row" alignItems="center" gap={1}>
                      <Iconify
                        icon="solar:document-bold-duotone"
                        width={18}
                        sx={{ color: 'primary.main' }}
                      />
                      <Typography variant="subtitle2" fontWeight={700}>
                        Charge Information
                      </Typography>
                    </Stack>
                  </Stack>
                  <Divider sx={{ mb: 2 }} />

                  {/* Body */}
                  <Box>
                    <Grid container spacing={1}>
                      {/* Charge Name */}
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <InfoItem
                          icon={<Iconify icon="solar:bill-list-bold" />}
                          label="Charge Name"
                          value={chargeData?.chargeName || 'N/A'}
                        />
                      </Grid>

                      {/* Charge Category */}
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <InfoItem
                          icon={<Iconify icon="solar:layers-bold" />}
                          label="Charge Category"
                          value={chargeData?.categoryName || 'N/A'}
                        />
                      </Grid>

                      {/* Amount */}
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <InfoItem
                          icon={<Iconify icon="solar:wallet-money-bold" />}
                          label="Amount"
                          value={`₹ ${parseFloat(String(chargeData?.amount || 0)).toLocaleString()}`}
                        />
                      </Grid>

                      {/* Due Date */}
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <InfoItem
                          icon={<Iconify icon="solar:calendar-date-bold" />}
                          label="Due Date"
                          value={formattedDueDate}
                        />
                      </Grid>

                      {/* Created Date */}
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <InfoItem
                          icon={<Iconify icon="solar:calendar-mark-bold" />}
                          label="Created Date"
                          value={formattedCreatedDate}
                        />
                      </Grid>

                      {/* Description */}
                      <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                        <InfoItem
                          icon={<Iconify icon="solar:notes-bold" />}
                          label="Description"
                          value={chargeData?.purposeDescription || 'No description provided.'}
                        />
                      </Grid>

                      {/* Requested By Information Section */}
                      {chargeData?.requestor && (
                        <>
                          <Grid size={{ xs: 12 }} sx={{ mt: 1 }}>
                            <Divider />
                          </Grid>
                          <Grid size={{ xs: 12 }}>
                            <Stack direction="row" alignItems="center" gap={1} mb={2}>
                              <Iconify
                                icon="solar:user-rounded-bold-duotone"
                                width={18}
                                sx={{ color: 'primary.main' }}
                              />
                              <Typography variant="subtitle2" fontWeight={700}>
                                Requested By
                              </Typography>
                            </Stack>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <InfoItem
                              icon={<Iconify icon="solar:user-id-bold" />}
                              label="Requestor Name"
                              value={chargeData.requestor.requestorName || 'N/A'}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <InfoItem
                              icon={<Iconify icon="solar:case-minimalistic-bold" />}
                              label="Role"
                              value={chargeData.requestor.requestorRole || 'N/A'}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <InfoItem
                              icon={<Iconify icon="solar:calendar-bold" />}
                              label="Requested Date"
                              value={
                                chargeData.requestor.requestedOn
                                  ? dayjs(chargeData.requestor.requestedOn).format('DD-MM-YYYY')
                                  : 'N/A'
                              }
                            />
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </Box>
                </Paper>
              </Grid>

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
          <Box
            display="flex"
            alignItems="center"
            justifyContent="flex-end"
            flexWrap="wrap"
            gap={1}
          >
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
