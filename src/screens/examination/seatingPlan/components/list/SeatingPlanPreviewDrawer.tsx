import { Iconify } from 'src/components/iconify';
import {
  Box,
  Drawer,
  Button,
  Divider,
  Typography,
  IconButton,
  LinearProgress,
} from '@mui/material';

import AllocationStatusBadge from '../common/AllocationStatusBadge';
import { getSeatingPlanPrimaryAction } from './seating-plan-actions';

import type { SeatingPlanListRow } from '../../types';

interface Props {
  row: SeatingPlanListRow | null;
  onClose: () => void;
  onPrimaryAction: (row: SeatingPlanListRow) => void;
}

export default function SeatingPlanPreviewDrawer({ row, onClose, onPrimaryAction }: Props) {
  return (
    <Drawer
      anchor="right"
      open={!!row}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 380 },
          maxWidth: '100vw',
          p: { xs: 2, sm: 2.5 },
        },
      }}
    >
      {row && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, height: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h6">{row.examName}</Typography>
              <Typography variant="body2" color="text.secondary">
                {row.examTypeName} · {row.standardName}
              </Typography>
            </Box>
            <IconButton aria-label="Close seating plan preview" size="small" onClick={onClose}>
              <Iconify icon="mdi:close" width={18} />
            </IconButton>
          </Box>

          <AllocationStatusBadge status={row.status} />

          <Typography variant="body2">
            {row.subjectNames.join(', ') || 'No subjects are scheduled for this examination.'}
          </Typography>

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

          <Box sx={{ display: 'flex', gap: 1 }}>
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

          <Typography variant="body2" color="text.secondary">
            {row.plannedSubjectCount} of {row.subjectCount} subjects are assigned across{' '}
            {row.seatingPlanCount} seating plan{row.seatingPlanCount === 1 ? '' : 's'}.
          </Typography>

          {row.blockingIssueCount > 0 && (
            <Typography variant="body2" color="warning.dark">
              {row.blockingIssueCount} readiness issue
              {row.blockingIssueCount === 1 ? '' : 's'} need attention.
            </Typography>
          )}

          <Box sx={{ flex: 1 }} />

          <Button
            variant="contained"
            fullWidth
            startIcon={<Iconify icon={getSeatingPlanPrimaryAction(row.status).icon} />}
            onClick={() => onPrimaryAction(row)}
            sx={{ minHeight: 44 }}
          >
            {getSeatingPlanPrimaryAction(row.status).label}
          </Button>
        </Box>
      )}
    </Drawer>
  );
}
