'use client';

import type { LabelColor } from 'src/components/label';
import type { FeeRefundRequestDto } from 'src/redux/finance/RefundManagement/feeRefundManage';

import React from 'react';
import { Label } from 'src/components/label';
import { alpha } from '@mui/material/styles';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { formatNumber } from 'src/utils/formate_number';
import { DetailGrid, DetailField, DetailSection } from 'src/components/detail-view';
import { useGetFeeRefundByIdQuery } from 'src/redux/finance/RefundManagement/feeRefundManage';
import {
  FeeRefundStatusType,
  FeeRefundStatusOptions,
  FeeRefundStatusTypeColors,
} from 'src/enums/feeRefund-status-type';
import {
  Box,
  Alert,
  Stack,
  Paper,
  Drawer,
  Button,
  Skeleton,
  Typography,
  DialogActions,
} from '@mui/material';

import RefundFeeHeadViewTable from './RefundFeeHeadViewTable';
import FinancePolicyDrawerHeader from '../../policies/components/FinancePolicyDrawerHeader';

import type { IStudentFeeData, IRefundFormProps } from '../type';
import type { IRefundFeeHeadItem } from './RefundFeeHeadViewTable';

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const RemarksFormSkeleton = () => (
  <Stack spacing={2} aria-label="Loading refund details" aria-busy="true">
    {[0, 1, 2].map((section) => (
      <Paper
        key={section}
        variant="outlined"
        sx={{ p: 2, borderRadius: 2, containerType: 'inline-size' }}
      >
        <Skeleton width="45%" height={32} sx={{ mb: 2 }} />
        <DetailGrid>
          {[0, 1, 2, 3].map((field) => (
            <Box key={field}>
              <Skeleton width="60%" />
              <Skeleton width="85%" height={24} />
            </Box>
          ))}
        </DetailGrid>
      </Paper>
    ))}
  </Stack>
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
  const refundId = student._refundRequestId;

  const {
    currentData: refundDetail,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetFeeRefundByIdQuery(refundId!, { skip: !refundId || !open.value });

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
      value: dto ? formatNumber(currentRequestAmount, 'INR') : 'N/A',
    },
    {
      label: 'Policy-calculated',
      value: dto?.calculatedAmount != null ? formatNumber(dto.calculatedAmount, 'INR') : 'N/A',
    },
    {
      label: 'Approved',
      value: dto?.approvedAmount != null ? formatNumber(dto.approvedAmount, 'INR') : 'N/A',
    },
    {
      label: 'Processed',
      value: dto?.processedAmount != null ? formatNumber(dto.processedAmount, 'INR') : 'N/A',
    },
    {
      label: 'Reversed',
      value: dto?.reversedAmount != null ? formatNumber(dto.reversedAmount, 'INR') : 'N/A',
    },
    {
      label: 'Refund Method',
      value: displayStudent?.refundMethod || 'N/A',
    },
    {
      label: 'Policy payment methods',
      value: dto?.allowedPayoutMethods?.join(', ') || 'No payment methods available',
      fullWidth: true,
    },
  ];

  const status = dto?.status ?? student.status;
  const statusOption = FeeRefundStatusOptions.find((option) => option.value === status);
  const closeView = () => onClose(null, false);
  const availableActions = dto?.availableActions ?? student._availableActions ?? [];

  return (
    <Drawer
      anchor="right"
      open={open.value}
      onClose={closeView}
      slotProps={{
        backdrop: { sx: { bgcolor: (theme) => alpha(theme.palette.common.black, 0.32) } },
      }}
      PaperProps={{
        role: 'dialog',
        'aria-modal': true,
        'aria-labelledby': 'refund-details-title',
        sx: {
          width: { xs: '100%', sm: 'min(760px, 92vw)' },
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          bgcolor: 'background.paper',
          backgroundImage: 'none',
        },
      }}
    >
      <FinancePolicyDrawerHeader
        title="View Refund Request"
        titleId="refund-details-title"
        helpText="Review the student's refund request, recorded amounts, fee head details, and settlement history."
        badges={
          statusOption && (
            <Label color={FeeRefundStatusTypeColors[status as FeeRefundStatusType] as LabelColor}>
              {statusOption.label}
            </Label>
          )
        }
        onClose={closeView}
      />
      <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
        <Stack spacing={2} sx={{ p: 2 }}>
          {loading ? (
            <RemarksFormSkeleton />
          ) : isError ? (
            <Alert
              severity="error"
              action={
                <Button size="small" color="inherit" onClick={() => refetch()}>
                  Retry
                </Button>
              }
            >
              Could not load refund details. Please try again.
            </Alert>
          ) : (
            <>
              <DetailSection
                title="Student Information"
                icon={GlobalIcons.assigned}
                helpText="Student identity and academic details associated with this refund request."
              >
                <DetailGrid>
                  <DetailField
                    label="Student name"
                    value={`${displayStudent.name}${displayStudent.grNo ? ` (${displayStudent.grNo})` : ''}`}
                  />
                  <DetailField label="Roll no." value={displayStudent.rollNo} />
                  <DetailField
                    label="Class/division"
                    value={[displayStudent.class, displayStudent.division]
                      .filter(Boolean)
                      .join(' - ')}
                  />
                  <DetailField label="Board" value={displayStudent.board} />
                  <DetailField label="Medium" value={displayStudent.medium} />
                  <DetailField
                    label="Total paid fees"
                    value={formatNumber(displayStudent.totalPaidFees, 'INR')}
                  />
                  <DetailField
                    label="Total pending fees"
                    value={formatNumber(displayStudent.totalPendingFees, 'INR')}
                  />
                </DetailGrid>
              </DetailSection>

              <DetailSection
                title="Refund Information"
                icon={GlobalIcons.receiptIcon}
                helpText="Original receipt, refund source, recorded amounts, and available policy payment methods."
              >
                <DetailGrid>
                  {infoItems.map((item) => (
                    <DetailField
                      key={item.label}
                      label={item.label}
                      value={item.value}
                      fullWidth={item.fullWidth}
                    />
                  ))}
                </DetailGrid>
              </DetailSection>

              {dto?.workflowVersion === 1 && (
                <DetailSection
                  title="Refund Timeline"
                  icon={GlobalIcons.clock}
                  helpText="Recorded request, approval, payment, and completion events for this refund."
                >
                  <Stack spacing={0.75}>
                    <Typography variant="body2">
                      Requested ·{' '}
                      {dto.submittedAt
                        ? new Date(dto.submittedAt).toLocaleString('en-IN')
                        : 'Date unavailable'}
                    </Typography>
                    {dto.status !== 0 && dto.status !== 3 && (
                      <Typography variant="body2">Approved · Refund amount authorized</Typography>
                    )}
                    {dto.settlements?.map((payout) => (
                      <React.Fragment key={payout.id}>
                        <Typography variant="body2">
                          {payout.status === 1 ? 'Payment completed' : 'Payment recorded'} ·{' '}
                          {payout.method} ·{' '}
                          {new Date(payout.settlementDate).toLocaleString('en-IN')}
                        </Typography>
                      </React.Fragment>
                    ))}
                    {dto.failureReason && (
                      <Typography variant="body2" color="error.main">
                        Failed · {dto.failureReason}
                      </Typography>
                    )}
                    {dto.status === 3 && dto.approverNotes && (
                      <Typography variant="body2" color="error.main">
                        Rejected · {dto.approverNotes}
                      </Typography>
                    )}
                    {dto.replacesRefundRequestId && (
                      <Typography variant="body2">
                        Replaces refund {dto.replacesRefundRequestId}
                      </Typography>
                    )}
                    {dto.replacedByRefundRequestId && (
                      <Typography variant="body2">
                        Replaced by refund {dto.replacedByRefundRequestId}
                      </Typography>
                    )}
                    {dto.isRefundSubledgerBalanced !== null &&
                      dto.isRefundSubledgerBalanced !== undefined && (
                        <Typography
                          variant="body2"
                          color={dto.isRefundSubledgerBalanced ? 'text.secondary' : 'error.main'}
                        >
                          Refund subledger ·{' '}
                          {formatNumber(dto.refundSubledgerNetAmount ?? 0, 'INR')} ·{' '}
                          {dto.isRefundSubledgerBalanced ? 'Balanced' : 'Needs review'}
                        </Typography>
                      )}
                  </Stack>
                </DetailSection>
              )}

              {/* Fee Head Refund Table */}
              {dto?.feeHeads && dto.feeHeads.length > 0 && (
                <DetailSection
                  title="Fee Head-Wise Refund Details"
                  icon={GlobalIcons.documentIcon}
                  helpText="Paid and refunded amounts by fee head and installment."
                >
                  <RefundFeeHeadViewTable
                    data={dto.feeHeads.map((fh): IRefundFeeHeadItem => ({
                      feeHeadId: fh.feeHeadId ?? 'paid-charges',
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
                    }))}
                  />
                </DetailSection>
              )}

              {/* Approver Notes */}
              {dto?.approverNotes && (
                <DetailSection
                  title="Approver Notes"
                  icon={GlobalIcons.notebook}
                  helpText="Notes recorded when reviewing this refund request."
                >
                  <Typography
                    variant="body2"
                    sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
                  >
                    {dto.approverNotes}
                  </Typography>
                </DetailSection>
              )}

              {dto?.settlements && dto.settlements.length > 0 && (
                <DetailSection
                  title="Settlement History"
                  icon={GlobalIcons.history}
                  helpText="Recorded payment attempts, references, amounts, and failure details."
                >
                  <Stack spacing={1}>
                    {dto.settlements.map((settlement) => (
                      <Paper key={settlement.id} variant="outlined" sx={{ p: 1.5 }}>
                        <Stack
                          direction={{ xs: 'column', sm: 'row' }}
                          spacing={1}
                          justifyContent="space-between"
                        >
                          <Box sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
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
                            {formatNumber(settlement.amount, 'INR')}
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
                </DetailSection>
              )}
            </>
          )}
        </Stack>
      </Scrollbar>

      <DialogActions
        sx={{
          px: 2,
          py: 1.5,
          borderTop: 1,
          borderColor: 'divider',
          flexShrink: 0,
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Button
          variant="outlined"
          color="inherit"
          onClick={closeView}
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Close
        </Button>
        {availableActions.includes('reject') && (
          <Button
            variant="soft"
            color="error"
            onClick={onReject}
            size="small"
            disabled={loading || isError}
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
            disabled={loading || isError}
            startIcon={<Iconify icon={GlobalIcons.tick} />}
          >
            Approve
          </Button>
        )}
      </DialogActions>
    </Drawer>
  );
};

export default RefundRemarksForm;
