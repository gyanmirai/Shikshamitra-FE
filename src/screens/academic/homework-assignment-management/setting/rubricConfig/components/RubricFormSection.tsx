import type { ReactNode } from 'react';

import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Stack, Paper, IconButton, Typography } from '@mui/material';

export const RubricFormSection = ({
  title,
  caption,
  icon,
  children,
  action,
}: {
  title: string;
  caption?: string;
  icon: string;
  children: ReactNode;
  action?: ReactNode;
}) => (
  <Paper
    variant="outlined"
    sx={{
      p: { xs: 1.5, md: 2 },
      borderRadius: 1.5,
      bgcolor: 'background.paper',
      borderColor: 'divider',
      boxShadow: 'var(--shadows-2)',
    }}
  >
    <Stack spacing={1.5}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        gap={1}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box
            sx={{
              width: 24,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary',
            }}
          >
            <Iconify icon={icon} width={18} height={18} />
          </Box>
          <Stack direction="row" spacing={0.25} alignItems="center">
            <Typography variant="subtitle2" fontWeight={700}>
              {title}
            </Typography>
            {caption ? (
              <CustomTooltip title={caption} placement="right" arrow>
                <IconButton
                  size="small"
                  aria-label={`About ${title}`}
                  sx={{ color: 'info.main', '&:hover': { bgcolor: 'transparent' } }}
                >
                  <Iconify icon="mdi:information-outline" width={17} />
                </IconButton>
              </CustomTooltip>
            ) : null}
          </Stack>
        </Stack>
        {action}
      </Stack>
      {children}
    </Stack>
  </Paper>
);
