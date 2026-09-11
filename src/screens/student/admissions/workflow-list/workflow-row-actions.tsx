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
  onClone: () => void;
  onCreateVersion: () => void;
  onUsage: () => void;
  onArchive: () => void;
  onDelete: () => void;
};

export function WorkflowRowActions({ workflow, canEdit, canDelete, canClone, canCreateVersion, canArchive, canViewUsage, onView, onClone, onCreateVersion, onUsage, onArchive, onDelete }: Props) {
  const item = (label: string, icon: string, action: () => void, color?: string) => (
    <MenuItem onClick={action}><Iconify icon={icon} color={color} /> {label}</MenuItem>
  );
  return (
    <ThreeDotsActions
      placement="right-top"
      moreLabel={`More actions for ${workflow.name}`}
      showViewIcon
      viewIcon="mdi:eye-outline"
      viewLabel={workflow.status === 0 && canEdit ? 'Open builder' : 'View workflow'}
      handleViewClick={onView}
      actions={({ popover }) => {
        const run = (action: () => void) => { popover.onClose(); action(); };
        return (
          <MenuList>
            {canClone && item('Clone as draft', 'mdi:content-copy', () => run(onClone))}
            {canCreateVersion && workflow.status !== 0 && item('Create new version', 'mdi:file-plus-outline', () => run(onCreateVersion))}
            {canViewUsage && item('View usage', 'mdi:chart-box-outline', () => run(onUsage))}
            {canArchive && workflow.status === 1 && item('Archive', 'mdi:archive-outline', () => run(onArchive), 'warning.main')}
            {canDelete && workflow.status === 0 && item('Delete draft', 'mdi:delete-outline', () => run(onDelete), 'error.main')}
          </MenuList>
        );
      }}
    />
  );
}
