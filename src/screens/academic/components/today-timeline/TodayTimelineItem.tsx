import type { LessonPlanTimelineSlot } from 'src/redux/academicAPI/CurriculumManagementApi/LessonPlanApi/lesson-plan-api';

import { alpha } from '@mui/material/styles';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Box, Chip, Stack, Typography } from '@mui/material';

import { getLessonPlanState, getTodayTimelineStatus } from './today-timeline-utils';

const timelineStatusStyle = {
  completed: { label: 'Completed', color: 'success' as const, icon: 'mdi:check-circle-outline' },
  ongoing: { label: 'Now', color: 'info' as const, icon: 'mdi:play-circle-outline' },
  upcoming: { label: 'Upcoming', color: 'warning' as const, icon: 'mdi:clock-outline' },
};

type TodayTimelineItemProps = {
  slot: LessonPlanTimelineSlot;
  now: Date;
  isLast: boolean;
};

export function TodayTimelineItem({ slot, now, isLast }: TodayTimelineItemProps) {
  const statusStyle = timelineStatusStyle[getTodayTimelineStatus(slot, now)];
  const planState = getLessonPlanState(slot);

  return (
    <Stack component="li" direction="row" spacing={1.5}>
      <Stack alignItems="center" sx={{ width: 36, flexShrink: 0 }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            color: `${statusStyle.color}.main`,
            bgcolor: (theme) => alpha(theme.palette[statusStyle.color].main, 0.12),
          }}
          aria-label={statusStyle.label}
        >
          <Iconify icon={statusStyle.icon} width={18} />
        </Box>
        {!isLast ? <Box sx={{ width: 2, flex: 1, minHeight: 38, bgcolor: 'divider' }} /> : null}
      </Stack>

      <Box sx={{ flex: 1, minWidth: 0, pb: isLast ? 0 : 1.5 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={0.75}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2">
              {slot.startTime}–{slot.endTime} · {slot.subjectName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {slot.periodName} · {slot.standardName} {slot.divisionName}
            </Typography>
          </Box>
          <Label variant="soft" color={statusStyle.color}>
            {statusStyle.label}
          </Label>
        </Stack>

        <Stack direction="row" spacing={0.75} sx={{ mt: 0.75, flexWrap: 'wrap', gap: 0.75 }}>
          <Chip label={planState.label} color={planState.color} size="small" variant="outlined" />
          {slot.lessonPlan?.topic ? (
            <Chip label={slot.lessonPlan.topic} size="small" variant="outlined" />
          ) : null}
        </Stack>
      </Box>
    </Stack>
  );
}
