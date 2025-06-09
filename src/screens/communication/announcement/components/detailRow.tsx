import { Box, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';

export const DetailRow = ({ label, value, icon, color = '' }: any) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', mb: 1 }}>
    {icon && (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Iconify sx={{ color: { color }, mt: 0.5 }} icon={icon} />
        <Box display="flex" flexDirection="column">
          <Typography variant="subtitle2">{label}</Typography>
          <Typography variant="body2">{value}</Typography>
        </Box>
      </Box>
    )}
  </Box>
);
