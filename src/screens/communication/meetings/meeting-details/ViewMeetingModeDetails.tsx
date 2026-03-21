import React from 'react';
import { Icon } from '@iconify/react';
import { Box, Grid, Card, Typography } from '@mui/material';

import type { IMeeting } from '../type';

const ViewMeetingMode = ({ meeting }: { meeting: IMeeting | null }) => {
  if (!meeting) return null;

  return (
    <Card sx={{ p: 2, mb: 2, boxShadow: 3 }}>
      {/* Heading */}
      <Typography variant="h6" color="primary.main" sx={{ mb: 2 }}>
        Meeting Mode
      </Typography>

      <Grid container spacing={3}>
        {/* Mode */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Icon icon="mdi:toggle-switch" width={18} />
            <Typography variant="body2" color="text.secondary">
              Mode
            </Typography>
          </Box>
          <Typography variant="body1" fontWeight="600">
            {meeting.mode || '—'}
          </Typography>
        </Grid>

        {/* Venue */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Icon icon={meeting.mode === 'online' ? 'mdi:link' : 'mdi:map-marker'} width={18} />
            <Typography variant="body2" color="text.secondary">
              {meeting.mode === 'online' ? 'Meeting Link' : 'Venue'}
            </Typography>
          </Box>
          <Typography variant="body1" fontWeight="600">
            {meeting.mode === 'online' ? meeting.link || '—' : meeting.classRoom || '—'}
          </Typography>
        </Grid>
      </Grid>
    </Card>
  );
};

export default ViewMeetingMode;
