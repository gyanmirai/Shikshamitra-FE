'use client';

import type { ReactNode } from 'react';

import { Box, Stack, Typography, IconButton } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';

export default function FinancePolicyDrawerHeader({
  title,
  description,
  descriptionDisplay = 'inline',
  icon,
  badges,
  onClose,
  disabled = false,
  titleId,
}: {
  title: string;
  description: ReactNode;
  descriptionDisplay?: 'inline' | 'tooltip';
  icon?: string;
  badges?: ReactNode;
  onClose: () => void;
  disabled?: boolean;
  titleId: string;
}) {
  return (
    <Stack
      direction="row"
      alignItems="flex-start"
      spacing={1.5}
      sx={{ px: { xs: 2, sm: 3 }, py: 2, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}
    >
      {icon && (
        <Box
          sx={{
            display: 'flex',
            p: 1,
            borderRadius: 1,
            bgcolor: 'background.neutral',
            color: 'text.secondary',
          }}
        >
          <Iconify icon={icon} width={22} />
        </Box>
      )}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Typography id={titleId} variant="h6" component="h2" sx={{ overflowWrap: 'anywhere' }}>
            {title}
          </Typography>
          {badges}
          {descriptionDisplay === 'tooltip' && (
            <CustomTooltip arrow placement="bottom" title={description}>
              <IconButton size="small" aria-label={`${title} information`} disabled={disabled}>
                <Iconify icon="lucide:info" width={16} sx={{ color: 'info.main' }} aria-hidden />
              </IconButton>
            </CustomTooltip>
          )}
        </Stack>
        {descriptionDisplay === 'inline' && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5, overflowWrap: 'anywhere' }}
          >
            {description}
          </Typography>
        )}
      </Box>
      <IconButton size="small" aria-label={`Close ${title}`} disabled={disabled} onClick={onClose}>
        <Iconify icon="mingcute:close-line" width={20} />
      </IconButton>
    </Stack>
  );
}
