'use client';

import type { FeeRefundRequestDto } from 'src/redux/finance/RefundManagement/feeRefundManage';

import React from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetFeeRefundByIdQuery } from 'src/redux/finance/RefundManagement/feeRefundManage';
import { Box, Grid, Stack, Paper, Button, Divider, Skeleton, DialogActions } from '@mui/material';

import StudentRefundInfo from './StudentRefundInfo';
import { paymentMethodsConfig } from '../../FeeCollection/Components/paymentConfigMethods';

import type { IStudentFeeData, IRefundProcessFormProps } from '../type';

export const getInitialPaymentDetails = (method?: string) => {
  if (!method || !(method in paymentMethodsConfig)) return {};
  return paymentMethodsConfig[method as keyof typeof paymentMethodsConfig].reduce(
    (acc, field) => {
      acc[field.name] = ''; // default empty
      return acc;
    },
    {} as Record<string, any>
  );
};

// ─── Skeleton shown while fetching ───────────────────────────────────────────
const RefundProcessSkeleton = () => (
  <Paper variant="outlined" sx={{ p: 1.5, mb: 1.5, borderRadius: 2 }}>
    <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
      <Skeleton variant="circular" width={18} height={18} />
      <Box>
        <Skeleton variant="text" width={140} height={18} />
        <Skeleton variant="text" width={200} height={14} />
      </Box>
    </Stack>
    <Divider sx={{ mb: 2 }} />
    <Grid container spacing={3}>
      {Array.from({ length: 8 }).map((_, i) => (
        <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
            <Skeleton variant="rounded" width={36} height={36} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={12} />
              <Skeleton variant="text" width="80%" height={18} />
            </Box>
          </Box>
        </Grid>
      ))}
    </Grid>
  </Paper>
);

// ─── Map API DTO → IStudentFeeData shape expected by StudentRefundInfo ────────
const mapDtoToStudentFeeData = (dto: FeeRefundRequestDto): IStudentFeeData => ({
  id: 0,
  name: dto.studentName ?? '',
  board: '',
  medium: '',
  class: dto.className ?? '',
  division: dto.divisionName ?? '',
  grNo: dto.studentGrNo != null ? String(dto.studentGrNo) : '',
  rollNo: dto.studentRollNo != null ? String(dto.studentRollNo) : '',
  contactNo: dto.studentContactNo ?? '',
  totalPaidFees: dto.totalAmount ?? 0,
  totalPendingFees: 0,
  refundAmount: dto.totalAmount ?? 0,
  requestDate: dto.creationTime
    ? new Date(dto.creationTime).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '',
  reasonOfRefund: dto.reason ?? '',
  refundMethod: dto.refundMethod ?? '',
  remarks: dto.approverNotes ?? '',
});

const RefundProcessForm: React.FC<IRefundProcessFormProps> = ({ open, onClose, student }) => {
  const refundId = (student as any)?._refundRequestId as string | undefined;

  // Fetch full refund details by ID using common hook
  const {
    data: refundDetail,
    isLoading: refundLoading,
    isFetching: refundFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFeeRefundByIdQuery,
    params: refundId,
    options: { skip: !refundId },
  });

  const isLoading = refundLoading || refundFetching;
  const displayStudent = refundDetail ? mapDtoToStudentFeeData(refundDetail) : student;

  const handleSubmit = () => {
    shikshaMitraToast.success({ message: 'Remarks submitted successfully' });
    onClose(null, true);
  };

  return (
    <>
      <DialogScrollContent>
        {isLoading ? <RefundProcessSkeleton /> : <StudentRefundInfo student={displayStudent} />}
      </DialogScrollContent>

      {/* 🔹 Actions */}
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={() => {
            onClose(null, false);
          }}
        >
          Cancel
        </Button>
        <Button
          variant="soft"
          color="success"
          onClick={handleSubmit}
          size="small"
          disabled={isLoading}
          startIcon={<Iconify icon={GlobalIcons.submit} />}
        >
          Generate Receipt
        </Button>
      </DialogActions>
    </>
  );
};

export default RefundProcessForm;
