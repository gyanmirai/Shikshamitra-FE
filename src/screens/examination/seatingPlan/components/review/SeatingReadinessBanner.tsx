import { Box, Stack, Paper, Typography, LinearProgress } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';

interface Props {
  blockers: number;
  warnings: number;
  allocationProgress: number;
}

export default function SeatingReadinessBanner({ blockers, warnings, allocationProgress }: Props) {
  let severity: 'success' | 'warning' | 'error' = 'success';
  let title = 'Ready to Finalize';
  let icon = 'solar:check-circle-bold';
  let description = 'All validation rules pass. The plan can now be finalized and locked.';

  if (blockers > 0) {
    severity = 'error';
    title = 'Action Required — Blockers Detected';
    icon = 'solar:danger-triangle-bold';
    description = `There ${blockers === 1 ? 'is' : 'are'} ${blockers} blocker issue${blockers === 1 ? '' : 's'} preventing finalization. Please resolve unallocated seats or room capacity issues.`;
  } else if (allocationProgress < 100) {
    severity = 'warning';
    title = 'Incomplete Allocation';
    icon = 'solar:info-circle-bold';
    description = `${allocationProgress}% of students allocated. Assign all students to seats before finalizing.`;
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 1.5,
        bgcolor: (theme) => alpha(theme.palette[severity].main, 0.05),
        borderColor: (theme) => alpha(theme.palette[severity].main, 0.3),
        boxShadow: (theme) => `0 6px 18px -12px ${alpha(theme.palette[severity].main, 0.35)}`,
      }}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.25,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: `${severity}.main`,
              bgcolor: (theme) => alpha(theme.palette[severity].main, 0.12),
              flexShrink: 0,
            }}
          >
            <Iconify icon={icon} width={22} height={22} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle2" fontWeight={700} color={`${severity}.dark`}>
                {title}
              </Typography>
              <Typography variant="caption" fontWeight={700} color={`${severity}.main`}>
                {allocationProgress}% Allocated
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {description}
            </Typography>
          </Box>
        </Stack>

        <LinearProgress
          variant="determinate"
          value={allocationProgress}
          color={severity}
          sx={{ height: 6, borderRadius: 3 }}
        />
      </Stack>
    </Paper>
  );
}

