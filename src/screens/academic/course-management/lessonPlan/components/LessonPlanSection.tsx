import type { ReactNode } from 'react';

import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import { Box, Paper, Stack, Typography } from '@mui/material';

type Props = {
  title: string;
  caption?: string;
  icon: string;
  children: ReactNode;
  action?: ReactNode;
};

export function LessonPlanSection({ title, caption, icon, children, action }: Props) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 1.5, md: 2 },
        borderRadius: 1.5,
        bgcolor: 'background.paper',
        borderColor: 'divider',
        boxShadow: (theme) =>
          `0 10px 30px -24px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.4)}`,
      }}
    >
      <Stack spacing={1.5}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          gap={1}
        >
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                flexShrink: 0,
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
            <Stack spacing={0.2} sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                {title}
              </Typography>
              {caption && (
                <Typography variant="caption" color="text.secondary">
                  {caption}
                </Typography>
              )}
            </Stack>
          </Stack>
          {action}
        </Stack>
        {children}
      </Stack>
    </Paper>
  );
}
