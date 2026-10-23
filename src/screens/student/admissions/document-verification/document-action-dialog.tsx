import type {
  AdmissionDocumentRequirement,
  ApplicationDocumentVerification,
} from 'src/redux/student/admissions/admission-document-types';

import { Iconify } from 'src/components/iconify';
import { Button, DialogActions } from '@mui/material';
import { StudentFeedback } from 'src/components/student-feedback';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { documentActionLabels } from './document-action-model';
import { DocumentActionFields } from './document-action-fields';
import { useDocumentActionForm } from './use-document-action-form';

import type { DocumentAction } from './document-action-model';

export function DocumentActionDialog({
  action,
  summary,
  requirement,
  onClose,
}: {
  action: DocumentAction;
  summary: ApplicationDocumentVerification;
  requirement: AdmissionDocumentRequirement;
  onClose: () => void;
}) {
  const { formik, error, snapshot, extensions, maxFileSizeMb } = useDocumentActionForm({
    action,
    summary,
    requirement,
    onSuccess: onClose,
  });
  const cancel = () => {
    if (!formik.dirty || window.confirm('You have unsaved changes. Do you want to discard them?'))
      onClose();
  };
  return (
    <CustomDialog
      open
      title={documentActionLabels[action]}
      maxWidth="sm"
      handleClose={onClose}
      hasUnsavedChanges={formik.dirty}
      disableClose={formik.isSubmitting}
    >
      <DialogScrollContent>
        {error && (
          <StudentFeedback
            notificationKey="STU-0306"
            presentation="persistent"
            severity="error"
            sx={{ mb: 2 }}
          >
            {error}
          </StudentFeedback>
        )}
        <DocumentActionFields
          action={action}
          requirement={snapshot.requirement}
          formik={formik}
          extensions={extensions}
          maxFileSizeMb={maxFileSizeMb}
        />
      </DialogScrollContent>
      <DialogActions>
        <Button size="small" variant="outlined" onClick={cancel} disabled={formik.isSubmitting}>
          Cancel
        </Button>
        <Button
          size="small"
          variant="contained"
          disabled={formik.isSubmitting}
          onClick={() => formik.handleSubmit()}
          startIcon={<Iconify icon="mdi:content-save-outline" />}
        >
          {formik.isSubmitting ? 'Saving…' : documentActionLabels[action]}
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
