import dayjs from 'dayjs';
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
    <Paper
      component="section"
      aria-labelledby="exam-schedule-heading"
      variant="outlined"
      sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 'var(--shadows-2)' }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ p: 1.5 }}
      >
        <Typography id="exam-schedule-heading" variant="subtitle1" sx={{ fontWeight: 700 }}>
          Subjects &amp; schedule
        </Typography>
        <Chip
          label={`${subjectCount} subject${subjectCount === 1 ? '' : 's'}`}
          size="small"
          variant="soft"
          sx={{ fontWeight: 600 }}
        />
      </Stack>
      <Divider />

      {subjectCount === 0 ? (
        <Box sx={{ p: 1.5, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No subjects have been scheduled for this exam yet.
          </Typography>
        </Box>
      ) : (
        <Box>
          {dateGroups.map((group, groupIndex) => {
            const isUnscheduled = group.dateKey === 'unscheduled';

            return (
              <Box key={group.dateKey}>
                {groupIndex > 0 && <Divider sx={{ mx: 1.5 }} />}
                <Box sx={{ px: 1.5, pt: 1.25, pb: 0.5 }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1}
                  >
                    <Stack direction="row" spacing={0.75} alignItems="center" minWidth={0}>
                      <Iconify
                        icon={isUnscheduled ? 'solar:calendar-cross-bold' : GlobalIcons.calendar}
                        width={15}
                        sx={{ color: 'text.secondary', flexShrink: 0 }}
                      />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}
                      >
                        {group.formattedDate}
                        {group.dayOfWeek ? ` · ${group.dayOfWeek}` : ''}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>

                <Stack divider={<Divider sx={{ mx: 1.5 }} />}>
                  {group.subjects.map((subject) => {
                    const duration = getDurationText(subject.startTime, subject.endTime);
                    const hasTime = Boolean(subject.startTime && subject.endTime);

                    return (
                      <Stack
                        key={subject.subjectId || subject.name || subject.subjectName}
                        direction={{ xs: 'column', sm: 'row' }}
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        justifyContent="space-between"
                        gap={0.75}
                        sx={{ px: 1.5, py: 0.75 }}
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
                            sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
                          >
                            <Iconify
                              icon={GlobalIcons.clock}
                              width={14}
                              height={16}
                              sx={{ color: 'text.secondary' }}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}
                            >
                              {dayjs(subject.startTime).format('hh:mm A')} –{' '}
                              {dayjs(subject.endTime).format('hh:mm A')}
                            </Typography>
                            {duration && (
                              <Typography variant="caption" color="text.disabled">
                                · {duration}
                              </Typography>
                            )}
                          </Stack>
                        ) : (
                          <Chip
                            label="Time not set"
                            size="small"
                            color="warning"
                            variant="soft"
                            sx={{ justifySelf: { xs: 'start', sm: 'end' } }}
                          />
                        )}
                      </Stack>
                    );
                  })}
                </Stack>
              </Box>
            );
          })}
        </Box>
      )}
    </Paper>
  );
}
