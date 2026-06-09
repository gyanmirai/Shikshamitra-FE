import React from 'react';
import dayjs from 'dayjs';
import { Iconify } from 'src/components/iconify';
import { InfoItem } from 'src/components/info-item';
import { Person, CalendarToday } from '@mui/icons-material';
import { Box, Grid, Paper, Stack, Divider, Typography } from '@mui/material';

interface RequestorInfoProps {
  charge?: any;
}

const RequestorInfoCard: React.FC<RequestorInfoProps> = ({ charge }) => {
  const requestorName = charge?.requestor?.requestorName || 'N/A';
  const requestorRole = charge?.requestor?.requestorRole || 'N/A';
  const requestedOn = charge?.requestor?.requestedOn
    ? dayjs(charge.requestor.requestedOn).format('DD-MM-YYYY')
    : 'N/A';

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
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoItem icon={<Person />} label="Name" value={requestorName} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoItem
              icon={<Iconify icon="solar:briefcase-bold-duotone" />}
              label="Role"
              value={requestorRole}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <InfoItem icon={<CalendarToday />} label="Requested On" value={requestedOn} />
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default RequestorInfoCard;
