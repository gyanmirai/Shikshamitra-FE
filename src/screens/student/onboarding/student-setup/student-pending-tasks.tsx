import { useState } from 'react';
import { Box, Stack, Button, Tooltip, Typography } from '@mui/material';

import type { StudentSetupView } from './student-setup-view';
import type { StudentOnboardingItem } from './student-onboarding-model';

export const pendingTaskView = (key: string): StudentSetupView => {
  if (key.includes('document')) return 'readiness';
  if (key.includes('fee') || key.includes('finance')) return 'fees';
  if (key.includes('account') || key.includes('credential')) return 'credentials';
  if (key.includes('roll')) return 'roll-number';
  if (key.includes('gr')) return 'gr-number';
  if (key.includes('placement') || key.includes('division')) return 'division';
  return 'readiness';
};

export default function StudentPendingTasks({
  student,
  onOpenTask,
  hovered = false,
  onKeepOpen,
  onLeave,
}: {
  student: StudentOnboardingItem;
  onOpenTask: (view: StudentSetupView) => void;
  hovered?: boolean;
  onKeepOpen?: () => void;
  onLeave?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const pending = student.readinessItems.filter(
    (item) =>
      ['pending', 'failed', 'not-connected'].includes(item.status) && item.key !== 'final_readiness'
  );
  const identifierIndex = pending.findIndex((item) => item.key.includes('identifiers'));
  if (identifierIndex >= 0 && (!student.grNo || !student.rollNo)) {
    const combined = pending[identifierIndex];
    pending.splice(
      identifierIndex,
      1,
      ...(!student.grNo ? [{ ...combined, key: 'gr_number', label: 'GR number' }] : []),
      ...(!student.rollNo ? [{ ...combined, key: 'roll_number', label: 'Roll number' }] : [])
    );
  }
  if (
    student.studentEnrollmentId &&
    student.credentialsPending &&
    !pending.some((item) => pendingTaskView(item.key) === 'credentials')
  ) {
    pending.push({
      key: 'credentials',
      label: 'App credentials',
      detail: 'Complete required app access and login emails.',
      status: 'pending',
      blocking: false,
      owner: 'Onboarding',
    });
  }
  return (
    <Tooltip
      open={hovered || open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      arrow
      placement="right"
      enterDelay={300}
      title={
        <Box
          onMouseEnter={onKeepOpen}
          onMouseLeave={onLeave}
          sx={{ p: 0.5, minWidth: 190, maxWidth: 300 }}
        >
          <Typography variant="subtitle2">{pending.length} pending items</Typography>
          <Stack spacing={0.5} sx={{ mt: 0.5 }}>
            {pending.map((item) => (
              <Button
                key={item.key}
                size="small"
                color="inherit"
                sx={{ justifyContent: 'flex-start' }}
                onClick={(event) => {
                  event.stopPropagation();
                  onOpenTask(pendingTaskView(item.key));
                }}
              >
                {item.label}
              </Button>
            ))}
          </Stack>
          {!pending.length && (
            <Typography variant="caption">All readiness items are complete.</Typography>
          )}
        </Box>
      }
    >
      <Button
        size="small"
        color="inherit"
        aria-expanded={hovered || open}
        aria-label={`View ${pending.length} pending items for ${student.studentName}`}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false);
        }}
      >
        {pending.length} pending
      </Button>
    </Tooltip>
  );
}
