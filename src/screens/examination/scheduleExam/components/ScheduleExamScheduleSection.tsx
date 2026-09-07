import dayjs from 'dayjs';
import { alpha } from '@mui/material/styles';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Chip, Paper, Stack, Divider, Typography } from '@mui/material';

export type SubjectRowItem = {
  endTime?: string | null;
  examDate?: string | null;
  groupName?: string;
  name?: string;
  startTime?: string | null;
  subjectId: string;
  subjectName: string;
};

export type DateGroup = {
  dateKey: string;
  dayOfWeek: string;
  formattedDate: string;
  subjects: SubjectRowItem[];
};

type ScheduleExamScheduleSectionProps = {
  dateGroups: DateGroup[];
  subjectCount: number;
};

const getDurationText = (startTime?: string | null, endTime?: string | null) => {
  if (!startTime || !endTime) return null;
  const start = dayjs(startTime);
  const end = dayjs(endTime);
  if (!start.isValid() || !end.isValid()) return null;
  const diffMinutes = end.diff(start, 'minute');
  if (diffMinutes <= 0) return null;
  const hours = Math.floor(diffMinutes / 60);
  const mins = diffMinutes % 60;
  if (hours > 0 && mins > 0) return `${hours} hr ${mins} min`;
  if (hours > 0) return `${hours} hr${hours > 1 ? 's' : ''}`;
  return `${mins} min`;
};

export function ScheduleExamScheduleSection({
  dateGroups,
  subjectCount,
}: ScheduleExamScheduleSectionProps) {
  return (
    <Box component="section" aria-labelledby="exam-schedule-heading">
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }}>
        <Box>
          <Typography id="exam-schedule-heading" variant="subtitle1" sx={{ fontWeight: 700 }}>
            Subjects &amp; schedule
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Timetable arranged in chronological order
          </Typography>
        </Box>
        <Chip
          label={`${subjectCount} subject${subjectCount === 1 ? '' : 's'}`}
          size="small"
          variant="soft"
          sx={{ fontWeight: 600 }}
        />
      </Stack>

      {subjectCount === 0 ? (
        <Paper
          variant="outlined"
          sx={{ p: 3, textAlign: 'center', borderRadius: 2, borderStyle: 'dashed' }}
        >
          <Typography variant="body2" color="text.secondary">
            No subjects have been scheduled for this exam yet.
          </Typography>
        </Paper>
      ) : (
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
          {dateGroups.map((group, groupIndex) => {
            const isUnscheduled = group.dateKey === 'unscheduled';

            return (
              <Box key={group.dateKey}>
                {groupIndex > 0 && <Divider />}
                <Box
                  sx={{
                    px: 2.25,
                    py: 1.25,
                    bgcolor: (theme) =>
                      alpha(
                        isUnscheduled ? theme.palette.warning.main : theme.palette.primary.main,
                        0.055
                      ),
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={2}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Iconify
                        icon={isUnscheduled ? 'solar:calendar-cross-bold' : GlobalIcons.calendar}
                        width={17}
                        height={17}
                        sx={{ color: isUnscheduled ? 'warning.main' : 'primary.main' }}
                      />
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}
                        >
                          {group.formattedDate}
                        </Typography>
                        {group.dayOfWeek && (
                          <Typography variant="caption" color="text.secondary">
                            {group.dayOfWeek}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      {group.subjects.length} {group.subjects.length === 1 ? 'exam' : 'exams'}
                    </Typography>
                  </Stack>
                </Box>

                <Stack divider={<Divider />}>
                  {group.subjects.map((subject) => {
                    const duration = getDurationText(subject.startTime, subject.endTime);
                    const hasTime = Boolean(subject.startTime && subject.endTime);

                    return (
                      <Stack
                        key={subject.subjectId || subject.name || subject.subjectName}
                        direction={{ xs: 'column', sm: 'row' }}
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        justifyContent="space-between"
                        spacing={1.5}
                        sx={{ px: 2.25, py: 1.75 }}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 650 }}>
                            {subject.subjectName || '-'}
                          </Typography>
                          {subject.groupName && (
                            <Typography variant="caption" color="text.secondary">
                              Elective group · {subject.groupName}
                            </Typography>
                          )}
                        </Box>

                        {hasTime ? (
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={0.75}
                            sx={{ flexShrink: 0 }}
                          >
                            <Iconify
                              icon={GlobalIcons.clock}
                              width={16}
                              height={16}
                              sx={{ color: 'primary.main' }}
                            />
                            <Typography
                              variant="body2"
                              color="text.primary"
                              sx={{ fontWeight: 650, fontVariantNumeric: 'tabular-nums' }}
                            >
                              {dayjs(subject.startTime).format('hh:mm A')} –{' '}
                              {dayjs(subject.endTime).format('hh:mm A')}
                            </Typography>
                            {duration && (
                              <Chip
                                label={duration}
                                size="small"
                                variant="soft"
                                sx={{ height: 24 }}
                              />
                            )}
                          </Stack>
                        ) : (
                          <Chip label="Time not set" size="small" color="warning" variant="soft" />
                        )}
                      </Stack>
                    );
                  })}
                </Stack>
              </Box>
            );
          })}
        </Paper>
      )}
    </Box>
  );
}
