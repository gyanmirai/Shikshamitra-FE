import type { ReactNode } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { FormSectionCard } from 'src/components/form-section-card';

import { formatPlanSchedules } from './workflow-utils';

import type { GuidedStepProps } from './types';

export function WorkflowSummary({ workspace, workflow }: GuidedStepProps) {
  const plan = workflow.selectedPlan;
  const selectedCapacity =
    plan?.availableRooms
      .filter((room) => workflow.formik.values.selectedRoomIds.includes(room.roomId))
      .reduce((total, room) => total + room.usableCapacity, 0) ?? 0;
  const allocatedStudents = workflow.preview?.assignments.length ?? plan?.allocatedStudents ?? 0;
  const pendingStudents = Math.max(0, (plan?.totalStudents ?? 0) - allocatedStudents);

  return (
    <Stack
      component="aside"
      aria-label="Seating plan summary"
      spacing={1.5}
      sx={{
        display: { xs: 'none', lg: 'flex' },
        width: 280,
        flexShrink: 0,
        p: 2,
        borderLeft: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.neutral',
        overflowY: 'auto',
      }}
    >
      <FormSectionCard icon="mdi:clipboard-text-outline" title="Examination">
        <Stack spacing={1}>
          <Typography variant="subtitle2">{workspace.examName}</Typography>
          <Typography variant="caption" color="text.secondary">
            {workspace.standardName}
          </Typography>
          <SummaryRow
            label="Subjects"
            value={`${workflow.readiness.plannedSubjectCount}/${workflow.readiness.totalSubjectCount}`}
          />
          <SummaryRow
            label="Plans ready"
            value={`${workflow.readiness.readyPlanCount}/${workflow.readiness.totalPlanCount}`}
          />
          <SummaryRow
            label="Saved seats"
            value={`${workflow.readiness.allocatedStudentSeats}/${workflow.readiness.totalStudentSeats}`}
          />
          <SummaryRow label="State" value={workflow.isPublished ? 'Published' : 'Draft'} />
        </Stack>
      </FormSectionCard>
      {plan ? (
        <FormSectionCard icon="mdi:seat" title="Selected plan">
          <Stack spacing={1}>
            <SummaryRow label="Plan" value={plan.name} />
            <SummaryRow
              label="Subjects"
              value={plan.subjects.map((subject) => subject.subjectName).join(', ')}
            />
            <SummaryRow
              label="Schedule"
              value={<ScheduleValue value={formatPlanSchedules(plan.subjects)} />}
            />
            <SummaryRow label="Students" value={plan.totalStudents} />
            <SummaryRow label="Proposed" value={allocatedStudents} />
            <SummaryRow label="Rooms" value={workflow.formik.values.selectedRoomIds.length} />
            <SummaryRow label="Usable seats" value={selectedCapacity} />
            <SummaryRow label="Unallocated" value={pendingStudents} />
          </Stack>
        </FormSectionCard>
      ) : null}
    </Stack>
  );
}

function ScheduleValue({ value }: { value: string }) {
  const separatorIndex = value.indexOf(' · ');
  if (separatorIndex < 0) return value;

  return (
    <Stack spacing={0} alignItems="flex-end">
      <Box component="span">{value.slice(0, separatorIndex)}</Box>
      <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>
        {value.slice(separatorIndex + 3)}
      </Box>
    </Stack>
  );
}

export function SummaryRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '88px minmax(0, 1fr)',
        columnGap: 1,
        alignItems: 'start',
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
        {label}
      </Typography>
      <Typography
        component="div"
        variant="body2"
        fontWeight={600}
        textAlign="right"
        sx={{ minWidth: 0, lineHeight: 1.5, overflowWrap: 'anywhere' }}
      >
        {value}
      </Typography>
    </Box>
  );
}
