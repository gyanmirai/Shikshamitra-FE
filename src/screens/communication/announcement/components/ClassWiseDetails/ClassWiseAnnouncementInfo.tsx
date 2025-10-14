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
  Category,
  Business,
  Dashboard,
  AccessTime,
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
        width: 36,
        height: 36,
        borderRadius: '50%',
        bgcolor: (theme) => alpha(theme.palette.success.main, 0.15),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 1,
      }}
    >
      {React.cloneElement(icon as React.ReactElement<{ sx?: { color: string } }>, {
        sx: { color },
      })}
    </Box>
  );

  return (
    <Card sx={{ p: 3, borderRadius: 2, boxShadow: 4, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', gap: 1 }}>
        <Label
          variant="soft"
          color={AnnouncementStatusColor[announcement?.status as AnnouncementStatus] as any}
        >
          {AnnouncementStatus[announcement?.status as AnnouncementStatus]}
        </Label>
      </Box>

      {/* Details */}
      <Grid container spacing={2}>
        {/* Title */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {renderIconBox(<Category />, 'primary.main')}
            <Box>
              <Typography variant="body2" color="text.secondary">
                Title
              </Typography>
              <Typography variant="body1" fontWeight="400">
                {announcement.title || '—'}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Category */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {renderIconBox(<Dashboard />, 'primary.main')}
            <Box>
              <Typography variant="body2" color="text.secondary">
                Category
              </Typography>
              <Chip
                label={announcement.type || 'N/A'}
                size="small"
                color="default"
                variant="outlined"
              />
            </Box>
          </Box>
        </Grid>

        {/* Importance Level */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {renderIconBox(<Star />, 'primary.main')}
            <Box>
              <Typography variant="body2" color="text.secondary">
                Importance Level
              </Typography>
              <Typography variant="body1" fontWeight="400">
                {announcement.importance_level?.levelName || 'Normal'}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Organizations */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {renderIconBox(<Business />, 'primary.main')}
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
                    color="default"
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
            {renderIconBox(<ClassIcon />, 'primary.main')}
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
                    color="default"
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
            {renderIconBox(<Groups />, 'primary.main')}
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
                    color="default"
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
            {renderIconBox(<AccessTime />, 'success.main')}
            <Box>
              <Typography variant="body2" color="text.secondary">
                Start Date
              </Typography>
              <Typography variant="body1" fontWeight="400">
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
            {renderIconBox(<AccessTime />, 'primary.main')}
            <Box>
              <Typography variant="body2" color="text.secondary">
                End Date
              </Typography>
              <Typography variant="body1" fontWeight="400">
                {announcement.endDate
                  ? dayjs(announcement.endDate).format('DD/MM/YYYY - hh:mmA')
                  : '—'}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Card>
  );
}
