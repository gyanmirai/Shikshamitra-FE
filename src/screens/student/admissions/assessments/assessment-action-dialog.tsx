import type { ManagedApplicationAssessment } from 'src/redux/student/admissions/admission-assessment-types';

import { useState } from 'react';
import { useFormik } from 'formik';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { Alert, Button, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { assessmentErrorMessage } from './assessment-utils';
import { useAssessmentActions } from './use-assessment-actions';
import { AssessmentActionFields } from './assessment-action-fields';
import { assessmentActionLabels, validateAssessmentAction } from './assessment-action-model';

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
  const run = useAssessmentActions(snapshot);
  const formik = useFormik<AssessmentActionValues>({
    initialValues: {
      sessionId: initialSessionId,
      slotStartsAt: '',
      requiresSlot: false,
      attendance: 'present',
      outcome: '',
      approved: true,
      marks: '',
      notes: '',
    },
    validate: (values) => validateAssessmentAction(action, values, snapshot),
    onSubmit: async (values) => {
      setError('');
      try {
        await run(action, values);
        shikshaMitraToast.success({ message: 'Assessment updated' });
        onClose();
      } catch (failure) {
        setError(assessmentErrorMessage(failure));
      }
    },
  });
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
        <AssessmentActionFields
          action={action}
          assessment={snapshot}
          formik={formik}
          admissionOfferingId={admissionOfferingId}
          workflowStageDefinitionId={workflowStageDefinitionId}
        />
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
        <Button
          size="small"
          variant="contained"
          onClick={() => formik.handleSubmit()}
          disabled={formik.isSubmitting}
          startIcon={<Iconify icon="mdi:content-save-outline" />}
        >
          {formik.isSubmitting ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
