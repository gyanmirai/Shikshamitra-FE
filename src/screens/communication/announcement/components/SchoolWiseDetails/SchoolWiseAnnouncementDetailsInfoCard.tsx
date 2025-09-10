'use client';

import type { LabelColor } from 'src/components/label';

import React from 'react';
import Grid from '@mui/material/Grid';
import { Label } from 'src/components/label';
import { Box, Card, Chip, Typography } from '@mui/material';
import {
  AnnouncementStatus,
  AnnouncementStatusColor,
} from 'src/enums/communication_announcement_status_type';

import type { ISchoolWiseAnnouncement } from '../../type';

export default function SchoolWiseAnnouncementDetailsInfoCard({
  announcement,
}: {
  announcement: ISchoolWiseAnnouncement | null;
}) {
  return (
    <Card sx={{ p: 2, mb: 2, boxShadow: 3 }}>
      {/* Heading */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" color="primary.main">
          Announcement Details
        </Typography>
        <Label
          variant="soft"
          color={AnnouncementStatusColor[announcement?.status as AnnouncementStatus] as LabelColor}
        >
          {AnnouncementStatus[announcement?.status as AnnouncementStatus]}
        </Label>
      </Box>

      <Grid container spacing={2}>
        {/* Title */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Title
          </Typography>
          <Typography variant="body1" fontWeight="600">
            {announcement?.title}
          </Typography>
        </Grid>

        {/* Category */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Category
          </Typography>
          <Chip
            label={announcement?.type || 'N/A'}
            size="small"
            color="default"
            variant="outlined"
          />
        </Grid>

        {/* Importance Level */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Important Level
          </Typography>
          <Typography variant="body1" fontWeight="600">
            {announcement?.importance_level || 'Normal'}
          </Typography>
        </Grid>

        {/* Start Date */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Start Date
          </Typography>
          <Typography variant="body1" fontWeight="600">
            {announcement?.startDate
              ? new Date(announcement.startDate as string).toLocaleDateString()
              : '—'}
          </Typography>
        </Grid>

        {/* End Date */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Typography variant="body2" color="text.secondary">
            End Date
          </Typography>
          <Typography variant="body1" fontWeight="600">
            {announcement?.endDate
              ? new Date(announcement.endDate as string).toLocaleDateString()
              : '—'}
          </Typography>
        </Grid>
      </Grid>
    </Card>
  );
}
