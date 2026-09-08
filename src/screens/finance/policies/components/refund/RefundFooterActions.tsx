'use client';

import React from 'react';
import { alpha } from '@mui/material/styles';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Chip, Stack, Button, Typography } from '@mui/material';

interface RefundFooterActionsProps {
  isSaving: boolean;
  canSubmit: boolean;
  onCancel: () => void;
  submitLabel: string;
}

export default function RefundFooterActions({
  isSaving,
  canSubmit,
  onCancel,
  submitLabel,
}: RefundFooterActionsProps) {
  return (
    <Box
      sx={{
        px: { xs: 2, sm: 3 },
        py: 2,
        bgcolor: (theme) =>
          theme.palette.mode === 'dark'
            ? alpha(theme.palette.background.default, 0.8)
            : alpha(theme.palette.grey[50], 0.9),
        borderTop: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        gap: 2,
      }}
    >
      {/* Keyboard Shortcut Hint */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ display: { xs: 'none', sm: 'flex' } }}>
        <Chip
          size="small"
          label="Ctrl + Enter"
          variant="outlined"
          sx={{ height: 22, fontSize: '0.68rem', fontWeight: 600, color: 'text.secondary' }}
        />
        <Typography variant="caption" color="text.secondary">
          to quick submit
        </Typography>
      </Stack>

      {/* Action Buttons */}
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ ml: 'auto' }}>
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          disabled={isSaving}
          onClick={onCancel}
          startIcon={<Iconify icon={GlobalIcons.cancel} width={18} height={18} />}
        >
          Cancel
        </Button>

        <LoadingButton
          size="small"
          variant="contained"
          color="primary"
          loading={isSaving}
          disabled={isSaving || !canSubmit}
          type="submit"
          startIcon={
            <Iconify
              icon={
                submitLabel.toLowerCase().includes('draft')
                  ? GlobalIcons.submit
                  : GlobalIcons.publish
              }
              width={18}
              height={18}
            />
          }
        >
          {submitLabel}
        </LoadingButton>
      </Stack>
    </Box>
  );
}
