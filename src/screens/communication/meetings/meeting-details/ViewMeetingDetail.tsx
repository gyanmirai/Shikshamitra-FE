import type { LabelColor } from 'src/components/label';

import React from 'react';
import { Label } from 'src/components/label';
import { Box, Grid, Card, Chip, Typography } from '@mui/material';
import { MeetingStatus, MeetingStatusColor } from 'src/enums/meeting-status-type';

import type { IMeeting } from '../type';

const ViewMeetingDetail = ({ meeting }: { meeting: IMeeting | null }) => {
  if (!meeting) return null;

  return (
    <Card sx={{ p: 2, mb: 2, boxShadow: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" color="primary.main">
          Meeting Details
        </Typography>
        <Label
          variant="soft"
          color={MeetingStatusColor[meeting.status as MeetingStatus] as LabelColor}
        >
          {MeetingStatus[meeting.status as MeetingStatus]}
        </Label>
      </Box>

      <Grid container spacing={2}>
        {/* Title */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Title
          </Typography>
          <Typography variant="body1" fontWeight="600">
            {meeting.title}
          </Typography>
        </Grid>

        {/* Category */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Category
          </Typography>
          <Chip label={meeting.type || 'N/A'} size="small" color="default" variant="outlined" />
        </Grid>

        {/* Importance */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Important Level
          </Typography>
          <Typography variant="body1" fontWeight="600">
            {meeting.importance_level || 'Normal'}
          </Typography>
        </Grid>

        {/* Start Date */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Start Date
          </Typography>
          <Typography variant="body1" fontWeight="600">
            {meeting.startDate ? new Date(meeting.startDate as string).toLocaleDateString() : '—'}
          </Typography>
        </Grid>

        {/* End Date */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Typography variant="body2" color="text.secondary">
            End Date
          </Typography>
          <Typography variant="body1" fontWeight="600">
            {meeting.endDate ? new Date(meeting.endDate as string).toLocaleDateString() : '—'}
          </Typography>
        </Grid>
      </Grid>
    </Card>
  );
};

export default ViewMeetingDetail;
