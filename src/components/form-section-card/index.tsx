import type { ReactNode } from 'react';

import { Iconify } from 'src/components/iconify';
import { Box, Card, Stack, Typography } from '@mui/material';

interface FormSectionCardProps {
  icon: string;
  title: string;
  description: string;
  children: ReactNode;
}

export function FormSectionCard({ icon, title, description, children }: FormSectionCardProps) {
  return (
    <Card component="section" variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2 }}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} alignItems="flex-start">
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
            <Iconify icon={icon} width={20} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography component="h2" variant="subtitle2">
              {title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {description}
            </Typography>
          </Box>
        </Stack>
        {children}
      </Stack>
    </Card>
  );
}
