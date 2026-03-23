'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Box, Chip, Stack, Typography } from '@mui/material';

import { DashboardWidgetWrapper } from '../../component/dashboard-widget-wrapper';

// ----------------------------------------------------------------------

type Meeting = {
  id: string;
  title: string;
  time: string;
  duration: string;
  location: string;
  type: 'online' | 'in-person';
  status: 'upcoming' | 'ongoing' | 'completed';
  participants: string[];
};

const TODAYS_MEETINGS: Meeting[] = [
  {
    id: 'mtg-1',
    title: 'Class 10-A Weekly Review',
    time: '9:00 AM',
    duration: '30 min',
    location: 'Room 202',
    type: 'in-person',
    status: 'completed',
    participants: ['HOD – Science', 'Class Teacher'],
  },
  {
    id: 'mtg-2',
    title: 'Parent-Teacher Discussion',
    time: '11:30 AM',
    duration: '45 min',
    location: 'Counseling Room',
    type: 'in-person',
    status: 'ongoing',
    participants: ['Mrs. Sharma (Parent)', 'Counselor'],
  },
  {
    id: 'mtg-3',
    title: 'Staff Development Session',
    time: '3:00 PM',
    duration: '60 min',
    location: 'Online (Google Meet)',
    type: 'online',
    status: 'upcoming',
    participants: ['Principal', 'All Teaching Staff'],
  },
  {
    id: 'mtg-4',
    title: 'Exam Paper Discussion',
    time: '4:30 PM',
    duration: '30 min',
    location: 'HOD Office',
    type: 'in-person',
    status: 'upcoming',
    participants: ['HOD – Mathematics', 'Co-examiner'],
  },
];

const STATUS_CONFIG = {
  upcoming: { label: 'Upcoming', color: 'info' as const, icon: 'solar:clock-circle-bold' },
  ongoing: { label: 'Ongoing', color: 'success' as const, icon: 'solar:play-circle-bold' },
  completed: { label: 'Done', color: 'default' as const, icon: 'solar:check-circle-bold' },
};

// ----------------------------------------------------------------------

function MeetingItem({ meeting, index }: { meeting: Meeting; index: number }) {
  const theme = useTheme();
  const { label, color } = STATUS_CONFIG[meeting.status];
  const isOnline = meeting.type === 'online';

  const mainColor =
    meeting.status === 'completed'
      ? theme.palette.text.disabled
      : meeting.status === 'ongoing'
        ? theme.palette.success.main
        : theme.palette.info.main;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07 }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        {/* Timeline dot */}
        <Stack alignItems="center" sx={{ pt: 0.5 }}>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: mainColor,
              border: `2px solid ${mainColor}40`,
              flexShrink: 0,
              ...(meeting.status === 'ongoing' && {
                animation: 'pulse 1.5s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { boxShadow: `0 0 0 0 ${mainColor}60` },
                  '50%': { boxShadow: `0 0 0 5px ${mainColor}00` },
                },
              }),
            }}
          />
        </Stack>

        {/* Content */}
        <Box
          sx={{
            flex: 1,
            p: 1.5,
            borderRadius: '10px',
            bgcolor: meeting.status === 'ongoing' ? `${mainColor}0a` : 'background.neutral',
            border: `1px solid ${meeting.status === 'ongoing' ? `${mainColor}30` : 'transparent'}`,
            opacity: meeting.status === 'completed' ? 0.6 : 1,
          }}
        >
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={0.5}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                flex: 1,
                textDecoration: meeting.status === 'completed' ? 'line-through' : 'none',
              }}
            >
              {meeting.title}
            </Typography>
            <Chip
              label={label}
              size="small"
              color={color}
              sx={{ height: 20, fontSize: '0.62rem', fontWeight: 700, ml: 1, flexShrink: 0 }}
            />
          </Stack>

          <Stack direction="row" flexWrap="wrap" gap={1.5} mt={0.5}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Iconify
                icon="solar:clock-circle-outline"
                width={13}
                sx={{ color: 'text.disabled' }}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {meeting.time} · {meeting.duration}
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Iconify
                icon={isOnline ? 'solar:monitor-smartphone-bold' : 'solar:map-point-outline'}
                width={13}
                sx={{ color: 'text.disabled' }}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {meeting.location}
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </motion.div>
  );
}

// ----------------------------------------------------------------------

export default function TeacherTodaysMeetings() {
  const ongoingCount = TODAYS_MEETINGS.filter((m) => m.status === 'ongoing').length;
  const upcomingCount = TODAYS_MEETINGS.filter((m) => m.status === 'upcoming').length;

  return (
    <DashboardWidgetWrapper
      title={
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="solar:calendar-date-bold-duotone" width={20} />
          <span>Today&apos;s Meetings</span>
        </Stack>
      }
      action={
        <Stack direction="row" spacing={0.5}>
          {ongoingCount > 0 && (
            <Chip
              label={`${ongoingCount} Live`}
              size="small"
              color="success"
              sx={{ height: 22, fontWeight: 700, fontSize: '0.7rem' }}
            />
          )}
          {upcomingCount > 0 && (
            <Chip
              label={`${upcomingCount} Upcoming`}
              size="small"
              color="info"
              sx={{ height: 22, fontWeight: 700, fontSize: '0.7rem' }}
            />
          )}
        </Stack>
      }
    >
      <Stack spacing={1.2}>
        {TODAYS_MEETINGS.map((meeting, idx) => (
          <MeetingItem key={meeting.id} meeting={meeting} index={idx} />
        ))}
      </Stack>
    </DashboardWidgetWrapper>
  );
}
