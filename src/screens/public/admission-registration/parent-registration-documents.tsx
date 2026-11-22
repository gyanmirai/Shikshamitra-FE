'use client';

import type { ReactNode } from 'react';
import type { ParentRegistrationDocument } from 'src/redux/student/admissions/admission-parent-registration-types';

import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomUpload from 'src/components/custom-upload';
import { useId, useRef, useState, useEffect } from 'react';
import { LoadingButton } from 'src/components/loading-button';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { Box, Stack, Button, Typography, FormControl } from '@mui/material';
import { documentActionSchema } from 'src/screens/student/admissions/document-verification/document-action-model';

import { registrationDocumentStatus } from './parent-registration-model';
import { ParentRegistrationAttachment } from './parent-registration-files';

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
  const canUpload = document.canUpload && !disabled;
  const showUpload = canUpload && (uploadOpen || !latest);
  const extensions = document.allowedExtensions.map((extension) => extension.replace(/^\./, ''));
  const uploadControls = (
    <Stack spacing={1}>
      {showUpload && (
        <>
          {latest && (
            <Typography variant="caption" color="text.secondary">
              Replacing the file creates a new version for school review.
            </Typography>
          )}
          <ShakingTextField error={Boolean(fileError)}>
            <FormControl fullWidth required={document.isRequired} error={Boolean(fileError)}>
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
                accept={extensions.map((extension) => `.${extension}`).join(',')}
                maxFileSizeMb={document.maxFileSizeMb}
                disabled={uploading || formik.isSubmitting}
                loading={!mobile && formik.isSubmitting}
                parentsProps={{
                  role: 'group',
                  'aria-labelledby': `${id}-title`,
                }}
                dragProps={{
                  'aria-describedby': `${id}-help`,
                  'aria-required': document.isRequired,
                  'aria-invalid': Boolean(fileError) || undefined,
                  sx: !formik.values.file
                    ? {
                        ...(!fileError && { bgcolor: 'action.hover' }),
                        height: 'auto',
                        minHeight: { xs: 112, md: 144 },
                      }
                    : undefined,
                }}
              />
            </FormControl>
          </ShakingTextField>
          <Stack
            direction="row"
            justifyContent="flex-end"
            spacing={1}
            useFlexGap
            flexWrap={mobile ? 'wrap' : 'nowrap'}
          >
            {uploadOpen && (
              <Button
                size="small"
                disabled={uploading}
                onClick={() => {
                  formik.resetForm();
                  retry.current = null;
                  setUploadOpen(false);
                }}
              >
                {latest ? 'Cancel replacement' : 'Cancel'}
              </Button>
            )}
            <LoadingButton
              size="small"
              variant={mobile ? 'contained' : 'outlined'}
              startIcon={mobile ? <Iconify icon="mdi:upload" width={16} /> : undefined}
              loading={formik.isSubmitting}
              disabled={
                uploading ||
                (mobile && (!formik.values.file || Boolean(fileError) || formik.isValidating))
              }
              onClick={() => formik.submitForm()}
            >
              {mobile ? 'Upload selected file' : 'Upload document'}
            </LoadingButton>
          </Stack>
        </>
      )}
      {!showUpload && (
        <Button
          size="small"
          variant="outlined"
          startIcon={<Iconify icon="mdi:swap-horizontal" width={16} />}
          disabled={uploading}
          onClick={() => setUploadOpen(true)}
          sx={{ alignSelf: 'flex-start' }}
        >
          Replace document
        </Button>
      )}
    </Stack>
  );

  return (
    <FormSectionCard
      title={document.name}
      titleTypographyProps={{ id: `${id}-title` }}
      icon={GlobalIcons.documentIcon}
      descriptionTooltip={document.description || 'Upload a clear copy for school review.'}
    >
      <Stack spacing={1.5}>
        <Typography
          variant="body2"
          color="text.secondary"
          aria-live={mobile ? 'polite' : undefined}
        >
          {document.isRequired ? 'Required' : 'Optional'} ·{' '}
          {mobile && document.status === 'pendingReview' ? (
            <>
              <Box component="span" sx={{ color: 'success.main', fontWeight: 'fontWeightMedium' }}>
                Uploaded
              </Box>
              {' · Awaiting school review'}
            </>
          ) : (
            <Box component="span" sx={{ color: status.color }}>
              {status.label}
            </Box>
          )}
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'minmax(0, 1fr)',
              md: canUpload ? 'minmax(260px, 0.85fr) minmax(0, 1.15fr)' : 'minmax(0, 1fr)',
            },
            gap: 2,
          }}
        >
          {canUpload && (
            <DocumentPanel
              id={`${id}-upload`}
              title="Upload file"
              icon="mdi:upload-outline"
              description={
                <span id={`${id}-help`}>
                  {extensions.map((extension) => extension.toUpperCase()).join(', ')} · Up to{' '}
                  {document.maxFileSizeMb} MB
                </span>
              }
            >
              {uploadControls}
            </DocumentPanel>
          )}
          <DocumentPanel
            id={`${id}-attachments`}
            title="View attachments"
            icon="mdi:file-document-multiple-outline"
            description={latest ? '1 file attached' : undefined}
          >
            {latest ? (
              <ParentRegistrationAttachment file={latest} transport={transport} />
            ) : (
              <Stack
                alignItems="center"
                justifyContent="center"
                spacing={1}
                sx={{
                  minHeight: { xs: 88, md: 144 },
                  borderRadius: 1.5,
                  bgcolor: 'action.hover',
                  px: 2,
                }}
              >
                <Iconify
                  icon="mdi:file-document-outline"
                  width={28}
                  sx={{ color: 'text.disabled' }}
                  aria-hidden
                />
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  No files attached yet
                </Typography>
              </Stack>
            )}
          </DocumentPanel>
        </Box>
        {document.evidence.length > 1 && (
          <Typography variant="caption" color="text.secondary">
            Previous versions are retained by the school.
          </Typography>
        )}
      </Stack>
    </FormSectionCard>
  );
}

function DocumentPanel({
  id,
  title,
  icon,
  description,
  children,
}: {
  id: string;
  title: string;
  icon: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Box
      component="section"
      aria-labelledby={id}
      sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1.5, minWidth: 0 }}
    >
      <Stack direction="row" spacing={1} alignItems="flex-start" mb={1.5}>
        <Iconify icon={icon} width={20} sx={{ color: 'text.secondary' }} aria-hidden />
        <Box sx={{ minWidth: 0 }}>
          <Typography id={id} variant="subtitle2" component="h3" fontWeight={700}>
            {title}
          </Typography>
          {description && (
            <Typography variant="caption" color="text.secondary">
              {description}
            </Typography>
          )}
        </Box>
      </Stack>
      {children}
    </Box>
  );
}
