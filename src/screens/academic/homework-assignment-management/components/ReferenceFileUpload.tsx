import type { FileData } from 'src/components/custom-upload';

import FileUploader from 'src/components/custom-upload';
import { Stack, Alert, Button, Typography } from '@mui/material';

import { REFERENCE_FILE_ACCEPT } from '../hooks/useReferenceFileUpload';

import type { ReferenceFileUploadState } from '../hooks/useReferenceFileUpload';

interface ReferenceFileUploadProps {
  value?: FileData | File | null;
  upload: ReferenceFileUploadState;
  disabled?: boolean;
  onPreview?: (file: File | FileData) => void;
}

export function ReferenceFileUpload({
  value,
  upload,
  disabled,
  onPreview,
}: ReferenceFileUploadProps) {
  return (
    <Stack spacing={1}>
      <FileUploader
        value={value ?? undefined}
        multiple={false}
        showVisibleDocumentCount={1}
        isLoading={upload.isUploading}
        disabled={disabled}
        accept={REFERENCE_FILE_ACCEPT}
        onChange={(file) => upload.change(file ?? null)}
        onReject={upload.reject}
        onPreview={onPreview}
        primaryText="Upload Reference File"
        secondaryText="Supports PDF, DOCX, PNG, JPG/JPEG (Max 5MB)"
        dragProps={{ sx: { flexDirection: value ? 'row' : 'column', gap: 1 } }}
      />
      {upload.error && (
        <Alert
          severity="error"
          action={
            <Stack direction="row" spacing={1}>
              {upload.failedFile && (
                <Button color="inherit" size="small" onClick={upload.retry}>
                  Retry
                </Button>
              )}
              <Button color="inherit" size="small" onClick={upload.clearError}>
                Dismiss
              </Button>
            </Stack>
          }
        >
          {upload.failedFile && `${upload.failedFile.name}: `}
          {upload.error}
        </Alert>
      )}
      {value && !upload.isUploading && !upload.error && (
        <Typography role="status" variant="caption" color="success.main">
          ✓ File attached successfully
        </Typography>
      )}
    </Stack>
  );
}
