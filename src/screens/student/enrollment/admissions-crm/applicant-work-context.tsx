import { Chip, Paper, Stack, Typography } from '@mui/material';
import {
  AdmissionCrmWorkUrgency,
  AdmissionCrmLeadPriority,
  AdmissionCrmRecommendedAction,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { formatEnrollmentDate } from './enrollment-display';

import type { ApplicantWorkContextItem } from './enrollment-workspace-context';

const actionLabels: Record<AdmissionCrmRecommendedAction, string> = {
  [AdmissionCrmRecommendedAction.OpenApplicant]: 'Open applicant',
  [AdmissionCrmRecommendedAction.CompleteTask]: 'Complete task',
  [AdmissionCrmRecommendedAction.ScheduleExam]: 'Schedule exam',
  [AdmissionCrmRecommendedAction.RecordAttendance]: 'Record attendance',
  [AdmissionCrmRecommendedAction.RescheduleExam]: 'Reschedule exam',
  [AdmissionCrmRecommendedAction.RecordResult]: 'Record result',
  [AdmissionCrmRecommendedAction.DecideEligibility]: 'Decide eligibility',
  [AdmissionCrmRecommendedAction.ReviewRegistration]: 'Review registration',
  [AdmissionCrmRecommendedAction.ReviewDocuments]: 'Review documents',
  [AdmissionCrmRecommendedAction.ReviewOffer]: 'Review offer',
  [AdmissionCrmRecommendedAction.RepairActivation]: 'Repair activation',
};

const priorityLabels: Record<AdmissionCrmLeadPriority, string> = {
  [AdmissionCrmLeadPriority.None]: 'No priority',
  [AdmissionCrmLeadPriority.Hot]: 'Hot priority',
  [AdmissionCrmLeadPriority.Warm]: 'Warm priority',
  [AdmissionCrmLeadPriority.Cold]: 'Cold priority',
  [AdmissionCrmLeadPriority.Low]: 'Low priority',
};

const urgencyLabels: Record<AdmissionCrmWorkUrgency, string> = {
  [AdmissionCrmWorkUrgency.Normal]: 'Normal',
  [AdmissionCrmWorkUrgency.DueSoon]: 'Due soon',
  [AdmissionCrmWorkUrgency.DueToday]: 'Due today',
  [AdmissionCrmWorkUrgency.Overdue]: 'Overdue',
};

export function ApplicantWorkContext({ workItem }: { workItem: ApplicantWorkContextItem }) {
  return (
    <Paper
      component="aside"
      aria-label="Current work"
      variant="outlined"
      sx={{ mx: 2, mb: 1, px: 1.5, py: 1.25, flexShrink: 0 }}
    >
      <Stack spacing={0.75}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          gap={0.5}
          alignItems={{ xs: 'flex-start', sm: 'baseline' }}
        >
          <Typography variant="overline" color="primary.main" sx={{ lineHeight: 1.4 }}>
            Current work
          </Typography>
          <Typography variant="subtitle2">{workItem.title}</Typography>
        </Stack>
        {workItem.details ? (
          <Typography variant="body2" color="text.secondary">
            {workItem.details}
          </Typography>
        ) : null}
        <Stack direction="row" gap={0.75} flexWrap="wrap">
          <Chip
            size="small"
            color="primary"
            variant="outlined"
            label={actionLabels[workItem.recommendedAction]}
          />
          <Chip
            size="small"
            color={
              workItem.urgency === AdmissionCrmWorkUrgency.Overdue
                ? 'error'
                : workItem.urgency === AdmissionCrmWorkUrgency.DueToday
                  ? 'warning'
                  : 'default'
            }
            variant="outlined"
            label={
              workItem.dueAt
                ? `${urgencyLabels[workItem.urgency]} · ${formatEnrollmentDate(workItem.dueAt, true)}`
                : urgencyLabels[workItem.urgency]
            }
          />
          <Chip size="small" variant="outlined" label={priorityLabels[workItem.priority]} />
          <Chip
            size="small"
            variant="outlined"
            label={`Assigned to ${workItem.assignedDisplayName || workItem.ownerDisplayName || 'you'}`}
          />
        </Stack>
      </Stack>
    </Paper>
  );
}
