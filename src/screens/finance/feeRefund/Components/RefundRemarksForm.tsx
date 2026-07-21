'use client';

import type { FeeRefundRequestDto } from 'src/redux/finance/RefundManagement/feeRefundManage';

import React from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { formatCurrency } from 'src/utils/cureencyFormater';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { FeeRefundStatusType } from 'src/enums/feeRefund-status-type';
import { useGetFeeRefundByIdQuery } from 'src/redux/finance/RefundManagement/feeRefundManage';
import {
  Box,
  Card,
  Stack,
  Paper,
  Button,
  Divider,
  Skeleton,
  Typography,
  DialogActions,
} from '@mui/material';

import StudentRefundInfo from './StudentRefundInfo';
import RefundFeeHeadViewTable from './RefundFeeHeadViewTable';

import type { IStudentFeeData, IRefundFormProps } from '../type';
import type { IRefundFeeHeadItem } from './RefundFeeHeadViewTable';

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const RemarksFormSkeleton = () => (
  <>
    {/* Student info skeleton */}
    <Paper variant="outlined" sx={{ p: 1.5, mb: 1.5, borderRadius: 2 }}>
      <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
        <Skeleton variant="circular" width={18} height={18} />
        <Box>
          <Skeleton variant="text" width={140} height={18} />
          <Skeleton variant="text" width={200} height={14} />
        </Box>
      </Stack>
      <Divider sx={{ mb: 2 }} />
      <Box display="flex" flexWrap="wrap" gap={1}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Box key={i} display="flex" alignItems="flex-start" gap={1} sx={{ flex: '1 1 200px' }}>
            <Skeleton variant="rounded" width={36} height={36} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={12} />
              <Skeleton variant="text" width="80%" height={18} />
            </Box>
          </Box>
        ))}
      </Box>
    </Paper>
    {/* Info card skeleton */}
    <Card sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}>
      <Box display="flex" alignItems="stretch">
        {Array.from({ length: 4 }).map((_, i, arr) => (
          <React.Fragment key={i}>
            <Box sx={{ flex: 1, px: 3, py: 2 }}>
              <Skeleton variant="text" width="70%" height={12} />
              <Skeleton variant="text" width="50%" height={20} sx={{ mt: 0.5 }} />
            </Box>
            {i < arr.length - 1 && <Divider orientation="vertical" flexItem />}
          </React.Fragment>
        ))}
      </Box>
    </Card>
  </>
);

// ─── Map API DTO → IStudentFeeData ─────────────────────────────────────────────

const mapDtoToStudentFeeData = (dto: FeeRefundRequestDto): IStudentFeeData => ({
  id: 0,
  name: dto.studentName ?? '',
  board: dto.boardName ?? '',
  medium: dto.educationMediumName ?? '',
  class: dto.standardName ?? '',
  division: dto.divisionName ?? '',
  grNo: dto.studentGrNo != null ? String(dto.studentGrNo) : '',
  rollNo: dto.studentRollNo != null ? String(dto.studentRollNo) : '',
  contactNo: dto.studentContactNo ?? '',
  totalPaidFees: dto.totalPaidAmount ?? 0,
  totalPendingFees: 0,
  refundAmount: dto.lines?.reduce((sum, l) => sum + (l.amount ?? 0), 0) ?? 0,
  requestDate: dto.creationTime
    ? new Date(dto.creationTime).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '',
  reasonOfRefund: dto.reason ?? '',
  refundMethod: dto.refundMethod ?? '',
  reason: dto.reason ?? '',
  remarks: dto.approverNotes ?? '',
});

const RefundRemarksForm: React.FC<IRefundFormProps> = ({
  open,
  onClose,
  student,
  onReject,
  onApprove,
}) => {
  const refundId = (student as any)?._refundRequestId as string | undefined;

  const {
    data: refundDetail,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFeeRefundByIdQuery,
    params: refundId,
    options: { skip: !refundId },
  });

  const loading = isLoading || isFetching;
  const dto = refundDetail as FeeRefundRequestDto | undefined;
  const displayStudent = dto ? mapDtoToStudentFeeData(dto) : student;

  const currentRequestAmount = dto?.lines?.reduce((sum, l) => sum + (l.amount ?? 0), 0) ?? 0;

  const infoItems = [
    {
      label: 'Total Paid Amount',
      value: dto?.totalPaidAmount != null ? formatCurrency(dto.totalPaidAmount) : 'N/A',
    },
    {
      label: 'Total Refunded Amount',
      value: dto?.totalRefundedAmount != null ? formatCurrency(dto.totalRefundedAmount) : 'N/A',
    },
    {
      label: 'Current Refund Request',
      value: currentRequestAmount > 0 ? formatCurrency(currentRequestAmount) : 'N/A',
    },
    {
      label: 'Refund Method',
      value: displayStudent?.refundMethod || 'N/A',
    },
  ];

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Scrollbar sx={{ p: 2, height: '100%' }}>
        {loading ? (
          <RemarksFormSkeleton />
        ) : (
          <>
            <StudentRefundInfo
              student={displayStudent}
              status={dto?.status ?? (student as any)?.status}
            />

            {/* Info Card */}
            <Card
              sx={{
                mb: 2,
                boxShadow: 'var(--shadows-10)',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'stretch' }}>
                {infoItems.map((item, idx, arr) => (
                  <React.Fragment key={item.label}>
                    <Box sx={{ flex: '1 1 180px', px: 3, py: 2 }}>
                      <Typography
                        variant="overline"
                        sx={{
                          color: 'text.secondary',
                          display: 'block',
                          letterSpacing: 1.5,
                          fontSize: '0.65rem',
                          lineHeight: 1.4,
                        }}
                      >
                        {item.label}
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 700, mt: 0.5, fontVariantNumeric: 'tabular-nums' }}
                      >
                        {item.value}
                      </Typography>
                    </Box>
                    {idx < arr.length - 1 && <Divider orientation="vertical" flexItem />}
                  </React.Fragment>
                ))}
              </Box>
            </Card>

            {/* Fee Head Refund Table */}
            {dto?.feeHeads && dto.feeHeads.length > 0 && (
              <>
                <Typography variant="subtitle2" fontWeight={700} mb={1}>
                  Fee Head-Wise Refund Details
                </Typography>
                <RefundFeeHeadViewTable
                  data={dto.feeHeads.map(
                    (fh): IRefundFeeHeadItem => ({
                      feeHeadId: fh.feeHeadId,
                      feeHeadName: fh.feeHeadName,
                      totalPaid: fh.totalPaid,
                      totalRefunded: fh.totalRefunded,
                      items: fh.items.map((item) => ({
                        month: item.month,
                        total: item.total,
                        paid: item.paid,
                        refundAmount: item.refundAmount,
                        status: item.status,
                      })),
                    })
                  )}
                />
              </>
            )}

            {/* Approver Notes */}
            {dto?.approverNotes && (
              <Card variant="outlined" sx={{ borderRadius: 2, p: 2, mb: 2 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                  textTransform="uppercase"
                  letterSpacing={1}
                  display="block"
                  mb={0.5}
                >
                  Approver Notes
                </Typography>
                <Typography variant="body2">{dto.approverNotes}</Typography>
              </Card>
            )}
          </>
        )}
      </Scrollbar>

      {/* Actions */}
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        {(() => {
          const currentStatus = dto?.status ?? (student as any)?.status;
          const isPending =
            currentStatus === FeeRefundStatusType.Pending || currentStatus === undefined;
          if (isPending) {
            return (
              <>
                <Button
                  variant="soft"
                  color="error"
                  onClick={onReject}
                  size="small"
                  disabled={loading}
                  startIcon={<Iconify icon={GlobalIcons.cancel} />}
                >
                  Reject
                </Button>
                <Button
                  variant="soft"
                  color="success"
                  onClick={onApprove}
                  size="small"
                  disabled={loading}
                  startIcon={<Iconify icon={GlobalIcons.tick} />}
                >
                  Approve
                </Button>
              </>
            );
          }
          return (
            <Button
              variant="outlined"
              onClick={(e) => onClose(e, false)}
              size="small"
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
            >
              Cancel
            </Button>
          );
        })()}
      </DialogActions>
    </Box>
  );
};

export default RefundRemarksForm;
