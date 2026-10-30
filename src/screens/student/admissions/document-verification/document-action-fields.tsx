import type { FormikProps } from 'formik';
import type { AdmissionDocumentRequirement } from 'src/redux/student/admissions/admission-document-types';

import { useId, useRef } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import ShakingTextField from 'src/components/shaking-text-field';
import { StudentFeedback } from 'src/components/student-feedback';
import {
  Stack,
  Button,
  TextField,
  FormLabel,
  Typography,
  FormControl,
  FormHelperText,
} from '@mui/material';

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
  const fileInput = useRef<HTMLInputElement>(null);
  const fileId = useId();
  const fileHelpId = `${fileId}-help`;
  const fileError = Boolean(formik.touched.file && formik.errors.file);
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
          <ShakingTextField error={fileError}>
            <FormControl fullWidth required error={fileError} disabled={formik.isSubmitting}>
              <FormLabel htmlFor={fileId} sx={{ typography: 'body2', mb: 1 }}>
                Document
              </FormLabel>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                alignItems={{ sm: 'center' }}
              >
                <Button
                  type="button"
                  size="small"
                  variant="outlined"
                  startIcon={<Iconify icon={GlobalIcons.upload} width={18} />}
                  disabled={formik.isSubmitting}
                  aria-describedby={fileHelpId}
                  onClick={() => fileInput.current?.click()}
                  sx={{ alignSelf: 'flex-start', flexShrink: 0 }}
                >
                  Upload file
                </Button>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ overflowWrap: 'anywhere', minWidth: 0 }}
                >
                  {formik.values.file?.name ?? 'No file selected'}
                </Typography>
              </Stack>
              <input
                ref={fileInput}
                id={fileId}
                hidden
                type="file"
                name="file"
                required
                disabled={formik.isSubmitting}
                aria-describedby={fileHelpId}
                aria-invalid={fileError}
                accept={extensions.map((extension) => `.${extension.replace(/^\./, '')}`).join(',')}
                onChange={(event) => {
                  formik.setFieldTouched('file', true, false);
                  formik.setFieldValue('file', event.target.files?.[0] ?? null);
                }}
                onBlur={formik.handleBlur}
              />
              <FormHelperText id={fileHelpId} sx={{ mx: 0 }}>
                {fileError
                  ? formik.errors.file
                  : `${extensions.join(', ').toUpperCase()} · Maximum ${maxFileSizeMb} MB`}
              </FormHelperText>
            </FormControl>
          </ShakingTextField>
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
