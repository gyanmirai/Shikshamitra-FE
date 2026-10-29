import type { AssessmentRosterItem } from 'src/redux/student/admissions/admission-assessment-roster-api';

import { useRef, useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { StudentFeedback } from 'src/components/student-feedback';
import { Button, Typography, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { admissionAssessmentsApi } from 'src/redux/student/admissions/admission-assessments-api';
import {
  admissionApplicationsApi,
  useLazyGetAdmissionApplicationQuery,
  useAdvanceAdmissionApplicationWorkflowMutation,
} from 'src/redux/student/admissions/admission-applications-api';

import { assessmentErrorMessage } from './assessment-utils';
import { continueAssessment } from './assessment-continue-command';

import type { AssessmentContinueRetry } from './assessment-continue-command';

export function AssessmentContinueDialog({
  row,
  onClose,
}: {
  row: AssessmentRosterItem;
  onClose: () => void;
}) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const retry = useRef<AssessmentContinueRetry>({});
  const key = useRef<string | null>(null);
  const [getApplication] = useLazyGetAdmissionApplicationQuery();
  const [getWorkflow] = admissionApplicationsApi.useLazyGetAdmissionApplicationWorkflowQuery();
  const [getAssessment] = admissionAssessmentsApi.useLazyGetApplicationAssessmentQuery();
  const [advance] = useAdvanceAdmissionApplicationWorkflowMutation();
  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await continueAssessment(
        row,
        {
          application: (id) => getApplication(id, false).unwrap(),
          workflow: (id) => getWorkflow(id, false).unwrap(),
          assessment: (applicationId, stageInstanceId) =>
            getAssessment({ applicationId, stageInstanceId }, false).unwrap(),
          advance: (input) => advance(input).unwrap(),
        },
        (key.current ??= crypto.randomUUID()),
        retry.current
      );
      shikshaMitraToast.success({ message: 'Application moved to the next stage' });
      onClose();
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : assessmentErrorMessage(failure, 'Unable to continue. Refresh the roster and try again.')
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <CustomDialog
      open
      title="Continue to next stage"
      titleInfo="The configured workflow determines the next stage."
      maxWidth="sm"
      handleClose={onClose}
      disableClose={busy}
      hasForm={false}
      hasUnsavedChanges={false}
    >
      <DialogScrollContent>
        <Typography variant="body2">
          Continue {row.applicantName}&apos;s application ({row.applicationNumber}) after completing
          this assessment?
        </Typography>
        {error && (
          <StudentFeedback
            notificationKey="STU-0254"
            presentation="persistent"
            severity="error"
            sx={{ mt: 2 }}
          >
            {error}
          </StudentFeedback>
        )}
      </DialogScrollContent>
      <DialogActions>
        <Button variant="outlined" disabled={busy} onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" disabled={busy} onClick={submit}>
          {busy ? 'Continuing…' : 'Continue'}
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
