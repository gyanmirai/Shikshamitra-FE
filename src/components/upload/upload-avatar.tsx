import Webcam from 'react-webcam';
import Box from '@mui/material/Box';
import { varAlpha } from 'src/theme/styles';
import { useDropzone } from 'react-dropzone';
import Typography from '@mui/material/Typography';
import { useRef, useState, useEffect, useCallback } from 'react';
import {
  Stack,
  Dialog,
  Button,
  Tooltip,
  IconButton,
  DialogTitle,
  DialogActions,
  DialogContent,
  CircularProgress,
} from '@mui/material';

import { Image } from '../image';
import { Iconify } from '../iconify';

import type { UploadProps } from './types';

// ----------------------------------------------------------------------

export function UploadAvatar({
  sx,
  error,
  value,
  title,
  disabled,
  onDelete,
  helperText,
  ...other
}: UploadProps) {
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    multiple: false,
    disabled,
    accept: { 'image/*': [] },
    ...other,
  });

  const hasFile = !!value;

  const hasError = isDragReject || !!error;

  const [preview, setPreview] = useState('');
  const [webcamOpen, setWebcamOpen] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  useEffect(() => {
    if (typeof value === 'string') {
      setPreview(value);
    } else if (value instanceof File) {
      setPreview(URL.createObjectURL(value));
    }
  }, [value]);

  const handleCapture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc && other.onDrop) {
      setCapturing(true);
      // Convert base64 data URL to a File object so onDrop works as expected
      fetch(imageSrc)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], `webcam-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
          other.onDrop?.([file], [], null as any);
          setWebcamOpen(false);
        })
        .finally(() => setCapturing(false));
    }
  }, [other]);

  const renderPreview = hasFile && (
    <Image alt="avatar" src={preview} sx={{ width: 1, height: 1, borderRadius: '50%' }} />
  );

  const renderPlaceholder = (
    <Box
      className="upload-placeholder"
      sx={{
        top: 0,
        gap: 1,
        left: 0,
        width: 1,
        height: 1,
        zIndex: 9,
        display: 'flex',
        borderRadius: '50%',
        position: 'absolute',
        alignItems: 'center',
        color: 'text.disabled',
        flexDirection: 'column',
        justifyContent: 'center',
        bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
        transition: (theme) =>
          theme.transitions.create(['opacity'], { duration: theme.transitions.duration.shorter }),
        '&:hover': { opacity: 0.72 },
        ...(hasError && {
          color: 'error.main',
          bgcolor: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.08),
        }),
        ...(hasFile && {
          zIndex: 9,
          opacity: 0,
          color: 'common.white',
          bgcolor: (theme) => varAlpha(theme.vars.palette.grey['900Channel'], 0.64),
        }),
      }}
    >
      <Iconify icon="solar:camera-add-bold" width={32} />

      <Typography variant="caption" fontSize={10}>
        {title || 'Upload photo'}
      </Typography>
    </Box>
  );

  const renderLoading = capturing && (
    <Box
      sx={{
        top: 0,
        left: 0,
        width: 1,
        height: 1,
        zIndex: 10,
        display: 'flex',
        borderRadius: '50%',
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: (theme) => varAlpha(theme.vars.palette.grey['900Channel'], 0.48),
      }}
    >
      <CircularProgress size={32} sx={{ color: 'common.white' }} />
    </Box>
  );

  const renderContent = (
    <Box
      sx={{
        width: 1,
        height: 1,
        overflow: 'hidden',
        borderRadius: '50%',
        position: 'relative',
      }}
    >
      {renderPreview}
      {renderPlaceholder}
      {renderLoading}
    </Box>
  );

  return (
    <Box display="flex" flexDirection="column" gap={1} alignItems="center">
      <Stack direction="row" alignItems="flex-end" spacing={0.2}>
        <Box sx={{ position: 'relative' }}>
          {hasFile && !disabled && onDelete && (
            <Tooltip title="Remove photo">
              <IconButton
                size="small"
                onClick={onDelete}
                sx={{
                  top: 4,
                  right: 4,
                  zIndex: 10,
                  position: 'absolute',
                  color: 'common.white',
                  bgcolor: (theme) => varAlpha(theme.vars.palette.grey['900Channel'], 0.6),
                  '&:hover': {
                    bgcolor: (theme) => varAlpha(theme.vars.palette.grey['900Channel'], 0.8),
                  },
                }}
              >
                <Iconify icon="mingcute:close-line" width={16} />
              </IconButton>
            </Tooltip>
          )}
          <Box
            {...getRootProps()}
            sx={{
              p: 1,
              m: 'auto',
              width: 135,
              height: 135,
              cursor: 'pointer',
              overflow: 'hidden',
              borderRadius: '50%',
              border: (theme) =>
                `1px dashed ${varAlpha(theme.vars.palette.grey['500Channel'], 0.2)}`,
              ...(isDragActive && { opacity: 0.72 }),
              ...(disabled && { pointerEvents: 'none' }),
              ...(hasError && { borderColor: 'error.main' }),
              ...(hasFile && {
                ...(hasError && {
                  bgcolor: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.08),
                }),
                '&:hover .upload-placeholder': { opacity: 1 },
              }),
              ...sx,
            }}
          >
            <input {...getInputProps()} />

            {renderContent}
          </Box>
        </Box>

        {!disabled && (
          <Tooltip title="Take photo">
            <IconButton
              size="small"
              onClick={() => setWebcamOpen(true)}
              sx={{
                bgcolor: 'background.neutral',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Iconify icon="solar:videocamera-record-bold" width={17} />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      {helperText && (
        <Typography
          pr={3}
          fontSize={10}
          variant="subtitle2"
          color={error ? 'error.main' : 'default.main'}
        >
          {helperText}
        </Typography>
      )}

      {/* Webcam capture dialog */}
      <Dialog open={webcamOpen} onClose={() => setWebcamOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Take a Photo</DialogTitle>
        <DialogContent
          sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, pt: 2 }}
        >
          <Box sx={{ borderRadius: 2, overflow: 'hidden', width: '100%' }}>
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              mirrored
              videoConstraints={{ facingMode: 'user' }}
              style={{ width: '100%', display: 'block' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setWebcamOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCapture}
            disabled={capturing}
            startIcon={
              capturing ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <Iconify icon="solar:camera-bold" />
              )
            }
          >
            {capturing ? 'Capturing...' : 'Capture'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
