'use client';

import { Box, LinearProgress } from '@mui/material';

export default function HRWorkspaceLoading({ heading = 'HR Workspace' }: { heading?: string }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <LinearProgress aria-label={`Loading ${heading}`} sx={{ mx: 1 }} />
    </Box>
  );
}
