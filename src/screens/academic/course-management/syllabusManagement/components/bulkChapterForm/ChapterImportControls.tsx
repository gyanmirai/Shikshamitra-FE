'use client';

import type { ChangeEvent } from 'react';

import { LoadingButton } from '@mui/lab';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Button, Typography } from '@mui/material';

import { CHAPTER_IMPORT_ACCEPT, MAX_CHAPTER_IMPORT_ROWS } from './chapterImport';

type Props = {
  isImporting: boolean;
  isDownloading: boolean;
  errors: string[];
  showErrors: boolean;
  onDownload: () => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export default function ChapterImportControls({
  isImporting,
  isDownloading,
  errors,
  showErrors,
  onDownload,
  onFileChange,
}: Props) {
  return (
    <>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        gap={1.5}
      >
        <Stack direction="row" alignItems="flex-start" gap={1.25}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1,
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'action.hover',
              color: 'text.secondary',
              flexShrink: 0,
            }}
          >
            <Iconify icon="mdi:file-table-outline" width={20} />
          </Box>
          <Box>
            <Typography variant="subtitle2">Import chapters</Typography>
            <Typography variant="body2" color="text.secondary">
              Upload an Excel or CSV file to add multiple chapters at once.
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" gap={1} flexWrap="wrap">
          <LoadingButton
            size="small"
            color="inherit"
            variant="outlined"
            loading={isDownloading}
            onClick={onDownload}
            startIcon={<Iconify icon="mdi:download-outline" width={18} />}
          >
            Download template
          </LoadingButton>
          <Button
            component="label"
            size="small"
            variant="contained"
            disabled={isImporting}
            startIcon={isImporting ? undefined : <Iconify icon="mdi:tray-arrow-up" width={18} />}
          >
            {isImporting ? 'Reading file…' : 'Upload file'}
            <input hidden type="file" accept={CHAPTER_IMPORT_ACCEPT} onChange={onFileChange} />
          </Button>
        </Stack>
      </Stack>

      <Box sx={{ mt: 1.5, pt: 1.5, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary">
          Required columns: Chapter Number, Chapter Name, Start Date and End Date. Use YYYY-MM-DD
          for dates. Maximum {MAX_CHAPTER_IMPORT_ROWS} rows and 5 MB.
        </Typography>

        {showErrors && (
          <Box
            role="alert"
            sx={{ mt: 1.25, p: 1.25, border: 1, borderColor: 'error.main', borderRadius: 1 }}
          >
            <Typography variant="body2" fontWeight={600} color="error.main">
              The file was not imported. Fix these items and upload it again:
            </Typography>
            <Box component="ul" sx={{ my: 0.75, pl: 2.5 }}>
              {errors.slice(0, 5).map((error) => (
                <Typography component="li" variant="caption" key={error}>
                  {error}
                </Typography>
              ))}
            </Box>
            {errors.length > 5 && (
              <Typography variant="caption" color="text.secondary">
                And {errors.length - 5} more issue{errors.length - 5 === 1 ? '' : 's'}.
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </>
  );
}
