import dayjs from 'dayjs';
import { alpha } from '@mui/material/styles';
import { Label } from 'src/components/label';
import { Box, Card, Grid, Typography } from '@mui/material';
import { Groups, Person, Warning, Category, AccessTime, Notifications } from '@mui/icons-material';
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
  console.log('Announcement Declare On----', announcement);
  if (!announcement) return null;

  return (
    <Card sx={{ p: 2, borderRadius: 2, boxShadow: 4, mb: 2 }}>
      <Grid container spacing={2}>
        {/* Title & Description */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {announcement.description}
          </Typography>
        </Grid>

        {/* Announcement Type */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: (theme) => alpha(theme.palette.info.main, 0.15),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 2,
              }}
            >
              <Category sx={{ color: 'info.main' }} />
            </Box>
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
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: (theme) => alpha(theme.palette.error.main, 0.15),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 2,
              }}
            >
              <Warning sx={{ color: announcement.importance_level?.color || 'error.main' }} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Importance
              </Typography>
              <Typography
                variant="body1"
                fontWeight="600"
                sx={{ color: announcement.importance_level?.color }}
              >
                {announcement.importance_level?.levelName || '—'}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Start Date */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
              <AccessTime sx={{ color: 'success.main' }} />
            </Box>
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
              <AccessTime sx={{ color: 'primary.main' }} />
            </Box>
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

        <Grid size={{ xs: 12, md: 6 }}>
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
              <AccessTime sx={{ color: 'primary.main' }} />
            </Box>
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

        {/* Duration */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: (theme) => alpha(theme.palette.info.main, 0.15),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 2,
              }}
            >
              <AccessTime sx={{ color: 'info.main' }} />
            </Box>
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

        {/* Audience */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.15),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 2,
              }}
            >
              <Groups sx={{ color: 'secondary.main' }} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Audience
              </Typography>
              <Typography variant="body1" fontWeight="600">
                {announcement.audience?.map((a) => a.value).join(', ') || '—'}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Announced By */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.15),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 2,
              }}
            >
              <Person sx={{ color: 'primary.main' }} />
            </Box>
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
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: (theme) => alpha(theme.palette.warning.main, 0.15),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 2,
              }}
            >
              <Notifications sx={{ color: 'warning.main' }} />
            </Box>
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

        {/* Link */}
        {/* <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LinkIcon sx={{ color: 'primary.main' }} />
            <MuiLink
              href={announcement.link}
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              color="primary.main"
              fontWeight="600"
            >
              {announcement.link}
            </MuiLink>
          </Box>
        </Grid> */}
      </Grid>
    </Card>
  );
}
