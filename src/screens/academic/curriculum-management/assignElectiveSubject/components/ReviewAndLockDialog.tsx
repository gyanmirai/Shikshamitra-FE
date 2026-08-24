'use client';

import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogActions from '@mui/material/DialogActions';
import { Box, Chip, Alert, Typography } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import type { SubjectCapacityRow } from '../types';

interface ReviewAndLockDialogProps {
  open: boolean;
  onClose: () => void;
  total: number;
  assigned: number;
  unassigned: number;
  subjectCapacity: SubjectCapacityRow[];
  preferenceMatchPct: number | null;
  canLock: boolean;
  hasUnsavedChanges: boolean;
  isLocked: boolean;
  isLocking: boolean;
  onConfirmLock: () => void;
}

export default function ReviewAndLockDialog({
  open,
  onClose,
  total,
  assigned,
  unassigned,
  subjectCapacity,
  preferenceMatchPct,
  canLock,
  hasUnsavedChanges,
  isLocked,
  isLocking,
  onConfirmLock,
}: ReviewAndLockDialogProps) {
  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      title={
        <Box display="flex" flexDirection="row" gap={1} alignItems="center" component="span">
          <Box component="span" sx={{ fontWeight: 700, fontSize: '1.15rem' }}>
            Review and Lock
          </Box>
          <CustomTooltip
            arrow
            placement="right"
            title="Review elective subject allocation details and lock the assignments for this class."
          >
            <Iconify icon={GlobalIcons.info} sx={{ cursor: 'pointer' }} color="info.main" width={16} height={16} />
          </CustomTooltip>
        </Box>
      }
      maxWidth="sm"
      hasForm={false}
    >
      <DialogScrollContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {isLocked ? (
            <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold-duotone" />}>
              These elective assignments are locked and cannot be modified.
            </Alert>
          ) : unassigned > 0 ? (
            <Alert severity="error" icon={<Iconify icon="solar:danger-triangle-bold-duotone" />}>
              {unassigned} student{unassigned === 1 ? '' : 's'} still need an elective assignment.
              Assign and save before locking.
            </Alert>
          ) : hasUnsavedChanges ? (
            <Alert severity="warning" icon={<Iconify icon="solar:danger-triangle-bold-duotone" />}>
              You have unsaved changes. Save the draft before locking.
            </Alert>
          ) : total === 0 ? (
            <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold-duotone" />}>
              No students found for this elective group.
            </Alert>
          ) : null}

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
        </Box>
      </DialogScrollContent>
      <DialogActions>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={onClose}
          variant="outlined"
          size="small"
        >
          Cancel
        </Button>
        <LoadingButton
          variant="contained"
          color="error"
          size="small"
          disabled={!canLock}
          loading={isLocking}
          startIcon={<Iconify icon={GlobalIcons.lockIcon} />}
          onClick={onConfirmLock}
        >
          Lock Elective Assignments
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
  );
}
