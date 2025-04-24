import React from 'react';

import { Box, Card, Chip, Typography, CardContent } from '@mui/material';

import type { DashboardCardProps } from './dashboard-card-interface';

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  mainText,
  mainIcon,
  subtitleText,
  subtitleIcon,
  labelData = [],
  titleColor = 'primary.common.black',
  mainTextColor = 'primary.common.black',
  subtitleTextColor = 'primary.common.black',
  mainIconColor = 'primary.common.black',
  subtitleIconColor = 'primary.common.black',
  backgroundColor = 'primary.common.white',
}) => (
  <Card
    sx={{
      backgroundColor,
      borderRadius: '12px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: 'var(--shadows-8)',
        scale: 1.03,
      },
    }}
  >
    <CardContent>
      {/* Title */}
      <Typography variant="h6" fontWeight={600} mb={2} color={titleColor}>
        {title}
      </Typography>

      {/* Main Row */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="h5" fontWeight={700} color={mainTextColor}>
          {mainText}
        </Typography>
        {mainIcon && <Box color={mainIconColor}>{mainIcon}</Box>}
      </Box>

      {/* Subtitle Row */}
      {!labelData.length && subtitleText && (
        <Box display="flex" alignItems="center" gap={1}>
          {subtitleIcon && <Box color={subtitleIconColor}>{subtitleIcon}</Box>}
          <Typography variant="body2" color={subtitleTextColor}>
            {subtitleText}
          </Typography>
        </Box>
      )}

      {/* Label Chips */}
      {labelData.length > 0 && (
        <Box display="flex" gap={1} flexWrap="wrap">
          {labelData.map((item, index) => (
            <Chip
              key={index}
              label={`${item.label}: ${item.value}`}
              sx={{
                backgroundColor: item.bgColor || '#f0f0f0',
                color: '#000',
                fontWeight: 500,
              }}
            />
          ))}
        </Box>
      )}
    </CardContent>
  </Card>
);

export default DashboardCard;
