import { Stack } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';

import { GradeScaleArchiveAction } from './GradeScaleArchiveAction';

import type { IGrade } from './type';

type Props = {
  scale: IGrade;
  canView: boolean;
  canAdd: boolean;
  canDelete: boolean;
  isArchiveLoading: boolean;
  isRestoreLoading: boolean;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onArchive: () => void;
  onRestore: () => void;
};

export function GradeScaleRowActions({
  scale,
  canView,
  canAdd,
  canDelete,
  isArchiveLoading,
  isRestoreLoading,
  onView,
  onEdit,
  onDelete,
  onArchive,
  onRestore,
}: Props) {
  const archived = scale.status === 3 || scale.status === 'Archived';
  return (
    <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
      {!archived && (
        <ThreeDotsActions
          showThreeDots={false}
          placement="right-top"
          showViewIcon={canView}
          showEditIcon={canAdd}
          showDeleteIcon={canDelete}
          disableDeleteIcon={(scale.usageCount || 0) > 0}
          viewLabel={`View ${scale.name}`}
          editLabel={`Edit ${scale.name}`}
          deleteLabel={`Delete ${scale.name}`}
          handleViewClick={onView}
          handleEditClick={onEdit}
          handleDeleteClick={onDelete}
        />
      )}
      <GradeScaleArchiveAction
        title={`${archived ? 'Restore' : 'Archive'} grade scale ${scale.name}`}
        archived={archived}
        disabled={archived ? !canAdd || isRestoreLoading : !canDelete || isArchiveLoading}
        onClick={archived ? onRestore : onArchive}
      />
    </Stack>
  );
}
