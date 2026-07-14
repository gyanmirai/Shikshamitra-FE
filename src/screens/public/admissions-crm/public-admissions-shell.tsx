import type { ReactNode } from 'react';

import { Box, Stack, Typography } from '@mui/material';

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
};

export function PublicAdmissionsShell({
  eyebrow = 'School Admissions',
  title,
  description,
  children,
}: Props) {
  return (
    <Box
      sx={{
        minHeight: '100dvh',
        bgcolor: 'background.neutral',
        color: 'text.primary',
        px: { xs: 1.5, sm: 2.5 },
        pt: { xs: 'max(20px, env(safe-area-inset-top))', sm: 4 },
        pb: { xs: 'max(20px, env(safe-area-inset-bottom))', sm: 4 },
      }}
    >
      <Stack spacing={2.5} sx={{ width: '100%', maxWidth: 780, mx: 'auto' }}>
        <Box component="header">
          <Typography variant="overline" color="primary.darker">
            {eyebrow}
          </Typography>
          <Typography variant="h4" component="h1" sx={{ textWrap: 'balance' }}>
            {title}
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, textWrap: 'pretty' }}>
              {description}
            </Typography>
          )}
        </Box>
        <Box component="main" sx={{ minWidth: 0 }}>
          {children}
        </Box>
        <Typography component="footer" variant="caption" color="text.secondary" textAlign="center">
          Your information is protected and used only for the school admission process.
        </Typography>
      </Stack>
    </Box>
  );
}
