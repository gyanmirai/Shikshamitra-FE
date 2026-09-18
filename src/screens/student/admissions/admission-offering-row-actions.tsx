import type { AdmissionOfferingListItem } from 'src/redux/student/admissions/admission-offerings-api';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { MenuItem, MenuList } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';

export type AdmissionOfferingActionProps = {
  canEdit: boolean;
  canClone: boolean;
  canActivate: boolean;
  canDeactivate: boolean;
  canDelete: boolean;
  onView: (row: AdmissionOfferingListItem) => void;
  onEdit: (row: AdmissionOfferingListItem) => void;
  onClone: (row: AdmissionOfferingListItem) => void;
  onToggleActive: (row: AdmissionOfferingListItem) => void;
  onDelete: (row: AdmissionOfferingListItem) => void;
};

type Props = AdmissionOfferingActionProps & { row: AdmissionOfferingListItem };

export function AdmissionOfferingRowActions({ row, ...actions }: Props) {
  const activationAllowed = row.canActivate || row.configurationStatus === 1;
  const hasOverflowActions =
    actions.canClone || (row.isActive ? actions.canDeactivate : actions.canActivate);

  return (
    <ThreeDotsActions
      showViewIcon
      viewIcon="mdi:eye-outline"
      viewLabel={`View ${row.code}`}
      handleViewClick={() => actions.onView(row)}
      showEditIcon={actions.canEdit}
      editLabel={`Edit ${row.code}`}
      handleEditClick={() => actions.onEdit(row)}
      showDeleteIcon={actions.canDelete}
      deleteLabel={`Delete ${row.code}`}
      disableDeleteIcon={!row.canDelete}
      handleDeleteClick={() => actions.onDelete(row)}
      showThreeDots={hasOverflowActions}
      moreLabel={`Actions for ${row.code}`}
      actions={({ popover }) => (
        <MenuList dense>
          {actions.canClone && (
            <MenuItem
              onClick={() => {
                popover.onClose();
                actions.onClone(row);
              }}
            >
              <Iconify icon={GlobalIcons.copy} sx={{ mr: 1 }} />
              Clone
            </MenuItem>
          )}
          {row.isActive && actions.canDeactivate && (
            <MenuItem
              onClick={() => {
                popover.onClose();
                actions.onToggleActive(row);
              }}
            >
              <Iconify icon={GlobalIcons.lockIcon} sx={{ mr: 1 }} />
              Deactivate
            </MenuItem>
          )}
          {!row.isActive && actions.canActivate && activationAllowed && (
            <MenuItem
              onClick={() => {
                popover.onClose();
                actions.onToggleActive(row);
              }}
            >
              <Iconify icon={GlobalIcons.publish} sx={{ mr: 1 }} />
              Activate
            </MenuItem>
          )}
          {!row.isActive && actions.canActivate && !activationAllowed && actions.canEdit && (
            <MenuItem
              onClick={() => {
                popover.onClose();
                actions.onEdit(row);
              }}
            >
              <Iconify icon="mdi:clipboard-edit-outline" sx={{ mr: 1 }} />
              Complete setup to activate
            </MenuItem>
          )}
          {!row.isActive && actions.canActivate && !activationAllowed && !actions.canEdit && (
            <MenuItem disabled>
              <Iconify icon="mdi:alert-circle-outline" sx={{ mr: 1 }} />
              Activation blocked by incomplete setup
            </MenuItem>
          )}
        </MenuList>
      )}
    />
  );
}
