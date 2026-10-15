import type { ReactNode } from 'react';

import { useId } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import FormHelperText from '@mui/material/FormHelperText';

import { Iconify } from '../iconify';
import { useImageUpload } from './use-image-upload';

export function ImageUpload({
  label,
  actionLabel,
  maxSize,
  helperText,
  preview,
  previewWidth = 96,
  fileName,
  disabled = false,
  error,
  onUpload,
}: {
  label: string;
  actionLabel: string;
  maxSize: number;
  helperText: string;
  preview?: ReactNode;
  previewWidth?: number;
  fileName?: string;
  disabled?: boolean;
  error?: string;
  onUpload: (file: File) => void;
}) {
  const id = useId();
  const { getRootProps, getInputProps, open, isDragActive, rejection } = useImageUpload({
    disabled,
    maxSize,
    onUpload,
  });
  const message = rejection || error;
  return (
    <Box>
      <Stack
        {...getRootProps({ role: 'group', 'aria-label': `${label} upload` })}
        direction="row"
        spacing={2}
        useFlexGap
        flexWrap="wrap"
        alignItems="center"
        sx={{
          p: 1.5,
          border: '1px dashed',
          borderColor: message ? 'error.main' : isDragActive ? 'primary.main' : 'divider',
          borderRadius: 1,
          bgcolor: isDragActive ? 'action.selected' : 'background.paper',
          opacity: disabled ? 0.64 : 1,
        }}
      >
        <input {...getInputProps({ 'aria-label': `${label} image file` })} />
        <Box
          sx={{
            width: { xs: Math.min(previewWidth, 100), sm: previewWidth },
            minHeight: 80,
            flexShrink: 0,
            bgcolor: 'background.neutral',
            borderRadius: 0.75,
            overflow: 'hidden',
            display: 'grid',
            alignItems: 'center',
            justifyItems: preview ? 'stretch' : 'center',
          }}
        >
          {preview || (
            <Iconify icon="mdi:image-outline" width={28} sx={{ color: 'text.secondary' }} />
          )}
        </Box>
        <Stack spacing={0.75} sx={{ minWidth: 0, flex: '1 1 120px', alignItems: 'flex-start' }}>
          <Typography variant="body2" fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>
            {preview ? fileName || 'Current image' : 'No image selected'}
          </Typography>
          <Button
            type="button"
            variant="outlined"
            size="small"
            disabled={disabled}
            onClick={open}
            aria-describedby={`${id}-help${message ? ` ${id}-error` : ''}`}
            aria-invalid={Boolean(message)}
          >
            {actionLabel}
          </Button>
          <Typography variant="caption" color="text.secondary" role="status">
            {isDragActive ? 'Drop image here' : 'or drag and drop an image here'}
          </Typography>
        </Stack>
      </Stack>
      <FormHelperText id={`${id}-help`} sx={{ mx: 0, mt: 0.75 }}>
        {helperText}
      </FormHelperText>
      {message && (
        <FormHelperText id={`${id}-error`} error role="alert" sx={{ mx: 0 }}>
          {message}
        </FormHelperText>
      )}
    </Box>
  );
}
