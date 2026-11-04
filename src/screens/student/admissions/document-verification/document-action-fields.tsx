import type { FormikProps } from 'formik';
import type { AdmissionDocumentRequirement } from 'src/redux/student/admissions/admission-document-types';

import { useId } from 'react';
import { ValidationError } from 'yup';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomUpload from 'src/components/custom-upload';
import ShakingTextField from 'src/components/shaking-text-field';
import { StudentFeedback } from 'src/components/student-feedback';
import { FormSectionCard } from 'src/components/form-section-card';
import { Box, Stack, TextField, FormLabel, Typography, FormControl } from '@mui/material';

import { documentActionSchema } from './document-action-model';

import type { DocumentAction, DocumentActionValues } from './document-action-model';

export function DocumentActionFields({
  action,
  requirement,
  formik,
  extensions,
  maxFileSizeMb,
}: {
  action: DocumentAction;
  requirement: AdmissionDocumentRequirement;
  formik: FormikProps<DocumentActionValues>;
  extensions: string[];
  maxFileSizeMb: number;
}) {
  const original = action === 'original';
  const fileId = useId();
  const fileHelpId = `${fileId}-help`;
  const fileError = formik.touched.file ? formik.errors.file : undefined;
  const fileGuidance = `${extensions.join(', ').toUpperCase()} · Maximum ${maxFileSizeMb} MB`;
  const selectFile = (file: File | null) => {
    formik.setFieldTouched('file', true, false);
    if (file) {
      try {
        documentActionSchema(action, extensions, maxFileSizeMb).validateSyncAt('file', { file });
      } catch (failure) {
        if (failure instanceof ValidationError) formik.setFieldError('file', failure.message);
        return;
      }
    }
    formik.setFieldValue('file', file);
  };
  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2">{requirement.name}</Typography>
      {action === 'upload' && (
        <>
          {requirement.evidence.length > 0 && (
            <StudentFeedback notificationKey="STU-0307" presentation="inline" severity="info">
              This creates a new version for review. Previous versions remain in the history.
              {requirement.evidence.at(-1)?.originalSeen
                ? ' Record the Original Again After Replacing the File.'
                : ''}
            </StudentFeedback>
          )}
          <FormSectionCard
            title="Attachments"
            icon={GlobalIcons.documentIcon}
            descriptionTooltip="Select One Document for This Requirement. It Is Uploaded When You Submit."
          >
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <Iconify icon={GlobalIcons.upload} width={20} sx={{ color: 'text.secondary' }} />
              <Box>
                <Typography component="h3" variant="subtitle2" fontWeight={700}>
                  Upload Files
                </Typography>
                <Typography id={fileHelpId} variant="caption" color="text.secondary">
                  {fileGuidance}
                </Typography>
              </Box>
            </Stack>
            <ShakingTextField error={Boolean(fileError)}>
              <FormControl
                fullWidth
                required
                error={Boolean(fileError)}
                disabled={formik.isSubmitting}
              >
                <FormLabel id={fileId} component="span" sx={{ typography: 'body2', mb: 1 }}>
                  Document
                </FormLabel>
                <CustomUpload<false>
                  multiple={false}
                  value={formik.values.file ?? undefined}
                  onChange={(file) => {
                    if (!file || file instanceof File) selectFile(file);
                  }}
                  onReject={(message) => {
                    formik.setFieldTouched('file', true, false);
                    formik.setFieldError('file', message);
                  }}
                  error={fileError}
                  primaryText="Drop files here or browse"
                  secondaryText="Select one file"
                  accept={extensions
                    .map((extension) => `.${extension.replace(/^\./, '')}`)
                    .join(',')}
                  maxFileSizeMb={maxFileSizeMb}
                  disabled={formik.isSubmitting}
                  loading={formik.isSubmitting}
                  parentsProps={{ role: 'group', 'aria-labelledby': fileId }}
                  dragProps={{
                    'aria-describedby': fileHelpId,
                    'aria-required': true,
                    'aria-invalid': Boolean(fileError),
                    sx: { minHeight: 144, bgcolor: 'action.hover' },
                  }}
                />
              </FormControl>
            </ShakingTextField>
          </FormSectionCard>
        </>
      )}
      {original && (
        <StudentFeedback notificationKey="STU-0308" presentation="inline" severity="info">
          Confirm that you personally checked the physical original. This records your attestation
          and sends the evidence for review.
        </StudentFeedback>
      )}
      {action === 'reject' && (
        <StudentFeedback notificationKey="STU-0310" presentation="inline" severity="warning">
          Explain what needs correcting so admissions staff can provide a replacement.
        </StudentFeedback>
      )}
      {action === 'waive' && (
        <StudentFeedback notificationKey="STU-0311" presentation="inline" severity="warning">
          This records an exception for this applicant. Explain why the requirement can be waived.
        </StudentFeedback>
      )}
      {action !== 'accept' && (
        <ShakingTextField error={Boolean(formik.touched.notes && formik.errors.notes)}>
          <TextField
            fullWidth
            multiline
            minRows={3}
            size="small"
            name="notes"
            label={
              original
                ? 'Original Verification Notes'
                : action === 'reject'
                  ? 'Rejection Reason'
                  : action === 'waive'
                    ? 'Reason'
                    : 'Notes'
            }
            required={['original', 'reject', 'waive'].includes(action)}
            disabled={formik.isSubmitting}
            value={formik.values.notes}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.notes && Boolean(formik.errors.notes)}
            helperText={formik.touched.notes && formik.errors.notes}
            slotProps={{ htmlInput: { maxLength: 1024 } }}
          />
        </ShakingTextField>
      )}
    </Stack>
  );
}
