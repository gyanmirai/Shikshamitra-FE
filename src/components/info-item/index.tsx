import React from 'react';
import Box from '@mui/material/Box';
import { varAlpha } from 'src/theme/styles';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  iconColor?: string;
  iconBgColor?: string | ((theme: any) => string);
}

export const InfoItem = ({
  icon,
  label,
  value,
  iconColor = 'primary.main',
  iconBgColor = (theme) => varAlpha(theme.palette.primary.mainChannel, 0.08),
}: InfoItemProps) => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: 1.5,
        bgcolor: iconBgColor,
        color: iconColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {React.isValidElement(icon)
        ? React.cloneElement(icon as React.ReactElement<any>, { sx: { fontSize: 20 } })
        : icon}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="subtitle2"
        sx={{ color: 'text.secondary', display: 'block', fontWeight: 500 }}
      >
        {label}
      </Typography>
      <Typography
        variant="subtitle2"
        component="div"
        sx={{ fontWeight: 600, color: 'text.primary', wordBreak: 'break-word' }}
      >
        {value || 'N/A'}
      </Typography>
    </Box>
  </Box>
);
