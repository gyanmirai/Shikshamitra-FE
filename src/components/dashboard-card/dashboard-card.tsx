import React from 'react';
import Link from 'next/link';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Avatar, Typography } from '@mui/material';

interface LabelItem {
  name: string;
  color: 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary' | 'default';
}

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: string;
  color?: string;
  bgColor?: string;
  href?: string;
  labels?: LabelItem[];
  description?: string;
}

export const DashboardCard = ({
  title,
  value,
  icon,
  color = 'primary.main',
  bgColor = 'primary.lighter',
  href = '',
  labels = [],
  description,
}: DashboardCardProps) => {
  const cardContent = (
    <Card
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        boxShadow: 2,
        cursor: href ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 'var(--shadows-8)',
          transform: 'scale(1.02)',
        },
      }}
    >
      {/* Icon/Avatar - Left */}
      <Avatar
        sx={{
          width: 50,
          height: 50,
          bgcolor: bgColor,
          color,
          borderRadius: '16px',
          flexShrink: 0,
        }}
      >
        <Iconify icon={icon} width={24} />
      </Avatar>

      {/* Title and Value - Middle */}
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontWeight: 700 }}>
          {title} / {value}
        </Typography>
        {description && (
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
            {description}
          </Typography>
        )}
        {labels.length > 0 && (
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
            {labels.map((label, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box
                  sx={{
                    width: 3,
                    height: 20,
                    bgcolor: `${label.color}.main`,
                    borderRadius: 0.5,
                  }}
                />
                <Typography sx={{ fontWeight: 300, fontSize: 14 }}>{label.name}</Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Card>
  );

  if (href) {
    return (
      <Box component={Link} href={href} sx={{ textDecoration: 'none', display: 'block' }}>
        {cardContent}
      </Box>
    );
  }

  return cardContent;
};
