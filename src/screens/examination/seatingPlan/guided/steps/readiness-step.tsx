import Link from 'next/link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import AlertTitle from '@mui/material/AlertTitle';
import { academicPaths } from 'src/constants/academic-menu';

import { formatSession } from '../workflow-utils';

import type { GuidedStepProps } from '../types';

export function ReadinessStep({ workspace }: GuidedStepProps) {
  const issues = workspace.sessions.flatMap((session) => session.issues);
  const blockers = issues.filter((issue) => issue.severity === 'blocker');
  const canStart = workspace.sessions.some(
    (session) => session.seatingPlanId || session.canPrepare
  );

  return (
    <Stack spacing={2.5} sx={{ p: { xs: 2, md: 3 }, maxWidth: 880 }}>
      <Stack spacing={0.75}>
        <Typography variant="h5">Check the essentials first</Typography>
        <Typography color="text.secondary">
          We checked schedules, eligible students, rooms, and older overlapping plans before any
          seating is changed.
        </Typography>
      </Stack>

      <Alert severity={canStart ? 'success' : 'warning'} variant="outlined">
        <AlertTitle>{canStart ? 'Ready to begin' : 'Action is required'}</AlertTitle>
        {canStart
          ? `${workspace.sessions.length} examination session${workspace.sessions.length === 1 ? '' : 's'} found. You can prepare each time slot independently.`
          : `${blockers.length} blocking issue${blockers.length === 1 ? '' : 's'} must be resolved before seating can be prepared.`}
      </Alert>

      <Stack spacing={1.25}>
        {workspace.sessions.map((session) => (
          <Alert
            key={session.sessionKey}
            severity={session.seatingPlanId || session.canPrepare ? 'info' : 'warning'}
            variant="outlined"
          >
            <AlertTitle>{formatSession(session)}</AlertTitle>
            {session.subjects.map((subject) => subject.subjectName).join(', ')} ·{' '}
            {session.totalStudents} students · {session.availableRooms.length} rooms available
            {session.issues.map((issue) => (
              <Typography key={issue.code} variant="body2" sx={{ mt: 0.75 }}>
                {issue.title}: {issue.message}
              </Typography>
            ))}
          </Alert>
        ))}
      </Stack>

      {!canStart && (
        <Button
          component={Link}
          href={academicPaths.examination.schedule}
          variant="outlined"
          sx={{ alignSelf: 'flex-start', minHeight: 44 }}
        >
          Open examination schedule
        </Button>
      )}
    </Stack>
  );
}
