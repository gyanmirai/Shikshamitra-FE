'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import { useSelector } from 'react-redux';
import { Box, Alert, Stack, Drawer, Button, Skeleton, DialogActions } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { fDate, fDateTime } from 'src/utils/format-time';
import { formatNumber } from 'src/utils/formate_number';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { DetailGrid, DetailField } from 'src/components/detail-view';
import { FormSectionCard } from 'src/components/form-section-card';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { financePermissions } from 'src/constants/finance-menu';
import { useGetFeeAdjustmentQuery } from 'src/redux/finance/adjustments/adjustmentApi';
import type { FeeAdjustmentDetailDto } from '../types/adjustmentApi.types';
import type { IAdjustmentViewProps } from '../types/adjustment.types';

import { useFinancePermissions } from '../../hooks/useFinancePermissions';
import FinancePolicyDrawerHeader from '../../policies/components/FinancePolicyDrawerHeader';
import { AdjustmentStatusEnum } from '../enums/adjustment.enum';
import {
  ADJUSTMENT_STATUS_COLORS,
  formatAdjustmentStatusLabel,
} from '../constants/adjustmentOptions';

const moneyColumn = (id: string, label: string): IColumn => ({
  id,
  label,
  minWidth: 130,
  align: 'right',
  isSort: false,
  isFilter: false,
  render: (value) => (value == null ? '—' : formatNumber(value, 'INR', { fractionDigits: 2 })),
});
const sourceColumns: IColumn[] = [
  { id: 'installmentLabel', label: 'Installment', minWidth: 150, isSort: false, isFilter: false },
  { id: 'feeHeadName', label: 'Fee head', minWidth: 140, isSort: false, isFilter: false },
  moneyColumn('paidAmount', 'Paid'),
  moneyColumn('adjustableAmount', 'Adjustable'),
  moneyColumn('requestedAmount', 'Requested'),
];
const allocationColumns: IColumn[] = [
  { id: 'installmentLabel', label: 'Installment', minWidth: 150, isSort: false, isFilter: false },
  { id: 'feeHeadName', label: 'Fee head', minWidth: 140, isSort: false, isFilter: false },
  moneyColumn('amount', 'Applied'),
  { id: 'applyBatchNumber', label: 'Batch', minWidth: 80, isSort: false, isFilter: false },
  {
    id: 'appliedOn',
    label: 'Applied on',
    minWidth: 160,
    isSort: false,
    isFilter: false,
    render: (value) => (value ? fDateTime(value) : '—'),
  },
];

export default function AdjustmentView({
  adjustmentId,
  viewMeta,
  onClose,
  onApprove,
  onReject,
  showApprove = false,
  showReject = false,
}: IAdjustmentViewProps) {
  const access = useFinancePermissions(financePermissions.fees.adjustment);
  const actorId = useSelector((state: RootState) => state.auth.user?.sub);
  const query = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFeeAdjustmentQuery,
    params: adjustmentId,
    options: { skip: !adjustmentId || !access.canView },
  });
  const detail: FeeAdjustmentDetailDto | undefined = query.currentData;
  const loading = query.isLoading || query.isFetching;
  const status = detail?.status ?? viewMeta.status;
  const mayDecide = Boolean(
    detail &&
    !loading &&
    !query.isError &&
    actorId &&
    (detail.requestedByUserId ?? viewMeta.requestedByUserId) !== actorId
  );
  const canApply =
    mayDecide &&
    access.canApprove &&
    detail?.availableActions?.includes('Approve') &&
    (status === AdjustmentStatusEnum.Pending || status === AdjustmentStatusEnum.PartiallyApplied);
  const studentFields = detail
    ? [
        { label: 'Student name', value: detail.studentName },
        { label: 'GR no.', value: detail.studentGrNo },
        { label: 'Roll no.', value: detail.rollNo },
        {
          label: 'Class / Division',
          value: [detail.className, detail.divisionName].filter(Boolean).join(' / '),
        },
        { label: 'Contact no.', value: detail.contactNo },
      ]
    : [];
  const informationFields = detail
    ? [
        { label: 'Voucher', value: detail.voucherNumber },
        {
          label: 'Requested amount',
          value: formatNumber(detail.requestedAmount, 'INR', { fractionDigits: 2 }),
        },
        {
          label: 'Applied amount',
          value: formatNumber(detail.appliedAmount, 'INR', { fractionDigits: 2 }),
        },
        {
          label: 'Remaining amount',
          value: formatNumber(detail.remainingAmount, 'INR', { fractionDigits: 2 }),
        },
        { label: 'Requested by', value: detail.requestedByName },
        {
          label: 'Requested on',
          value: detail.createdAt ? fDate(detail.createdAt, 'DD-MM-YYYY') : undefined,
        },
        { label: 'Remarks', value: detail.remarks || detail.reason, fullWidth: true },
        ...(detail.reason && detail.remarks && detail.reason !== detail.remarks
          ? [{ label: 'Reason', value: detail.reason, fullWidth: true }]
          : []),
      ]
    : [];

  return (
    <Drawer
      anchor="right"
      open
      onClose={onClose}
      PaperProps={{
        role: 'dialog',
        'aria-modal': true,
        'aria-labelledby': 'adjustment-details-title',
        sx: {
          width: { xs: '100%', sm: 'min(760px, 92vw)' },
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          height: 1,
          bgcolor: 'background.paper',
          backgroundImage: 'none',
        },
      }}
    >
      <FinancePolicyDrawerHeader
        title="View Adjustment Request"
        titleId="adjustment-details-title"
        onClose={onClose}
        helpText="Review the student, source fee lines, recorded adjustment amounts and allocation history. Approval applies a non-cash adjustment to eligible outstanding fees."
        badges={
          <Label color={ADJUSTMENT_STATUS_COLORS[status] ?? 'default'}>
            {formatAdjustmentStatusLabel(status)}
          </Label>
        }
      />
      <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
        <Stack spacing={2} sx={{ p: 2, minWidth: 0 }}>
          {loading ? (
            <Stack spacing={2} aria-label="Loading adjustment details" aria-busy="true">
              {[0, 1, 2].map((section) => (
                <Skeleton key={section} variant="rounded" height={180} />
              ))}
            </Stack>
          ) : query.isError || !detail ? (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={() => query.refetch()}>
                  Retry
                </Button>
              }
            >
              Could not load adjustment details. Please try again.
            </Alert>
          ) : (
            <>
              {detail.unavailableReason && (
                <Alert severity="info">{detail.unavailableReason}</Alert>
              )}
              <FormSectionCard
                title="Student Information"
                sx={{ containerType: 'inline-size', minWidth: 0 }}
                icon={GlobalIcons.assigned}
                descriptionTooltip="Student identity and academic details associated with this adjustment request."
              >
                <DetailGrid>
                  {studentFields.map((field) => (
                    <DetailField key={field.label} {...field} />
                  ))}
                </DetailGrid>
              </FormSectionCard>
              <FormSectionCard
                title="Adjustment Information"
                sx={{ containerType: 'inline-size', minWidth: 0 }}
                icon={GlobalIcons.notebook}
                descriptionTooltip="The recorded request, applied balance, remaining balance and remarks. A remaining amount may be applied in a later batch."
              >
                <DetailGrid>
                  {informationFields.map((field) => (
                    <DetailField key={field.label} {...field} />
                  ))}
                </DetailGrid>
              </FormSectionCard>
              <FormSectionCard
                title="Source Fee Lines"
                icon={GlobalIcons.receiptIcon}
                descriptionTooltip="Fee installments included in the request, with their paid, adjustable and requested amounts."
              >
                <CustomizableTable
                  tableId="adjustment-source-lines-table"
                  tableTitle="Adjustment source fee lines"
                  variant="embedded"
                  columns={sourceColumns}
                  data={detail.sourceLines ?? []}
                  showToolbar={false}
                  isPagination={false}
                  isSearch={false}
                  isFilter={false}
                  isShowedDense={false}
                  noDataText="No source fee lines recorded."
                />
              </FormSectionCard>
              {Boolean(detail.targetAllocations?.length) && (
                <FormSectionCard
                  title="Applied Allocations"
                  icon={GlobalIcons.history}
                  descriptionTooltip="Recorded applications of this adjustment, including each target installment, batch and application date."
                >
                  <CustomizableTable
                    tableId="adjustment-target-allocations-table"
                    tableTitle="Applied adjustment allocations"
                    variant="embedded"
                    columns={allocationColumns}
                    data={detail.targetAllocations}
                    showToolbar={false}
                    isPagination={false}
                    isSearch={false}
                    isFilter={false}
                    isShowedDense={false}
                  />
                </FormSectionCard>
              )}
              {(detail.processedByName ||
                detail.processedAt ||
                detail.approverNotes ||
                detail.rejectionReason) && (
                <FormSectionCard
                  title="Review Information"
                  sx={{ containerType: 'inline-size', minWidth: 0 }}
                  icon={GlobalIcons.clock}
                  descriptionTooltip="The reviewer, review date and notes recorded for this adjustment."
                >
                  <DetailGrid>
                    <DetailField label="Processed by" value={detail.processedByName} />
                    <DetailField
                      label="Processed on"
                      value={detail.processedAt ? fDateTime(detail.processedAt) : undefined}
                    />
                    {detail.approverNotes && (
                      <DetailField label="Approval notes" value={detail.approverNotes} fullWidth />
                    )}
                    {detail.rejectionReason && (
                      <DetailField
                        label="Rejection reason"
                        value={detail.rejectionReason}
                        fullWidth
                      />
                    )}
                  </DetailGrid>
                </FormSectionCard>
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
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={onClose}
        >
          Close
        </Button>
        {showReject &&
          mayDecide &&
          access.canReject &&
          detail?.availableActions?.includes('Reject') &&
          status === AdjustmentStatusEnum.Pending && (
            <Button
              variant="soft"
              color="error"
              size="small"
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={onReject}
            >
              Reject
            </Button>
          )}
        {showApprove && canApply && (
          <Button
            variant="soft"
            color="success"
            size="small"
            startIcon={<Iconify icon={GlobalIcons.tick} />}
            onClick={onApprove}
          >
            {status === AdjustmentStatusEnum.PartiallyApplied
              ? 'Apply remaining'
              : 'Approve and apply'}
          </Button>
        )}
      </DialogActions>
    </Drawer>
  );
}
