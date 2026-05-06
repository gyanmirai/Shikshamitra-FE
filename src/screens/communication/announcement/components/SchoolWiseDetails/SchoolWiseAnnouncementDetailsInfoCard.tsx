import React from 'react';
import dayjs from 'dayjs';
import { varAlpha } from 'src/theme/styles';
import { alpha } from '@mui/material/styles';
import { Label } from 'src/components/label';
import { Box, Card, Grid, Divider, Typography, CardContent } from '@mui/material';
import { Flag, Groups, Person, Category, AccessTime, Notifications } from '@mui/icons-material';
import {
  AnnouncementStatus,
  AnnouncementStatusColor,
} from 'src/enums/communication_announcement_status_type';
import { InfoItem } from 'src/screens/academic/homework-assignment-management/homeworkCreation/component/viewHomeworkDetails';

import type { ISchoolWiseAnnouncement } from '../../type';

export default function SchoolWiseAnnouncementDetailsInfoCard({
  announcement,
}: {
  announcement: ISchoolWiseAnnouncement | null;
}) {
  if (!announcement) return null;

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        boxShadow: (theme) =>
          `0 0 2px 0 ${varAlpha(theme.palette.grey['500Channel'], 0.2)}, 0 12px 24px -4px ${varAlpha(theme.palette.grey['500Channel'], 0.12)}`,
        overflow: 'hidden',
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          px: 2,
          py: 2,
          borderBottom: '1px dashed',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.02),
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Announcement Details
        </Typography>

        {announcement.importance_level && (
          <Label
            variant="soft"
            sx={{
              color: announcement.importance_level.color,
              bgcolor: (theme) => varAlpha(theme.palette.error.mainChannel, 0.08), // Using error bg as base or custom?
              ...((announcement.importance_level.color && {
                color: announcement.importance_level.color,
                backgroundColor: alpha(announcement.importance_level.color, 0.16),
              }) ||
                {}),
            }}
          >
            {announcement.importance_level.levelName}
          </Label>
        )}
      </Box>

      <CardContent sx={{ p: 2 }}>
        <Grid container spacing={3}>
          {/* Type */}
          <Grid size={{ xs: 12, md: 4 }}>
            <InfoItem
              label="Type"
              value={announcement.type?.map((t) => t.announcementType).join(', ') || '—'}
              icon={<Category />}
            />
          </Grid>

          {/* Announcement Declared On */}
          <Grid size={{ xs: 12, md: 4 }}>
            <InfoItem
              label="Declared On"
              value={
                announcement.startDate
                  ? dayjs(announcement.startDate).format('DD/MM/YYYY - hh:mm A')
                  : '—'
              }
              icon={<AccessTime />}
            />
          </Grid>

          {/* Announcement Closed On */}
          <Grid size={{ xs: 12, md: 4 }}>
            <InfoItem
              label="Closed On"
              value={
                announcement.endDate
                  ? dayjs(announcement.endDate).format('DD/MM/YYYY - hh:mm A')
                  : '—'
              }
              icon={<AccessTime />}
            />
          </Grid>

          {/* Status */}
          <Grid size={{ xs: 12, md: 4 }}>
            <InfoItem
              label="Status"
              value={
                <Label
                  variant="soft"
                  color={
                    (AnnouncementStatusColor[announcement?.status as AnnouncementStatus] as any) ||
                    'default'
                  }
                >
                  {AnnouncementStatus[announcement?.status as AnnouncementStatus]}
                </Label>
              }
              icon={<Notifications />}
            />
          </Grid>

          {/* Duration */}
          <Grid size={{ xs: 12, md: 4 }}>
            <InfoItem label="Duration" value={announcement.duration || '—'} icon={<AccessTime />} />
          </Grid>

          {/* Audience */}
          <Grid size={{ xs: 12, md: 4 }}>
            <InfoItem
              label="Audience"
              value={announcement.audience?.map((a) => a.value).join(', ') || '—'}
              icon={<Groups />}
            />
          </Grid>

          {/* Announced By */}
          <Grid size={{ xs: 12, md: 4 }}>
            <InfoItem
              label="Announced By"
              value={announcement.createdBy || '—'}
              icon={<Person />}
            />
          </Grid>

          {/* Notification Preferences */}
          <Grid size={{ xs: 12, md: 4 }}>
            <InfoItem
              label="Notification Preferences"
              value={announcement.notification_preferences?.join(', ') || '—'}
              icon={<Notifications />}
            />
          </Grid>

          {/* Divider */}
          <Grid size={{ xs: 12 }}>
            <Divider sx={{ borderStyle: 'dashed' }} />
          </Grid>

          {/* Description Section */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box
                sx={{
                  minWidth: 40,
                  height: 40,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'info.main',
                  mt: 0.5,
                }}
              >
                <Flag sx={{ fontSize: 20 }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Description & Notes
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ lineHeight: 1.6, mb: 1.5 }}
                >
                  {announcement.description || 'No description provided.'}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
