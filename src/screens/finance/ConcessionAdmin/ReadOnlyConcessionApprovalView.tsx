'use client';

import type { IData, IColumn } from 'src/components/customizabaleTable/types';

import { useRef, useState, useEffect } from 'react';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { formatNumber } from 'src/utils/formate_number';
import { concessionBenefitBlockerMessage } from 'src/utils/concession-benefit-blocker';
import { shikshaMitraToast } from 'src/components/toast';
import { FormSectionCard } from 'src/components/form-section-card';
import { DetailField } from 'src/components/detail-view';
import CustomizableTable from 'src/components/customizabaleTable';
import { concessionErrorMessage } from '../Concession/Components/concessionValueValidation';
import { Box, Alert, Stack, Button, Skeleton, TextField, Typography } from '@mui/material';
import {
  useApproveConcessionRequestMutation,
  useGetConcessionApprovalContextQuery,
  usePreviewConcessionApprovalMutation,
} from 'src/redux/finance/ConcessionManagement/concessionManagementApi';

import type { IFeeHeadApprovalViewProps } from './type';

const money = (value: number) => formatNumber(value, 'INR');

const breakdownColumns: IColumn[] = (
  [
    {
      id: 'feeHeadName',
      label: 'Fee head',
      minWidth: 170,
      rowHeader: true,
      render: (value, row) => (
        <>
          <Typography variant="body2">{value}</Typography>
          {row.groupRequestedAmount != null && (
            <Typography variant="caption" color="text.secondary">
              {money(row.groupRequestedAmount)} requested
            </Typography>
          )}
        </>
      ),
    },
    {
      id: 'monthLabel',
      label: 'Installment',
      minWidth: 110,
      render: (value, row) => (row.missingInstallment ? '—' : `${value} ${row.year}`),
    },
    ...[
      { id: 'originalAmount', label: 'Original fee' },
      { id: 'paidAmount', label: 'Paid' },
      { id: 'outstandingAmount', label: 'Outstanding' },
      { id: 'suggestedConcessionAmount', label: 'Concession' },
    ].map(({ id, label }): IColumn => ({
      id,
      label,
      align: 'right',
      minWidth: 100,
      render: (value, row) => (row.missingInstallment ? '—' : money(value)),
    })),
  ] satisfies IColumn[]
).map((column) => ({
  ...column,
  isFilter: false,
  isSort: false,
  headerSx: { px: 1.25, py: 0.75 },
  cellSx: { px: 1.25, py: 0.75, fontVariantNumeric: 'tabular-nums' },
}));

export default function ReadOnlyConcessionApprovalView({
  selectedItem,
  onBack,
}: IFeeHeadApprovalViewProps) {
  const requestId = selectedItem.studentConcessionTypeRequestId || selectedItem.id || '';
  const {
    data: context,
    isLoading,
    isError,
    refetch,
  } = useGetConcessionApprovalContextQuery(requestId, {
    skip: !requestId,
  });
  const [previewApproval, { isLoading: isPreviewing }] = usePreviewConcessionApprovalMutation();
  const [approve, { isLoading: isApproving }] = useApproveConcessionRequestMutation();
  const [previewTotal, setPreviewTotal] = useState<number | null>(null);
  const [previewRefund, setPreviewRefund] = useState(0);
  const [autoCreateRefund, setAutoCreateRefund] = useState(true);
  const [message, setMessage] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const commandKey = useRef('');
  const changed = (context?.feeHeadGroups ?? []).some((group) => group.hasChangedSinceSubmission);
  const benefitBlocker = context?.benefitBlocker;
  const breakdownRows = (context?.feeHeadGroups ?? []).flatMap<IData>((group) => {
    const lines = group.dueFeeLines.filter((line) => line.suggestedConcessionAmount > 0);
    // Keep the saved group total visible when changed live balances leave no
    // eligible installment; unavailable current amounts use neutral placeholders.
    if (!lines.length)
      return [
        {
          id: `${group.feeHeadId}-unavailable`,
          feeHeadName: group.feeHeadName,
          groupRequestedAmount: group.requestedConcessionAmount,
          missingInstallment: true,
        },
      ];
    return lines.map((line, index) => ({
      ...line,
      id: `${group.feeHeadId}-${line.dueFeeId}`,
      feeHeadName: group.feeHeadName,
      groupRequestedAmount: index === 0 ? group.requestedConcessionAmount : null,
    }));
  });
  useEffect(() => {
    if (benefitBlocker) setPreviewTotal(null);
  }, [benefitBlocker]);

  const handleAction = async () => {
    if (!context || benefitBlocker || isError || changed) return;
    setActionError(null);
    try {
      if (previewTotal === null) {
        const result = await previewApproval({
          concessionRequestId: requestId,
          body: {
            requestConcurrencyStamp: context.requestConcurrencyStamp,
            previewFingerprint: context.previewFingerprint,
          },
        }).unwrap();
        setPreviewTotal(result.totalApprovedAmount);
        setPreviewRefund(result.refundRequestAmount);
        setAutoCreateRefund(result.autoCreateRefund);
        return;
      }
      const result = await approve({
        studentConcessionTypeRequestId: requestId,
        body: {
          message: message.trim() || undefined,
          requestConcurrencyStamp: context.requestConcurrencyStamp,
          previewFingerprint: context.previewFingerprint,
          idempotencyKey: (commandKey.current ||= window.crypto.randomUUID()),
        },
      }).unwrap();
      shikshaMitraToast.success({
        message:
          result.refundRequests.length > 0
            ? `Concession approved. ${result.refundRequests.length} refund request(s) submitted for review.`
            : 'Concession approved successfully.',
      });
      onBack();
    } catch (error) {
      setPreviewTotal(null);
      setPreviewRefund(0);
      const detail = concessionErrorMessage(
        error,
        'Could not approve this concession. Refresh and review the request.'
      );
      setActionError(detail);
      shikshaMitraToast.error({ message: detail });
      await refetch();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <Stack
        direction="row"
        alignItems="center"
        gap={1}
        sx={{ px: 1.25, py: 0.75, borderBottom: 1, borderColor: 'divider' }}
      >
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          startIcon={<Iconify icon={GlobalIcons.back} />}
          onClick={onBack}
          disabled={isApproving}
        >
          Back
        </Button>
        <Typography variant="subtitle1" component="h2">
          Approve Concession
        </Typography>
      </Stack>
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          p: 1.25,
          '& .MuiCard-root': { boxShadow: 'none' },
        }}
      >
        {isLoading && (
          <Stack spacing={1.5} aria-label="Loading financial impact" aria-busy="true">
            <Skeleton variant="rounded" height={90} />
            <Skeleton variant="rounded" height={180} />
          </Stack>
        )}
        {isError && (
          <Alert
            severity="error"
            action={
              <Button size="small" onClick={() => refetch()}>
                Retry
              </Button>
            }
          >
            Unable to load financial impact. Try again.
          </Alert>
        )}
        {context && (
          <Stack spacing={1}>
            <FormSectionCard
              title={selectedItem.concessionTypeName || 'Concession request'}
              icon="mdi:tag-outline"
              description={`${context.concessionPolicyName} · version ${context.concessionPolicyVersion}`}
              descriptionTooltip="The saved concession type, policy version and total requested amount."
              iconSize={16}
              iconContainerSize={28}
              contentSpacing={0.75}
              actionFullWidthOnMobile
              action={
                <DetailField
                  layout="inline"
                  label="Requested concession"
                  value={money(context.totalRequestedConcessionAmount)}
                />
              }
              sx={{
                p: { xs: 1.25, sm: 1.25 },
                '& .MuiTypography-root': { overflowWrap: 'anywhere' },
              }}
            />
            {changed && (
              <Alert severity="error">
                The live fee balance or policy calculation has changed since submission. Refresh or
                create a new request; approval cannot reduce the submitted amount.
              </Alert>
            )}
            {benefitBlocker && (
              <Alert severity="error">{concessionBenefitBlockerMessage(benefitBlocker)}</Alert>
            )}
            {actionError && <Alert severity="error">{actionError}</Alert>}
            {previewTotal !== null && previewRefund > 0 && !autoCreateRefund && (
              <Alert severity="warning">
                A refund of {money(previewRefund)} requires a separate request. After approval,
                create its linked refund requests manually.
              </Alert>
            )}
            <FormSectionCard
              title="Fee Breakdown"
              icon={GlobalIcons.notebook}
              descriptionTooltip="Saved installment amounts grouped by fee head. Review the original, paid, outstanding and concession amounts before approval."
              iconSize={16}
              iconContainerSize={28}
              contentSpacing={0.75}
              sx={{ p: { xs: 1.25, sm: 1.25 } }}
            >
              <CustomizableTable
                tableId={`concession-approval-breakdown-${requestId}`}
                tableTitle="Concession fee breakdown"
                variant="embedded"
                columns={breakdownColumns}
                data={breakdownRows}
                showToolbar={false}
                showColumns={false}
                showExport={false}
                showFullScreen={false}
                isSearch={false}
                isFilter={false}
                isPagination={false}
                isShowedDense={false}
                noDataText="No requested installments to review."
                wrapperProps={{ sx: { flex: '0 0 auto', minWidth: 0 } }}
                tableContainerProps={{ sx: { height: 'auto' } }}
              />
            </FormSectionCard>

            <TextField
              size="small"
              fullWidth
              disabled={isApproving}
              label="Approval note (optional)"
              multiline
              minRows={1}
              maxRows={3}
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
                setPreviewTotal(null);
              }}
            />
          </Stack>
        )}
      </Box>
      {context && (
        <Stack
          direction="row"
          justifyContent="flex-end"
          sx={{ px: 1.25, py: 1, borderTop: 1, borderColor: 'divider' }}
        >
          <LoadingButton
            startIcon={
              <Iconify
                icon={
                  previewTotal === null
                    ? 'mdi:clipboard-text-search-outline'
                    : 'mdi:check-circle-outline'
                }
              />
            }
            variant="contained"
            size="small"
            disabled={changed || isLoading || isError || Boolean(benefitBlocker)}
            loading={isPreviewing || isApproving}
            onClick={handleAction}
          >
            {previewTotal === null ? 'Review impact' : 'Confirm approval'}
          </LoadingButton>
        </Stack>
      )}
    </Box>
  );
}
