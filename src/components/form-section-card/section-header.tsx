import type { ReactNode } from 'react';
import type { TypographyProps } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { Box, Stack, Typography } from '@mui/material';
import { InfoTooltipIcon } from 'src/components/custom-tooltip/info-tooltip-icon';

export interface FormSectionHeaderProps {
  icon?: string;
  iconSize?: number;
  iconContainerSize?: number;
  title: ReactNode;
  titleTypographyProps?: Partial<TypographyProps>;
  description?: string;
  descriptionTooltip?: string;
  descriptionTooltipLabel?: string;
  action?: ReactNode;
  actionFullWidthOnMobile?: boolean;
}

export function FormSectionHeader({
  icon,
  iconSize = 20,
  iconContainerSize = 36,
  title,
  titleTypographyProps,
  description,
  descriptionTooltip,
  descriptionTooltipLabel,
  action,
  actionFullWidthOnMobile = false,
}: FormSectionHeaderProps) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
      {icon && (
        <Box
          sx={{
            width: iconContainerSize,
            height: iconContainerSize,
            borderRadius: 0.75,
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'background.neutral',
            color: 'text.secondary',
            flexShrink: 0,
          }}
        >
          <Iconify icon={icon} width={iconSize} aria-hidden />
        </Box>
      )}
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Stack direction="row" spacing={0.5} alignItems="center" useFlexGap flexWrap="wrap">
          <Typography component="h2" variant="subtitle1" {...titleTypographyProps}>
            {title}
          </Typography>
          {descriptionTooltip && (
            <InfoTooltipIcon
              title={descriptionTooltip}
              label={
                descriptionTooltipLabel ??
                (typeof title === 'string' ? `${title} information` : 'Section information')
              }
            />
          )}
        </Stack>
        {description && (
          <Typography variant="caption" color="text.secondary">
            {description}
          </Typography>
        )}
      </Box>
      {action && (
        <Box
          sx={{
            ml: 'auto',
            flexShrink: 0,
            maxWidth: '100%',
            ...(actionFullWidthOnMobile && { width: { xs: '100%', md: 'auto' } }),
          }}
        >
          {action}
        </Box>
      )}
    </Stack>
  );
}
