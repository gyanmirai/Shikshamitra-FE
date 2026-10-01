import type { ReactNode } from 'react';

import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Paper, Typography } from '@mui/material';

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
              width: 32,
              height: 32,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'primary.main',
              bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
            }}
          >
            <Iconify icon={icon} width={18} height={18} />
          </Box>
          <Stack spacing={0.2}>
            <Typography variant="subtitle2" fontWeight={700}>
              {title}
            </Typography>
            {caption ? (
              <Typography variant="caption" color="text.secondary">
                {caption}
              </Typography>
            ) : null}
          </Stack>
        </Stack>
        {action}
      </Stack>
      {children}
    </Stack>
  </Paper>
);
