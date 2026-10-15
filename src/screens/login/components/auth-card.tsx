import type { ReactNode } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';

type Props = { title: string; description: string; children: ReactNode; headingId: string };

export function AuthCard({ title, description, headingId, children }: Props) {
  return (
    <Box
      component="section"
      aria-labelledby={headingId}
      sx={{
        color: 'text.primary',
        width: 1,
        maxWidth: 440,
        px: { xs: 2.5, sm: 3.5 },
        py: 3.5,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2.5,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
      }}
    >
      <Typography
        variant="caption"
        sx={(theme) => ({
          mb: 2,
          color: 'primary.dark',
          fontSize: '0.6875rem',
          fontWeight: 700,
          letterSpacing: '0.16em',
          ...theme.applyStyles('dark', { color: 'primary.light' }),
        })}
      >
        GYANMIRAI SCHOOL PORTAL
      </Typography>
      <Typography
        id={headingId}
        component="h2"
        variant="h3"
        sx={{
          fontSize: { xs: '1.5rem', sm: '1.75rem' },
          letterSpacing: '-0.025em',
          mb: 1,
        }}
      >
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        {description}
      </Typography>
      {children}
      <Stack
        direction="row"
        spacing={0.75}
        alignItems="center"
        justifyContent="center"
        sx={{ mt: 3, color: 'text.secondary' }}
      >
        <Iconify icon="mdi:lock-outline" width={16} />
        <Typography variant="caption">School account access</Typography>
      </Stack>
    </Box>
  );
}
