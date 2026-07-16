'use client';

import { useMemo, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import { Add, Sync, Gavel, CheckCircle, AccountBalance } from '@mui/icons-material';
import {
  Box,
  Chip,
  Alert,
  Stack,
  Button,
  Divider,
  MenuItem,
  TextField,
  Typography,
  LinearProgress,
} from '@mui/material';
import {
  AdmissionCrmFinanceState,
  AdmissionCrmConcessionType,
  AdmissionCrmFeePolicyStatus,
  AdmissionCrmConcessionStatus,
  useGetAdmissionCrmFeePoliciesQuery,
  useIssueAdmissionCrmQuotationMutation,
  useDecideAdmissionCrmConcessionMutation,
  useRequestAdmissionCrmConcessionMutation,
  useGetAdmissionCrmFinancialReadinessQuery,
  useRecordAdmissionCrmFinanceStateMutation,
  useOverrideAdmissionCrmPaymentGateMutation,
  useAcknowledgeAdmissionCrmConcessionFinanceMutation,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

type Props = { leadId: string; academicYearId: string };

const financeLabels: Record<AdmissionCrmFinanceState, string> = {
  [AdmissionCrmFinanceState.NotRequired]: 'Not required',
  [AdmissionCrmFinanceState.NotStarted]: 'Not started',
  [AdmissionCrmFinanceState.Initiated]: 'Initiated',
  [AdmissionCrmFinanceState.PendingConfirmation]: 'Pending confirmation',
  [AdmissionCrmFinanceState.PartiallyConfirmed]: 'Partially confirmed',
  [AdmissionCrmFinanceState.Confirmed]: 'Confirmed',
  [AdmissionCrmFinanceState.Failed]: 'Failed',
  [AdmissionCrmFinanceState.Reversed]: 'Reversed',
  [AdmissionCrmFinanceState.Disputed]: 'Disputed',
  [AdmissionCrmFinanceState.Waived]: 'Waived',
  [AdmissionCrmFinanceState.Sponsored]: 'Sponsored',
  [AdmissionCrmFinanceState.Refunded]: 'Refunded',
};

const concessionLabels: Record<AdmissionCrmConcessionType, string> = {
  [AdmissionCrmConcessionType.Sibling]: 'Sibling',
  [AdmissionCrmConcessionType.StaffChild]: 'Staff child',
  [AdmissionCrmConcessionType.Alumni]: 'Alumni',
  [AdmissionCrmConcessionType.Merit]: 'Merit',
  [AdmissionCrmConcessionType.NeedBased]: 'Need based',
  [AdmissionCrmConcessionType.RteOrAuthority]: 'RTE or authority',
  [AdmissionCrmConcessionType.Scholarship]: 'Scholarship',
  [AdmissionCrmConcessionType.Discretionary]: 'Discretionary',
  [AdmissionCrmConcessionType.SchoolDefined]: 'School defined',
};

const readError = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error && 'data' in error) {
    const { data } = error as { data?: { errorCode?: string; detail?: string } };
    return data?.errorCode || data?.detail || fallback;
  }
  return fallback;
};

const inDays = (days: number) => {
  const value = new Date();
  value.setDate(value.getDate() + days);
  return value.toISOString().slice(0, 16);
};

export function ApplicantFinancialReadiness({ leadId, academicYearId }: Props) {
  const [policyId, setPolicyId] = useState('');
  const [quotationExpiry, setQuotationExpiry] = useState(() => inDays(7));
  const [financeState, setFinanceState] = useState(AdmissionCrmFinanceState.PendingConfirmation);
  const [confirmedAmount, setConfirmedAmount] = useState('0');
  const [financeReference, setFinanceReference] = useState('');
  const [gateOverrideReason, setGateOverrideReason] = useState('');
  const [gateOverrideUntil, setGateOverrideUntil] = useState('');
  const [concessionType, setConcessionType] = useState(AdmissionCrmConcessionType.Sibling);
  const [concessionAmount, setConcessionAmount] = useState('0');
  const [concessionPercentage, setConcessionPercentage] = useState('0');
  const [concessionReason, setConcessionReason] = useState('');
  const [concessionEvidence, setConcessionEvidence] = useState('');
  const [decisionAmount, setDecisionAmount] = useState('0');
  const [decisionReason, setDecisionReason] = useState('');
  const [ackReference, setAckReference] = useState('');

  const readinessQuery = useGetAdmissionCrmFinancialReadinessQuery({ leadId });
  const policiesQuery = useGetAdmissionCrmFeePoliciesQuery({
    academicYearId,
    status: AdmissionCrmFeePolicyStatus.Published,
    maxResultCount: 100,
  });
  const [issueQuotation, issueState] = useIssueAdmissionCrmQuotationMutation();
  const [recordFinance, financeMutationState] = useRecordAdmissionCrmFinanceStateMutation();
  const [overrideGate, overrideState] = useOverrideAdmissionCrmPaymentGateMutation();
  const [requestConcession, requestState] = useRequestAdmissionCrmConcessionMutation();
  const [decideConcession, decisionState] = useDecideAdmissionCrmConcessionMutation();
  const [acknowledgeConcession, acknowledgementState] =
    useAcknowledgeAdmissionCrmConcessionFinanceMutation();

  const readiness = readinessQuery.data;
  const quotation = readiness?.currentQuotation;
  const policies = useMemo(() => policiesQuery.data?.items || [], [policiesQuery.data?.items]);

  useEffect(() => {
    if (!policyId && policies.length) setPolicyId(policies[0].id);
  }, [policies, policyId]);
  useEffect(() => {
    if (quotation) {
      setConfirmedAmount(String(quotation.confirmedAmount));
      setFinanceReference(quotation.financeReference || '');
      setFinanceState(quotation.financeState);
    }
  }, [quotation]);

  const run = async (action: () => Promise<unknown>, success: string, fallback: string) => {
    try {
      await action();
      shikshaMitraToast.success({ message: success });
    } catch (error) {
      shikshaMitraToast.error({ message: readError(error, fallback) });
    }
  };

  const issue = () =>
    run(
      () =>
        issueQuotation({
          leadId,
          body: { feePolicyId: policyId, validUntil: new Date(quotationExpiry).toISOString() },
        }).unwrap(),
      'Admission quotation issued.',
      'Unable to issue quotation.'
    );

  return (
    <Stack component="section" sx={{ py: 0.5 }}>
      <Stack spacing={1.25}>
        <Stack direction="row" gap={1} alignItems="center" justifyContent="space-between">
          <Stack direction="row" gap={1} alignItems="center">
            <AccountBalance fontSize="small" />
            <Typography variant="subtitle2">Financial readiness</Typography>
          </Stack>
          {quotation ? (
            <Chip
              size="small"
              color={quotation.isGateSatisfied ? 'success' : 'warning'}
              label={quotation.isGateSatisfied ? 'Gate satisfied' : 'Gate pending'}
            />
          ) : null}
        </Stack>
        {(readinessQuery.isFetching || policiesQuery.isFetching) && <LinearProgress />}
        {readiness?.blockingReason ? (
          <Alert severity="warning">{readiness.blockingReason}</Alert>
        ) : null}
        {!quotation && policies.length === 0 && !policiesQuery.isFetching ? (
          <Alert severity="warning">
            No published fee policy is available. Payment is treated as not required until a policy
            and quotation are issued.
          </Alert>
        ) : (
          <Alert severity="info">
            Finance integration placeholder: record the confirmed amount and finance reference here.
            Pending, reversed, or disputed gates block later admission milestones.
          </Alert>
        )}

        {!quotation ? (
          <Stack direction={{ xs: 'column', md: 'row' }} gap={1} alignItems={{ md: 'center' }}>
            <TextField
              select
              size="small"
              label="Fee policy"
              value={policyId}
              onChange={(event) => setPolicyId(event.target.value)}
              sx={{ minWidth: 220 }}
            >
              {policies.map((policy) => (
                <MenuItem key={policy.id} value={policy.id}>
                  {policy.name} v{policy.version}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              type="datetime-local"
              label="Valid until"
              value={quotationExpiry}
              onChange={(event) => setQuotationExpiry(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <LoadingButton
              variant="contained"
              startIcon={<Add />}
              loading={issueState.isLoading}
              disabled={!policyId || !quotationExpiry}
              onClick={issue}
            >
              Issue quotation
            </LoadingButton>
          </Stack>
        ) : (
          <Stack spacing={1}>
            <Stack direction="row" gap={1} flexWrap="wrap">
              <Chip size="small" label={quotation.quotationNumber} />
              <Chip
                size="small"
                label={`Gross: ${quotation.currency} ${quotation.grossAmount.toFixed(2)}`}
              />
              <Chip
                size="small"
                label={`Concession: ${quotation.currency} ${quotation.concessionAmount.toFixed(2)}`}
              />
              <Chip
                size="small"
                label={`Net: ${quotation.currency} ${quotation.netAmount.toFixed(2)}`}
              />
              <Chip size="small" label={`Finance: ${financeLabels[quotation.financeState]}`} />
            </Stack>
            <Box sx={{ overflowX: 'auto' }}>
              <Stack sx={{ minWidth: 420 }}>
                {quotation.components.map((component) => (
                  <Stack
                    key={component.key}
                    direction="row"
                    justifyContent="space-between"
                    sx={{ py: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}
                  >
                    <Box>
                      <Typography variant="body2">{component.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {component.isRefundable ? 'Refundable' : 'Non-refundable'}
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      {quotation.currency} {component.amount.toFixed(2)}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
            <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
              <TextField
                select
                size="small"
                label="Finance state"
                value={financeState}
                onChange={(event) =>
                  setFinanceState(Number(event.target.value) as AdmissionCrmFinanceState)
                }
                sx={{ minWidth: 180 }}
              >
                {Object.entries(financeLabels).map(([value, label]) => (
                  <MenuItem key={value} value={Number(value)}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                size="small"
                type="number"
                label="Confirmed amount"
                value={confirmedAmount}
                onChange={(event) => setConfirmedAmount(event.target.value)}
              />
              <TextField
                size="small"
                label="Finance reference"
                value={financeReference}
                onChange={(event) => setFinanceReference(event.target.value)}
              />
              <LoadingButton
                variant="outlined"
                startIcon={<Sync />}
                loading={financeMutationState.isLoading}
                onClick={() =>
                  run(
                    () =>
                      recordFinance({
                        quotationId: quotation.id,
                        body: {
                          state: financeState,
                          confirmedAmount: Number(confirmedAmount),
                          financeReference: financeReference || undefined,
                          source: 'Finance reconciliation',
                          confirmedAt: new Date().toISOString(),
                        },
                      }).unwrap(),
                    'Finance state recorded.',
                    'Unable to record Finance state.'
                  )
                }
              >
                Record state
              </LoadingButton>
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
              <TextField
                size="small"
                fullWidth
                label="Gate override reason"
                value={gateOverrideReason}
                onChange={(event) => setGateOverrideReason(event.target.value)}
              />
              <TextField
                size="small"
                type="datetime-local"
                label="Override until"
                value={gateOverrideUntil}
                onChange={(event) => setGateOverrideUntil(event.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <LoadingButton
                color="warning"
                variant="outlined"
                startIcon={<Gavel />}
                loading={overrideState.isLoading}
                disabled={!gateOverrideReason.trim()}
                onClick={() =>
                  run(
                    () =>
                      overrideGate({
                        quotationId: quotation.id,
                        body: {
                          reason: gateOverrideReason,
                          until: gateOverrideUntil
                            ? new Date(gateOverrideUntil).toISOString()
                            : null,
                        },
                      }).unwrap(),
                    'Payment gate override recorded.',
                    'Unable to override payment gate.'
                  )
                }
              >
                Override gate
              </LoadingButton>
            </Stack>
          </Stack>
        )}

        <Divider />
        <Typography variant="subtitle2">Concessions and scholarships</Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
          <TextField
            select
            size="small"
            label="Type"
            value={concessionType}
            onChange={(event) =>
              setConcessionType(Number(event.target.value) as AdmissionCrmConcessionType)
            }
            sx={{ minWidth: 160 }}
          >
            {Object.entries(concessionLabels).map(([value, label]) => (
              <MenuItem key={value} value={Number(value)}>
                {label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            type="number"
            label="Amount"
            value={concessionAmount}
            onChange={(event) => setConcessionAmount(event.target.value)}
          />
          <TextField
            size="small"
            type="number"
            label="Percentage"
            value={concessionPercentage}
            onChange={(event) => setConcessionPercentage(event.target.value)}
          />
          <TextField
            size="small"
            fullWidth
            label="Reason"
            value={concessionReason}
            onChange={(event) => setConcessionReason(event.target.value)}
          />
          <TextField
            size="small"
            label="Evidence reference"
            value={concessionEvidence}
            onChange={(event) => setConcessionEvidence(event.target.value)}
          />
          <LoadingButton
            variant="outlined"
            loading={requestState.isLoading}
            disabled={
              !concessionReason.trim() ||
              (Number(concessionAmount) <= 0 && Number(concessionPercentage) <= 0)
            }
            onClick={() =>
              run(
                () =>
                  requestConcession({
                    leadId,
                    body: {
                      quotationId: quotation?.id,
                      type: concessionType,
                      requestedAmount: Number(concessionAmount),
                      requestedPercentage: Number(concessionPercentage),
                      reason: concessionReason,
                      evidenceReference: concessionEvidence || undefined,
                    },
                  }).unwrap(),
                'Concession requested.',
                'Unable to request concession.'
              )
            }
          >
            Request
          </LoadingButton>
        </Stack>

        {(readiness?.concessions || []).map((concession) => (
          <Stack
            key={concession.id}
            spacing={0.75}
            sx={{ py: 0.75, borderTop: '1px solid', borderColor: 'divider' }}
          >
            <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
              <Typography variant="body2">{concessionLabels[concession.type]}</Typography>
              <Chip size="small" label={AdmissionCrmConcessionStatus[concession.status]} />
              <Typography variant="caption" color="text.secondary">
                Requested {concession.requestedAmount || `${concession.requestedPercentage}%`}
              </Typography>
            </Stack>
            {concession.status === AdmissionCrmConcessionStatus.ApprovalPending ? (
              <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
                <TextField
                  size="small"
                  type="number"
                  label="Approved amount"
                  value={decisionAmount}
                  onChange={(event) => setDecisionAmount(event.target.value)}
                />
                <TextField
                  size="small"
                  fullWidth
                  label="Decision reason"
                  value={decisionReason}
                  onChange={(event) => setDecisionReason(event.target.value)}
                />
                <LoadingButton
                  startIcon={<CheckCircle />}
                  variant="outlined"
                  loading={decisionState.isLoading}
                  disabled={!decisionReason.trim() || Number(decisionAmount) <= 0}
                  onClick={() =>
                    run(
                      () =>
                        decideConcession({
                          concessionId: concession.id,
                          body: {
                            approve: true,
                            approvedAmount: Number(decisionAmount),
                            reason: decisionReason,
                          },
                        }).unwrap(),
                      'Concession approved for Finance review.',
                      'Unable to approve concession.'
                    )
                  }
                >
                  Approve
                </LoadingButton>
                <Button
                  color="error"
                  disabled={!decisionReason.trim() || decisionState.isLoading}
                  onClick={() =>
                    run(
                      () =>
                        decideConcession({
                          concessionId: concession.id,
                          body: { approve: false, approvedAmount: 0, reason: decisionReason },
                        }).unwrap(),
                      'Concession rejected.',
                      'Unable to reject concession.'
                    )
                  }
                >
                  Reject
                </Button>
              </Stack>
            ) : null}
            {concession.status === AdmissionCrmConcessionStatus.ApprovedPendingFinance ? (
              <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
                <TextField
                  size="small"
                  fullWidth
                  label="Finance acknowledgement reference"
                  value={ackReference}
                  onChange={(event) => setAckReference(event.target.value)}
                />
                <LoadingButton
                  loading={acknowledgementState.isLoading}
                  disabled={!ackReference.trim()}
                  onClick={() =>
                    run(
                      () =>
                        acknowledgeConcession({
                          concessionId: concession.id,
                          financeReference: ackReference,
                        }).unwrap(),
                      'Finance acknowledgement recorded.',
                      'Unable to record acknowledgement.'
                    )
                  }
                >
                  Acknowledge
                </LoadingButton>
              </Stack>
            ) : null}
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
