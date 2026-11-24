import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type { AdaptiveThreeDotsAction } from 'src/components/adaptive-three-dots-actions';

import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';

type Props = {
  form: AdmissionForm;
  canManage: boolean;
  canPublish: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onValidate: () => void;
  onPublish: () => void;
  onHistory: () => void;
  onCreateVersion: () => void;
  creatingVersion?: boolean;
  versionBusy?: boolean;
  onArchive: () => void;
  onRestore: () => void;
  onDelete: () => void;
};

export function getFormRowActionVisibility(
  status: AdmissionForm['status'],
  canManage: boolean,
  canPublish: boolean,
  canDelete: boolean
) {
  const isDraft = status === 0;
  const isPublished = status === 1;

  return {
    edit: canManage && isDraft,
    validate: canManage && isDraft,
    publish: canPublish && isDraft,
    delete: canDelete && isDraft,
    history: true,
    createVersion: canPublish && isPublished,
    archive: canManage && isPublished,
    restore: canManage && status === 2,
  };
}

export function FormRowActions({
  form,
  canManage,
  canPublish,
  canDelete,
  onEdit,
  onValidate,
  onPublish,
  onHistory,
  onCreateVersion,
  creatingVersion = false,
  versionBusy = false,
  onArchive,
  onRestore,
  onDelete,
}: Props) {
  const visible = getFormRowActionVisibility(form.status, canManage, canPublish, canDelete);
  const actions: AdaptiveThreeDotsAction[] = [];
  if (visible.edit)
    actions.push({
      id: 'edit',
      label: `Edit`,
      icon: 'solar:pen-bold',
      onClick: onEdit,
    });
  if (visible.publish)
    actions.push({
      id: 'publish',
      label: `Publish`,
      icon: 'mdi:publish',
      onClick: onPublish,
    });
  if (visible.delete)
    actions.push({
      id: 'delete',
      label: `Delete `,
      icon: 'solar:trash-bin-trash-bold',
      color: 'error.main',
      onClick: onDelete,
    });
  if (visible.validate)
    actions.push({
      id: 'validate',
      label: `Validate `,
      icon: 'mdi:check-decagram-outline',
      onClick: onValidate,
    });
  if (visible.createVersion)
    actions.push({
      id: 'new-version',
      label: `New Version`,
      icon: 'mdi:source-branch-plus',
      loading: creatingVersion,
      disabled: versionBusy,
      onClick: onCreateVersion,
    });
  if (visible.archive)
    actions.push({
      id: 'archive',
      label: `Archive `,
      icon: 'mdi:archive-outline',
      onClick: onArchive,
    });
  if (visible.restore)
    actions.push({
      id: 'restore',
      label: 'Restore',
      icon: 'mdi:restore',
      onClick: onRestore,
    });
  if (visible.history)
    actions.push({
      id: 'history',
      label: `History & Versions `,
      icon: 'mdi:history',
      onClick: onHistory,
    });

  return (
    <AdaptiveThreeDotsActions
      placement="right-top"
      moreLabel={`More Actions `}
      directActionLimit={2}
      collapseOnOverflow={false}
      sx={{
        gap: 0,
        '& .MuiIconButton-root': { width: { xs: 44, sm: 30 }, height: { xs: 44, sm: 30 } },
      }}
      actions={actions}
    />
  );
}
