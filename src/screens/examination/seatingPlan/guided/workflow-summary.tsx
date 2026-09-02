import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

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
      }}
    >
      <Stack spacing={0.25}>
        <Typography variant="overline" color="text.secondary">
          Examination progress
        </Typography>
        <Typography variant="subtitle1">{workspace.examName}</Typography>
        <Typography variant="body2" color="text.secondary">
          {workspace.standardName}
        </Typography>
      </Stack>
      <Divider />
      <SummaryRow
        label="Subjects"
        value={`${workflow.readiness.plannedSubjectCount}/${workflow.readiness.totalSubjectCount}`}
      />
      <SummaryRow
        label="Plans ready"
        value={`${workflow.readiness.readyPlanCount}/${workflow.readiness.totalPlanCount}`}
      />
      <SummaryRow
        label="Seats"
        value={`${workflow.readiness.allocatedStudentSeats}/${workflow.readiness.totalStudentSeats}`}
      />
      <SummaryRow label="State" value={workflow.isPublished ? 'Published' : 'Draft'} />
      {plan ? (
        <>
          <Divider />
          <SummaryRow label="Plan" value={plan.name} />
          <SummaryRow
            label="Subjects"
            value={plan.subjects.map((subject) => subject.subjectName).join(', ')}
          />
          <SummaryRow label="Schedule" value={formatPlanSchedules(plan.subjects)} />
          <SummaryRow label="Students" value={plan.totalStudents} />
          <SummaryRow label="Proposed" value={allocatedStudents} />
          <SummaryRow label="Rooms" value={workflow.formik.values.selectedRoomIds.length} />
          <SummaryRow label="Usable seats" value={selectedCapacity} />
          <SummaryRow label="Pending" value={pendingStudents} />
        </>
      ) : (
        <Typography variant="body2" color="text.secondary">
          {workflow.readiness.isReadyToPublish
            ? 'Every plan is ready. Review the whole examination and publish once.'
            : 'Choose an existing plan or select unplanned subjects for a new one.'}
        </Typography>
      )}
    </Stack>
  );
}

function SummaryRow({ label, value }: { label: string; value: string | number }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={1}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} textAlign="right">
        {value}
      </Typography>
    </Stack>
  );
}
