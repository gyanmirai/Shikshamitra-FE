import React from 'react';
import { varAlpha } from 'src/theme/styles';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Person, CalendarToday } from '@mui/icons-material';
import { Box, Paper, Stack, Avatar, Divider, Typography } from '@mui/material';

interface RequestorInfoProps {
  charge?: any;
}

const RequestorInfoCard: React.FC<RequestorInfoProps> = ({ charge }) => {
  const requestorName = charge?.requestor?.requestorName || 'N/A';
  const requestorRole = charge?.requestor?.requestorRole || 'N/A';
  const requestedOn = charge?.requestor?.requestedOn
    ? new Date(charge.requestor.requestedOn).toLocaleDateString()
    : 'N/A';

  const initials =
    requestorName !== 'N/A'
      ? requestorName
          .split(' ')
          .map((n: any) => n[0])
          .join('')
          .toUpperCase()
      : 'NA';

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        borderRadius: 2,
        transition: 'box-shadow 0.2s ease',
        '&:hover': { boxShadow: 4 },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
        <Iconify icon="mdi:account-details-outline" width={18} sx={{ color: 'primary.main' }} />
        <Typography variant="subtitle2" fontWeight={700}>
          Requestor Details
        </Typography>
      </Stack>
      <Divider sx={{ mb: 2 }} />

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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
                <Label variant="soft" color="success">
                  {requestorRole}
                </Label>
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
      </Box>
    </Paper>
  );
};

export default RequestorInfoCard;
