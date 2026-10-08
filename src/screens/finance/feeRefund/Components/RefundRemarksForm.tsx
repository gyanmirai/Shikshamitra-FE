'use client';

import type { FeeRefundRequestDto } from 'src/redux/finance/RefundManagement/feeRefundManage';

import React from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { formatCurrency } from 'src/utils/cureencyFormater';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
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
      label: 'Voucher',
      value: dto?.voucherNumber || 'N/A',
    },
    {
      label: 'Original Receipt',
      value: dto?.originalReceiptNumber || 'N/A',
    },
    {
      label: 'Source',
      value: dto?.concessionRequestId ? 'Approved concession' : dto?.refundPolicyName || 'N/A',
    },
    {
      label: 'Requested',
      value: currentRequestAmount > 0 ? formatCurrency(currentRequestAmount) : 'N/A',
    },
    {
      label: 'Policy-calculated',
      value: dto?.calculatedAmount ? formatCurrency(dto.calculatedAmount) : 'N/A',
    },
    {
      label: 'Approved',
      value: dto?.approvedAmount ? formatCurrency(dto.approvedAmount) : 'N/A',
    },
    {
      label: 'Processed',
      value: dto?.processedAmount ? formatCurrency(dto.processedAmount) : 'N/A',
    },
    {
      label: 'Reversed',
      value: dto?.reversedAmount ? formatCurrency(dto.reversedAmount) : 'N/A',
    },
    {
      label: 'Refund Method',
      value: displayStudent?.refundMethod || 'N/A',
    },
    {
      label: 'Policy payment methods',
      value: dto?.allowedPayoutMethods?.join(', ') || 'No payment methods available',
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

            {dto?.workflowVersion === 1 && (
              <Card variant="outlined" sx={{ borderRadius: 2, p: 2, mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} mb={1}>Refund timeline</Typography>
                <Stack spacing={0.75}>
                  <Typography variant="body2">Requested · {dto.submittedAt
                    ? new Date(dto.submittedAt).toLocaleString('en-IN') : 'Date unavailable'}</Typography>
                  {dto.status !== 0 && dto.status !== 3 &&
                    <Typography variant="body2">Approved · Full amount reserved</Typography>}
                  {dto.settlements?.map((payout) => <React.Fragment key={payout.id}>
                    <Typography variant="body2">Payment recorded · {payout.method} · {new Date(payout.settlementDate).toLocaleString('en-IN')}</Typography>
                    {payout.verifiedAt && <Typography variant="body2">Outcome verified · {new Date(payout.verifiedAt).toLocaleString('en-IN')}</Typography>}
                  </React.Fragment>)}
                  {dto.status === 2 && dto.settlements?.some((payout) => payout.status === 0) &&
                    <Typography variant="body2" color="info.main">Awaiting payment verification</Typography>}
                  {dto.failureReason && <Typography variant="body2" color="error.main">Failed · {dto.failureReason}</Typography>}
                  {dto.status === 3 && dto.approverNotes && <Typography variant="body2" color="error.main">Rejected · {dto.approverNotes}</Typography>}
                  {dto.replacesRefundRequestId && <Typography variant="body2">Replaces refund {dto.replacesRefundRequestId}</Typography>}
                  {dto.replacedByRefundRequestId && <Typography variant="body2">Replaced by refund {dto.replacedByRefundRequestId}</Typography>}
                  {dto.isRefundSubledgerBalanced !== null && dto.isRefundSubledgerBalanced !== undefined &&
                    <Typography variant="body2" color={dto.isRefundSubledgerBalanced ? 'text.secondary' : 'error.main'}>
                      Refund subledger · {formatCurrency(dto.refundSubledgerNetAmount ?? 0)} · {dto.isRefundSubledgerBalanced ? 'Balanced' : 'Needs review'}
                    </Typography>}
                </Stack>
              </Card>
            )}

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

            {dto?.settlements && dto.settlements.length > 0 && (
              <Card variant="outlined" sx={{ borderRadius: 2, p: 2, mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} mb={1}>
                  Settlement History
                </Typography>
                <Stack spacing={1}>
                  {dto.settlements.map((settlement) => (
                    <Paper key={settlement.id} variant="outlined" sx={{ p: 1.5 }}>
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1}
                        justifyContent="space-between"
                      >
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            Attempt {settlement.attemptNumber} · {settlement.method}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(settlement.settlementDate).toLocaleString('en-IN')}
                            {settlement.externalReference
                              ? ` · Ref: ${settlement.externalReference}`
                              : ''}
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={700}>
                          {formatCurrency(settlement.amount)}
                        </Typography>
                      </Stack>
                      {settlement.failureReason && (
                        <Typography variant="caption" color="error.main">
                          {settlement.failureReason}
                        </Typography>
                      )}
                    </Paper>
                  ))}
                </Stack>
              </Card>
            )}
          </>
        )}
      </Scrollbar>

      {/* Actions */}
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        {(() => {
          const availableActions = dto?.availableActions ?? (student as any)?._availableActions ?? [];
          if (availableActions.includes('approve') || availableActions.includes('reject')) {
            return (
              <>
                {availableActions.includes('reject') && (
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
                )}
                {availableActions.includes('approve') && (
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
                )}
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
