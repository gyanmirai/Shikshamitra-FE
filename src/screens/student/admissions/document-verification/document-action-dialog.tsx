import type {
  AdmissionDocumentRequirement,
  ApplicationDocumentVerification,
} from 'src/redux/student/admissions/admission-document-types';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Button, DialogActions } from '@mui/material';
import { StudentFeedback } from 'src/components/student-feedback';
import { DialogScrollContent } from 'src/components/customDialog';
import { FormSectionCard } from 'src/components/form-section-card';

import { ReviewDialog } from '../review/review-dialog';
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
  return (
    <ReviewDialog
      open
      title={title}
      titleInfo={
        action === 'reject'
          ? 'Give a reason so admissions staff can provide a corrected document.'
          : 'Review this requirement and record the document action for the applicant.'
      }
      maxWidth="sm"
      onClose={onClose}
      dirty={formik.dirty}
      busy={formik.isSubmitting}
      formProps={{
        noValidate: true,
        onSubmit: (event) => {
          event.preventDefault();
          formik.handleSubmit();
        },
      }}
      actions={(requestClose) => (
        <DialogActions>
          <Button
            size="small"
            variant="outlined"
            onClick={requestClose}
            disabled={formik.isSubmitting}
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
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
              <Iconify icon={action === 'reject' ? GlobalIcons.cancel : GlobalIcons.submit} />
            }
          >
            {submitLabel}
          </Button>
        </DialogActions>
      )}
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
        <FormSectionCard
          title={action === 'upload' ? 'Document Details' : 'Document Decision'}
          icon={GlobalIcons.documentIcon}
          descriptionTooltip="Review the requirement and provide the evidence or decision notes for this action."
          titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
        >
          <DocumentActionFields
            action={action}
            requirement={snapshot.requirement}
            formik={formik}
            extensions={extensions}
            maxFileSizeMb={maxFileSizeMb}
          />
        </FormSectionCard>
      </DialogScrollContent>
    </ReviewDialog>
  );
}
