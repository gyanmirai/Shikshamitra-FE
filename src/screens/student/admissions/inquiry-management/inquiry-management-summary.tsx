import type { AdmissionInquiryManagement } from 'src/redux/student/admissions/admission-inquiry-management-api';

import { fDateTime } from 'src/utils/format-time';
import { StudentFeedback } from 'src/components/student-feedback';
import { Chip, Grid, Paper, Stack, Typography } from '@mui/material';

const outcomeLabels = [
  'Interested',
  'Pending',
  'Not interested',
  'Not interested',
  'Not interested',
];

export function InquiryManagementSummary({
  value,
  counsellorName,
}: {
  value: AdmissionInquiryManagement;
  counsellorName?: string | null;
}) {
  const facts = [
    {
      label: 'Counsellor',
      value: counsellorName || (value.assignedCounsellorId ? 'Assigned' : 'Unassigned'),
    },
    { label: 'Contacts', value: String(value.contactCount) },
    {
      label: 'First contact due',
      value: value.firstContactDueAt ? fDateTime(value.firstContactDueAt) : 'Not tracked',
    },
    {
      label: 'Qualification due',
      value: value.qualificationDueAt ? fDateTime(value.qualificationDueAt) : 'Not tracked',
    },
  ];
  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1} flexWrap="wrap">
        <Chip
          size="small"
          color={value.isOverdue ? 'error' : 'default'}
          label={value.isOverdue ? 'Action overdue' : 'On track'}
        />
        <Chip
          size="small"
          color={value.canStartApplication ? 'success' : 'warning'}
          label={
            value.isLocked
              ? 'Moved to Pipeline'
              : value.canStartApplication
                ? 'Ready for next stage'
                : 'Next stage unavailable'
          }
        />
        {value.outcome != null && (
          <Chip size="small" color="primary" label={outcomeLabels[value.outcome]} />
        )}
      </Stack>
      <Grid container spacing={1}>
        {facts.map((fact) => (
          <Grid key={fact.label} size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper variant="outlined" sx={{ p: 1.25, height: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {fact.label}
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {fact.value || '—'}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      {value.blockers.length > 0 && (
        <StudentFeedback notificationKey="STU-0415" presentation="persistent" severity="warning">
          <Typography variant="subtitle2">Before starting an application</Typography>
          {value.blockers.map((blocker) => (
            <Typography key={blocker} variant="body2">
              • {blocker}
            </Typography>
          ))}
        </StudentFeedback>
      )}
      {value.outcomeReason && (
        <StudentFeedback notificationKey="STU-0416" presentation="inline" severity="info">
          Latest status reason: {value.outcomeReason}
        </StudentFeedback>
      )}
      {value.qualificationEmailStatus && (
        <StudentFeedback notificationKey="STU-0417" presentation="inline" severity="info">
          Qualification email: {value.qualificationEmailStatus}
          {value.qualificationEmailMessage ? ` · ${value.qualificationEmailMessage}` : ''}
        </StudentFeedback>
      )}
    </Stack>
  );
}
