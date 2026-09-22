import type { AdmissionWorkflow } from 'src/redux/student/admissions/admission-workflows-api';

import { Iconify } from 'src/components/iconify';
import { MenuItem, MenuList } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';

export type WorkflowActionPermissions = {
  canEdit: boolean;
  canDelete: boolean;
  canClone: boolean;
  canCreateVersion: boolean;
  canArchive: boolean;
  canViewUsage: boolean;
};

type Props = WorkflowActionPermissions & {
  workflow: AdmissionWorkflow;
  onView: () => void;
  onEdit: () => void;
  onClone: () => void;
  onCreateVersion: () => void;
  onUsage: () => void;
  onArchive: () => void;
  onDelete: () => void;
};

export function WorkflowRowActions({
  workflow,
  canEdit,
  canDelete,
  canClone,
  canCreateVersion,
  canArchive,
  canViewUsage,
  onView,
  onEdit,
  onClone,
  onCreateVersion,
  onUsage,
  onArchive,
  onDelete,
}: Props) {
  const item = (label: string, icon: string, action: () => void, color?: string) => (
    <MenuItem aria-label={`${label} ${workflow.name}`} onClick={action}>
      <Iconify icon={icon} color={color} /> {label}
    </MenuItem>
  );
  return (
    <ThreeDotsActions
      placement="right-top"
      moreLabel={`More actions for ${workflow.name}`}
      showViewIcon
      viewIcon="mdi:eye-outline"
      viewLabel={`Preview ${workflow.name}`}
      handleViewClick={onView}
      showEditIcon={canEdit}
      editLabel={`Edit ${workflow.name}`}
      disableEditIcon={workflow.status !== 0}
      handleEditClick={onEdit}
      showDeleteIcon={canDelete}
      deleteLabel={`Delete ${workflow.name}`}
      disableDeleteIcon={workflow.status !== 0}
      handleDeleteClick={onDelete}
      actions={({ popover }) => {
        const run = (action: () => void) => {
          popover.onClose();
          action();
        };
        return (
          <MenuList dense>
            {canClone && item('Clone as draft', 'mdi:content-copy', () => run(onClone))}
            {canCreateVersion &&
              [1, 2, 7].includes(workflow.status) &&
              item('Create new version', 'mdi:file-plus-outline', () => run(onCreateVersion))}
            {canViewUsage && item('View usage', 'mdi:chart-box-outline', () => run(onUsage))}
            {canArchive &&
              [1, 7].includes(workflow.status) &&
              item('Archive', 'mdi:archive-outline', () => run(onArchive), 'warning.main')}
          </MenuList>
        );
      }}
    />
  );
}
