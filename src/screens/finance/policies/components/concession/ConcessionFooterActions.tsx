'use client';

/**
 * ConcessionFooterActions
 * Standard bottom action bar with Cancel & LoadingButton Submit
 */

import React from 'react';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Stack, Button, Box, Typography } from '@mui/material';

interface ConcessionFooterActionsProps {
  isSaving: boolean;
  onCancel: () => void;
  isEditing?: boolean;
}

export default function ConcessionFooterActions({
  isSaving,
  onCancel,
  isEditing = false,
}: ConcessionFooterActionsProps) {
  return (
    <Box
      sx={{
        px: { xs: 2, sm: 3 },
        py: 1.75,
        bgcolor: 'background.neutral',
        borderTop: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
        Press <Box component="kbd" sx={{ px: 0.75, py: 0.25, borderRadius: 0.5, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider', fontSize: '0.7rem' }}>Ctrl + Enter</Box> to submit
      </Typography>

      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ ml: 'auto' }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={onCancel}
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          disabled={isSaving}
        >
          Cancel
        </Button>

        <LoadingButton
          variant="contained"
          color="primary"
          loading={isSaving}
          type="submit"
          size="small"
          disabled={isSaving}
          startIcon={
            <Iconify
              icon={isEditing ? GlobalIcons.edit : GlobalIcons.submit}
              width={18}
              height={18}
            />
          }
        >
          {isEditing ? 'Update Policy' : 'Create Policy'}
        </LoadingButton>
      </Stack>
    </Box>
  );
}
