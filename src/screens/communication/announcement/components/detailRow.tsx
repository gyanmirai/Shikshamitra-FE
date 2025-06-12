import { Box, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';

export const DetailRow = ({ label, value, icon, color = '' }: any) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', mb: 1 }}>
    {icon && (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Iconify
            icon={icon}
            sx={{
              color,
              mt: 0.1,
              // fontSize: '1.2rem',
            }}
          />
          <Typography variant="subtitle2">{label}</Typography>
        </Box>

        <Typography variant="body2" sx={{ ml: 3.5 }}>
          {value}
        </Typography>
      </Box>
    )}
  </Box>
);
