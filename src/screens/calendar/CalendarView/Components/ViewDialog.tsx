import React from 'react';
import dayjs from 'dayjs';
import { Label } from 'src/components/label';
import CloseIcon from '@mui/icons-material/Close';
import GroupIcon from '@mui/icons-material/Group';
import { sanitizeHtml } from 'src/utils/sanitize-html';
import CategoryIcon from '@mui/icons-material/Category';
import InfoTwoTone from '@mui/icons-material/InfoTwoTone';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import {
  Box,
  Grid,
  Stack,
  Dialog,
  Divider,
  Typography,
  IconButton,
  DialogTitle,
  DialogContent,
} from '@mui/material';

export type CalendarDialogItem = {
  title?: string;
  calendarItemType?: number | string;
  typeName?: string;
  description?: string;
  mode?: string;
  venue?: string;
  startTime?: string;
  endTime?: string;
  audienceCount?: number;
  status?: number;
  startDate?: string;
  endDate?: string;
  start?: string;
  end?: string;
};

type ViewDialogProps = {
  open: boolean;
  onClose: () => void;
  data: CalendarDialogItem | null;
};

const statusLabels: Record<number, string> = {
  0: 'Upcoming',
  1: 'Active',
  2: 'Completed',
};

const statusColors: Record<number, 'warning' | 'success' | 'info'> = {
  0: 'warning',
  1: 'success',
  2: 'info',
};

export default function CalendarViewDialog({ open, onClose, data }: ViewDialogProps) {
  const isHoliday = data?.calendarItemType === 1 || data?.calendarItemType === 'Holiday';
  const itemType = isHoliday ? 'Holiday' : 'Event';
  const status = typeof data?.status === 'number' ? data.status : undefined;
  const statusLabel = status !== undefined ? statusLabels[status] || 'Scheduled' : 'Scheduled';
  const startDate = data?.startDate || data?.start;
  const endDate = data?.endDate || data?.end;
  const dateLabel = startDate
    ? `${dayjs(startDate).format('MMM D, YYYY')}${
        endDate && !dayjs(startDate).isSame(endDate, 'day')
          ? ` - ${dayjs(endDate).format('MMM D, YYYY')}`
          : ''
      }`
    : '-';
  const timeLabel =
    data?.startTime || data?.endTime
      ? `${data?.startTime || '-'} - ${data?.endTime || '-'}`
      : isHoliday
        ? 'All day'
        : '-';
  const modeLabel = isHoliday ? 'Holiday' : data?.mode || '-';
  const audienceCount = data?.audienceCount ?? 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          sx={{
            px: { xs: 2.5, md: 3 },
            py: 2.5,
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          }}
          gap={2}
        >
          <Stack gap={1} sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Label color={status !== undefined ? statusColors[status] || 'default' : 'default'}>
                {statusLabel}
              </Label>
              <Label color={isHoliday ? 'error' : 'success'}>{itemType}</Label>
              <Label color="default">{data?.typeName || 'General'}</Label>
            </Stack>
            <Typography variant="h6" sx={{ wordBreak: 'break-word' }}>
              {data?.title || `Untitled ${itemType}`}
            </Typography>
          </Stack>
          <IconButton onClick={onClose} aria-label="Close dialog">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2.5, md: 3 } }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <InfoItem icon={<CalendarTodayIcon />} title="Date" value={dateLabel} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <InfoItem icon={<AccessTimeIcon />} title="Time" value={timeLabel} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <InfoItem
              icon={<GroupIcon />}
              title="Audience"
              value={`${audienceCount} ${audienceCount === 1 ? 'group' : 'groups'}`}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <InfoItem
              icon={isHoliday ? <CategoryIcon /> : <LocationOnIcon />}
              title={isHoliday ? 'Category' : 'Venue'}
              value={isHoliday ? data?.typeName || '-' : data?.venue || '-'}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                border: (theme) => `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                p: 2,
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <InfoTwoTone sx={{ color: 'text.secondary', fontSize: 20 }} />
                <Typography variant="subtitle2">Description</Typography>
              </Stack>
              <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />
              {data?.description ? (
                <Typography
                  component="div"
                  variant="body2"
                  color="text.secondary"
                  sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.description) }}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No description provided.
                </Typography>
              )}
            </Box>
          </Grid>
          {!isHoliday && (
            <Grid size={{ xs: 12 }}>
              <InfoItem icon={<CategoryIcon />} title="Mode" value={modeLabel} />
            </Grid>
          )}
        </Grid>
      </DialogContent>
    </Dialog>
  );
}

type InfoItemProps = {
  icon: React.ReactNode;
  title: string;
  value: React.ReactNode;
};

function InfoItem({ icon, title, value }: InfoItemProps) {
  return (
    <Box
      sx={{
        border: (theme) => `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        p: 2,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1,
          bgcolor: 'background.neutral',
          color: 'text.secondary',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          '& svg': { fontSize: 20 },
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="body2" fontWeight={600} sx={{ wordBreak: 'break-word' }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}
