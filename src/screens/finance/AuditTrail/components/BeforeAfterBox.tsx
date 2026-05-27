'use client';

import { Box, Typography } from '@mui/material';
import { Iconify } from 'src/components/iconify';

interface BeforeAfterBoxProps {
  label: string;
  data: Record<string, any> | undefined;
  variant: 'before' | 'after';
}

const BeforeAfterBox = ({ label, data, variant }: BeforeAfterBoxProps) => {
  const isBefore = variant === 'before';

  const labelColor = isBefore ? '#EF4444' : '#22C55E';
  const iconColor = isBefore ? '#EF4444' : '#22C55E';
  const icon = isBefore ? 'mdi:arrow-left-circle-outline' : 'mdi:arrow-right-circle-outline';

  return (
    <Box
      sx={{
        flex: 1,
        borderRadius: 2,
        p: 2,
        bgcolor: 'background.paper',
        border: '1.5px solid',
        borderColor: isBefore ? 'error.light' : 'success.light',
        minWidth: 0,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          bgcolor: labelColor,
          borderRadius: '10px 10px 0 0',
        },
      }}
    >
      {/* Label */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
        <Iconify icon={icon} width={16} sx={{ color: iconColor, flexShrink: 0 }} />
        <Typography
          variant="caption"
          fontWeight={800}
          sx={{
            color: labelColor,
            textTransform: 'uppercase',
            letterSpacing: 1.2,
            fontSize: 10,
          }}
        >
          {label}
        </Typography>
      </Box>

      {/* Data rows */}
      {data && Object.keys(data).length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {Object.entries(data).map(([key, value]) => (
            <Box
              key={key}
              sx={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 0.75,
                borderBottom: '1px dashed',
                borderColor: isBefore ? 'error.light' : 'success.light',
                pb: 0.5,
                '&:last-child': { borderBottom: 'none', pb: 0 },
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: isBefore ? 'error.dark' : 'success.dark',
                  textTransform: 'capitalize',
                  fontWeight: 500,
                  flexShrink: 0,
                  fontSize: 11,
                }}
              >
                {key.replace(/_/g, ' ')}:
              </Typography>
              <Typography
                variant="caption"
                fontWeight={700}
                sx={{
                  color: isBefore ? 'error.darker' : 'success.darker',
                  fontSize: 12,
                  wordBreak: 'break-word',
                }}
              >
                {String(value ?? '—')}
              </Typography>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography variant="caption" sx={{ color: isBefore ? 'error.main' : 'success.main' }}>
          No data
        </Typography>
      )}
    </Box>
  );
};

export default BeforeAfterBox;
