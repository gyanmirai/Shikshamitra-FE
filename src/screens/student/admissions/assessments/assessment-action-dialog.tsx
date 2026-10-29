import type { ManagedApplicationAssessment } from 'src/redux/student/admissions/admission-assessment-types';

import { useFormik } from 'formik';
import { useRef, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { Button, DialogActions } from '@mui/material';
import { shikshaMitraToast } from 'src/components/toast';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { StudentFeedback } from 'src/components/student-feedback';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { assessmentErrorMessage } from './assessment-utils';
import { useAssessmentActions } from './use-assessment-actions';
import { AssessmentActionFields } from './assessment-action-fields';
import { assessmentResultProfile, assessmentSubjectValues } from './assessment-subject-results';
import {
  assessmentActionLabels,
  latestAssessmentAttempt,
  validateAssessmentAction,
} from './assessment-action-model';

import type { AssessmentAction, AssessmentActionValues } from './assessment-action-model';

type Props = {
  action: AssessmentAction;
  assessment: ManagedApplicationAssessment;
  admissionOfferingId: string;
  workflowStageDefinitionId: string;
  initialSessionId?: string;
  onClose: () => void;
};

export function AssessmentActionDialog({
  action,
  assessment,
  admissionOfferingId,
  workflowStageDefinitionId,
  initialSessionId = '',
  onClose,
}: Props) {
  // Keep the reviewed attempt and concurrency stamp fixed while staff edit the dialog.
  const [snapshot] = useState(assessment);
  const [error, setError] = useState('');
  const [draftValidation, setDraftValidation] = useState(false);
  const submitting = useRef(false);
  const run = useAssessmentActions(snapshot);
  const profile = assessmentResultProfile(snapshot, latestAssessmentAttempt(snapshot));
  const formik = useFormik<AssessmentActionValues>({
    initialValues: {
      sessionId: initialSessionId,
      slotStartsAt: '',
      requiresSlot: false,
      attendance: 'present',
      outcome: '',
      approved: true,
      marks: '',
      notes: action === 'result' && profile ? (latestAssessmentAttempt(snapshot)?.notes ?? '') : '',
      subjectScores: assessmentSubjectValues(latestAssessmentAttempt(snapshot)),
    },
    validate: (values) => validateAssessmentAction(action, values, snapshot),
    onSubmit: async (values) => {
      if (submitting.current) return;
      submitting.current = true;
      setError('');
      try {
        await run(action, values);
        shikshaMitraToast.success({ message: 'Assessment updated' });
        onClose();
      } catch (failure) {
        setError(assessmentErrorMessage(failure));
      } finally {
        submitting.current = false;
      }
    },
  });
  const saveDraft = async () => {
    if (submitting.current || !snapshot.canSaveResultDraft) return;
    setDraftValidation(true);
    const errors = validateAssessmentAction('resultDraft', formik.values, snapshot);
    formik.setErrors(errors);
    if (Object.keys(errors).length) return;
    submitting.current = true;
    formik.setSubmitting(true);
    setError('');
    try {
      await run('resultDraft', formik.values);
      shikshaMitraToast.success({ message: 'Assessment draft saved' });
      onClose();
    } catch (failure) {
      setError(assessmentErrorMessage(failure));
    } finally {
      submitting.current = false;
      formik.setSubmitting(false);
    }
  };
  const cancel = () => {
    if (!formik.dirty || window.confirm('You have unsaved changes. Do you want to discard them?'))
      onClose();
  };
  const title =
    action === 'book' && snapshot.policy.schedulingEnabled
      ? 'Book assessment session'
      : assessmentActionLabels[action];
  const titleInfo: Record<AssessmentAction, string> = {
    book: snapshot.policy.schedulingEnabled
      ? 'Choose an available session for this assessment attempt.'
      : 'Start a new assessment attempt. This stage does not require a scheduled session.',
    attendance: 'Record attendance for this assessment attempt.',
    result:
      snapshot.policy.scoringEnabled && !profile && snapshot.policy.scoringMode !== 'subjects'
        ? 'The result is calculated from these marks.'
        : 'Record the result for this assessment attempt. Draft marks do not complete the stage.',
    resultDraft:
      'Save draft marks for this assessment attempt. Draft marks do not complete the stage.',
    retake: `Allow another attempt within the configured limit of ${snapshot.policy.maxAttempts}. Book the next attempt after saving.`,
    cancel:
      'Cancel this attempt and release its session place. A new booking can then be made if the stage allows it.',
    waive: 'This records an assessment waiver. Enter the reason for the admission audit history.',
  };
  return (
    <CustomDialog
      open
      title={title}
      titleInfo={titleInfo[action]}
      maxWidth="sm"
      handleClose={onClose}
      hasUnsavedChanges={formik.dirty}
      disableClose={formik.isSubmitting}
    >
      <DialogScrollContent>
        {error && (
          <StudentFeedback
            notificationKey="STU-0238"
            presentation="persistent"
            severity="error"
            sx={{ mb: 2 }}
          >
            {error}
          </StudentFeedback>
        )}
        <FormBusyRegion busy={formik.isSubmitting} label="Saving assessment…">
          <AssessmentActionFields
            action={action}
            assessment={snapshot}
            formik={formik}
            admissionOfferingId={admissionOfferingId}
            workflowStageDefinitionId={workflowStageDefinitionId}
            draftValidation={draftValidation}
          />
        </FormBusyRegion>
      </DialogScrollContent>
      <DialogActions>
        <Button
          size="small"
          variant="outlined"
          onClick={cancel}
          disabled={formik.isSubmitting}
          startIcon={<Iconify icon="mdi:close" />}
        >
          Cancel
        </Button>
        {action === 'result' && profile && (
          <Button
            size="small"
            variant="outlined"
            disabled={formik.isSubmitting || !snapshot.canSaveResultDraft}
            onClick={saveDraft}
          >
            Save draft
          </Button>
        )}
        <Button
          size="small"
          variant="contained"
          onClick={() => {
            setDraftValidation(false);
            formik.handleSubmit();
          }}
          disabled={formik.isSubmitting}
          startIcon={<Iconify icon="mdi:content-save-outline" />}
        >
          {formik.isSubmitting
            ? 'Saving…'
            : action === 'result' && profile
              ? 'Submit result'
              : 'Save'}
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
