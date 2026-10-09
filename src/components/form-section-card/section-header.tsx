import type { ReactNode } from 'react';
import type { TypographyProps } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Stack, IconButton, Typography } from '@mui/material';

export interface FormSectionHeaderProps {
  icon: string;
  iconSize?: number;
  title: ReactNode;
  titleTypographyProps?: Partial<TypographyProps>;
  description?: string;
  descriptionTooltip?: string;
  action?: ReactNode;
  actionFullWidthOnMobile?: boolean;
}

export function FormSectionHeader({
  icon,
  iconSize = 20,
  title,
  titleTypographyProps,
  description,
  descriptionTooltip,
  action,
  actionFullWidthOnMobile = false,
}: FormSectionHeaderProps) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1,
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'background.neutral',
          color: 'text.secondary',
          flexShrink: 0,
        }}
      >
        <Iconify icon={icon} width={iconSize} aria-hidden />
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
          <Typography component="h2" variant="subtitle2" {...titleTypographyProps}>
            {title}
          </Typography>
          {descriptionTooltip && (
            <CustomTooltip title={descriptionTooltip} arrow placement="right">
              <IconButton
                aria-label={
                  typeof title === 'string' ? `${title} information` : 'Section information'
                }
                size="small"
                color="info"
                sx={{ p: 0.25, minWidth: 44, minHeight: 44 }}
              >
                <Iconify icon="lucide:info" width={16} aria-hidden />
              </IconButton>
            </CustomTooltip>
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
