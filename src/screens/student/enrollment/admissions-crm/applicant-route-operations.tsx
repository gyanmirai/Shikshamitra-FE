'use client';

import type { AdmissionCrmRouteImpactPreviewDto } from 'src/redux/student/admissions-crm/final-admission-contracts';

import { useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import { Gavel, Route, Preview, FactCheck, ReportProblem } from '@mui/icons-material';
import { Box, Chip, Alert, Stack, MenuItem, TextField, Typography } from '@mui/material';
import {
  AdmissionCrmRouteType,
  AdmissionCrmRouteAppealStatus,
  AdmissionCrmRouteDefinitionStatus,
} from 'src/redux/student/admissions-crm/final-admission-contracts';

import { AdmissionCrmRouteEligibilityStatus } from 'src/redux/student/admissions-crm/communication-exams-events-contracts';

import {
  useAssignAdmissionCrmRouteMutation,
  useGetAdmissionCrmRouteAppealsQuery,
  useGetAdmissionCrmRouteHistoryQuery,
  useEvaluateAdmissionCrmRouteMutation,
  useGetAdmissionCrmRouteDefinitionsQuery,
  useDecideAdmissionCrmRouteAppealMutation,
  useRequestAdmissionCrmRouteAppealMutation,
  usePreviewAdmissionCrmRouteAssignmentMutation,
} from 'src/redux/student/admissions-crm/final-admission-api';

import { ApplicantInlineNotice } from './applicant-workspace-primitives';
import {
  formatEvidenceCode,
  getApplicantRouteFields,
  getRequiredEvidenceCodes,
  emptyApplicantRouteValues,
  buildRouteEvidenceReferences,
  isApplicantRouteInputComplete,
} from './applicant-route-requirements';

type Props = {
  leadId: string;
  academicYearId: string;
  capturedRouteDefinitionId?: string | null;
};
const routeNames = Object.entries(AdmissionCrmRouteType).filter(([key]) =>
  Number.isNaN(Number(key))
) as Array<[string, number]>;
const eligibility = [
  'Pending review',
  'Evidence pending',
  'Eligible',
  'Ineligible',
  'Exception approved',
  'Withdrawn',
  'Superseded',
];

export function ApplicantRouteOperations({
  leadId,
  academicYearId,
  capturedRouteDefinitionId,
}: Props) {
  const definitions = useGetAdmissionCrmRouteDefinitionsQuery({ academicYearId });
  const history = useGetAdmissionCrmRouteHistoryQuery({ leadId });
  const appeals = useGetAdmissionCrmRouteAppealsQuery({ leadId });
  const [definitionId, setDefinitionId] = useState('');
  const [reason, setReason] = useState('Initial route assignment.');
  const [routeValues, setRouteValues] = useState(emptyApplicantRouteValues);
  const [evidenceValues, setEvidenceValues] = useState<Record<string, string>>({});
  const [appealReason, setAppealReason] = useState('');
  const [appealEvidence, setAppealEvidence] = useState('');
  const [appealStatus, setAppealStatus] = useState(AdmissionCrmRouteEligibilityStatus.Eligible);
  const [impactPreview, setImpactPreview] = useState<AdmissionCrmRouteImpactPreviewDto>();
  const [assign, assignState] = useAssignAdmissionCrmRouteMutation();
  const [evaluate, evaluateState] = useEvaluateAdmissionCrmRouteMutation();
  const [previewAssignment, previewState] = usePreviewAdmissionCrmRouteAssignmentMutation();
  const [requestAppeal, requestAppealState] = useRequestAdmissionCrmRouteAppealMutation();
  const [decideAppeal, decideAppealState] = useDecideAdmissionCrmRouteAppealMutation();
  const current = history.data?.find((x) => x.isPrimary);
  const capturedDefinitionAvailable =
    Boolean(history.data) &&
    !current &&
    Boolean(
      capturedRouteDefinitionId &&
      definitions.data?.some((definition) => definition.id === capturedRouteDefinitionId)
    );
  const selectedDefinitionId =
    definitionId || (capturedDefinitionAvailable ? capturedRouteDefinitionId : '') || '';
  const selected = definitions.data?.find((x) => x.id === selectedDefinitionId);
  const routeFields = selected ? getApplicantRouteFields(selected.routeType) : [];
  const requiredEvidenceCodes = getRequiredEvidenceCodes(
    selected?.configuration.requiredEvidenceCodes
  );
  const routeInputComplete = selected
    ? isApplicantRouteInputComplete(
        selected.routeType,
        routeValues,
        requiredEvidenceCodes,
        evidenceValues
      )
    : false;
  const availableDefinitions = (definitions.data || []).filter(
    (definition) =>
      definition.status === AdmissionCrmRouteDefinitionStatus.Published ||
      (!current && definition.id === capturedRouteDefinitionId)
  );
  const pendingAppeal = appeals.data?.find(
    (x) =>
      x.status === AdmissionCrmRouteAppealStatus.Requested ||
      x.status === AdmissionCrmRouteAppealStatus.UnderReview
  );
  const run = async (fn: () => Promise<unknown>, message: string) => {
    try {
      await fn();
      shikshaMitraToast.success({ message });
    } catch (error) {
      const data =
        typeof error === 'object' && error && 'data' in error
          ? (error as { data?: { errorCode?: string } }).data
          : undefined;
      shikshaMitraToast.error({ message: data?.errorCode || 'Route action failed.' });
    }
  };
  const routeBody = selected
    ? {
        routeDefinitionId: selected.id,
        routeData: {
          relatedStudentId:
            selected.routeType === AdmissionCrmRouteType.SiblingPriority
              ? routeValues.relatedStudentId || null
              : null,
          formerStudentId:
            selected.routeType === AdmissionCrmRouteType.ReturningStudent
              ? routeValues.relatedStudentId || null
              : null,
          authoritativeReference: routeValues.reference || null,
          authorityName: routeValues.authority || null,
          allotmentNumber: routeValues.allotment || null,
          allotmentRound: routeValues.round || null,
          admissionDeadline: routeValues.deadline
            ? new Date(`${routeValues.deadline}T23:59:59Z`).toISOString()
            : null,
          previousSchool: routeValues.previousSchool || null,
          previousBoard: routeValues.previousBoard || null,
          lastClassCompleted: routeValues.lastClass || null,
          transferCertificateStatus:
            selected.routeType === AdmissionCrmRouteType.Transfer ? 'Pending verification' : null,
          equivalenceStatus:
            selected.routeType === AdmissionCrmRouteType.OverseasReturn
              ? routeValues.reference || 'Pending'
              : null,
          country:
            selected.routeType === AdmissionCrmRouteType.OverseasReturn
              ? routeValues.authority || null
              : null,
        },
        evidenceReferences: buildRouteEvidenceReferences(requiredEvidenceCodes, evidenceValues),
        reason,
      }
    : null;
  const previewRoute = async () => {
    if (!routeBody) return;
    try {
      setImpactPreview(await previewAssignment({ leadId, body: routeBody }).unwrap());
    } catch (error) {
      await run(() => Promise.reject(error), '');
    }
  };
  const save = () =>
    routeBody &&
    run(
      () => assign({ leadId, body: routeBody }).unwrap(),
      current ? 'Admission route changed with preserved history.' : 'Admission route assigned.'
    );
  return (
    <Stack component="section" sx={{ py: 0.5 }}>
      <Stack spacing={1.25}>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="subtitle2">Admission route</Typography>
          {current && (
            <Chip
              size="small"
              label={`${routeNames.find(([, v]) => v === current.routeType)?.[0]} - ${eligibility[current.status]}`}
              color={current.status === 2 || current.status === 4 ? 'success' : 'warning'}
            />
          )}
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
          <TextField
            size="small"
            select
            label="Published route"
            value={selectedDefinitionId}
            onChange={(e) => {
              setDefinitionId(e.target.value);
              setRouteValues(emptyApplicantRouteValues());
              setEvidenceValues({});
              setImpactPreview(undefined);
            }}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="">Select route</MenuItem>
            {availableDefinitions.map((definition) => (
              <MenuItem key={definition.id} value={definition.id}>
                {definition.name} v{definition.version}
                {definition.status === AdmissionCrmRouteDefinitionStatus.Retired
                  ? ' — captured for this inquiry'
                  : ''}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            fullWidth
            label="Assignment or change reason"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setImpactPreview(undefined);
            }}
          />
        </Stack>
        {selected && (
          <Stack spacing={1.25}>
            {routeFields.length > 0 && (
              <Box
                sx={{
                  display: 'grid',
                  gap: 1,
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, minmax(0, 1fr))',
                    lg: 'repeat(3, minmax(0, 1fr))',
                  },
                }}
              >
                {routeFields.map((field) => (
                  <TextField
                    key={field.key}
                    size="small"
                    required
                    type={field.type}
                    label={field.label}
                    value={routeValues[field.key]}
                    helperText={field.helperText}
                    onChange={(event) => {
                      setRouteValues((currentValues) => ({
                        ...currentValues,
                        [field.key]: event.target.value,
                      }));
                      setImpactPreview(undefined);
                    }}
                    InputLabelProps={field.type === 'date' ? { shrink: true } : undefined}
                  />
                ))}
              </Box>
            )}
            {requiredEvidenceCodes.length > 0 ? (
              <Stack spacing={0.75}>
                <Stack spacing={0.25}>
                  <Typography variant="body2" fontWeight={600}>
                    Required evidence
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Enter the verified document or record reference for each configured item.
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    display: 'grid',
                    gap: 1,
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, minmax(0, 1fr))',
                    },
                  }}
                >
                  {requiredEvidenceCodes.map((code) => {
                    const normalizedCode = code;
                    return (
                      <TextField
                        key={normalizedCode}
                        size="small"
                        required
                        label={`${formatEvidenceCode(normalizedCode)} reference`}
                        value={evidenceValues[normalizedCode] || ''}
                        helperText={`Configured evidence code: ${normalizedCode}`}
                        onChange={(event) => {
                          setEvidenceValues((currentValues) => ({
                            ...currentValues,
                            [normalizedCode]: event.target.value,
                          }));
                          setImpactPreview(undefined);
                        }}
                      />
                    );
                  })}
                </Box>
              </Stack>
            ) : (
              routeFields.length === 0 && (
                <ApplicantInlineNotice>
                  This admission pathway does not require additional information.
                </ApplicantInlineNotice>
              )
            )}
          </Stack>
        )}
        <Stack direction="row" gap={1}>
          <LoadingButton
            startIcon={<Preview />}
            loading={previewState.isLoading}
            disabled={!selected || !reason.trim() || !routeInputComplete}
            onClick={previewRoute}
          >
            Preview impact
          </LoadingButton>
          <LoadingButton
            variant="contained"
            startIcon={<Route />}
            loading={assignState.isLoading}
            disabled={!impactPreview || !selected || !reason.trim() || !routeInputComplete}
            onClick={save}
          >
            {current ? 'Confirm route change' : 'Assign route'}
          </LoadingButton>
        </Stack>
        {impactPreview ? (
          impactPreview.hasBlockingImpact ? (
            <Alert severity="warning">
              {impactPreview.impacts.map((x) => `${x.area}: ${x.impact}`).join(' ')}
            </Alert>
          ) : (
            <ApplicantInlineNotice>
              {impactPreview.impacts.map((x) => `${x.area}: ${x.impact}`).join(' ')}
            </ApplicantInlineNotice>
          )
        ) : null}
        {current && current.status < 2 && (
          <Stack direction="row" gap={1}>
            <LoadingButton
              startIcon={<FactCheck />}
              loading={evaluateState.isLoading}
              onClick={() =>
                run(
                  () =>
                    evaluate({
                      assignmentId: current.id,
                      status: AdmissionCrmRouteEligibilityStatus.Eligible,
                      reason: 'Evidence and policy checks completed.',
                    }).unwrap(),
                  'Route marked eligible.'
                )
              }
            >
              Approve eligibility
            </LoadingButton>
            <LoadingButton
              color="warning"
              loading={evaluateState.isLoading}
              onClick={() =>
                run(
                  () =>
                    evaluate({
                      assignmentId: current.id,
                      status: AdmissionCrmRouteEligibilityStatus.EvidencePending,
                      reason: 'Required route evidence is pending.',
                    }).unwrap(),
                  'Route moved to evidence pending.'
                )
              }
            >
              Evidence pending
            </LoadingButton>
          </Stack>
        )}
        {current && (
          <Stack spacing={1}>
            <Typography variant="subtitle2">Route appeal</Typography>
            {pendingAppeal ? (
              <>
                <Alert severity="warning">
                  Appeal requests {eligibility[pendingAppeal.requestedStatus]}:{' '}
                  {pendingAppeal.reason}
                </Alert>
                <Stack direction="row" gap={1}>
                  <LoadingButton
                    startIcon={<Gavel />}
                    loading={decideAppealState.isLoading}
                    onClick={() =>
                      run(
                        () =>
                          decideAppeal({
                            appealId: pendingAppeal.id,
                            approved: true,
                            reason: 'Appeal evidence reviewed and approved.',
                          }).unwrap(),
                        'Route appeal approved.'
                      )
                    }
                  >
                    Approve appeal
                  </LoadingButton>
                  <LoadingButton
                    color="error"
                    loading={decideAppealState.isLoading}
                    onClick={() =>
                      run(
                        () =>
                          decideAppeal({
                            appealId: pendingAppeal.id,
                            approved: false,
                            reason: 'Appeal evidence does not change the original decision.',
                          }).unwrap(),
                        'Route appeal rejected.'
                      )
                    }
                  >
                    Reject appeal
                  </LoadingButton>
                </Stack>
              </>
            ) : (
              <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
                <TextField
                  size="small"
                  select
                  label="Requested outcome"
                  value={appealStatus}
                  onChange={(e) => setAppealStatus(Number(e.target.value))}
                >
                  <MenuItem value={AdmissionCrmRouteEligibilityStatus.Eligible}>Eligible</MenuItem>
                  <MenuItem value={AdmissionCrmRouteEligibilityStatus.ExceptionApproved}>
                    Exception approved
                  </MenuItem>
                  <MenuItem value={AdmissionCrmRouteEligibilityStatus.EvidencePending}>
                    Evidence pending
                  </MenuItem>
                </TextField>
                <TextField
                  size="small"
                  fullWidth
                  label="Appeal reason"
                  value={appealReason}
                  onChange={(e) => setAppealReason(e.target.value)}
                />
                <TextField
                  size="small"
                  fullWidth
                  label="Appeal evidence reference"
                  value={appealEvidence}
                  helperText="Optional. Use EVIDENCE_CODE:reference when adding supporting evidence."
                  onChange={(e) => setAppealEvidence(e.target.value)}
                />
                <LoadingButton
                  startIcon={<ReportProblem />}
                  loading={requestAppealState.isLoading}
                  disabled={appealReason.trim().length < 3}
                  onClick={() =>
                    run(
                      () =>
                        requestAppeal({
                          assignmentId: current.id,
                          requestedStatus: appealStatus,
                          reason: appealReason.trim(),
                          evidenceReferences: appealEvidence.trim() ? [appealEvidence.trim()] : [],
                        }).unwrap(),
                      'Route appeal submitted.'
                    )
                  }
                >
                  Submit appeal
                </LoadingButton>
              </Stack>
            )}
          </Stack>
        )}
        {(history.data || []).length > 1 && (
          <ApplicantInlineNotice>
            {history.data!.length} route versions are retained in the applicant history.
          </ApplicantInlineNotice>
        )}
      </Stack>
    </Stack>
  );
}
