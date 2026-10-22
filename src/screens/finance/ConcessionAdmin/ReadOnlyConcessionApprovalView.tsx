'use client';

import { useRef, useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { formatNumber } from 'src/utils/formate_number';
import { shikshaMitraToast } from 'src/components/toast';
import { FormSectionCard } from 'src/components/form-section-card';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { Box, Alert, Stack, Button, Skeleton, TextField, Typography } from '@mui/material';
import {
  useApproveConcessionRequestMutation,
  useGetConcessionApprovalContextQuery,
  usePreviewConcessionApprovalMutation,
} from 'src/redux/finance/ConcessionManagement/concessionManagementApi';

import type { IFeeHeadApprovalViewProps } from './type';

const money = (value: number) => formatNumber(value, 'INR');

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
  const [, setPreviewRefund] = useState(0);
  const [, setAutoCreateRefund] = useState(true);
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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider' }}
      >
        <Typography variant="subtitle1" component="h2" fontWeight={700}>
          Approve concession
        </Typography>
        <Button
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={onBack}
          disabled={isApproving}
        >
          Back
        </Button>
      </Stack>
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          p: { xs: 1.5, sm: 2 },
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
          <Stack spacing={2}>
            <FormSectionCard
              title={selectedItem.concessionTypeName || 'Concession request'}
              icon="mdi:tag-outline"
              contentSpacing={1.5}
            >
              <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
                {context.concessionPolicyName} · version {context.concessionPolicyVersion}
              </Typography>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                gap={0.5}
                sx={{ p: 1.5, bgcolor: 'background.neutral', borderRadius: 1 }}
              >
                <Typography variant="body2">Requested concession</Typography>
                <Typography variant="subtitle2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                  {money(context.totalRequestedConcessionAmount)}
                </Typography>
              </Stack>
            </FormSectionCard>
            {changed && (
              <Alert severity="error">
                The live fee balance or policy calculation has changed since submission. Refresh or
                create a new request; approval cannot reduce the submitted amount.
              </Alert>
            )}
            {context.feeHeadGroups.map((group) => (
              <FormSectionCard
                key={group.feeHeadId}
                title={group.feeHeadName}
                icon="mdi:format-list-bulleted"
                action={
                  <Typography variant="body2" fontWeight={600}>
                    {money(group.requestedConcessionAmount)} requested
                  </Typography>
                }
                contentSpacing={1}
              >
                {group.dueFeeLines
                  .filter((line) => line.suggestedConcessionAmount > 0)
                  .map((line) => (
                    <Box
                      key={line.dueFeeId}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: 'repeat(2, minmax(0, 1fr))',
                          sm: 'minmax(0, 1fr) repeat(4, minmax(70px, 0.6fr))',
                        },
                        gap: 1,
                        py: 1,
                        '& + &': { borderTop: 1, borderColor: 'divider' },
                      }}
                    >
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Installment
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {line.monthLabel} {line.year}
                        </Typography>
                      </Box>
                      {[
                        { label: 'Original fee', amount: line.originalAmount },
                        { label: 'Paid', amount: line.paidAmount },
                        { label: 'Outstanding', amount: line.outstandingAmount },
                        { label: 'Concession', amount: line.suggestedConcessionAmount },
                      ].map((metric) => (
                        <Box
                          key={metric.label}
                          sx={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            {metric.label}
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight={metric.label === 'Concession' ? 600 : 400}
                          >
                            {money(metric.amount)}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  ))}
              </FormSectionCard>
            ))}

            <TextField
              size="small"
              fullWidth
              disabled={isApproving}
              label="Approval note (optional)"
              multiline
              minRows={2}
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
          sx={{ p: 1.5, borderTop: 1, borderColor: 'divider' }}
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
