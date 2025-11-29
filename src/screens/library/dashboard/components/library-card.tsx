import React from 'react';
import Link from 'next/link';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Avatar, Typography } from '@mui/material';

interface LabelItem {
  name: string;
  color: 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary' | 'default';
}

interface LibraryCardProps {
  title: string;
  value: string | number;
  icon: string;
  color?: string;
  bgColor?: string;
  href?: string;
  labels?: LabelItem[];
}

export const LibraryCard = ({
  title,
  value,
  icon,
  color = 'primary.main',
  bgColor = 'primary.lighter',
  href = '',
  labels = [],
}: LibraryCardProps) => {
  const cardContent = (
    <Card
      sx={{
        p: 3,
        height: '150px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 2,
        cursor: href ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 'var(--shadows-8)',
          transform: 'scale(1.02)',
        },
      }}
    >
      <Box>
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1, fontWeight: 'bold' }}>
          {title}
        </Typography>
        <Typography variant="h3" sx={{ mb: 1, fontWeight: 'bold' }}>
          {value}
        </Typography>
        {labels.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {labels.map((label, index) => (
              <Label key={index} color={label.color}>
                {label.name}
              </Label>
            ))}
          </Box>
        )}
      </Box>

      <Avatar
        sx={{
          width: 56,
          height: 56,
          bgcolor: bgColor,
          color,
        }}
      >
        <Iconify icon={icon} width={32} />
      </Avatar>
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
