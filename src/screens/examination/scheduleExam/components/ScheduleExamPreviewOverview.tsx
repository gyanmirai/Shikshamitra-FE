import type { Theme } from '@mui/material/styles';

import { alpha } from '@mui/material/styles';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Chip, Grid, Paper, Stack, Divider, Typography } from '@mui/material';

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
    { label: 'Grading scale', value: gradingScale },
    { label: 'Created by', value: createdBy },
  ];

  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
      <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0.8 }}>
        Exam overview
      </Typography>

      <Grid container spacing={2.25} sx={{ mt: 0.25 }}>
        {items.map((item) => (
          <Grid key={item.label} size={{ xs: 6, sm: 3 }}>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
              {item.label}
            </Typography>
            <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
              {item.value || '-'}
            </Typography>
          </Grid>
        ))}

        <Grid size={{ xs: 12 }}>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.75 }}>
            Divisions
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={0.75}>
            {divisions.length ? (
              divisions.map((division) => (
                <Chip
                  key={division}
                  label={division}
                  size="small"
                  variant="soft"
                  sx={{ height: 26, fontWeight: 600 }}
                />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                -
              </Typography>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
}

const summaryItems = ({ issueCount, subjectCount, warningCount }: StatusSummaryProps) => [
  {
    icon: GlobalIcons.notebook,
    label: 'Subjects',
    value: subjectCount,
    color: 'primary.main',
    background: (theme: Theme) => alpha(theme.palette.primary.main, 0.1),
  },
  {
    icon: GlobalIcons.info,
    label: 'Issues',
    value: issueCount,
    color: issueCount ? 'error.main' : 'text.secondary',
    background: (theme: Theme) =>
      alpha(issueCount ? theme.palette.error.main : theme.palette.grey[500], 0.1),
  },
  {
    icon: GlobalIcons.bell,
    label: 'Warnings',
    value: warningCount,
    color: warningCount ? 'warning.main' : 'text.secondary',
    background: (theme: Theme) =>
      alpha(warningCount ? theme.palette.warning.main : theme.palette.grey[500], 0.1),
  },
];

export function ScheduleExamStatusSummary({
  issueCount,
  subjectCount,
  warningCount,
}: StatusSummaryProps) {
  const items = summaryItems({ issueCount, subjectCount, warningCount });

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Stack direction="row" divider={<Divider orientation="vertical" flexItem />}>
        {items.map((item) => (
          <Stack
            key={item.label}
            direction={{ xs: 'column', sm: 'row' }}
            alignItems="center"
            justifyContent="center"
            spacing={1.25}
            sx={{ flex: 1, minWidth: 0, px: 1.5, py: 1.75 }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.25,
                display: 'grid',
                placeItems: 'center',
                color: item.color,
                bgcolor: item.background,
                flexShrink: 0,
              }}
            >
              <Iconify icon={item.icon} width={19} height={19} />
            </Box>
            <Box sx={{ minWidth: 0, textAlign: { xs: 'center', sm: 'left' } }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {item.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {item.label}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
}
