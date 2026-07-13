import { Box, Chip } from '@mui/material';
import { Iconify } from 'src/components/iconify';

export default function SeatingIssueBadge({
  blockers,
  warnings,
}: {
  blockers: number;
  warnings: number;
}) {
  if (blockers === 0 && warnings === 0) {
    return (
      <Chip
        size="small"
        color="success"
        variant="soft"
        icon={<Iconify icon="mdi:check-circle-outline" width={14} />}
        label="No issues"
      />
    );
  }

  return (
    <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
      {blockers > 0 && (
        <Chip
          size="small"
          color="error"
          variant="soft"
          icon={<Iconify icon="mdi:alert-circle-outline" width={14} />}
          label={`${blockers} blocker${blockers > 1 ? 's' : ''}`}
        />
      )}
      {warnings > 0 && (
        <Chip
          size="small"
          color="warning"
          variant="soft"
          icon={<Iconify icon="mdi:alert-outline" width={14} />}
          label={`${warnings} warning${warnings > 1 ? 's' : ''}`}
        />
      )}
    </Box>
  );
}
