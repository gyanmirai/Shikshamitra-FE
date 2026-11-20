import type { LibraryPolicyVersion } from 'src/redux/library/policy-types';
import type { AdaptiveThreeDotsAction } from 'src/components/adaptive-three-dots-actions/types';

import { GlobalIcons } from 'src/utils/icons';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';

export type PolicyActionProps = {
  canEdit: boolean;
  canPublish: boolean;
  canManage: (item: LibraryPolicyVersion) => boolean;
  onOpen: (id: string, edit: boolean) => void;
  onLifecycle: (item: LibraryPolicyVersion, action: 'publish' | 'archive') => void;
};
export function PolicyRowActions({
  item,
  canEdit,
  canPublish,
  canManage,
  onOpen,
  onLifecycle,
}: PolicyActionProps & { item: LibraryPolicyVersion }) {
  const identity = `${item.name} version ${item.version}`;
  const publishBlocked = (item.terms.dueDateMode ?? 1) === 1 && !canPublish;
  const actions: AdaptiveThreeDotsAction[] = [
    {
      id: 'view',
      label: `View ${identity}`,
      icon: GlobalIcons.eye,
      onClick: () => onOpen(item.id, false),
    },
  ];
  if (canEdit && canManage(item)) {
    actions.push({
      id: 'edit',
      label: item.status === 0 ? `Edit ${identity}` : `Create next version of ${item.name}`,
      icon: item.status === 0 ? GlobalIcons.edit : GlobalIcons.newversion,
      onClick: () => onOpen(item.id, true),
    });
    if (item.status === 0)
      actions.push({
        id: 'publish',
        label: `Publish ${identity}`,
        icon: GlobalIcons.publish,
        disabled: publishBlocked,
        tooltip: !publishBlocked
          ? undefined
          : 'Configure the Library timezone and opening hours before publishing.',
        onClick: () => onLifecycle(item, 'publish'),
      });
    if (item.status === 1)
      actions.push({
        id: 'archive',
        label: `Archive ${identity}`,
        icon: GlobalIcons.archive,
        onClick: () => onLifecycle(item, 'archive'),
      });
  }
  return (
    <AdaptiveThreeDotsActions
      actions={actions}
      directActionLimit={2}
      collapseOnOverflow={false}
      moreLabel={`More actions for ${identity}`}
      sx={{ justifyContent: 'flex-end' }}
    />
  );
}
