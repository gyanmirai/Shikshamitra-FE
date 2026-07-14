import { Iconify } from 'src/components/iconify';
import { Box, Drawer, Button, Divider, Typography, IconButton, LinearProgress } from '@mui/material';

import CapacityBadge from '../common/CapacityBadge';
import AllocationStatusBadge from '../common/AllocationStatusBadge';

import type { SeatingPlanListRow } from '../../types';

interface Props {
  row: SeatingPlanListRow | null;
  onClose: () => void;
  onPrimaryAction: (row: SeatingPlanListRow) => void;
}

export default function SeatingPlanPreviewDrawer({ row, onClose, onPrimaryAction }: Props) {
  return (
    <Drawer anchor="right" open={!!row} onClose={onClose} PaperProps={{ sx: { width: 380, p: 2.5 } }}>
      {row && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h6">{row.examName}</Typography>
              <Typography variant="body2" color="text.secondary">
                {row.examTypeName} · {row.standardName}
              </Typography>
            </Box>
            <IconButton size="small" onClick={onClose}>
              <Iconify icon="mdi:close" width={18} />
            </IconButton>
          </Box>

          <AllocationStatusBadge status={row.status} />

          <Divider />

          <Box>
            <Typography variant="caption" color="text.secondary">
              Allocation progress
            </Typography>
            <Typography variant="body2" fontWeight={700}>
              {row.allocatedStudents} / {row.totalStudents} allocated ({row.progress}%)
            </Typography>
            <LinearProgress
              variant="determinate"
              value={row.progress}
              color={row.status === 'needs-attention' ? 'error' : 'success'}
              sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 3 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Pending
              </Typography>
              <Typography variant="subtitle2">{row.pendingStudents}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Rooms used
              </Typography>
              <Typography variant="subtitle2">{row.roomsUsed}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Divisions
              </Typography>
              <Typography variant="subtitle2">{row.divisions.join(', ') || '—'}</Typography>
            </Box>
          </Box>

          <CapacityBadge status={row.capacityStatus} />

          <Box sx={{ flex: 1 }} />

          <Button variant="contained" fullWidth onClick={() => onPrimaryAction(row)}>
            Open Seating Plan
          </Button>
        </Box>
      )}
    </Drawer>
  );
}
