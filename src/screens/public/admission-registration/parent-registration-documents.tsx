'use client';

import type { ParentRegistrationDocument } from 'src/redux/student/admissions/admission-parent-registration-types';

import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { useRef, useState, useEffect } from 'react';
import CustomUpload from 'src/components/custom-upload';
import { LoadingButton } from 'src/components/loading-button';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { Box, Stack, Button, FormLabel, Typography, FormControl } from '@mui/material';
import { documentActionSchema } from 'src/screens/student/admissions/document-verification/document-action-model';

import { ParentRegistrationFileActions } from './parent-registration-files';

import type { ParentRegistrationTransport } from './parent-registration-transport';

export function ParentRegistrationDocuments({
  documents,
  transport,
  disabled,
  uploading,
  onUpload,
  onDirtyChange,
}: {
  documents: ParentRegistrationDocument[];
  transport: ParentRegistrationTransport;
  disabled: boolean;
  uploading: boolean;
  onUpload: (requirement: ParentRegistrationDocument, file: File, key: string) => Promise<boolean>;
  onDirtyChange: (key: string, dirty: boolean) => void;
}) {
  return (
    <Stack spacing={2}>
      {documents.map((document) => (
        <ParentDocument
          key={`${document.stageInstanceId}/${document.code}`}
          document={document}
          transport={transport}
          disabled={disabled}
          uploading={uploading}
          onUpload={onUpload}
          onDirtyChange={onDirtyChange}
        />
      ))}
    </Stack>
  );
}

function ParentDocument({
  document,
  transport,
  disabled,
  uploading,
  onUpload,
  onDirtyChange,
}: {
  document: ParentRegistrationDocument;
  transport: ParentRegistrationTransport;
  disabled: boolean;
  uploading: boolean;
  onUpload: (requirement: ParentRegistrationDocument, file: File, key: string) => Promise<boolean>;
  onDirtyChange: (key: string, dirty: boolean) => void;
}) {
  const [replacing, setReplacing] = useState(false);
  const retry = useRef<{ file: File; key: string } | null>(null);
  const formik = useFormik<{ file: File | null; notes: string }>({
    initialValues: { file: null, notes: '' },
    validationSchema: documentActionSchema(
      'upload',
      document.allowedExtensions,
      document.maxFileSizeMb
    ),
    onSubmit: async ({ file }) => {
      if (!file) return;
      if (retry.current?.file !== file) retry.current = { file, key: crypto.randomUUID() };
      if (await onUpload(document, file, retry.current.key)) {
        formik.resetForm();
        retry.current = null;
        setReplacing(false);
      }
    },
  });
  const fileError = formik.touched.file ? formik.errors.file : undefined;
  useEffect(() => {
    const key = `${document.stageInstanceId}/${document.code}`;
    onDirtyChange(key, formik.dirty);
    return () => onDirtyChange(key, false);
  }, [document.stageInstanceId, document.code, formik.dirty, onDirtyChange]);
  const latest = document.evidence.at(-1);
  return (
    <FormSectionCard
      title={document.name}
      icon={GlobalIcons.documentIcon}
      descriptionTooltip={document.description || 'Upload a clear copy for school review.'}
    >
      <Stack spacing={1}>
        <Typography variant="body2" color="text.secondary">
          {document.isRequired ? 'Required' : 'Optional'} ·{' '}
          {document.status === 'pendingReview' ? 'Awaiting school review' : document.status}
        </Typography>
        {latest && (
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
              {latest.fileName} · Version {latest.versionNumber}
            </Typography>
            <ParentRegistrationFileActions file={latest} transport={transport} />
          </Box>
        )}
        {document.canUpload && !disabled && (!latest || replacing) && (
          <>
            <Typography
              id={`document-help-${document.code}`}
              variant="caption"
              color="text.secondary"
            >
              {document.allowedExtensions.join(', ').toUpperCase()} · Maximum{' '}
              {document.maxFileSizeMb} MB. Replacements create a new version for school review.
            </Typography>
            <ShakingTextField error={Boolean(fileError)}>
              <FormControl fullWidth required={document.isRequired} error={Boolean(fileError)}>
                <FormLabel
                  id={`document-label-${document.code}`}
                  sx={{ typography: 'body2', mb: 1 }}
                >
                  Document
                </FormLabel>
                <CustomUpload<false>
                  multiple={false}
                  value={formik.values.file ?? undefined}
                  onChange={(file) => {
                    if (!file || file instanceof File) {
                      const mime = file?.type;
                      if (
                        file &&
                        !['image/jpeg', 'image/png', 'application/pdf'].includes(mime || '')
                      ) {
                        formik.setFieldTouched('file', true, false);
                        formik.setFieldError('file', 'Choose a JPG, PNG or PDF document.');
                        return;
                      }
                      formik.setFieldValue('file', file ?? null, true);
                      formik.setFieldTouched('file', true, false);
                    }
                  }}
                  onReject={(message) => {
                    formik.setFieldTouched('file', true, false);
                    formik.setFieldError('file', message);
                  }}
                  error={fileError}
                  primaryText="Drop a file here or browse"
                  secondaryText="Select one document"
                  accept={document.allowedExtensions
                    .map((extension) => `.${extension.replace(/^\./, '')}`)
                    .join(',')}
                  maxFileSizeMb={document.maxFileSizeMb}
                  disabled={uploading}
                  loading={formik.isSubmitting}
                  parentsProps={{
                    role: 'group',
                    'aria-labelledby': `document-label-${document.code}`,
                  }}
                  dragProps={{
                    'aria-describedby': `document-help-${document.code}`,
                    'aria-required': document.isRequired,
                  }}
                />
              </FormControl>
            </ShakingTextField>
            <Stack direction="row" justifyContent="flex-end" spacing={1}>
              {replacing && (
                <Button
                  size="small"
                  disabled={uploading}
                  onClick={() => {
                    formik.resetForm();
                    setReplacing(false);
                  }}
                >
                  Cancel replacement
                </Button>
              )}
              <LoadingButton
                size="small"
                variant="outlined"
                loading={formik.isSubmitting}
                disabled={uploading}
                onClick={() => formik.submitForm()}
              >
                Upload document
              </LoadingButton>
            </Stack>
          </>
        )}
        {latest && document.canUpload && !disabled && !replacing && (
          <Button
            size="small"
            disabled={uploading}
            onClick={() => setReplacing(true)}
            sx={{ alignSelf: 'flex-start' }}
          >
            Replace document
          </Button>
        )}
        {document.evidence.length > 1 && (
          <Typography variant="caption" color="text.secondary">
            Previous versions are retained by the school.
          </Typography>
        )}
      </Stack>
    </FormSectionCard>
  );
}
