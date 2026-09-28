import type { ReactNode } from 'react';

import { Box, Typography } from '@mui/material';
import CustomTooltip from 'src/components/custom-tooltip';

type Props = {
  text: string | number;
  secondary?: string;
  tooltip?: ReactNode;
  strong?: boolean;
};

export function AdmissionTableText({ text, secondary, tooltip, strong = false }: Props) {
  const fullText = tooltip ?? [text, secondary].filter(Boolean).join(' · ');

  return (
    <CustomTooltip title={fullText} arrow>
      <Box component="span" tabIndex={0} sx={{ display: 'block', minWidth: 0, maxWidth: '100%' }}>
        <Typography
          component="span"
          variant="body2"
          fontWeight={strong ? 600 : undefined}
          sx={{
            display: '-webkit-box',
            overflow: 'hidden',
            overflowWrap: 'anywhere',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: secondary ? 1 : 2,
          }}
        >
          {text}
        </Typography>
        {secondary && (
          <Typography component="span" variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
            {secondary}
          </Typography>
        )}
      </Box>
    </CustomTooltip>
  );
}
