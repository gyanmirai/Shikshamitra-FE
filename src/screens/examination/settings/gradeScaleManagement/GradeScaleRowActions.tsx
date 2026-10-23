import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';

import type { IGrade } from './type';

type Props = {
  scale: IGrade;
  canAdd: boolean;
  canDelete: boolean;
  isArchiveLoading: boolean;
  isRestoreLoading: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onArchive: () => void;
  onRestore: () => void;
};

export function GradeScaleRowActions({
  scale,
  canAdd,
  canDelete,
  isArchiveLoading,
  isRestoreLoading,
  onEdit,
  onDelete,
  onArchive,
  onRestore,
}: Props) {
  const archived = scale.status === 3 || scale.status === 'Archived';
  const actions = archived
    ? [
        {
          id: 'restore',
          label: `Restore grade scale ${scale.name}`,
          icon: 'solar:restart-bold',
          color: 'success.main',
          disabled: !canAdd || isRestoreLoading,
          onClick: onRestore,
        },
      ]
    : [
        ...(canAdd
          ? [
              {
                id: 'edit',
                label: `Edit ${scale.name}`,
                icon: 'solar:pen-bold',
                onClick: onEdit,
              },
            ]
          : []),
        ...(canDelete
          ? [
              {
                id: 'delete',
                label: `Delete ${scale.name}`,
                icon: 'solar:trash-bin-trash-bold',
                color: 'error.main',
                disabled: (scale.usageCount || 0) > 0,
                tooltip:
                  (scale.usageCount || 0) > 0
                    ? 'This grade scale is in use and cannot be deleted.'
                    : undefined,
                onClick: onDelete,
              },
            ]
          : []),
        {
          id: 'archive',
          label: `Archive grade scale ${scale.name}`,
          icon: 'solar:archive-bold',
          color: 'warning.main',
          disabled: !canDelete || isArchiveLoading,
          onClick: onArchive,
        },
      ];

  return <AdaptiveThreeDotsActions directActionLimit={2} actions={actions} placement="right-top" />;
}
