'use client';

import { LoadingButton } from '@mui/lab';
import { Iconify } from 'src/components/iconify';
import {
  Box,
  Chip,
  Alert,
  Drawer,
  Divider,
  IconButton,
  Typography,
} from '@mui/material';

import type { SubjectCapacityRow } from '../types';

interface ReviewAndLockDrawerProps {
  open: boolean;
  onClose: () => void;
  total: number;
  assigned: number;
  unassigned: number;
  subjectCapacity: SubjectCapacityRow[];
  preferenceMatchPct: number | null;
  canLock: boolean;
  isLocking: boolean;
  onConfirmLock: () => void;
}

export default function ReviewAndLockDrawer({
  open,
  onClose,
  total,
  assigned,
  unassigned,
  subjectCapacity,
  preferenceMatchPct,
  canLock,
  isLocking,
  onConfirmLock,
}: ReviewAndLockDrawerProps) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: 1, sm: 440 } } }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">Review and Lock</Typography>
        <IconButton onClick={onClose}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </Box>
      <Divider />

      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {!canLock && (
          <Alert severity="error" icon={<Iconify icon="solar:danger-triangle-bold-duotone" />}>
            {unassigned} student{unassigned === 1 ? '' : 's'} still need an elective assignment.
            Assign and save before locking.
          </Alert>
        )}

        <Box>
          <Typography variant="overline" color="text.secondary">
            Summary
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mt: 0.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Total students</Typography>
              <Typography variant="body2" fontWeight={600}>
                {total}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Assigned</Typography>
              <Typography variant="body2" fontWeight={600} color="success.main">
                {assigned}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Unassigned</Typography>
              <Typography variant="body2" fontWeight={600} color={unassigned > 0 ? 'error.main' : 'text.primary'}>
                {unassigned}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">Preference match</Typography>
              <Typography variant="body2" fontWeight={600}>
                {preferenceMatchPct === null ? 'N/A' : `${preferenceMatchPct}%`}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box>
          <Typography variant="overline" color="text.secondary">
            Subject-wise counts
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 0.5 }}>
            {subjectCapacity.map((s) => (
              <Chip
                key={s.subjectId}
                size="small"
                variant="soft"
                label={`${s.subjectName}: ${s.assignedCount}`}
              />
            ))}
          </Box>
        </Box>

        <Alert severity="warning" icon={<Iconify icon="solar:lock-bold-duotone" />}>
          Locking will prevent normal editing. Future changes must follow the reassignment workflow.
        </Alert>

        <LoadingButton
          variant="contained"
          color="error"
          size="large"
          disabled={!canLock}
          loading={isLocking}
          startIcon={<Iconify icon="mdi:lock-outline" />}
          onClick={onConfirmLock}
        >
          Lock Elective Assignments
        </LoadingButton>
      </Box>
    </Drawer>
  );
}
