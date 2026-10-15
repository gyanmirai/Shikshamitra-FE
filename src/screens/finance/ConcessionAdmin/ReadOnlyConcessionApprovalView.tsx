'use client';

import { useRef, useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { Box, Alert, Stack, Button, Divider, TextField, Typography } from '@mui/material';
import {
  useApproveConcessionRequestMutation,
  useGetConcessionApprovalContextQuery,
  usePreviewConcessionApprovalMutation,
} from 'src/redux/finance/ConcessionManagement/concessionManagementApi';

import type { IFeeHeadApprovalViewProps } from './type';

const money = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.ceil(value));

export default function ReadOnlyConcessionApprovalView({
  selectedItem,
  onBack,
}: IFeeHeadApprovalViewProps) {
  const requestId = selectedItem.studentConcessionTypeRequestId || selectedItem.id || '';
  const {
    data: context,
    isLoading,
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
  const commandKey = useRef('');
  const changed = (context?.feeHeadGroups ?? []).some((group) => group.hasChangedSinceSubmission);

  const handleAction = async () => {
    if (!context) return;
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
      shikshaMitraToast.error({ message: parseApiProblemDetail(error).detail });
      await refetch();
    }
  };

  return (
    <Box sx={{ p: 3, overflowY: 'auto', height: '100%' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Approve concession</Typography>
        <Button startIcon={<Iconify icon="mdi:close" />} onClick={onBack} >Back</Button>
      </Stack>
      {isLoading && <Typography>Loading financial impact…</Typography>}
      {context && (
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            {context.concessionPolicyName} · version {context.concessionPolicyVersion}
          </Typography>
          {changed && (
            <Alert severity="warning">
              The live fee balance or policy calculation has changed since submission. Refresh or
              create a new request; approval cannot reduce the submitted amount.
            </Alert>
          )}
          {context.feeHeadGroups.map((group) => (
            <Box
              key={group.feeHeadId}
              sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}
            >
              <Stack direction="row" justifyContent="space-between" mb={1}>
                <Typography fontWeight={600}>{group.feeHeadName}</Typography>
                <Typography fontWeight={700}>{money(group.requestedConcessionAmount)}</Typography>
              </Stack>
              {group.dueFeeLines
                .filter((line) => line.suggestedConcessionAmount > 0)
                .map((line) => (
                  <Stack
                    key={line.dueFeeId}
                    direction="row"
                    justifyContent="space-between"
                    py={0.5}
                  >
                    <Typography variant="body2">
                      {line.monthLabel} {line.year} · paid {money(line.paidAmount)} · outstanding{' '}
                      {money(line.outstandingAmount)}
                    </Typography>
                    <Typography variant="body2">
                      −{money(line.suggestedConcessionAmount)}
                    </Typography>
                  </Stack>
                ))}
            </Box>
          ))}
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Typography fontWeight={700}>Requested concession</Typography>
            <Typography fontWeight={700}>
              {money(context.totalRequestedConcessionAmount)}
            </Typography>
          </Stack>
          {previewTotal !== null && (
            <Alert severity="info">
              Approval will apply {money(previewTotal)}.
              {previewRefund > 0 &&
                (autoCreateRefund
                  ? ` The paid concession of ${money(previewRefund)} will create linked refund requests for separate review and payout.`
                  : ` The paid concession of ${money(previewRefund)} is refundable. Create its linked refund requests manually after approval.`)}
            </Alert>
          )}
          <TextField
            label="Approval note (optional)"
            multiline
            minRows={2}
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
              setPreviewTotal(null);
            }}
          />
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
            color="success"
            disabled={changed || isLoading}
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
