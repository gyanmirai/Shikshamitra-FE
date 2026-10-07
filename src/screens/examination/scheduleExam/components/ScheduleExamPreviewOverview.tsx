import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Chip, Grid, Paper, Stack, Divider, Typography } from '@mui/material';

type OverviewProps = {
  className: string;
  createdBy: string;
  divisions: string[];
  examType: string;
  gradingScale: string;
};

type StatusSummaryProps = {
  issueCount: number;
  subjectCount: number;
  warningCount: number;
};

export function ScheduleExamPreviewOverview({
  className,
  createdBy,
  divisions,
  examType,
  gradingScale,
}: OverviewProps) {
  const items = [
    { label: 'Exam type', value: examType },
    { label: 'Class', value: className },
    { label: 'Divisions', value: divisions.length ? divisions.join(', ') : '-' },
    { label: 'Grading scale', value: gradingScale },
    { label: 'Created by', value: createdBy },
  ];

  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, boxShadow: 'var(--shadows-2)' }}>
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ letterSpacing: 0.8, lineHeight: 1.5, display: 'block', mb: 1 }}
      >
        Exam overview
      </Typography>

      <Grid container columnSpacing={2} rowSpacing={1.5}>
        {items.map((item) => (
          <Grid key={item.label} size={{ xs: 12, sm: 4 }}>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.25 }}>
              {item.label}
            </Typography>
            <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
              {item.value || '-'}
            </Typography>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}

const summaryItems = ({ issueCount, subjectCount, warningCount }: StatusSummaryProps) => [
  {
    icon: GlobalIcons.notebook,
    label: 'Subjects',
    value: subjectCount,
  },
  {
    icon: GlobalIcons.info,
    label: 'Issues',
    value: issueCount,
  },
  {
    icon: GlobalIcons.bell,
    label: 'Warnings',
    value: warningCount,
  },
];

export function ScheduleExamStatusSummary({
  issueCount,
  subjectCount,
  warningCount,
}: StatusSummaryProps) {
  const items = summaryItems({ issueCount, subjectCount, warningCount });

  return (
    <Paper
      variant="outlined"
      sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 'var(--shadows-2)' }}
    >
      <Stack direction="row" divider={<Divider orientation="vertical" flexItem />}>
        {items.map((item) => (
          <Stack
            key={item.label}
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={0.5}
            sx={{ flex: 1, minWidth: 0, p: 1.5 }}
          >
            <Iconify
              icon={item.icon}
              width={16}
              height={16}
              sx={{ color: 'text.secondary', flexShrink: 0 }}
            />
            <Typography variant="body2" sx={{ fontSize: { xs: 12, sm: 14 }, whiteSpace: 'nowrap' }}>
              <strong>{item.value}</strong> {item.label}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
}
