import { MenuItem } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { GlobalIcons } from 'src/utils/icons';
import ThreeDotsActions from 'src/components/three-dots-actions';

type LeaveRequestActionsProps = {
  studentName: string;
  onApprove: () => void;
  onReject: () => void;
  onEdit: () => void;
};

export function LeaveRequestActions({
  studentName,
  onApprove,
  onReject,
  onEdit,
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
          onClick={() => {
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
