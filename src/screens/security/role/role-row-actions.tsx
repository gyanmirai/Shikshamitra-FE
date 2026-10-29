import type { RootState } from 'src/redux/store';
import type { AdaptiveThreeDotsAction } from 'src/components/adaptive-three-dots-actions';

import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { hasGrantedPermission } from 'src/utils/permissions';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';

import type { RoleRecord, RoleDialogState } from './role-form-values';

export type RoleActionHandler = (type: RoleDialogState['type'], role: RoleRecord) => void;

export default function RoleRowActions({
  role,
  onAction,
}: {
  role: RoleRecord;
  onAction: RoleActionHandler;
}) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const actions: AdaptiveThreeDotsAction[] = [];
  if (hasGrantedPermission(permissions, 'AbpIdentity.Roles.ManagePermissions'))
    actions.push(
      {
        id: 'visibility',
        label: `Set Module Visibility for ${role.name}`,
        tooltip: 'Set Module Visibility',
        icon: GlobalIcons.eye,
        onClick: () => onAction('visibility', role),
      },
      {
        id: 'permissions',
        label: `Manage Permissions for ${role.name}`,
        tooltip: 'Manage Permissions',
        icon: GlobalIcons.lockIcon,
        onClick: () => onAction('permissions', role),
      }
    );
  if (hasGrantedPermission(permissions, 'AbpIdentity.Roles.Update'))
    actions.push({
      id: 'edit',
      label: `Edit ${role.name}`,
      icon: GlobalIcons.edit,
      onClick: () => onAction('form', role),
    });
  if (hasGrantedPermission(permissions, 'AbpIdentity.Roles.Delete'))
    actions.push({
      id: 'delete',
      label: `Delete ${role.name}`,
      icon: GlobalIcons.delete,
      color: 'error.main',
      onClick: () => onAction('delete', role),
    });

  return (
    <AdaptiveThreeDotsActions
      actions={actions}
      moreLabel={`More actions for ${role.name}`}
      directActionLimit={2}
      collapseOnOverflow={false}
      placement="left-center"
      sx={{ justifyContent: 'flex-end' }}
    />
  );
}
