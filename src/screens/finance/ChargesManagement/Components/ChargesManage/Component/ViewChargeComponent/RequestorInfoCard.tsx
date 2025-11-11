import React from 'react';
import { Box, Card, Chip, Avatar, Typography, CardContent } from '@mui/material';

interface RequestorInfoProps {
  charge?: any;
}

const RequestorInfoCard: React.FC<RequestorInfoProps> = ({ charge }) => {
  const requestorName = charge?.requestorName || 'Rina Patel';
  const department = charge?.department || 'Library';
  const requestedOn = charge?.requestedOn || '10 Feb 2025';
  const initials = requestorName
    .split(' ')
    .map((n: any) => n[0])
    .join('')
    .toUpperCase();

  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: 'var(--shadows-8)',
        height: '100%',
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={600} color="text.primary" gutterBottom>
          Requestor
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: '#E0E0E0',
              color: 'text.primary',
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            {initials}
          </Avatar>

          <Box>
            <Typography variant="body1" fontWeight={600}>
              {requestorName}
            </Typography>
            <Chip
              label={department}
              size="small"
              sx={{
                mt: 0.5,
                bgcolor: 'rgba(0,167,111,0.08)',
                color: '#00A76F',
                fontWeight: 500,
                borderRadius: '6px',
              }}
            />
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary">
          Requested On
        </Typography>
        <Typography variant="body1" fontWeight={600}>
          {requestedOn}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default RequestorInfoCard;
