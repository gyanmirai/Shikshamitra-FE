import type { RootState } from 'src/redux/store';
import type { AdaptiveThreeDotsAction } from 'src/components/adaptive-three-dots-actions';

import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { hasGrantedPermission } from 'src/utils/permissions';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';

import type { UserRecord, UserActionHandler } from './user-record';

export default function UserRowActions({
  user,
  onAction,
}: {
  user: UserRecord;
  onAction: UserActionHandler;
}) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const actions: AdaptiveThreeDotsAction[] = [];
  if (hasGrantedPermission(permissions, 'AbpIdentity.Users.ManagePermissions')) {
    actions.push(
      {
        id: 'visibility',
        label: `Set Module Visibility for ${user.userName}`,
        tooltip: 'Set Module Visibility',
        icon: GlobalIcons.eye,
        onClick: () => onAction('visibility', user),
      },
      {
        id: 'permissions',
        label: `Module Permission for ${user.userName}`,
        tooltip: 'Manage Permissions',
        icon: GlobalIcons.lockIcon,
        onClick: () => onAction('permissions', user),
      }
    );
  }
  if (hasGrantedPermission(permissions, 'ShikshaMitra.UserScope.Manage')) {
    actions.push({
      id: 'academic',
      label:
        actions.length < 2 ? `Academic Permission for ${user.userName}` : 'Academic Permission',
      icon: 'mdi:school-outline',
      onClick: () => onAction('academic', user),
    });
  }

  return (
    <AdaptiveThreeDotsActions
      actions={actions}
      moreLabel={`More actions for ${user.userName}`}
      directActionLimit={2}
      collapseOnOverflow={false}
      placement="left-center"
      sx={{ justifyContent: 'flex-end' }}
    />
  );
}
