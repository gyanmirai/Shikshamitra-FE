'use client';

import Button from '@mui/material/Button';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import DialogActions from '@mui/material/DialogActions';
import { Box, Chip, Alert, Stack, Typography } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import {
  ReviewStatusIconBadge,
  type ReviewStatusIconTone,
} from './ReviewStatusIconBadge';

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
  const summaryItems: Array<{
    label: string;
    value: number | string;
    icon: string;
    tone: ReviewStatusIconTone;
  }> = [
    {
      label: 'Total students',
      value: total,
      icon: 'solar:users-group-rounded-bold-duotone',
      tone: 'info',
    },
    {
      label: 'Assigned',
      value: assigned,
      icon: 'solar:check-circle-bold-duotone',
      tone: 'success',
    },
    {
      label: 'Unassigned',
      value: unassigned,
      icon: 'solar:user-cross-rounded-bold-duotone',
      tone: unassigned > 0 ? 'error' : 'default',
    },
    {
      label: 'Preference match',
      value: preferenceMatchPct === null ? 'N/A' : `${preferenceMatchPct}%`,
      icon: 'solar:star-bold-duotone',
      tone: 'warning',
    },
  ];

  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      title={
        <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ReviewStatusIconBadge
            icon={GlobalIcons.lockIcon}
            tone="error"
            size={40}
            iconSize={22}
          />
          <Box component="span" sx={{ minWidth: 0 }}>
            <Box component="span" sx={{ display: 'block', fontWeight: 700, fontSize: '1.15rem' }}>
              Review and Lock
            </Box>
            <Box
              component="span"
              id="elective-lock-description"
              sx={{
                display: 'block',
                mt: 0.25,
                color: 'text.secondary',
                fontSize: '0.8rem',
                fontWeight: 400,
              }}
            >
              Confirm the final elective allocation before locking
            </Box>
          </Box>
        </Box>
      }
      maxWidth="sm"
      hasForm={false}
      disableClose={isLocking}
      aria-describedby="elective-lock-description"
      paperProps={{ sx: { maxWidth: 640 } }}
    >
      <DialogScrollContent sx={{ px: { xs: 2, sm: 2.5 }, py: 2.5 }}>
        <Stack spacing={2.5}>
          {isLocked ? (
            <Alert severity="info" icon={<Iconify icon="solar:lock-bold-duotone" />}>
              <Typography variant="subtitle2">Assignments are already locked</Typography>
              <Typography variant="body2" color="text.secondary">
                Future updates must use the reassignment workflow.
              </Typography>
            </Alert>
          ) : unassigned > 0 ? (
            <Alert severity="error" icon={<Iconify icon="solar:danger-triangle-bold-duotone" />}>
              <Typography variant="subtitle2">Assignment is incomplete</Typography>
              <Typography variant="body2">
                {unassigned} student{unassigned === 1 ? ' still needs' : 's still need'} an elective
                subject. Assign and save before locking.
              </Typography>
            </Alert>
          ) : hasUnsavedChanges ? (
            <Alert severity="warning" icon={<Iconify icon="solar:danger-triangle-bold-duotone" />}>
              <Typography variant="subtitle2">Save your latest changes</Typography>
              <Typography variant="body2">
                The current draft has unsaved changes. Save it before locking.
              </Typography>
            </Alert>
          ) : total === 0 ? (
            <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold-duotone" />}>
              <Typography variant="subtitle2">No students to lock</Typography>
              <Typography variant="body2">
                No students were found for this elective group.
              </Typography>
            </Alert>
          ) : (
            <Alert severity="success" icon={<Iconify icon="solar:check-circle-bold-duotone" />}>
              <Typography variant="subtitle2">Ready to lock</Typography>
              <Typography variant="body2">
                Every student has an elective assignment and all changes are saved.
              </Typography>
            </Alert>
          )}

          <Box component="section" aria-labelledby="assignment-summary-heading">
            <Stack direction="row" spacing={1} alignItems="center" mb={1.25}>
              <Iconify icon="solar:chart-square-bold-duotone" width={18} color="text.secondary" />
              <Typography id="assignment-summary-heading" variant="subtitle2">
                Assignment summary
              </Typography>
            </Stack>
            <Box
              sx={{
                display: 'grid',
                gap: 1,
                gridTemplateColumns: {
                  xs: 'repeat(2, minmax(0, 1fr))',
                  sm: 'repeat(4, minmax(0, 1fr))',
                },
              }}
            >
              {summaryItems.map((item) => (
                <Box
                  key={item.label}
                  sx={{
                    p: 1.5,
                    minWidth: 0,
                    border: 1,
                    borderRadius: 2,
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                  }}
                >
                  <Box sx={{ mb: 1 }}>
                    <ReviewStatusIconBadge icon={item.icon} tone={item.tone} />
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{ lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}
                  >
                    {item.value}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 0.25 }}
                  >
                    {item.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Box component="section" aria-labelledby="subject-counts-heading">
            <Stack direction="row" spacing={1} alignItems="center" mb={1.25}>
              <Iconify icon="solar:notebook-bold-duotone" width={18} color="text.secondary" />
              <Typography id="subject-counts-heading" variant="subtitle2">
                Students by elective subject
              </Typography>
            </Stack>
            {subjectCapacity.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {subjectCapacity.map((subject) => (
                  <Box
                    key={subject.subjectId}
                    sx={{
                      py: 0.75,
                      px: 1.25,
                      gap: 1.5,
                      minWidth: 150,
                      display: 'flex',
                      border: 1,
                      borderRadius: 1.5,
                      alignItems: 'center',
                      borderColor: 'divider',
                      justifyContent: 'space-between',
                      bgcolor: 'background.neutral',
                    }}
                  >
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {subject.subjectName}
                    </Typography>
                    <Chip
                      size="small"
                      color="primary"
                      variant="soft"
                      label={subject.assignedCount}
                      sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}
                    />
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No elective subject assignments are available.
              </Typography>
            )}
          </Box>

          <Alert severity="warning" icon={<Iconify icon="solar:lock-bold-duotone" />}>
            <Typography variant="subtitle2">Editing is restricted after locking</Typography>
            <Typography variant="body2">
              Any later changes must be completed through the reassignment workflow.
            </Typography>
          </Alert>
        </Stack>
      </DialogScrollContent>
      <DialogActions
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: 2,
          gap: 1,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          '& > :not(style) ~ :not(style)': { ml: 0 },
        }}
      >
        {isLocked ? (
          <Button
            onClick={onClose}
            variant="contained"
            size="medium"
            sx={{ minHeight: 42, minWidth: 104 }}
          >
            Done
          </Button>
        ) : (
          <>
            <Button
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={onClose}
              variant="outlined"
              size="medium"
              disabled={isLocking}
              sx={{ minHeight: 42, px: { xs: 1, sm: 2 }, whiteSpace: 'nowrap' }}
            >
              Keep Editing
            </Button>
            <Button
              variant="contained"
              color="error"
              size="medium"
              disabled={!canLock || isLocking}
              loading={isLocking}
              startIcon={<Iconify icon={GlobalIcons.lockIcon} />}
              onClick={onConfirmLock}
              sx={{
                minHeight: 42,
                minWidth: { xs: 0, sm: 220 },
                px: { xs: 1, sm: 2 },
                whiteSpace: 'nowrap',
              }}
            >
              Lock Assignments
            </Button>
          </>
        )}
      </DialogActions>
    </CustomDialog>
  );
}
