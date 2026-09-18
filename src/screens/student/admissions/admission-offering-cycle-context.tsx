import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';

import { Paper, Stack, Typography } from '@mui/material';
import { Label } from 'src/components/label';
import { formatDateOnly } from 'src/utils/date-only';

type Props = { cycle: AdmissionCycle };

const cycleStatusLabels = ['Draft', 'Published', 'Closed', 'Archived'] as const;
const cycleStatusColors = ['default', 'success', 'warning', 'default'] as const;

export function AdmissionOfferingCycleContext({ cycle }: Props) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        alignItems={{ sm: 'center' }}
        justifyContent="space-between"
      >
        <Stack spacing={0.25}>
          <Typography variant="subtitle2">{cycle.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {cycle.academicYearName || 'Academic year'} · {cycle.code}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Cycle window: {formatDateOnly(cycle.startDate, 'DD MMM YYYY')} –{' '}
            {formatDateOnly(cycle.endDate, 'DD MMM YYYY')}
          </Typography>
        </Stack>
        <Label color={cycleStatusColors[cycle.status]}>{cycleStatusLabels[cycle.status]}</Label>
      </Stack>
    </Paper>
  );
}
