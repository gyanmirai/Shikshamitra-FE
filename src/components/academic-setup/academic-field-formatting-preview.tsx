import type { InstituteFormattingScope } from 'src/redux/InstituteSetup/institute-field-formatting-api';

import { Box, Alert, Stack, TextField, Typography } from '@mui/material';

import { useAcademicFormatPreview } from './use-academic-format-preview';

import type { AcademicTextCase } from './academic-field-formatting-model';

type Props = {
  value: string;
  mode: AcademicTextCase;
  disabled: boolean;
  onChange: (value: string) => void;
  scope?: InstituteFormattingScope;
};

export function AcademicFieldFormattingPreview({ value, mode, disabled, onChange, scope }: Props) {
  const preview = useAcademicFormatPreview(value, mode, false, scope);
  return (
    <Box
      component="section"
      aria-label="Formatting example"
      sx={{ p: 1.5, bgcolor: 'background.neutral', borderRadius: 1 }}
    >
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Try an Example
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="stretch">
        <TextField
          size="small"
          label="You type"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          slotProps={{ htmlInput: { maxLength: 100 } }}
          sx={{ flex: 1 }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary">
            New entry will be saved as
          </Typography>
          <Typography
            component="output"
            aria-label="New entry will be saved as"
            aria-live="polite"
            variant="body2"
            sx={{ display: 'block', fontWeight: 600, overflowWrap: 'anywhere' }}
          >
            {preview.isLoading
              ? 'Calculating preview…'
              : preview.isError
                ? 'Preview unavailable'
                : preview.value || 'Enter an example'}
          </Typography>
        </Box>
      </Stack>
      {preview.isError && (
        <Alert severity="error" sx={{ mt: 1 }}>
          Could not load the preview. Your input has not changed.
        </Alert>
      )}
    </Box>
  );
}
