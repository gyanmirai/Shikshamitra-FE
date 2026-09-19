import type { SubjectScheduleLecture } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';

import { Iconify } from 'src/components/iconify';
import { Box, Chip, Paper, Stack, Typography } from '@mui/material';

import {
  getTimetableStatus,
  groupLecturesByDay,
  getScheduleDayLabel,
} from './subjectScheduleUtils';

function LectureCard({ lecture }: { lecture: SubjectScheduleLecture }) {
  const status = getTimetableStatus(lecture.timetableStatus);
  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1.5 }}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={1}>
        <Box>
          <Typography variant="subtitle2">Period {lecture.periodNumber}</Typography>
          <Stack direction="row" alignItems="center" spacing={0.5} color="text.secondary">
            <Iconify icon="mdi:clock-outline" width={15} />
            <Typography variant="caption">
              {lecture.startTime}–{lecture.endTime}
            </Typography>
          </Stack>
        </Box>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Chip size="small" label={`Division ${lecture.divisionName}`} variant="outlined" />
          <Chip size="small" label={status.label} color={status.color} variant="soft" />
        </Stack>
      </Stack>

      <Stack spacing={1} sx={{ mt: 1.5 }}>
        {lecture.subjects.map((subject) => (
          <Box
            key={subject.subjectId}
            sx={{ display: 'grid', gridTemplateColumns: '12px minmax(0, 1fr)', gap: 1 }}
          >
            <Box
              aria-hidden
              sx={{
                width: 8,
                height: 8,
                mt: 0.6,
                borderRadius: '50%',
                bgcolor: subject.subjectColor || 'primary.main',
              }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" fontWeight={600}>
                {subject.subjectName}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.25, sm: 1.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Teacher: {subject.teacherName || 'Not assigned'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Room: {subject.roomName || 'Not assigned'}
                </Typography>
              </Stack>
            </Box>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}

export function SubjectScheduleLectureList({ lectures }: { lectures: SubjectScheduleLecture[] }) {
  return (
    <Stack spacing={2}>
      {groupLecturesByDay(lectures).map(([day, dayLectures]) => (
        <Box key={day} component="section" aria-labelledby={`schedule-day-${day}`}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Iconify icon="mdi:calendar-blank-outline" width={18} color="primary.main" />
            <Typography id={`schedule-day-${day}`} variant="subtitle2" fontWeight={700}>
              {getScheduleDayLabel(day)}
            </Typography>
            <Chip
              size="small"
              label={`${dayLectures.length} ${dayLectures.length === 1 ? 'lecture' : 'lectures'}`}
            />
          </Stack>
          <Stack spacing={1}>
            {dayLectures.map((lecture) => (
              <LectureCard key={lecture.timetableSlotId} lecture={lecture} />
            ))}
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}
