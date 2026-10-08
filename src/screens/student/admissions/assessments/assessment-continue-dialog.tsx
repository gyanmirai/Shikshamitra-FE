import type { AssessmentRosterItem } from 'src/redux/student/admissions/admission-assessment-roster-api';

import { useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { Alert, Button, Typography, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { admissionAssessmentsApi } from 'src/redux/student/admissions/admission-assessments-api';
import {
  admissionApplicationsApi,
  useLazyGetAdmissionApplicationQuery,
  useAdvanceAdmissionApplicationWorkflowMutation,
} from 'src/redux/student/admissions/admission-applications-api';

import { assessmentErrorMessage } from './assessment-utils';
import { canRequestNormalStageAdvance } from '../application-detail/application-progress-model';

export function AssessmentContinueDialog({
  row,
  onClose,
}: {
  row: AssessmentRosterItem;
  onClose: () => void;
}) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [getApplication] = useLazyGetAdmissionApplicationQuery();
  const [getWorkflow] = admissionApplicationsApi.useLazyGetAdmissionApplicationWorkflowQuery();
  const [getAssessment] = admissionAssessmentsApi.useLazyGetApplicationAssessmentQuery();
  const [advance] = useAdvanceAdmissionApplicationWorkflowMutation();
  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const [application, workflow, assessment] = await Promise.all([
        getApplication(row.applicationId, false).unwrap(),
        getWorkflow(row.applicationId, false).unwrap(),
        getAssessment(
          { applicationId: row.applicationId, stageInstanceId: row.stageInstanceId },
          false
        ).unwrap(),
      ]);
      if (workflow.currentStageInstanceId !== row.stageInstanceId)
        throw new Error(
          'The admission step changed. Refresh the roster and review the current application.'
        );
      const stage = workflow.stages.find((item) => item.id === row.stageInstanceId);
      if (!assessment.canComplete || !canRequestNormalStageAdvance(stage, application.status))
        throw new Error(
          assessment.blockers.join(' ') ||
            'This assessment cannot continue yet. Refresh the roster and complete its pending actions.'
        );
      await advance({
        id: row.applicationId,
        expectedCurrentStageInstanceId: row.stageInstanceId,
        concurrencyStamp: application.concurrencyStamp,
        idempotencyKey: crypto.randomUUID(),
      }).unwrap();
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
      maxWidth="sm"
      handleClose={onClose}
      disableClose={busy}
      hasForm={false}
      hasUnsavedChanges={false}
    >
      <DialogScrollContent>
        <Typography variant="body2">
          Continue {row.applicantName}&apos;s application ({row.applicationNumber}) after completing
          this assessment? The configured workflow determines the next stage.
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
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
