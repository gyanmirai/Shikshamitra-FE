import React from 'react';
import { Visibility } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { Box, Grid, Card, Button, Typography } from '@mui/material';

import type { IMeeting } from '../type';

const ViewMeetingDescription = ({ meeting }: { meeting: IMeeting | null }) => {
  if (!meeting) return null;

  return (
    <Card sx={{ p: 2, mb: 2, boxShadow: 3 }}>
      {/* Description */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Description
        </Typography>
        <Typography variant="body1">{meeting.description}</Typography>
      </Box>

      <Grid container spacing={2}>
        {/* Target Audience */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify icon="mdi:account-group" />
            <Typography variant="body2" color="text.secondary">
              Target Audience
            </Typography>
          </Box>
          <Typography variant="body1" fontWeight="600">
            {meeting.audience?.length ? meeting.audience.join(', ') : '—'}
          </Typography>
        </Grid>

        {/* Class */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify icon="mdi:school" />
            <Typography variant="body2" color="text.secondary">
              Class
            </Typography>
          </Box>
          <Typography variant="body1" fontWeight="600">
            {meeting.classes?.length ? meeting.classes.join(', ') : '—'}
          </Typography>
        </Grid>

        {/* Division */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify icon="mdi:account-multiple-outline" />
            <Typography variant="body2" color="text.secondary">
              Division
            </Typography>
          </Box>
          <Typography variant="body1" fontWeight="600">
            {meeting.divisions?.length ? meeting.divisions.join(', ') : '—'}
          </Typography>
        </Grid>
      </Grid>

      {/* Attachment */}
      {meeting.attachment && meeting.attachment.length > 0 && (
        <Box
          sx={{
            mt: 3,
            p: 1.5,
            bgcolor: 'grey.100',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Iconify icon="mdi:paperclip" />
            <Typography variant="body2">Attachment: {meeting.attachment[0]}</Typography>
          </Box>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Visibility />}
            href={meeting.attachment[0]}
            target="_blank"
          >
            View
          </Button>
        </Box>
      )}
    </Card>
  );
};

export default ViewMeetingDescription;
