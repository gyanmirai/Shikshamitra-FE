import { Box, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';

export const DetailRow = ({ label, value, icon, color = '' }: any) => (
  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
    {icon && (
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Iconify sx={{ color: { color } }} icon={icon} className="w-full h-full" />
        <Typography variant="subtitle1" className="text-gray-600 mb-1">
          {label}
        </Typography>
      </Box>
    )}
    <Box sx={{ pb: 2, pl: 4.5 }}>
      <Typography variant="body2">{value}</Typography>
    </Box>
  </Box>
);
