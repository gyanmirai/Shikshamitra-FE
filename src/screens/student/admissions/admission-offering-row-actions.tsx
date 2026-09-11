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
  return (
    <ThreeDotsActions
      actions={({ popover }) => (
        <MenuList dense>
          <MenuItem
            onClick={() => {
              popover.onClose();
              actions.onView(row);
            }}
          >
            <Iconify icon={GlobalIcons.eye} sx={{ mr: 1 }} />
            View
          </MenuItem>
          {actions.canEdit && (
            <MenuItem
              onClick={() => {
                popover.onClose();
                actions.onEdit(row);
              }}
            >
              <Iconify icon={GlobalIcons.edit} sx={{ mr: 1 }} />
              {row.canEditIdentity ? 'Edit' : 'Edit operational configuration'}
            </MenuItem>
          )}
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
          {((row.isActive && actions.canDeactivate) || (!row.isActive && actions.canActivate)) && (
            <MenuItem
              onClick={() => {
                popover.onClose();
                actions.onToggleActive(row);
              }}
            >
              <Iconify
                icon={row.isActive ? GlobalIcons.lockIcon : GlobalIcons.publish}
                sx={{ mr: 1 }}
              />
              {row.isActive ? 'Deactivate' : 'Activate'}
            </MenuItem>
          )}
          {actions.canDelete && row.canDelete && (
            <MenuItem
              sx={{ color: 'error.main' }}
              onClick={() => {
                popover.onClose();
                actions.onDelete(row);
              }}
            >
              <Iconify icon={GlobalIcons.delete} sx={{ mr: 1 }} />
              Delete
            </MenuItem>
          )}
        </MenuList>
      )}
    />
  );
}
