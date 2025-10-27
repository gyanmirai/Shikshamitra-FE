'use client';

import dayjs from 'dayjs';
import React from 'react';
import { alpha } from '@mui/material/styles';
import { Label } from 'src/components/label';
import { Box, Card, Chip, Grid, Typography } from '@mui/material';
import {
  AnnouncementStatus,
  AnnouncementStatusColor,
} from 'src/enums/communication_announcement_status_type';
import {
  Star,
  Groups,
  Person,
  Category,
  Business,
  AccessTime,
  Description,
  Notifications,
  Class as ClassIcon,
} from '@mui/icons-material';

import type { IClassWiseAnnouncement } from '../../type';

export default function ClassWiseAnnouncementDetailsInfoCard({
  announcement,
}: {
  announcement: IClassWiseAnnouncement | null;
}) {
  if (!announcement) return null;

  const renderIconBox = (icon: React.ReactNode, color: string) => (
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        bgcolor: (theme) => alpha(theme.palette.success.main, 0.15),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 1,
      }}
    >
      {React.cloneElement(
        icon as React.ReactElement<{ sx?: { color: string; fontSize?: number } }>,
        {
          sx: { color, fontSize: 17 },
        }
      )}
    </Box>
  );

  return (
    <Card sx={{ p: 2, borderRadius: 2, boxShadow: 4, mb: 2 }}>
      <Grid container spacing={2}>
        {/* Type */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {renderIconBox(<Category />, 'info.main')}
            <Box>
              <Typography variant="body2" color="text.secondary">
                Type
              </Typography>
              <Typography variant="body1" fontWeight="600">
                {announcement.type?.map((t) => t.announcementType).join(', ') || '—'}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Importance Level */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {renderIconBox(<Star sx={{ fontSize: 17 }} />, 'error.main')}
            <Box>
              <Typography variant="body2" color="text.secondary">
                Importance
              </Typography>
              <Typography
                variant="body1"
                fontWeight="600"
                sx={{ color: announcement.importance_level?.color }}
              >
                {announcement.importance_level?.levelName || 'Normal'}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Organizations */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {renderIconBox(<Business sx={{ fontSize: 17 }} />, 'primary.main')}
            <Box>
              <Typography variant="body2" color="text.secondary">
                Organizations
              </Typography>
              {announcement?.organizations?.length ? (
                announcement.organizations.map((org) => (
                  <Chip
                    key={org}
                    label={org}
                    size="small"
                    sx={{ mr: 0.5, mb: 0.5 }}
                    variant="outlined"
                  />
                ))
              ) : (
                <Typography variant="body1">—</Typography>
              )}
            </Box>
          </Box>
        </Grid>

        {/* Classes */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {renderIconBox(<ClassIcon sx={{ fontSize: 17 }} />, 'primary.main')}
            <Box>
              <Typography variant="body2" color="text.secondary">
                Classes
              </Typography>
              {announcement?.classes?.length ? (
                announcement.classes.map((cls) => (
                  <Chip
                    key={cls}
                    label={cls}
                    size="small"
                    sx={{ mr: 0.5, mb: 0.5 }}
                    variant="outlined"
                  />
                ))
              ) : (
                <Typography variant="body1">—</Typography>
              )}
            </Box>
          </Box>
        </Grid>

        {/* Divisions */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {renderIconBox(<Groups sx={{ fontSize: 17 }} />, 'primary.main')}
            <Box>
              <Typography variant="body2" color="text.secondary">
                Divisions
              </Typography>
              {announcement?.divisions?.length ? (
                announcement.divisions.map((div) => (
                  <Chip
                    key={div}
                    label={div}
                    size="small"
                    sx={{ mr: 0.5, mb: 0.5 }}
                    variant="outlined"
                  />
                ))
              ) : (
                <Typography variant="body1">—</Typography>
              )}
            </Box>
          </Box>
        </Grid>

        {/* Start Date */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {renderIconBox(<AccessTime sx={{ fontSize: 17 }} />, 'success.main')}
            <Box>
              <Typography variant="body2" color="text.secondary">
                Announcement Declared On
              </Typography>
              <Typography variant="body1" fontWeight="600">
                {announcement.startDate
                  ? dayjs(announcement.startDate).format('DD/MM/YYYY - hh:mmA')
                  : '—'}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* End Date */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {renderIconBox(<AccessTime sx={{ fontSize: 17 }} />, 'primary.main')}
            <Box>
              <Typography variant="body2" color="text.secondary">
                Announcement Closed On
              </Typography>
              <Typography variant="body1" fontWeight="600">
                {announcement.endDate
                  ? dayjs(announcement.endDate).format('DD/MM/YYYY - hh:mmA')
                  : '—'}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Duration */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {renderIconBox(<AccessTime sx={{ fontSize: 17 }} />, 'info.main')}
            <Box>
              <Typography variant="body2" color="text.secondary">
                Duration
              </Typography>
              <Typography variant="body1" fontWeight="600">
                {announcement.duration || '—'}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Status */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {renderIconBox(<AccessTime sx={{ fontSize: 17 }} />, 'primary.main')}
            <Box>
              <Typography variant="body2" color="text.secondary">
                Status
              </Typography>
              <Label
                variant="soft"
                color={AnnouncementStatusColor[announcement?.status as AnnouncementStatus] as any}
              >
                {AnnouncementStatus[announcement?.status as AnnouncementStatus]}
              </Label>
            </Box>
          </Box>
        </Grid>

        {/* Announced By */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {renderIconBox(<Person sx={{ fontSize: 17 }} />, 'primary.main')}
            <Box>
              <Typography variant="body2" color="text.secondary">
                Announced By
              </Typography>
              <Typography variant="body1" fontWeight="600">
                {announcement.createdBy || '—'}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Notification Preferences */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {renderIconBox(<Notifications sx={{ fontSize: 17 }} />, 'warning.main')}
            <Box>
              <Typography variant="body2" color="text.secondary">
                Notification Preferences
              </Typography>
              <Typography variant="body1" fontWeight="600">
                {announcement.notification_preferences?.join(', ') || '—'}
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.15),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 2,
              }}
            >
              <Description sx={{ color: 'primary.main', fontSize: 17 }} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Description
              </Typography>
              <Typography variant="body1" fontWeight="600">
                {announcement.description || '—'}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Card>
  );
}
