'use client';

import type { ParentRegistrationFile } from 'src/redux/student/admissions/admission-parent-registration-types';

import { useState, useEffect } from 'react';
import { fData } from 'src/utils/format-number';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { FileThumbnail } from 'src/components/file-thumbnail';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Card,
  Stack,
  Button,
  Skeleton,
  Typography,
  IconButton,
  DialogActions,
  CircularProgress,
} from '@mui/material';

import type { ParentRegistrationTransport } from './parent-registration-transport';

const touchTarget = { '@media (pointer: coarse)': { minWidth: 44, minHeight: 44 } };

export function ParentRegistrationAttachment({
  file,
  transport,
}: {
  file: ParentRegistrationFile;
  transport: ParentRegistrationTransport;
}) {
  const [preview, setPreview] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const download = async () => {
    setDownloading(true);
    setError('');
    try {
      const blob = await transport.file(file.id);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = file.fileName.split(/[\\/]/).at(-1) || 'document';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError('Could not download this file. Try again.');
    } finally {
      setDownloading(false);
    }
  };
  return (
    <Stack spacing={1}>
      <Card variant="outlined" sx={{ p: 1, minWidth: 0 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <FileThumbnail file={file.fileName} sx={{ width: 25, height: 25 }} aria-hidden />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
              {file.fileName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {[
                Number.isFinite(file.size) ? fData(file.size) : null,
                `Version ${file.versionNumber}`,
              ]
                .filter(Boolean)
                .join(' · ')}
            </Typography>
          </Box>
          <Stack direction="row" sx={{ flexShrink: 0 }}>
            <CustomTooltip title="Preview">
              <span>
                <IconButton
                  size="small"
                  disabled={!file.canDownload}
                  onClick={() => setPreview(true)}
                  aria-label={`Preview ${file.fileName}`}
                  sx={touchTarget}
                >
                  <Iconify icon="mdi:eye-outline" width={18} aria-hidden />
                </IconButton>
              </span>
            </CustomTooltip>
            <CustomTooltip title={downloading ? 'Downloading…' : 'Download'}>
              <span>
                <IconButton
                  size="small"
                  disabled={!file.canDownload || downloading}
                  onClick={download}
                  aria-label={`Download ${file.fileName}`}
                  aria-busy={downloading || undefined}
                  sx={touchTarget}
                >
                  {downloading ? (
                    <CircularProgress size={16} aria-hidden />
                  ) : (
                    <Iconify icon="mdi:download" width={18} aria-hidden />
                  )}
                </IconButton>
              </span>
            </CustomTooltip>
          </Stack>
        </Stack>
      </Card>
      {error && (
        <Typography role="alert" color="error" variant="body2">
          {error}
        </Typography>
      )}
      {preview && (
        <ParentRegistrationPreview
          file={file}
          transport={transport}
          onClose={() => setPreview(false)}
        />
      )}
    </Stack>
  );
}

function ParentRegistrationPreview({
  file,
  transport,
  onClose,
}: {
  file: ParentRegistrationFile;
  transport: ParentRegistrationTransport;
  onClose: () => void;
}) {
  const [state, setState] = useState<{ url?: string; type?: string; error?: string }>({});
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let disposed = false;
    let url = '';
    setState({});
    transport
      .file(file.id)
      .then((blob) => {
        if (disposed) return;
        const type = (blob.type || file.contentType).split(';')[0];
        if (!['image/jpeg', 'image/png', 'application/pdf'].includes(type)) {
          setState({
            error: 'Preview is unavailable for this file format. Download the document to view it.',
          });
          return;
        }
        url = URL.createObjectURL(new Blob([blob], { type }));
        setState({ url, type });
      })
      .catch(() => {
        if (!disposed) setState({ error: 'Could not load this document. Try again.' });
      });
    return () => {
      disposed = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [transport, file.id, file.contentType, attempt]);
  return (
    <CustomDialog
      open
      title="Document Preview"
      titleInfo={file.fileName}
      handleClose={onClose}
      hasForm={false}
      guardUnsavedChanges={false}
      maxWidth="lg"
      paperProps={{ sx: { height: '85dvh' } }}
    >
      <DialogScrollContent sx={{ flex: 1, minHeight: 0 }}>
        {!state.url && !state.error && (
          <Skeleton aria-label="Loading document preview" variant="rounded" height={300} />
        )}
        {state.error && (
          <Stack spacing={1}>
            <Typography role="alert">{state.error}</Typography>
            <Button onClick={() => setAttempt((value) => value + 1)}>Try again</Button>
          </Stack>
        )}
        {state.url &&
          (state.type === 'application/pdf' ? (
            <Box
              component="iframe"
              src={state.url}
              title={file.fileName}
              sx={{ width: 1, height: '65dvh', border: 0 }}
            />
          ) : (
            <Box
              component="img"
              src={state.url}
              alt={file.fileName}
              sx={{
                display: 'block',
                maxWidth: 1,
                maxHeight: '65dvh',
                mx: 'auto',
                objectFit: 'contain',
              }}
            />
          ))}
      </DialogScrollContent>
      <DialogActions sx={{ p: 2 }}>
        <Button size="small" variant="outlined" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
