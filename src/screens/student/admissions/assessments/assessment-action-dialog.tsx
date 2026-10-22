import type { ManagedApplicationAssessment } from 'src/redux/student/admissions/admission-assessment-types';

import { useFormik } from 'formik';
import { useRef, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { Alert, Button, DialogActions } from '@mui/material';
import { FormBusyRegion } from 'src/components/form-busy-region';
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
  return (
    <CustomDialog
      open
      title={title}
      titleInfo="Record attendance or results for this assessment attempt. Draft marks do not complete the stage."
      maxWidth="sm"
      handleClose={onClose}
      hasUnsavedChanges={formik.dirty}
      disableClose={formik.isSubmitting}
    >
      <DialogScrollContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
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
