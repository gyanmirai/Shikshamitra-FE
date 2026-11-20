'use client';

import type { ParentRegistrationDocument } from 'src/redux/student/admissions/admission-parent-registration-types';

import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomUpload from 'src/components/custom-upload';
import { useId, useRef, useState, useEffect } from 'react';
import { LoadingButton } from 'src/components/loading-button';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { Box, Stack, Button, FormLabel, Typography, FormControl } from '@mui/material';
import { documentActionSchema } from 'src/screens/student/admissions/document-verification/document-action-model';

import { registrationDocumentStatus } from './parent-registration-model';
import { ParentRegistrationFileActions } from './parent-registration-files';

import type { ParentRegistrationTransport } from './parent-registration-transport';

export function ParentRegistrationDocuments({
  documents,
  mobile,
  transport,
  disabled,
  uploading,
  onUpload,
  onDirtyChange,
}: {
  documents: ParentRegistrationDocument[];
  mobile: boolean;
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
          mobile={mobile}
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
  mobile,
  transport,
  disabled,
  uploading,
  onUpload,
  onDirtyChange,
}: {
  document: ParentRegistrationDocument;
  mobile: boolean;
  transport: ParentRegistrationTransport;
  disabled: boolean;
  uploading: boolean;
  onUpload: (requirement: ParentRegistrationDocument, file: File, key: string) => Promise<boolean>;
  onDirtyChange: (key: string, dirty: boolean) => void;
}) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const id = useId();
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
        setUploadOpen(false);
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
  const status = registrationDocumentStatus(document);
  const showUpload = document.canUpload && !disabled && (uploadOpen || (!mobile && !latest));
  return (
    <FormSectionCard
      title={document.name}
      icon={GlobalIcons.documentIcon}
      descriptionTooltip={document.description || 'Upload a clear copy for school review.'}
    >
      <Stack spacing={1}>
        <Typography variant="body2" color="text.secondary">
          {document.isRequired ? 'Required' : 'Optional'} ·{' '}
          <Box component="span" sx={{ color: status.color }}>
            {status.label}
          </Box>
        </Typography>
        {latest && (
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
              {latest.fileName} · Version {latest.versionNumber}
            </Typography>
            <ParentRegistrationFileActions file={latest} transport={transport} />
          </Box>
        )}
        {document.canUpload && !disabled && (showUpload || !latest) && (
          <Typography id={`${id}-help`} variant="caption" color="text.secondary">
            {document.allowedExtensions
              .map((extension) => extension.replace(/^\./, '').toUpperCase())
              .join(', ')}{' '}
            · Up to {document.maxFileSizeMb} MB
          </Typography>
        )}
        {showUpload && (
          <>
            {latest && (
              <Typography variant="caption" color="text.secondary">
                Replacing the file creates a new version for school review.
              </Typography>
            )}
            <ShakingTextField error={Boolean(fileError)}>
              <FormControl fullWidth required={document.isRequired} error={Boolean(fileError)}>
                <FormLabel id={`${id}-label`} sx={{ typography: 'body2', mb: 1 }}>
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
                  primaryText={mobile ? 'Choose a file' : 'Drop a file here or browse'}
                  secondaryText="Select one document"
                  accept={document.allowedExtensions
                    .map((extension) => `.${extension.replace(/^\./, '')}`)
                    .join(',')}
                  maxFileSizeMb={document.maxFileSizeMb}
                  disabled={uploading}
                  loading={formik.isSubmitting}
                  parentsProps={{
                    role: 'group',
                    'aria-labelledby': `${id}-label`,
                  }}
                  dragProps={{
                    'aria-describedby': `${id}-help`,
                    'aria-required': document.isRequired,
                  }}
                />
              </FormControl>
            </ShakingTextField>
            <Stack direction="row" justifyContent="flex-end" spacing={1}>
              {uploadOpen && (
                <Button
                  size="small"
                  disabled={uploading}
                  onClick={() => {
                    formik.resetForm();
                    setUploadOpen(false);
                  }}
                >
                  {latest ? 'Cancel replacement' : 'Cancel'}
                </Button>
              )}
              <LoadingButton
                size="small"
                variant="outlined"
                loading={formik.isSubmitting}
                disabled={uploading}
                onClick={() => formik.submitForm()}
              >
                {mobile ? 'Upload selected file' : 'Upload document'}
              </LoadingButton>
            </Stack>
          </>
        )}
        {document.canUpload && !disabled && !showUpload && (
          <Button
            size="small"
            variant={latest ? 'text' : 'outlined'}
            startIcon={
              <Iconify icon={latest ? 'mdi:swap-horizontal' : GlobalIcons.upload} width={16} />
            }
            disabled={uploading}
            onClick={() => setUploadOpen(true)}
            sx={{ alignSelf: 'flex-start' }}
          >
            {latest ? 'Replace document' : 'Upload document'}
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
