'use client';

import { LoadingButton } from 'src/components/loading-button';

import {
  Box,
  Chip,
  Alert,
  Stack,
  Paper,
  Button,
  Dialog,
  Switch,
  Divider,
  MenuItem,
  TextField,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  FormControlLabel,
} from '@mui/material';

import {
  AdmissionCrmEligibilityDecision,
  AdmissionCrmExamAttendanceStatus,
} from 'src/redux/student/admissions-crm/communication-exams-events-contracts';

import { admissionCrmEligibilityLabels } from './admissions-crm-utils';

import { useExamsWorkspaceWorkspace } from './exams-workspace-context';

const attendanceLabels: Record<AdmissionCrmExamAttendanceStatus, string> = {
  [AdmissionCrmExamAttendanceStatus.NotMarked]: 'Not Marked',
  [AdmissionCrmExamAttendanceStatus.Present]: 'Present',
  [AdmissionCrmExamAttendanceStatus.Absent]: 'Absent',
  [AdmissionCrmExamAttendanceStatus.NoShow]: 'No-show',
  [AdmissionCrmExamAttendanceStatus.Excused]: 'Excused',
};

const editableAttendanceStatuses = [
  AdmissionCrmExamAttendanceStatus.Present,
  AdmissionCrmExamAttendanceStatus.Absent,
  AdmissionCrmExamAttendanceStatus.NoShow,
  AdmissionCrmExamAttendanceStatus.Excused,
];

const dateTimeFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const focusedExamSectionSx = {
  scrollMarginTop: 16,
  '&:focus-visible': {
    outline: '2px solid',
    outlineColor: 'primary.main',
    outlineOffset: 4,
  },
} as const;

export function ExamsWorkspaceSection2() {
  const { state: controllerState, actions, meta } = useExamsWorkspaceWorkspace();
  const {
    attendance,
    canChangeExamResult,
    canOverrideEligibility,
    canOverrideExamResult,
    closeSelectedExam,
    decideEligibility,
    decideEligibilityState,
    decisionReason,
    eligibility,
    examResultErrors,
    examResultReady,
    handoffExamId,
    handoffQuery,
    markAttendance,
    markAttendanceState,
    meritRank,
    obtainedMarks,
    openApplicant,
    overrideDecision,
    overrideReason,
    passingMarks,
    resultCorrectionReason,
    run,
    selectedExam,
    setAttendance,
    setDecisionReason,
    setEligibility,
    setHandoffExamId,
    setMeritRank,
    setObtainedMarks,
    setOverrideDecision,
    setOverrideReason,
    setPassingMarks,
    setResultCorrectionReason,
    setTotalMarks,
    totalMarks,
    uploadResult,
    uploadResultState,
  } = { ...controllerState, ...actions, ...meta };

  return (
    <>
      <Dialog open={Boolean(selectedExam)} onClose={closeSelectedExam} fullWidth maxWidth="md">
        <DialogTitle>Manage Assessment</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {selectedExam && (
              <Alert severity="info">
                {selectedExam.applicantName} ·{' '}
                {dateTimeFormatter.format(new Date(selectedExam.examStartTime))}
              </Alert>
            )}
            <Box id="exam-attendance-section" tabIndex={-1} sx={focusedExamSectionSx}>
              <Typography variant="subtitle2" gutterBottom>
                Attendance
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
                <TextField
                  select
                  fullWidth
                  label="Attendance status"
                  value={attendance}
                  disabled={!canChangeExamResult}
                  onChange={(event) => setAttendance(Number(event.target.value))}
                >
                  {attendance === AdmissionCrmExamAttendanceStatus.NotMarked ? (
                    <MenuItem value={AdmissionCrmExamAttendanceStatus.NotMarked} disabled>
                      Not marked
                    </MenuItem>
                  ) : null}
                  {editableAttendanceStatuses.map((value) => (
                    <MenuItem key={value} value={value}>
                      {attendanceLabels[value]}
                    </MenuItem>
                  ))}
                </TextField>
                <LoadingButton
                  variant="outlined"
                  loading={markAttendanceState.isLoading}
                  disabled={
                    !canChangeExamResult ||
                    attendance === AdmissionCrmExamAttendanceStatus.NotMarked
                  }
                  onClick={() =>
                    selectedExam &&
                    run(
                      () =>
                        markAttendance({
                          examRecordId: selectedExam.id,
                          body: { attendanceStatus: attendance },
                        }).unwrap(),
                      'Attendance recorded.'
                    )
                  }
                >
                  Save Attendance
                </LoadingButton>
              </Stack>
            </Box>
            <Divider />
            <Box id="exam-results-section" tabIndex={-1} sx={focusedExamSectionSx}>
              <Typography variant="subtitle2" gutterBottom>
                Marks & Merit
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
                <TextField
                  label="Total marks"
                  type="number"
                  value={totalMarks}
                  disabled={
                    !canChangeExamResult ||
                    (selectedExam?.obtainedMarks != null && !canOverrideExamResult)
                  }
                  error={Boolean(examResultErrors.totalMarks)}
                  helperText={examResultErrors.totalMarks}
                  slotProps={{ htmlInput: { min: 0 } }}
                  onChange={(event) => setTotalMarks(event.target.value)}
                />
                <TextField
                  label="Passing marks"
                  type="number"
                  value={passingMarks}
                  disabled={
                    !canChangeExamResult ||
                    (selectedExam?.obtainedMarks != null && !canOverrideExamResult)
                  }
                  error={Boolean(examResultErrors.passingMarks)}
                  helperText={examResultErrors.passingMarks}
                  slotProps={{ htmlInput: { min: 0, max: totalMarks || undefined } }}
                  onChange={(event) => setPassingMarks(event.target.value)}
                />
                <TextField
                  label="Obtained marks"
                  type="number"
                  value={obtainedMarks}
                  disabled={
                    !canChangeExamResult ||
                    (selectedExam?.obtainedMarks != null && !canOverrideExamResult)
                  }
                  error={Boolean(obtainedMarks && examResultErrors.obtainedMarks)}
                  helperText={obtainedMarks ? examResultErrors.obtainedMarks : undefined}
                  slotProps={{ htmlInput: { min: 0, max: totalMarks || undefined } }}
                  onChange={(event) => setObtainedMarks(event.target.value)}
                />
                <TextField
                  label="Merit rank"
                  type="number"
                  value={meritRank}
                  disabled={
                    !canChangeExamResult ||
                    (selectedExam?.obtainedMarks != null && !canOverrideExamResult)
                  }
                  error={Boolean(examResultErrors.meritRank)}
                  helperText={examResultErrors.meritRank}
                  slotProps={{ htmlInput: { min: 1, step: 1 } }}
                  onChange={(event) => setMeritRank(event.target.value)}
                />
              </Stack>
              {selectedExam?.obtainedMarks != null && !canOverrideExamResult ? (
                <Alert severity="error" sx={{ mt: 1.25 }}>
                  Your role can record new results but cannot replace an existing result.
                </Alert>
              ) : selectedExam?.obtainedMarks != null ? (
                <TextField
                  required
                  fullWidth
                  label="Correction Reason"
                  value={resultCorrectionReason}
                  onChange={(event) => setResultCorrectionReason(event.target.value)}
                  helperText="Required when replacing a previously recorded result."
                  multiline
                  minRows={2}
                  sx={{ mt: 1.25 }}
                />
              ) : null}
              {canChangeExamResult &&
              (selectedExam?.obtainedMarks == null || canOverrideExamResult) ? (
                <LoadingButton
                  variant="outlined"
                  loading={uploadResultState.isLoading}
                  disabled={
                    !examResultReady ||
                    (selectedExam?.obtainedMarks != null && !resultCorrectionReason.trim())
                  }
                  onClick={() =>
                    selectedExam &&
                    run(
                      () =>
                        uploadResult({
                          examRecordId: selectedExam.id,
                          body: {
                            totalMarks: Number(totalMarks),
                            passingMarks: Number(passingMarks),
                            obtainedMarks: Number(obtainedMarks),
                            meritRank: meritRank ? Number(meritRank) : undefined,
                            correctionReason: resultCorrectionReason.trim() || undefined,
                          },
                        }).unwrap(),
                      selectedExam.obtainedMarks == null
                        ? 'Exam result recorded.'
                        : 'Exam result correction recorded.'
                    )
                  }
                  sx={{ mt: 1.25 }}
                >
                  Save Result
                </LoadingButton>
              ) : null}
            </Box>
            <Divider />
            <Box id="exam-eligibility-section" tabIndex={-1} sx={focusedExamSectionSx}>
              <Typography variant="subtitle2" gutterBottom>
                Eligibility Decision
              </Typography>
              <Stack spacing={1.25}>
                <TextField
                  select
                  label="Decision"
                  value={eligibility}
                  disabled={!canChangeExamResult}
                  onChange={(event) => setEligibility(Number(event.target.value))}
                >
                  {eligibility === AdmissionCrmEligibilityDecision.Pending ? (
                    <MenuItem value={AdmissionCrmEligibilityDecision.Pending} disabled>
                      Select a decision
                    </MenuItem>
                  ) : null}
                  {Object.entries(admissionCrmEligibilityLabels)
                    .filter(([value]) => Number(value) !== AdmissionCrmEligibilityDecision.Pending)
                    .map(([value, label]) => (
                      <MenuItem key={value} value={Number(value)}>
                        {label}
                      </MenuItem>
                    ))}
                </TextField>
                <TextField
                  required
                  label="Decision reason"
                  value={decisionReason}
                  disabled={!canChangeExamResult}
                  onChange={(event) => setDecisionReason(event.target.value)}
                  multiline
                  minRows={2}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={overrideDecision}
                      disabled={!canChangeExamResult || !canOverrideEligibility}
                      onChange={(_, checked) => setOverrideDecision(checked)}
                    />
                  }
                  label="Override the calculated decision"
                />
                {canChangeExamResult && !canOverrideEligibility ? (
                  <Typography variant="caption" color="text.secondary">
                    Eligibility override permission is required to replace the calculated decision.
                  </Typography>
                ) : null}
                {overrideDecision && (
                  <TextField
                    required
                    label="Override reason"
                    value={overrideReason}
                    disabled={!canChangeExamResult || !canOverrideEligibility}
                    onChange={(event) => setOverrideReason(event.target.value)}
                    multiline
                    minRows={2}
                  />
                )}
                <LoadingButton
                  variant="contained"
                  loading={decideEligibilityState.isLoading}
                  disabled={
                    !canChangeExamResult ||
                    eligibility === AdmissionCrmEligibilityDecision.Pending ||
                    !decisionReason.trim() ||
                    (overrideDecision && (!canOverrideEligibility || !overrideReason.trim()))
                  }
                  onClick={() =>
                    selectedExam &&
                    run(
                      () =>
                        decideEligibility({
                          examRecordId: selectedExam.id,
                          body: {
                            decision: eligibility,
                            reason: decisionReason.trim(),
                            meritRank: meritRank ? Number(meritRank) : undefined,
                            overrideDecision,
                            overrideReason: overrideDecision ? overrideReason.trim() : undefined,
                          },
                        }).unwrap(),
                      'Eligibility decision recorded.'
                    )
                  }
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Save Eligibility
                </LoadingButton>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeSelectedExam}>Close</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={Boolean(handoffExamId)}
        onClose={() => setHandoffExamId('')}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Eligibility Handoff</DialogTitle>
        <DialogContent>
          <Stack spacing={1.25} sx={{ pt: 1 }}>
            {handoffQuery.isFetching && <LinearProgress aria-label="Loading eligibility handoff" />}
            {handoffQuery.isError && (
              <Alert severity="error">Eligibility handoff details are unavailable.</Alert>
            )}
            {handoffQuery.data && (
              <>
                <Alert severity={handoffQuery.data.canStartAdmission ? 'success' : 'warning'}>
                  {handoffQuery.data.canStartAdmission
                    ? 'Eligible for admission handoff'
                    : 'Review before admission handoff'}
                </Alert>
                <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
                  <Stack spacing={0.75}>
                    <Stack direction="row" justifyContent="space-between" gap={1}>
                      <Typography variant="subtitle2">{handoffQuery.data.applicantName}</Typography>
                      <Chip
                        size="small"
                        variant="outlined"
                        label={admissionCrmEligibilityLabels[handoffQuery.data.eligibilityDecision]}
                      />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {handoffQuery.data.desiredClassName || 'Class not captured'} -{' '}
                      {handoffQuery.data.admissionIntent}
                    </Typography>
                    {handoffQuery.data.dateOfBirth && (
                      <Typography variant="body2" color="text.secondary">
                        DOB: {dateFormatter.format(new Date(handoffQuery.data.dateOfBirth))}
                      </Typography>
                    )}
                    <Divider />
                    <Typography variant="body2">
                      {handoffQuery.data.primaryContactNo ||
                        handoffQuery.data.email ||
                        'No contact captured'}
                    </Typography>
                    <Typography variant="body2">
                      Marks:{' '}
                      {handoffQuery.data.obtainedMarks != null &&
                      handoffQuery.data.totalMarks != null
                        ? `${handoffQuery.data.obtainedMarks}/${handoffQuery.data.totalMarks}`
                        : 'Not recorded'}
                    </Typography>
                    {handoffQuery.data.missingAdmissionFields.length > 0 && (
                      <Alert severity="warning">
                        Missing: {handoffQuery.data.missingAdmissionFields.join(', ')}
                      </Alert>
                    )}
                  </Stack>
                </Paper>
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          {handoffQuery.data?.eligibilityDecision === AdmissionCrmEligibilityDecision.Eligible ? (
            <Button
              variant="contained"
              onClick={() => {
                openApplicant(handoffQuery.data!.leadId, 'registration');
                setHandoffExamId('');
              }}
            >
              Continue to Registration
            </Button>
          ) : null}
          <Button onClick={() => setHandoffExamId('')}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
