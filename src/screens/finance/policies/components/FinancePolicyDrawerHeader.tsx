'use client';

import type { ReactNode } from 'react';

import { Iconify } from 'src/components/iconify';
import { Box, Stack, Typography, IconButton } from '@mui/material';
import { InfoTooltipIcon } from 'src/components/custom-tooltip/info-tooltip-icon';

export default function FinancePolicyDrawerHeader({
  title,
  description,
  descriptionDisplay = 'inline',
  helpText,
  badges,
  onClose,
  disabled = false,
  titleId,
}: {
  title: string;
  description?: ReactNode;
  descriptionDisplay?: 'inline' | 'tooltip';
  helpText?: ReactNode;
  badges?: ReactNode;
  onClose: () => void;
  disabled?: boolean;
  titleId: string;
}) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.5}
      sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Typography id={titleId} variant="h6" component="h2" sx={{ overflowWrap: 'anywhere' }}>
            {title}
          </Typography>
          {(descriptionDisplay === 'tooltip' || helpText) && (
            <InfoTooltipIcon
              title={helpText || description}
              label={`${title} information`}
              disabled={disabled}
            />
          )}
        </Stack>
      </Box>
      {badges && (
        <Stack
          direction="row"
          spacing={0.75}
          alignItems="center"
          useFlexGap
          flexWrap="wrap"
          sx={{ justifyContent: 'flex-end', maxWidth: '40%' }}
        >
          {badges}
        </Stack>
      )}
      <IconButton size="small" aria-label={`Close ${title}`} disabled={disabled} onClick={onClose}>
        <Iconify icon="mingcute:close-line" width={20} />
      </IconButton>
    </Stack>
  );
}
