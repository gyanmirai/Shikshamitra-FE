import { Box, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';

export const DetailRow = ({ label, value, icon }: any) => (
  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
    {icon && (
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Iconify icon={icon} className="text-gray-500 w-full h-full" />
        <Typography variant="subtitle2" className="text-gray-600 mb-1">
          {label}
        </Typography>
      </Box>
    )}
    <Box sx={{ pb: 2, pl: 4.5 }}>
      <Box>{value}</Box>
    </Box>
  </Box>
);
