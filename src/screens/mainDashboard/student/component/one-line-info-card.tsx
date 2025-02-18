import React from 'react';

import { Box, Card, Typography, CardContent } from '@mui/material';

import { Iconify } from 'src/components/iconify/iconify';

interface OneLineInfoCardProps {
  title: string;
  text: string;
  Icon?: string;
}

const OneLineInfoCard: React.FC<OneLineInfoCardProps> = ({ title, text, Icon }) => (
  <Card sx={{ height: '100%', p: 2, display: 'flex', flexDirection: 'column' }}>
    <Typography variant="h6" mb={1}>
      {title}
    </Typography>
    <CardContent
      sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center', pt: 3 }}
    >
      <Box>{Icon && <Iconify icon={Icon} width={44} height={44} color="info" />}</Box>
      <Typography variant="h5" fontWeight="bold">
        {text}
      </Typography>
    </CardContent>
  </Card>
);

export default OneLineInfoCard;
