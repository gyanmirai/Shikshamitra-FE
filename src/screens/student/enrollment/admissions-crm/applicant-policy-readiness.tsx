'use client';

import { LoadingButton } from '@mui/lab';
import { useMemo, useState } from 'react';
import { Gavel, FactCheck } from '@mui/icons-material';
import { shikshaMitraToast } from 'src/components/toast';
import { Chip, Alert, Paper, Stack, MenuItem, TextField, Typography } from '@mui/material';
import {
  AdmissionCrmPolicyExceptionStatus,
  AdmissionCrmPolicyEvaluationStatus,
  useGetAdmissionCrmPolicyPacksQuery,
  useGetAdmissionCrmPolicyAdoptionsQuery,
  useGetAdmissionCrmPolicyReadinessQuery,
  useEvaluateAdmissionCrmPolicyRuleMutation,
  useDecideAdmissionCrmPolicyExceptionMutation,
  useRequestAdmissionCrmPolicyExceptionMutation,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

type Props = { leadId: string; academicYearId: string };

const statusLabel: Record<AdmissionCrmPolicyEvaluationStatus, string> = {
  [AdmissionCrmPolicyEvaluationStatus.NotEvaluated]: 'Not evaluated',
  [AdmissionCrmPolicyEvaluationStatus.Satisfied]: 'Satisfied',
  [AdmissionCrmPolicyEvaluationStatus.NotSatisfied]: 'Not satisfied',
  [AdmissionCrmPolicyEvaluationStatus.EvidencePending]: 'Evidence pending',
  [AdmissionCrmPolicyEvaluationStatus.ManualReviewRequired]: 'Manual review',
  [AdmissionCrmPolicyEvaluationStatus.ExceptionApproved]: 'Exception approved',
  [AdmissionCrmPolicyEvaluationStatus.NotApplicable]: 'Not applicable',
};

export function ApplicantPolicyReadiness({ leadId, academicYearId }: Props) {
  const readiness = useGetAdmissionCrmPolicyReadinessQuery({ leadId });
  const adoptions = useGetAdmissionCrmPolicyAdoptionsQuery({ academicYearId });
  const packs = useGetAdmissionCrmPolicyPacksQuery({ maxResultCount: 200 });
  const [adoptionId, setAdoptionId] = useState('');
  const [ruleCode, setRuleCode] = useState('');
  const [evidence, setEvidence] = useState('');
  const [manualStatus, setManualStatus] = useState<AdmissionCrmPolicyEvaluationStatus | ''>('');
  const [exceptionReason, setExceptionReason] = useState('');
  const [evaluate, evaluateState] = useEvaluateAdmissionCrmPolicyRuleMutation();
  const [requestException, requestState] = useRequestAdmissionCrmPolicyExceptionMutation();
  const [decideException, decideState] = useDecideAdmissionCrmPolicyExceptionMutation();

  const selectedAdoption = adoptions.data?.find((x) => x.id === adoptionId);
  const selectedPack = packs.data?.items.find((x) => x.id === selectedAdoption?.policyPackId);
  const rules = selectedPack?.rules || [];
  const failedEvaluation = useMemo(
    () =>
      readiness.data?.evaluations.find(
        (x) =>
          x.status === AdmissionCrmPolicyEvaluationStatus.NotSatisfied ||
          x.status === AdmissionCrmPolicyEvaluationStatus.ManualReviewRequired
      ),
    [readiness.data]
  );

  const run = async (action: () => Promise<unknown>, message: string) => {
    try {
      await action();
      shikshaMitraToast.success({ message });
    } catch (error) {
      const data =
        typeof error === 'object' && error && 'data' in error
          ? (error as { data?: { errorCode?: string } }).data
          : undefined;
      shikshaMitraToast.error({ message: data?.errorCode || 'Policy action failed.' });
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
      <Stack spacing={1.25}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle2">Policy readiness</Typography>
          <Chip
            size="small"
            color={readiness.data?.isPolicyReady ? 'success' : 'warning'}
            label={
              readiness.data?.isPolicyReady
                ? 'Ready'
                : `${readiness.data?.blockingFailureCount || 0} blocking`
            }
          />
        </Stack>
        {!adoptions.data?.length && (
          <Alert severity="warning">
            Adopt a published policy pack for this admission cycle before evaluating this applicant.
          </Alert>
        )}
        <Stack direction={{ xs: 'column', md: 'row' }} gap={1} alignItems={{ md: 'center' }}>
          <TextField
            size="small"
            select
            label="Policy adoption"
            value={adoptionId}
            onChange={(e) => {
              setAdoptionId(e.target.value);
              setRuleCode('');
            }}
            sx={{ minWidth: 240 }}
          >
            {(adoptions.data || [])
              .filter((x) => x.isActive)
              .map((x) => {
                const pack = packs.data?.items.find((p) => p.id === x.policyPackId);
                return (
                  <MenuItem key={x.id} value={x.id}>
                    {pack?.name || x.policyPackId} v{x.policyPackVersion}
                  </MenuItem>
                );
              })}
          </TextField>
          <TextField
            size="small"
            select
            label="Rule"
            value={ruleCode}
            onChange={(e) => setRuleCode(e.target.value)}
            sx={{ minWidth: 240 }}
          >
            {rules.map((rule) => (
              <MenuItem key={rule.code} value={rule.code}>
                {rule.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            fullWidth
            label="Evidence reference"
            value={evidence}
            onChange={(e) => setEvidence(e.target.value)}
          />
          <TextField
            size="small"
            select
            label="Manual result"
            value={manualStatus}
            onChange={(e) =>
              setManualStatus(
                e.target.value === ''
                  ? ''
                  : (Number(e.target.value) as AdmissionCrmPolicyEvaluationStatus)
              )
            }
            sx={{ minWidth: 170 }}
          >
            <MenuItem value="">Automatic / pending</MenuItem>
            <MenuItem value={1}>Satisfied</MenuItem>
            <MenuItem value={2}>Not satisfied</MenuItem>
            <MenuItem value={3}>Evidence pending</MenuItem>
            <MenuItem value={4}>Manual review</MenuItem>
            <MenuItem value={6}>Not applicable</MenuItem>
          </TextField>
          <LoadingButton
            variant="outlined"
            startIcon={<FactCheck />}
            loading={evaluateState.isLoading}
            disabled={!adoptionId || !ruleCode}
            onClick={() =>
              run(
                () =>
                  evaluate({
                    leadId,
                    body: {
                      policyAdoptionId: adoptionId,
                      ruleCode,
                      manualStatus: manualStatus === '' ? null : manualStatus,
                      evidenceReferences: evidence.trim() ? [evidence.trim()] : [],
                    },
                  }).unwrap(),
                'Policy rule evaluated.'
              )
            }
          >
            Evaluate
          </LoadingButton>
        </Stack>
        {(readiness.data?.evaluations || []).map((item) => (
          <Stack
            key={item.id}
            direction={{ xs: 'column', md: 'row' }}
            gap={1}
            justifyContent="space-between"
            sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 0.75 }}
          >
            <Typography variant="body2">
              {item.ruleCode}
              <Typography display="block" variant="caption" color="text.secondary">
                {item.explanation}
              </Typography>
            </Typography>
            <Chip
              size="small"
              label={statusLabel[item.status]}
              color={
                item.status === 1 || item.status === 5
                  ? 'success'
                  : item.status === 2
                    ? 'error'
                    : 'default'
              }
            />
          </Stack>
        ))}
        {failedEvaluation &&
          !readiness.data?.exceptions.some(
            (x) =>
              x.evaluationId === failedEvaluation.id &&
              x.status === AdmissionCrmPolicyExceptionStatus.ApprovalPending
          ) && (
            <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
              <TextField
                size="small"
                fullWidth
                label="Exception reason"
                value={exceptionReason}
                onChange={(e) => setExceptionReason(e.target.value)}
              />
              <LoadingButton
                startIcon={<Gavel />}
                loading={requestState.isLoading}
                disabled={!exceptionReason.trim() || !evidence.trim()}
                onClick={() =>
                  run(
                    () =>
                      requestException({
                        evaluationId: failedEvaluation.id,
                        reason: exceptionReason.trim(),
                        evidenceReference: evidence.trim(),
                      }).unwrap(),
                    'Policy exception requested.'
                  )
                }
              >
                Request exception
              </LoadingButton>
            </Stack>
          )}
        {(readiness.data?.exceptions || [])
          .filter((x) => x.status === AdmissionCrmPolicyExceptionStatus.ApprovalPending)
          .map((item) => (
            <Alert
              key={item.id}
              severity="warning"
              action={
                <Stack direction="row">
                  <LoadingButton
                    size="small"
                    loading={decideState.isLoading}
                    onClick={() =>
                      run(
                        () =>
                          decideException({
                            exceptionId: item.id,
                            approve: true,
                            reason: 'Reviewed and approved.',
                          }).unwrap(),
                        'Exception approved.'
                      )
                    }
                  >
                    Approve
                  </LoadingButton>
                  <LoadingButton
                    size="small"
                    color="error"
                    loading={decideState.isLoading}
                    onClick={() =>
                      run(
                        () =>
                          decideException({
                            exceptionId: item.id,
                            approve: false,
                            reason: 'Reviewed and rejected.',
                          }).unwrap(),
                        'Exception rejected.'
                      )
                    }
                  >
                    Reject
                  </LoadingButton>
                </Stack>
              }
            >
              {item.reason}
            </Alert>
          ))}
      </Stack>
    </Paper>
  );
}
