import dayjs from 'dayjs';
import { Label } from 'src/components/label';
import { alpha } from '@mui/material/styles';
import { Box, Card, Grid, Typography } from '@mui/material';
import { Groups, Person, AccessTime } from '@mui/icons-material';
import { AnnouncementStatus } from 'src/enums/announcement-status';
import { AnnouncementStatusColor } from 'src/enums/communication_announcement_status_type';

import type { ISchoolWiseAnnouncement } from '../../type';

export default function SchoolWiseAnnouncementDetailsInfoCard({
  announcement,
}: {
  announcement: ISchoolWiseAnnouncement | null;
}) {
  if (!announcement) return null;

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
        {/* Start Date & Time */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                bgcolor: (theme) => alpha(theme.palette.success.main, 0.15), // success with opacity
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
                Start Date & Time
              </Typography>
              <Typography variant="body1" fontWeight="600">
                {announcement.startDate
                  ? dayjs(announcement.startDate).format('DD/MM/YYYY - hh:mmA')
                  : '—'}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* End Date & Time */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                bgcolor: (theme) => alpha(theme.palette.success.main, 0.15), // success with opacity
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
                End Date & Time
              </Typography>
              <Typography variant="body1" fontWeight="600">
                {announcement.endDate
                  ? dayjs(announcement.endDate).format('DD/MM/YYYY - hh:mmA')
                  : '—'}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Audience */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                bgcolor: (theme) => alpha(theme.palette.success.main, 0.15), // success with opacity
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 2,
              }}
            >
              <Groups sx={{ color: 'primary.main' }} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Audience
              </Typography>
              <Typography variant="body1" fontWeight="600">
                {announcement.audience?.join(', ') || '—'}
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
                bgcolor: (theme) => alpha(theme.palette.success.main, 0.15), // success with opacity
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
                Announced by
              </Typography>
              <Typography variant="body1" fontWeight="600">
                {announcement.createdBy || '—'}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Card>
  );
}
