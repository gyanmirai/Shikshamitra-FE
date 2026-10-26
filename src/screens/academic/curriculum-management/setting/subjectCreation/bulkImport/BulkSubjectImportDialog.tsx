'use client';

import { useId } from 'react';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomUpload from 'src/components/custom-upload';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Button, FormLabel, Typography, DialogActions, LinearProgress } from '@mui/material';

import { SUBJECT_IMPORT_ACCEPT } from './constants';
import { useBulkSubjectImport } from './useBulkSubjectImport';
import { SubjectImportPreview } from './SubjectImportPreview';
import { TemplateDownloadPanel } from './TemplateDownloadPanel';

interface BulkSubjectImportDialogProps {
  open: boolean;
  onClose: () => void;
}

export function BulkSubjectImportDialog({ open, onClose }: BulkSubjectImportDialogProps) {
  const fileLabelId = useId();
  const fileHelpId = useId();
  const { formik, isParsing, isSaving, closeAndReset, handleFileChange } =
    useBulkSubjectImport(onClose);
  const invalidRows = formik.values.rows.filter((row) => row.issues.length > 0).length;
  const fileError =
    formik.touched.file && typeof formik.errors.file === 'string' ? formik.errors.file : '';

  return (
    <CustomDialog
      open={open}
      title="Import Subjects"
      titleInfo="Prepare subjects with the import template, then review the validated rows before importing."
      handleClose={closeAndReset}
      maxWidth="md"
      hasUnsavedChanges={formik.dirty}
      disableClose={isSaving}
    >
      <DialogScrollContent sx={{ py: 2.5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TemplateDownloadPanel />

          <FormSectionCard
            title="Import File"
            icon={GlobalIcons.upload}
            descriptionTooltip="Upload the completed template to validate each subject before import."
          >
            <FormLabel id={fileLabelId} component="span" required error={Boolean(fileError)}>
              Completed template
            </FormLabel>
            <ShakingTextField error={Boolean(fileError)}>
              <CustomUpload<false>
                multiple={false}
                value={formik.values.file || undefined}
                onChange={(value) => {
                  if (value instanceof File) handleFileChange(value);
                }}
                onReject={(message) => {
                  formik.setFieldTouched('file', true, false);
                  formik.setFieldError('file', message);
                }}
                error={fileError}
                primaryText="Drop the completed template here, or choose a file"
                dragProps={{
                  'aria-labelledby': fileLabelId,
                  'aria-describedby': fileHelpId,
                  'aria-invalid': Boolean(fileError),
                }}
                accept={SUBJECT_IMPORT_ACCEPT}
                showPreview={false}
                disabled={isParsing || isSaving}
              />
            </ShakingTextField>
            <Typography id={fileHelpId} variant="caption" color="text.secondary">
              CSV or Excel (.xlsx), maximum 5 MB. Required columns: Subject Name, Category, Color,
              Status.
            </Typography>
          </FormSectionCard>

          {isParsing && (
            <Box role="status" aria-label="Reading subject file">
              <LinearProgress />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.75, display: 'block' }}
              >
                Reading and validating the file…
              </Typography>
            </Box>
          )}

          {!isParsing && <SubjectImportPreview rows={formik.values.rows} />}
        </Box>
      </DialogScrollContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          type="button"
          size="small"
          variant="outlined"
          disabled={isSaving}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={closeAndReset}
        >
          Cancel
        </Button>
        <LoadingButton
          type="submit"
          size="small"
          variant="contained"
          loading={isSaving}
          disabled={isParsing || !formik.values.rows.length || invalidRows > 0}
          startIcon={<Iconify icon="solar:import-outline" />}
          onClick={() => formik.submitForm()}
        >
          Import {formik.values.rows.length || ''} subjects
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
  );
}
