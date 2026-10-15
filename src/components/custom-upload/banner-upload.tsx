import { useId } from 'react';
import { Box, Stack, Button, Typography, FormHelperText, CircularProgress } from '@mui/material';

import { Iconify } from '../iconify';
import { useBannerUpload } from './use-banner-upload';

import type { CustomUploadProps } from './custom-upload';

const actionSx = {
  '&.Mui-focusVisible': { outline: '2px solid', outlineColor: 'text.primary', outlineOffset: 3 },
};

export function BannerUpload(props: CustomUploadProps) {
  const { value = [], disabled, error: fieldError, helperText } = props;
  const { getRootProps, getInputProps, isDragActive, open, error, busy, fileName, clear } =
    useBannerUpload(props);
  const id = useId();
  const image = typeof value[0] === 'string' ? value[0] : value[0]?.preview;
  const locked = disabled || busy;
  const message = error || helperText;
  const hasError = Boolean(error || fieldError);

  return (
    <Stack
      spacing={1}
      role="group"
      aria-labelledby={`${id}-label`}
      aria-describedby={`${id}-help ${message ? `${id}-error` : ''}`}
    >
      <Stack direction="row" spacing={1} alignItems="baseline">
        <Typography id={`${id}-label`} variant="subtitle2">
          Banner Image
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Optional
        </Typography>
      </Stack>
      <Box
        {...getRootProps({ role: 'presentation' })}
        aria-busy={busy}
        sx={{
          border: '1px dashed',
          borderColor: hasError ? 'error.main' : isDragActive ? 'primary.main' : 'divider',
          bgcolor: isDragActive ? 'action.hover' : 'background.neutral',
          borderRadius: 1.5,
          p: 2,
        }}
      >
        <input {...getInputProps({ 'aria-label': 'Choose banner image', disabled: locked })} />
        {image ? (
          <Stack spacing={1.5}>
            <Box
              component="img"
              src={image}
              alt="Selected banner preview"
              sx={{ width: 1, height: { xs: 120, sm: 160 }, objectFit: 'contain', borderRadius: 1 }}
            />
            <Stack
              spacing={1.5}
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'stretch', sm: 'center' }}
            >
              <Typography variant="body2" sx={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}>
                {fileName || 'Current banner'}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  disabled={locked}
                  onClick={open}
                  sx={actionSx}
                >
                  Replace Banner
                </Button>
                <Button type="button" size="small" disabled={locked} onClick={clear} sx={actionSx}>
                  Remove Banner
                </Button>
              </Stack>
            </Stack>
          </Stack>
        ) : (
          <Stack spacing={1.5} alignItems="center" sx={{ py: 1 }}>
            <Iconify icon="mdi:image-plus-outline" width={32} sx={{ color: 'text.secondary' }} />
            <Typography variant="body2" sx={{ textAlign: 'center' }}>
              {isDragActive ? 'Drop your banner image here' : 'Drag and drop a banner image here'}
            </Typography>
            <Button
              type="button"
              variant="outlined"
              size="small"
              disabled={locked}
              onClick={open}
              sx={actionSx}
            >
              Upload Banner
            </Button>
          </Stack>
        )}
        {busy && (
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="center"
            role="status"
            sx={{ mt: 1.5 }}
          >
            <CircularProgress size={16} />
            <Typography variant="body2">Reading banner image...</Typography>
          </Stack>
        )}
      </Box>
      <Typography id={`${id}-help`} variant="caption" color="text.secondary">
        JPG, PNG, or GIF. Maximum 5 MB. A wide image works best.
      </Typography>
      {message && (
        <FormHelperText id={`${id}-error`} error={hasError} role={hasError ? 'alert' : undefined}>
          {message}
        </FormHelperText>
      )}
    </Stack>
  );
}
