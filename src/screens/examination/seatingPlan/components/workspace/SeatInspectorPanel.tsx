import AllocationConflictPanel from './AllocationConflictPanel';
import { Box, Button, Typography } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import type { SeatingValidationIssue } from '../../types';

interface Props {
  blockers: SeatingValidationIssue[];
  warnings: SeatingValidationIssue[];
  onOpenRules: () => void;
}

export default function SeatInspectorPanel({
  blockers,
  warnings,
  onOpenRules,
}: Props) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 1.5, height: '100%', overflow: 'auto' }}>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2" fontWeight={700}>
            Rules & Conflicts
          </Typography>
          <Button size="small" startIcon={<Iconify icon="mdi:tune-variant" width={14} />} onClick={onOpenRules}>
            Rules
          </Button>
        </Box>
        <AllocationConflictPanel blockers={blockers} warnings={warnings} />
      </Box>
    </Box>
  );
}
