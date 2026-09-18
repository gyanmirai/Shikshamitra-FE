import type {
  AdmissionDocumentRequirement,
  ApplicationDocumentVerification,
} from 'src/redux/student/admissions/admission-document-types';

import { useState } from 'react';
import { useFormik } from 'formik';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { Alert, Button, DialogActions } from '@mui/material';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import { useDocumentActions } from './use-document-actions';
import { DocumentActionFields } from './document-action-fields';
import { documentActionLabels, documentActionSchema } from './document-action-model';

import type { DocumentAction, DocumentActionValues } from './document-action-model';

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
  // Freeze the reviewed evidence and application stamp until this dialog closes.
  const [snapshot] = useState({ summary, requirement });
  const [error, setError] = useState('');
  const policy = snapshot.summary.policy?.requirements.find(
    (item) => item.code === requirement.code
  );
  const extensions = snapshot.requirement.allowedExtensions ??
    policy?.allowedExtensions ?? ['pdf', 'jpg', 'jpeg', 'png'];
  const maxFileSizeMb = snapshot.requirement.maxFileSizeMb ?? policy?.maxFileSizeMb ?? 5;
  const run = useDocumentActions(snapshot.summary, snapshot.requirement);
  const formik = useFormik<DocumentActionValues>({
    initialValues: { file: null, notes: '' },
    validationSchema: documentActionSchema(action, extensions, maxFileSizeMb),
    onSubmit: async (values) => {
      setError('');
      try {
        await run(action, values);
        shikshaMitraToast.success({ message: 'Document checklist updated' });
        onClose();
      } catch (failure) {
        const { detail } = parseApiProblemDetail(failure);
        setError(
          detail === 'Something went wrong'
            ? 'Unable to update this document. Refresh the checklist and try again.'
            : detail
        );
      }
    },
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
      guardUnsavedChanges={formik.dirty}
      disableClose={formik.isSubmitting}
    >
      <DialogScrollContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
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
