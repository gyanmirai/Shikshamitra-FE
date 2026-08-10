'use client';

import type { RootState } from 'src/redux/store';

import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { LoadingButton } from 'src/components/loading-button';
import {
  Box,
  Chip,
  Alert,
  Paper,
  Stack,
  Button,
  MenuItem,
  TextField,
  Typography,
  LinearProgress,
} from '@mui/material';
import {
  useGetAdmissionCrmStaffQuery,
  useAssignAdmissionCrmReviewerMutation,
  useDeclareAdmissionCrmReviewConflictMutation,
} from 'src/redux/student/admissions-crm/core-leads-api';

import { AdmissionCrmReviewRecommendation } from 'src/redux/student/admissions-crm/core-leads-contracts';

import {
  AdmissionCrmStructuredReviewStatus,
  AdmissionCrmReviewAssignmentStatus,
} from 'src/redux/student/admissions-crm/communication-exams-events-contracts';

import {
  useGetAdmissionCrmReviewConfigurationQuery,
  useStartAdmissionCrmStructuredReviewMutation,
  useSubmitAdmissionCrmStructuredReviewMutation,
  useGetAdmissionCrmStructuredReviewByLeadQuery,
} from 'src/redux/student/admissions-crm/communication-exams-events-api';

import { admissionCrmActionPermissions } from './admission-action-permissions';

const reviewStatusLabels: Record<AdmissionCrmStructuredReviewStatus, string> = {
  [AdmissionCrmStructuredReviewStatus.InReview]: 'In review',
  [AdmissionCrmStructuredReviewStatus.ReadyForDecision]: 'Ready for decision',
  [AdmissionCrmStructuredReviewStatus.Closed]: 'Closed',
  [AdmissionCrmStructuredReviewStatus.Cancelled]: 'Cancelled',
};

const assignmentStatusLabels: Record<AdmissionCrmReviewAssignmentStatus, string> = {
  [AdmissionCrmReviewAssignmentStatus.Assigned]: 'Assigned',
  [AdmissionCrmReviewAssignmentStatus.Submitted]: 'Submitted',
  [AdmissionCrmReviewAssignmentStatus.Recused]: 'Recused',
  [AdmissionCrmReviewAssignmentStatus.Cancelled]: 'Cancelled',
};

const recommendationLabels: Record<AdmissionCrmReviewRecommendation, string> = {
  [AdmissionCrmReviewRecommendation.Admit]: 'Admit',
  [AdmissionCrmReviewRecommendation.Waitlist]: 'Waitlist',
  [AdmissionCrmReviewRecommendation.Reject]: 'Reject',
  [AdmissionCrmReviewRecommendation.MoreInformation]: 'Request more information',
};

const tomorrow = () => {
  const date = new Date();
  date.setDate(date.getDate() + 2);
  return date.toISOString().slice(0, 16);
};

const readError = (error: unknown) => {
  const response = error as { data?: { error?: { message?: string }; detail?: string } };
  return (
    response.data?.error?.message ||
    response.data?.detail ||
    'The review action could not be completed.'
  );
};

export function ApplicantStructuredReview({
  leadId,
  academicYearId,
}: {
  leadId: string;
  academicYearId: string;
}) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canView = hasGrantedPermission(
    permissions,
    admissionCrmActionPermissions.viewStructuredReviews
  );
  const canAssign = hasGrantedPermission(
    permissions,
    admissionCrmActionPermissions.assignReviewers
  );
  const canSubmit = hasGrantedPermission(permissions, admissionCrmActionPermissions.submitReviews);
  const configurationQuery = useGetAdmissionCrmReviewConfigurationQuery(
    { academicYearId },
    { skip: !canView }
  );
  const isEnabled = configurationQuery.data?.isEnabled === true;
  const reviewQuery = useGetAdmissionCrmStructuredReviewByLeadQuery(
    { leadId },
    { skip: !canView || !isEnabled }
  );
  const review = reviewQuery.data;
  const reviewerOptionsQuery = useGetAdmissionCrmStaffQuery(
    { academicYearId, reviewerOnly: true, maxResultCount: 50 },
    { skip: !canAssign || !isEnabled }
  );
  const reviewerNamesQuery = useGetAdmissionCrmStaffQuery(
    { ids: review?.assignments.map((item) => item.reviewerUserId).join(','), maxResultCount: 50 },
    { skip: !review?.assignments.length }
  );
  const reviewerNames = useMemo(
    () => new Map((reviewerNamesQuery.data || []).map((person) => [person.id, person.displayName])),
    [reviewerNamesQuery.data]
  );
  const [reviewerUserId, setReviewerUserId] = useState('');
  const [dueAt, setDueAt] = useState(tomorrow);
  const [conflictReason, setConflictReason] = useState('');
  const [recommendation, setRecommendation] = useState(AdmissionCrmReviewRecommendation.Admit);
  const [confidentialRecommendation, setConfidentialRecommendation] = useState('');
  const [scores, setScores] = useState<Record<string, number | null>>({});
  const [startReview, startState] = useStartAdmissionCrmStructuredReviewMutation();
  const [assignReviewer, assignState] = useAssignAdmissionCrmReviewerMutation();
  const [declareConflict, conflictState] = useDeclareAdmissionCrmReviewConflictMutation();
  const [submitReview, submitState] = useSubmitAdmissionCrmStructuredReviewMutation();

  if (!canView || (!configurationQuery.isLoading && !isEnabled)) return null;
  if (configurationQuery.isLoading || reviewQuery.isLoading) {
    return <LinearProgress aria-label="Loading structured admissions review" />;
  }
  if (configurationQuery.isError || reviewQuery.isError) {
    return (
      <Alert severity="error" action={<Button onClick={() => reviewQuery.refetch()}>Retry</Button>}>
        Structured admissions review could not be loaded.
      </Alert>
    );
  }

  const perform = async (action: () => Promise<unknown>, success: string) => {
    try {
      await action();
      shikshaMitraToast.success({ message: success });
    } catch (error) {
      shikshaMitraToast.error({ message: readError(error) });
    }
  };

  if (!review) {
    return (
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={1} alignItems="flex-start">
          <Typography variant="subtitle2">Structured admissions review</Typography>
          <Typography variant="body2" color="text.secondary">
            This admission year requires confidential reviewer recommendations before a final
            approve, reject, or waitlist decision.
          </Typography>
          {canAssign ? (
            <LoadingButton
              variant="contained"
              loading={startState.isLoading}
              onClick={() =>
                perform(
                  () => startReview({ leadId }).unwrap(),
                  'Structured admissions review started.'
                )
              }
            >
              Start review
            </LoadingButton>
          ) : (
            <Alert severity="warning">A review coordinator must start this review.</Alert>
          )}
        </Stack>
      </Paper>
    );
  }

  const currentAssignment = review.assignments.find(
    (item) => item.isCurrentReviewer && item.status === AdmissionCrmReviewAssignmentStatus.Assigned
  );
  const canEnterRecommendation =
    currentAssignment &&
    canSubmit &&
    (!review.requireConflictDeclaration || currentAssignment.hasDeclaredConflict === false);

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
          <Box>
            <Typography variant="subtitle2">{review.title}</Typography>
            <Typography variant="caption" color="text.secondary">
              {review.submittedReviewCount} of {review.requiredCompletedReviews} required reviews
              submitted · rubric version {review.configurationVersion}
            </Typography>
          </Box>
          <Chip
            size="small"
            color={
              review.status === AdmissionCrmStructuredReviewStatus.ReadyForDecision
                ? 'success'
                : review.status === AdmissionCrmStructuredReviewStatus.InReview
                  ? 'warning'
                  : 'default'
            }
            label={reviewStatusLabels[review.status]}
          />
        </Stack>

        {review.assignments.map((assignment) => (
          <Box
            key={assignment.id}
            sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 1.25 }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {reviewerNames.get(assignment.reviewerUserId) || 'Assigned reviewer'}
                  {assignment.isCurrentReviewer ? ' (you)' : ''}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Due {new Date(assignment.dueAt).toLocaleString()}
                </Typography>
              </Box>
              <Chip size="small" label={assignmentStatusLabels[assignment.status]} />
            </Stack>
            {assignment.recommendation != null ? (
              <Alert severity="info" sx={{ mt: 1 }}>
                <Typography variant="body2" fontWeight={600}>
                  Recommendation: {recommendationLabels[assignment.recommendation]}
                </Typography>
                {assignment.confidentialRecommendation ? (
                  <Typography variant="body2">{assignment.confidentialRecommendation}</Typography>
                ) : null}
              </Alert>
            ) : null}
            {assignment.status === AdmissionCrmReviewAssignmentStatus.Recused &&
            assignment.conflictReason ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Conflict recorded: {assignment.conflictReason}
              </Typography>
            ) : null}
          </Box>
        ))}

        {canAssign && review.status === AdmissionCrmStructuredReviewStatus.InReview ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 210px auto' },
              gap: 1,
              alignItems: 'center',
            }}
          >
            <TextField
              select
              size="small"
              label="Reviewer"
              value={reviewerUserId}
              onChange={(event) => setReviewerUserId(event.target.value)}
              helperText="Only active staff with review access are listed."
            >
              {(reviewerOptionsQuery.data || []).map((person) => (
                <MenuItem key={person.id} value={person.id}>
                  {person.displayName} ({person.employeeCode})
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              type="datetime-local"
              label="Due date"
              value={dueAt}
              InputLabelProps={{ shrink: true }}
              onChange={(event) => setDueAt(event.target.value)}
            />
            <LoadingButton
              variant="outlined"
              loading={assignState.isLoading}
              disabled={!reviewerUserId || !dueAt}
              onClick={() =>
                perform(
                  () =>
                    assignReviewer({
                      reviewId: review.id,
                      reviewerUserId,
                      dueAt: new Date(dueAt).toISOString(),
                    }).unwrap(),
                  'Reviewer assigned.'
                )
              }
            >
              Assign reviewer
            </LoadingButton>
          </Box>
        ) : null}

        {currentAssignment &&
        review.requireConflictDeclaration &&
        currentAssignment.hasDeclaredConflict == null ? (
          <Stack spacing={1}>
            <Typography variant="subtitle2">Conflict-of-interest declaration</Typography>
            <TextField
              size="small"
              label="Conflict reason (required only if a conflict exists)"
              value={conflictReason}
              onChange={(event) => setConflictReason(event.target.value)}
            />
            <Stack direction="row" gap={1}>
              <LoadingButton
                variant="outlined"
                loading={conflictState.isLoading}
                onClick={() =>
                  perform(
                    () =>
                      declareConflict({
                        assignmentId: currentAssignment.id,
                        hasConflict: false,
                      }).unwrap(),
                    'No conflict declared.'
                  )
                }
              >
                Declare no conflict
              </LoadingButton>
              <LoadingButton
                color="warning"
                variant="outlined"
                loading={conflictState.isLoading}
                disabled={!conflictReason.trim()}
                onClick={() =>
                  perform(
                    () =>
                      declareConflict({
                        assignmentId: currentAssignment.id,
                        hasConflict: true,
                        reason: conflictReason.trim(),
                      }).unwrap(),
                    'Conflict recorded and assignment recused.'
                  )
                }
              >
                Declare conflict and recuse
              </LoadingButton>
            </Stack>
          </Stack>
        ) : null}

        {canEnterRecommendation ? (
          <Stack spacing={1}>
            <Typography variant="subtitle2">Your confidential recommendation</Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                gap: 1,
              }}
            >
              {review.criteria.map((criterion) => (
                <TextField
                  key={criterion.key}
                  size="small"
                  type="number"
                  required={criterion.isRequired}
                  label={`${criterion.label} (0–${criterion.maximumScore})`}
                  value={scores[criterion.key] ?? ''}
                  inputProps={{ min: 0, max: criterion.maximumScore }}
                  onChange={(event) =>
                    setScores({
                      ...scores,
                      [criterion.key]:
                        event.target.value === '' ? null : Number(event.target.value),
                    })
                  }
                />
              ))}
            </Box>
            <TextField
              select
              size="small"
              label="Recommendation"
              value={recommendation}
              onChange={(event) => setRecommendation(Number(event.target.value))}
            >
              {Object.entries(recommendationLabels).map(([value, label]) => (
                <MenuItem key={value} value={Number(value)}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              multiline
              minRows={3}
              label="Confidential rationale"
              value={confidentialRecommendation}
              onChange={(event) => setConfidentialRecommendation(event.target.value)}
              helperText="Visible only to you and authorized admissions decision-makers."
            />
            <LoadingButton
              variant="contained"
              loading={submitState.isLoading}
              disabled={
                !confidentialRecommendation.trim() ||
                review.criteria.some(
                  (criterion) => criterion.isRequired && scores[criterion.key] == null
                )
              }
              onClick={() =>
                perform(
                  () =>
                    submitReview({
                      assignmentId: currentAssignment.id,
                      recommendation,
                      confidentialRecommendation: confidentialRecommendation.trim(),
                      scores,
                    }).unwrap(),
                  'Confidential review submitted.'
                )
              }
              sx={{ alignSelf: 'flex-start' }}
            >
              Submit confidential review
            </LoadingButton>
          </Stack>
        ) : null}
      </Stack>
    </Paper>
  );
}
