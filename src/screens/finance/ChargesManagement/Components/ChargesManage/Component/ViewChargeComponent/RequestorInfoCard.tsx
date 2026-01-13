import React from 'react';
import { varAlpha } from 'src/theme/styles';
import { Person, CalendarToday } from '@mui/icons-material';
import { Box, Card, Chip, Stack, Avatar, Divider, Typography, CardContent } from '@mui/material';

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
      variant="outlined"
      sx={{
        borderRadius: 2,
        boxShadow: (theme) =>
          `0 0 2px 0 ${varAlpha(theme.palette.grey['500Channel'], 0.2)}, 0 12px 24px -4px ${varAlpha(theme.palette.grey['500Channel'], 0.12)}`,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: '1px dashed',
          borderColor: 'divider',
          bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.02),
        }}
      >
        <Typography
          variant="subtitle1"
          fontWeight={700}
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          Requestor Details
        </Typography>
      </Box>

      <CardContent
        sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
      >
        <Stack spacing={3}>
          {/* Requestor Profile Section */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.08),
                color: 'primary.main',
                fontWeight: 700,
                fontSize: 20,
                border: '1px solid',
                borderColor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.2),
              }}
            >
              {initials}
            </Avatar>

            <Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
                {requestorName}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Chip
                  label={department}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: '0.75rem',
                    bgcolor: (theme) => varAlpha(theme.palette.secondary.mainChannel, 0.08),
                    color: 'secondary.dark',
                    fontWeight: 600,
                    borderRadius: '6px',
                  }}
                />
              </Box>
            </Box>
          </Box>

          <Divider sx={{ borderStyle: 'dashed' }} />

          {/* Date Section */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: (theme) => varAlpha(theme.palette.grey['500Channel'], 0.08),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.secondary',
                flexShrink: 0,
              }}
            >
              <CalendarToday sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight="bold"
                sx={{ display: 'block', mb: 0.5, letterSpacing: 0.5 }}
              >
                REQUESTED ON
              </Typography>
              <Typography variant="body2" fontWeight={600} color="text.primary">
                {requestedOn}
              </Typography>
            </Box>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default RequestorInfoCard;
