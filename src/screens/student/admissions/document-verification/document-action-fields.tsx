import type { FormikProps } from 'formik';
import type { AdmissionDocumentRequirement } from 'src/redux/student/admissions/admission-document-types';

import { Stack, TextField, Typography } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { StudentFeedback } from 'src/components/student-feedback';

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
  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2">{requirement.name}</Typography>
      {action === 'upload' && (
        <>
          {requirement.evidence.length > 0 && (
            <StudentFeedback notificationKey="STU-0307" presentation="inline" severity="info">
              This creates a new version for review. Previous versions remain in the history.
              {requirement.evidence.at(-1)?.originalSeen
                ? ' Record the original again after replacing the file.'
                : ''}
            </StudentFeedback>
          )}
          <TextField
            type="file"
            label="Document"
            required
            fullWidth
            size="small"
            disabled={formik.isSubmitting}
            name="file"
            onChange={(event) => {
              formik.setFieldValue('file', (event.target as HTMLInputElement).files?.[0] ?? null);
            }}
            onBlur={formik.handleBlur}
            error={formik.touched.file && Boolean(formik.errors.file)}
            helperText={
              formik.touched.file && formik.errors.file
                ? formik.errors.file
                : `${extensions.join(', ').toUpperCase()} · Maximum ${maxFileSizeMb} MB`
            }
            slotProps={{
              inputLabel: { shrink: true },
              htmlInput: {
                accept: extensions.map((extension) => `.${extension.replace(/^\./, '')}`).join(','),
              },
            }}
          />
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
                ? 'Original verification notes'
                : action === 'reject'
                  ? 'Rejection reason'
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
