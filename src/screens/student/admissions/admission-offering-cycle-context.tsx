import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';

import { Label } from 'src/components/label';
import { formatDateOnly } from 'src/utils/date-only';
import { Paper, Stack, Typography } from '@mui/material';

type Props = { cycle: AdmissionCycle; showCode?: boolean };

const cycleStatusLabels = ['Draft', 'Published', 'Closed', 'Archived'] as const;
const cycleStatusColors = ['default', 'success', 'warning', 'default'] as const;

export function AdmissionOfferingCycleContext({ cycle, showCode = true }: Props) {
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
            {cycle.academicYearName || 'Academic year'}
            {showCode && ` · ${cycle.code}`}
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
