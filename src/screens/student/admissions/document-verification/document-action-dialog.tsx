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
  onSuccess = onClose,
  canSubmit = true,
  title = documentActionLabels[action],
  submitLabel = documentActionLabels[action],
}: {
  action: DocumentAction;
  summary: ApplicationDocumentVerification;
  requirement: AdmissionDocumentRequirement;
  onClose: () => void;
  onSuccess?: () => void;
  canSubmit?: boolean;
  title?: string;
  submitLabel?: string;
}) {
  const { formik, error, snapshot, extensions, maxFileSizeMb } = useDocumentActionForm({
    action,
    summary,
    requirement,
    onSuccess,
    canSubmit,
  });
  const cancel = () => {
    if (!formik.dirty || window.confirm('You have unsaved changes. Do you want to discard them?'))
      onClose();
  };
  return (
    <CustomDialog
      open
      title={title}
      titleInfo={
        action === 'reject'
          ? 'Give a reason so admissions staff can provide a corrected document.'
          : undefined
      }
      maxWidth="sm"
      handleClose={onClose}
      hasUnsavedChanges={formik.dirty}
      disableClose={formik.isSubmitting}
      formProps={{
        noValidate: true,
        onSubmit: (event) => {
          event.preventDefault();
          formik.handleSubmit();
        },
      }}
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
          type="submit"
          size="small"
          variant="contained"
          color={action === 'reject' ? 'error' : 'inherit'}
          disabled={!canSubmit || formik.isSubmitting}
          loading={formik.isSubmitting}
          loadingPosition="start"
          startIcon={
            <Iconify icon={action === 'reject' ? 'mdi:close' : 'mdi:content-save-outline'} />
          }
        >
          {submitLabel}
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
