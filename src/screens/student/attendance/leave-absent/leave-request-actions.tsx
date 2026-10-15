import { MenuItem } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';

type LeaveRequestActionsProps = {
  studentName: string;
  onApprove: () => void;
  onReject: () => void;
  onEdit: () => void;
  editDisabled?: boolean;
};

export function LeaveRequestActions({
  studentName,
  onApprove,
  onReject,
  onEdit,
  editDisabled = false,
}: LeaveRequestActionsProps) {
  return (
    <ThreeDotsActions
      sx={{ justifyContent: 'flex-end' }}
      moreLabel={`More actions for ${studentName}`}
      directActions={[
        {
          id: 'approve',
          label: `Approve leave request for ${studentName}`,
          icon: GlobalIcons.tick,
          color: 'success.main',
          onClick: onApprove,
        },
        {
          id: 'reject',
          label: `Reject leave request for ${studentName}`,
          icon: GlobalIcons.reject,
          color: 'error.main',
          onClick: onReject,
        },
      ]}
      actions={({ popover }) => (
        <MenuItem
          aria-label={`Edit leave request for ${studentName}`}
          disabled={editDisabled}
          title={editDisabled ? 'Select a medium to edit a leave request.' : undefined}
          onClick={() => {
            if (editDisabled) return;
            popover.onClose();
            onEdit();
          }}
        >
          <Iconify icon={GlobalIcons.edit} width={16} sx={{ mr: 1 }} />
          Edit request
        </MenuItem>
      )}
    />
  );
}
