import dayjs from 'dayjs';
import { alpha } from '@mui/material/styles';
import { Label } from 'src/components/label';
import { Box, Card, Grid, Typography } from '@mui/material';
import {
  AnnouncementStatus,
  AnnouncementStatusColor,
} from 'src/enums/communication_announcement_status_type';
import {
  Groups,
  Person,
  Warning,
  Category,
  AccessTime,
  Description,
  Notifications,
} from '@mui/icons-material';

import type { ISchoolWiseAnnouncement } from '../../type';

// ----------------------------------------------------------------------

type DetailItemProps = {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  iconColor?: any;
  iconBgColor?: any;
};

function DetailItem({ icon, label, value, iconColor, iconBgColor }: DetailItemProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 1.5,
          bgcolor: iconBgColor || ((theme: any) => alpha(theme.palette.primary.main, 0.08)),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: iconColor || 'primary.main',
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            fontWeight: 600,
            display: 'block',
            mb: 0.5,
            textTransform: 'uppercase',
          }}
        >
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

// ----------------------------------------------------------------------

export default function SchoolWiseAnnouncementDetailsInfoCard({
  announcement,
}: {
  announcement: ISchoolWiseAnnouncement | null;
}) {
  if (!announcement) return null;

  return (
    <Card
      sx={{
        p: 3,
        borderRadius: 2,
        border: (theme) => `1px dashed ${theme.palette.divider}`,
        boxShadow: 'none',
      }}
    >
      <Grid container spacing={3}>
        {/* Type */}
        <Grid size={{ xs: 12, md: 4 }}>
          <DetailItem
            label="Type"
            value={announcement.type?.map((t) => t.announcementType).join(', ') || '—'}
            icon={<Category fontSize="small" />}
            iconColor="info.main"
            iconBgColor={(theme: any) => alpha(theme.palette.info.main, 0.08)}
          />
        </Grid>

        {/* Importance Level */}
        <Grid size={{ xs: 12, md: 4 }}>
          <DetailItem
            label="Importance"
            value={
              <Box component="span" sx={{ color: announcement.importance_level?.color }}>
                {announcement.importance_level?.levelName || '—'}
              </Box>
            }
            icon={<Warning fontSize="small" />}
            iconColor={announcement.importance_level?.color || 'error.main'}
            iconBgColor={(theme: any) => alpha(theme.palette.error.main, 0.08)}
          />
        </Grid>

        {/* Start Date */}
        <Grid size={{ xs: 12, md: 4 }}>
          <DetailItem
            label="Announcement Declared On"
            value={
              announcement.startDate
                ? dayjs(announcement.startDate).format('DD/MM/YYYY - hh:mm A')
                : '—'
            }
            icon={<AccessTime fontSize="small" />}
            iconColor="success.main"
            iconBgColor={(theme: any) => alpha(theme.palette.success.main, 0.08)}
          />
        </Grid>

        {/* End Date */}
        <Grid size={{ xs: 12, md: 4 }}>
          <DetailItem
            label="Announcement Closed On"
            value={
              announcement.endDate
                ? dayjs(announcement.endDate).format('DD/MM/YYYY - hh:mm A')
                : '—'
            }
            icon={<AccessTime fontSize="small" />}
            iconColor="error.main" // Changed to error to signify closing
            iconBgColor={(theme: any) => alpha(theme.palette.error.main, 0.08)}
          />
        </Grid>

        {/* Status */}
        <Grid size={{ xs: 12, md: 4 }}>
          <DetailItem
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
            icon={<Notifications fontSize="small" />}
            iconColor="primary.main"
          />
        </Grid>

        {/* Duration */}
        <Grid size={{ xs: 12, md: 4 }}>
          <DetailItem
            label="Duration"
            value={announcement.duration || '—'}
            icon={<AccessTime fontSize="small" />}
            iconColor="info.main"
            iconBgColor={(theme: any) => alpha(theme.palette.info.main, 0.08)}
          />
        </Grid>

        {/* Audience */}
        <Grid size={{ xs: 12, md: 4 }}>
          <DetailItem
            label="Audience"
            value={announcement.audience?.map((a) => a.value).join(', ') || '—'}
            icon={<Groups fontSize="small" />}
            iconColor="secondary.main"
            iconBgColor={(theme: any) => alpha(theme.palette.secondary.main, 0.08)}
          />
        </Grid>

        {/* Announced By */}
        <Grid size={{ xs: 12, md: 4 }}>
          <DetailItem
            label="Announced By"
            value={announcement.createdBy || '—'}
            icon={<Person fontSize="small" />}
            iconColor="primary.main"
          />
        </Grid>

        {/* Notification Preferences */}
        <Grid size={{ xs: 12, md: 4 }}>
          <DetailItem
            label="Notification Preferences"
            value={announcement.notification_preferences?.join(', ') || '—'}
            icon={<Notifications fontSize="small" />}
            iconColor="warning.main"
            iconBgColor={(theme: any) => alpha(theme.palette.warning.main, 0.08)}
          />
        </Grid>

        {/* Description */}
        <Grid size={{ xs: 12 }}>
          <DetailItem
            label="Description"
            value={announcement.description || '—'}
            icon={<Description fontSize="small" />}
            iconColor="primary.main"
          />
        </Grid>
      </Grid>
    </Card>
  );
}
