'use client';

import type { AdmissionCrmRouteImpactPreviewDto } from 'src/redux/student/admissions-crm/admissions-crm-api';

import { useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import { Chip, Alert, Stack, MenuItem, TextField, Typography } from '@mui/material';
import { Gavel, Route, Preview, FactCheck, ReportProblem } from '@mui/icons-material';
import {
  AdmissionCrmRouteType,
  AdmissionCrmRouteAppealStatus,
  AdmissionCrmRouteDefinitionStatus,
  AdmissionCrmRouteEligibilityStatus,
  useAssignAdmissionCrmRouteMutation,
  useGetAdmissionCrmRouteAppealsQuery,
  useGetAdmissionCrmRouteHistoryQuery,
  useEvaluateAdmissionCrmRouteMutation,
  useGetAdmissionCrmRouteDefinitionsQuery,
  useDecideAdmissionCrmRouteAppealMutation,
  useRequestAdmissionCrmRouteAppealMutation,
  usePreviewAdmissionCrmRouteAssignmentMutation,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { ApplicantInlineNotice } from './applicant-workspace-primitives';

type Props = { leadId: string; academicYearId: string };
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

export function ApplicantRouteOperations({ leadId, academicYearId }: Props) {
  const definitions = useGetAdmissionCrmRouteDefinitionsQuery({ academicYearId });
  const history = useGetAdmissionCrmRouteHistoryQuery({ leadId });
  const appeals = useGetAdmissionCrmRouteAppealsQuery({ leadId });
  const [definitionId, setDefinitionId] = useState('');
  const [reason, setReason] = useState('Initial route assignment.');
  const [evidence, setEvidence] = useState('');
  const [reference, setReference] = useState('');
  const [authority, setAuthority] = useState('');
  const [allotment, setAllotment] = useState('');
  const [round, setRound] = useState('');
  const [previousSchool, setPreviousSchool] = useState('');
  const [previousBoard, setPreviousBoard] = useState('');
  const [lastClass, setLastClass] = useState('');
  const [relatedStudentId, setRelatedStudentId] = useState('');
  const [deadline, setDeadline] = useState('');
  const [appealReason, setAppealReason] = useState('');
  const [appealStatus, setAppealStatus] = useState(AdmissionCrmRouteEligibilityStatus.Eligible);
  const [impactPreview, setImpactPreview] = useState<AdmissionCrmRouteImpactPreviewDto>();
  const [assign, assignState] = useAssignAdmissionCrmRouteMutation();
  const [evaluate, evaluateState] = useEvaluateAdmissionCrmRouteMutation();
  const [previewAssignment, previewState] = usePreviewAdmissionCrmRouteAssignmentMutation();
  const [requestAppeal, requestAppealState] = useRequestAdmissionCrmRouteAppealMutation();
  const [decideAppeal, decideAppealState] = useDecideAdmissionCrmRouteAppealMutation();
  const selected = definitions.data?.find((x) => x.id === definitionId);
  const current = history.data?.find((x) => x.isPrimary);
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
              ? relatedStudentId || null
              : null,
          formerStudentId:
            selected.routeType === AdmissionCrmRouteType.ReturningStudent
              ? relatedStudentId || null
              : null,
          authoritativeReference: reference || null,
          authorityName: authority || null,
          allotmentNumber: allotment || null,
          allotmentRound: round || null,
          admissionDeadline: deadline ? new Date(`${deadline}T23:59:59Z`).toISOString() : null,
          previousSchool: previousSchool || null,
          previousBoard: previousBoard || null,
          lastClassCompleted: lastClass || null,
          transferCertificateStatus:
            selected.routeType === AdmissionCrmRouteType.Transfer ? 'Pending verification' : null,
          equivalenceStatus:
            selected.routeType === AdmissionCrmRouteType.OverseasReturn
              ? reference || 'Pending'
              : null,
          country:
            selected.routeType === AdmissionCrmRouteType.OverseasReturn ? authority || null : null,
        },
        evidenceReferences: evidence
          .split(',')
          .map((x) => x.trim())
          .filter(Boolean),
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
            value={definitionId}
            onChange={(e) => {
              setDefinitionId(e.target.value);
              setImpactPreview(undefined);
            }}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value="">Select route</MenuItem>
            {(definitions.data || [])
              .filter((x) => x.status === AdmissionCrmRouteDefinitionStatus.Published)
              .map((x) => (
                <MenuItem key={x.id} value={x.id}>
                  {x.name} v{x.version}
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
          <TextField
            size="small"
            fullWidth
            label="Evidence references"
            value={evidence}
            onChange={(e) => {
              setEvidence(e.target.value);
              setImpactPreview(undefined);
            }}
          />
        </Stack>
        {selected && (
          <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
            <TextField
              size="small"
              label={
                selected.routeType === AdmissionCrmRouteType.ReturningStudent
                  ? 'Former student ID'
                  : 'Related student ID'
              }
              value={relatedStudentId}
              onChange={(e) => setRelatedStudentId(e.target.value)}
            />
            <TextField
              size="small"
              label="Authority / country"
              value={authority}
              onChange={(e) => setAuthority(e.target.value)}
            />
            <TextField
              size="small"
              label="Authority / staff reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
            <TextField
              size="small"
              label="Allotment number"
              value={allotment}
              onChange={(e) => setAllotment(e.target.value)}
            />
            <TextField
              size="small"
              label="Round"
              value={round}
              onChange={(e) => setRound(e.target.value)}
            />
            <TextField
              size="small"
              label="Previous school"
              value={previousSchool}
              onChange={(e) => setPreviousSchool(e.target.value)}
            />
            <TextField
              size="small"
              label="Previous board"
              value={previousBoard}
              onChange={(e) => setPreviousBoard(e.target.value)}
            />
            <TextField
              size="small"
              label="Last class"
              value={lastClass}
              onChange={(e) => setLastClass(e.target.value)}
            />
            <TextField
              size="small"
              type="date"
              label="Admission deadline"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        )}
        <Stack direction="row" gap={1}>
          <LoadingButton
            startIcon={<Preview />}
            loading={previewState.isLoading}
            disabled={!selected || !reason.trim()}
            onClick={previewRoute}
          >
            Preview impact
          </LoadingButton>
          <LoadingButton
            variant="contained"
            startIcon={<Route />}
            loading={assignState.isLoading}
            disabled={!impactPreview || !selected || !reason.trim()}
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
                          evidenceReferences: evidence
                            .split(',')
                            .map((x) => x.trim())
                            .filter(Boolean),
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
