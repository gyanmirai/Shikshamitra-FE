import type { ReactNode } from 'react';
import type { TypographyProps } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Stack, IconButton, Typography } from '@mui/material';

export interface FormSectionHeaderProps {
  icon: string;
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
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Stack direction="row" spacing={0.5} alignItems="center" useFlexGap flexWrap="wrap">
          <Typography component="h2" variant="subtitle2" {...titleTypographyProps}>
            {title}
          </Typography>
          {descriptionTooltip && (
            <CustomTooltip title={descriptionTooltip} arrow placement="right">
              <IconButton
                aria-label={
                  descriptionTooltipLabel ??
                  (typeof title === 'string' ? `${title} information` : 'Section information')
                }
                size="small"
                color="info"
                disableRipple
                sx={{
                  p: 0.75,
                  width: 44,
                  height: 44,
                  flexShrink: 0,
                  justifyContent: 'flex-start',
                  // Keep the touch target roomy while the visible help circle stays compact.
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 8,
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                  },
                  '&:hover': { bgcolor: 'transparent' },
                  '&:hover::before, &.Mui-focusVisible::before': { bgcolor: 'action.hover' },
                  '&.Mui-focusVisible::before': {
                    outline: '2px solid',
                    outlineColor: 'info.main',
                    outlineOffset: 2,
                  },
                  '& .MuiSvgIcon-root, & .iconify': { position: 'relative' },
                }}
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
