'use client';

import type { ChangeEvent } from 'react';

import { useId } from 'react';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Stack, Button, FormLabel, Typography } from '@mui/material';

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
  const fileLabelId = useId();
  const fileHelpId = useId();
  const fileErrorId = useId();
  return (
    <>
      <ShakingTextField error={showErrors}>
        <Stack spacing={1}>
          <FormLabel id={fileLabelId} component="span" required error={showErrors}>
            Chapter file
          </FormLabel>
          <Stack direction="row" gap={1} flexWrap="wrap">
            <LoadingButton
              type="button"
              size="small"
              color="inherit"
              variant="outlined"
              loading={isDownloading}
              onClick={onDownload}
              startIcon={<Iconify icon={GlobalIcons.download} width={18} />}
            >
              Download template
            </LoadingButton>
            <Button
              component="label"
              size="small"
              variant="contained"
              disabled={isImporting}
              aria-label="Upload chapter file (required)"
              aria-describedby={fileHelpId}
              startIcon={isImporting ? undefined : <Iconify icon={GlobalIcons.upload} width={18} />}
            >
              {isImporting ? 'Reading file…' : 'Upload file'}
              <input
                hidden
                type="file"
                accept={CHAPTER_IMPORT_ACCEPT}
                onChange={onFileChange}
                aria-labelledby={fileLabelId}
                aria-required="true"
                aria-invalid={showErrors}
                aria-describedby={`${fileHelpId}${showErrors ? ` ${fileErrorId}` : ''}`}
              />
            </Button>
          </Stack>
        </Stack>
      </ShakingTextField>

      <Box>
        <Typography id={fileHelpId} variant="caption" color="text.secondary">
          Required columns: Chapter Number, Chapter Name, Start Date and End Date. Use YYYY-MM-DD
          for dates. Maximum {MAX_CHAPTER_IMPORT_ROWS} rows and 5 MB.
        </Typography>

        {showErrors && (
          <Box
            id={fileErrorId}
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
