import type {
  AcademicInsightsSection,
  AcademicInsightsSectionKey,
} from 'src/redux/academicAPI/academicInsightsTypes';

import { Stack, Typography } from '@mui/material';
import { EmptyContent } from 'src/components/empty-content';

const emptyCopy: Record<AcademicInsightsSectionKey, [string, string]> = {
  classrooms: [
    'No class teacher mapping preview is available.',
    'Review class teacher assignments for the selected academic scope.',
  ],
  student360: [
    'No comparable student samples are available.',
    'Attendance and published scores will appear when matching records are available.',
  ],
  calendar: [
    'No upcoming calendar entries are available.',
    'Review the selected academic context and its calendar dates.',
  ],
  curriculum: [
    'No recorded chapter progress is available.',
    'Review subject and chapter setup in the permitted syllabus workflow.',
  ],
  lesson: [
    'No lesson plans are available.',
    'Review lesson plans for the selected academic scope.',
  ],
  timetable: [
    'No scheduled periods are available.',
    'Review timetable setup for the selected academic scope.',
  ],
  tasks: [
    'No published learning task schedules are available.',
    'Published homework and assignment schedules will appear here.',
  ],
  evaluation: [
    'No received submissions are available.',
    'The review distribution will appear after submissions are received.',
  ],
  exams: [
    'No exam stages or upcoming exams are available.',
    'Review examinations for the selected academic scope.',
  ],
  reports: [
    'No completed export jobs are available.',
    'Completed jobs from your permitted report families will appear here.',
  ],
  notifications: [
    'No notification templates are available.',
    'The read-only catalogue will appear when templates are returned.',
  ],
  audits: [
    'No academic audit events are available.',
    'Recorded academic activity will appear for the selected scope.',
  ],
  settings: [
    'No configuration records are available.',
    'Review the permitted setup workflows for the selected academic context.',
  ],
};

export function AcademicInsightEmptyState({ section }: { section: AcademicInsightsSection }) {
  const restricted = section.status === 'unavailable' || section.status === 'error';
  const [message, guidance] = emptyCopy[section.key];
  const reason =
    section.summary ||
    (section.status === 'error'
      ? 'This insight could not be loaded. Try again.'
      : 'This insight is unavailable for the selected scope.');

  if (!restricted) {
    return (
      <EmptyContent
        title={message}
        description={guidance}
        sx={{ py: 3, px: 2, height: 'auto' }}
        slotProps={{ img: { width: 1, maxWidth: 192, height: 'auto' } }}
      />
    );
  }

  return (
    <Stack spacing={1} sx={{ py: 2 }} role={section.status === 'error' ? 'status' : undefined}>
      <Typography variant="body2" color="text.secondary">
        {reason}
      </Typography>
    </Stack>
  );
}
