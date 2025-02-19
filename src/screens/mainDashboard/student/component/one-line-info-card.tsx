import React from 'react';

import { Box, Card, Typography, CardContent } from '@mui/material';

import { Iconify } from 'src/components/iconify/iconify';

interface InfoItem {
  title: string;
  text: string;
  icon?: string;
  color: string;
}

interface OneLineInfoCardProps {
  items: InfoItem[];
}

const OneLineInfoCard: React.FC<OneLineInfoCardProps> = ({ items }) => (
  <Card sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column' }}>
    <CardContent sx={{ display: 'flex', flexDirection: 'row', gap: 4, alignItems: 'center' }}>
      {items.map(({ title, text, icon, color }, index) => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {icon && <Iconify icon={icon} width={44} height={44} color={color} />}
          <Box>
            <Typography variant="h6">{title}</Typography>
            <Typography variant="h5" fontWeight="bold">
              {text}
            </Typography>
          </Box>
        </Box>
      ))}
    </CardContent>
  </Card>
);

export default OneLineInfoCard;
