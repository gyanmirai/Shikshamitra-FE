import type { FormikProps } from 'formik';

import { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import CustomUpload from 'src/components/custom-upload';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { FormLabel, FormControl, FormHelperText } from '@mui/material';

import { DocumentFileList } from './document-file-list';
import { LocalFilePreview } from './local-file-preview';
import { documentFileHelp, documentFilesError } from '../document-form';

import type { DocumentFormValues } from '../types';

export function DocumentAttachmentsField({
  formik,
  documentId,
  canRemove,
}: {
  formik: FormikProps<DocumentFormValues>;
  documentId?: string;
  canRemove: boolean;
}) {
  const [preview, setPreview] = useState<File | null>(null);
  const [rejection, setRejection] = useState('');
  const validationError =
    (formik.submitCount > 0 || formik.touched.files) && typeof formik.errors.files === 'string'
      ? formik.errors.files
      : '';
  const error = rejection || validationError;
  return (
    <FormSectionCard
      title="Attachments"
      icon={GlobalIcons.upload}
      titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
      descriptionTooltip="Keep the main approval and its supporting scans together in one document record."
    >
      {documentId && (
        <DocumentFileList
          documentId={documentId}
          files={formik.values.retainedFiles}
          disabled={formik.isSubmitting}
          onRemove={
            canRemove
              ? (id) => {
                  setRejection('');
                  formik.setFieldValue(
                    'retainedFiles',
                    formik.values.retainedFiles.filter((file) => file.id !== id)
                  );
                  formik.setFieldTouched('files', true, false);
                }
              : undefined
          }
        />
      )}
      <ShakingTextField error={Boolean(error)}>
        <FormControl fullWidth required error={Boolean(error)}>
          <FormLabel id="document-files-label" sx={{ typography: 'body2', mb: 1 }}>
            Files
          </FormLabel>
          <CustomUpload
            multiple
            value={formik.values.files}
            disabled={formik.isSubmitting}
            accept=".pdf,.jpg,.jpeg,.png"
            primaryText="Choose files or drop them here"
            error={error}
            parentsProps={{
              role: 'group',
              'aria-labelledby': 'document-files-label',
              'aria-describedby': 'document-files-help',
              'aria-invalid': Boolean(error),
            }}
            dragProps={{ 'aria-describedby': 'document-files-help' }}
            onReject={setRejection}
            onPreview={(file) => {
              const selected =
                file instanceof File
                  ? file
                  : formik.values.files.find(
                      (item) => item.name === file.name && item.size === file.size
                    );
              if (selected) setPreview(selected);
            }}
            onChange={(selected) => {
              const files = selected.filter((file): file is File => file instanceof File);
              if (
                files.length === formik.values.files.length &&
                files.every((file, index) => file === formik.values.files[index])
              )
                return;
              const problem = documentFilesError(files, formik.values.retainedFiles.length);
              if (problem && files.length > formik.values.files.length) {
                setRejection(problem);
                return;
              }
              setRejection('');
              formik.setFieldValue('files', files);
              formik.setFieldTouched('files', true, false);
            }}
          />
          <FormHelperText id="document-files-help">
            {documentFileHelp} {formik.values.retainedFiles.length + formik.values.files.length} of
            5 files selected.
          </FormHelperText>
          {error && formik.values.files.length > 0 && (
            <FormHelperText error role="alert">
              {error}
            </FormHelperText>
          )}
        </FormControl>
      </ShakingTextField>
      {preview && <LocalFilePreview file={preview} onClose={() => setPreview(null)} />}
    </FormSectionCard>
  );
}
