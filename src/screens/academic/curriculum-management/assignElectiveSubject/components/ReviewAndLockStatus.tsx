import { Iconify } from 'src/components/iconify';
import { Alert, Typography } from '@mui/material';

interface ReviewAndLockStatusProps {
  isLocked: boolean;
  unassigned: number;
  hasUnsavedChanges: boolean;
  total: number;
}

export function ReviewAndLockStatus({
  isLocked,
  unassigned,
  hasUnsavedChanges,
  total,
}: ReviewAndLockStatusProps) {
  if (isLocked) {
    return (
      <Alert severity="info" icon={<Iconify icon="solar:lock-bold-duotone" />}>
        <Typography variant="subtitle2">Assignments are already locked</Typography>
        <Typography variant="body2" color="text.secondary">
          Future updates must use the reassignment workflow.
        </Typography>
      </Alert>
    );
  }

  if (unassigned > 0) {
    return (
      <Alert severity="error" icon={<Iconify icon="solar:danger-triangle-bold-duotone" />}>
        <Typography variant="subtitle2">Assignment is incomplete</Typography>
        <Typography variant="body2">
          {unassigned} student{unassigned === 1 ? ' still needs' : 's still need'} an elective
          subject. Assign and save before locking.
        </Typography>
      </Alert>
    );
  }

  if (hasUnsavedChanges) {
    return (
      <Alert severity="warning" icon={<Iconify icon="solar:danger-triangle-bold-duotone" />}>
        <Typography variant="subtitle2">Save your latest changes</Typography>
        <Typography variant="body2">
          The current draft has unsaved changes. Save it before locking.
        </Typography>
      </Alert>
    );
  }

  if (total === 0) {
    return (
      <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold-duotone" />}>
        <Typography variant="subtitle2">No students to lock</Typography>
        <Typography variant="body2">No students were found for this elective group.</Typography>
      </Alert>
    );
  }

  return (
    <Alert severity="success" icon={<Iconify icon="solar:check-circle-bold-duotone" />}>
      <Typography variant="subtitle2">Ready to lock</Typography>
      <Typography variant="body2">
        Every student has an elective assignment and all changes are saved.
      </Typography>
    </Alert>
  );
}
