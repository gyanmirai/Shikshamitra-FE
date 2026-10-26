import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  buildingsApi,
  useDeleteBuildingMutation,
} from 'src/redux/InstituteSetup/BuildingApi/BuildingApi';

import type { IBuilding } from '../types';

type Props = { open: boolean; building: IBuilding | null; onClose: () => void };

export function DeleteBuildingDialog({ open, building, onClose }: Props) {
  const [deleteBuilding, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteBuildingMutation,
  });
  const { confirmWithUndo } = useConfirmWithUndo();
  return (
    <ConfirmDialog
      open={open}
      disableBackdropClick
      onClose={onClose}
      title="Delete Building"
      icon={<Iconify icon={GlobalIcons.delete} width={24} sx={{ color: 'error.main' }} />}
      content={
        <>
          Are you sure you want to delete building <strong>{building?.buildingName}</strong>?
        </>
      }
      action={
        <LoadingButton
          type="button"
          loading={isLoading}
          variant="contained"
          color="error"
          size="small"
          startIcon={<Iconify icon={GlobalIcons.delete} width={18} />}
          onClick={() => {
            const buildingToDelete = building;
            let deletedIndex = -1;
            confirmWithUndo({
              item: buildingToDelete,
              message: `Building "${buildingToDelete?.buildingName}" deleted successfully`,
              onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
                dispatchFn(
                  buildingsApi.util.updateQueryData('getBuildings', undefined, (draft: any) => {
                    const targetArray = Array.isArray(draft) ? draft : draft?.items;
                    if (!targetArray) return;
                    const index = targetArray.findIndex(
                      (item: any) => item.id === buildingToDelete?.id
                    );
                    deletedIndex = index;
                    setDeleteIndex(index);
                    if (index !== -1) targetArray.splice(index, 1);
                  })
                ),
              onUndoRestore: (dispatchFn) =>
                dispatchFn(
                  buildingsApi.util.updateQueryData('getBuildings', undefined, (draft: any) => {
                    const targetArray = Array.isArray(draft) ? draft : draft?.items;
                    if (!targetArray || deletedIndex === -1 || !buildingToDelete) return;
                    targetArray.splice(deletedIndex, 0, buildingToDelete);
                  })
                ),
              onCommit: () => deleteBuilding(buildingToDelete?.id),
            });
            onClose();
          }}
        >
          Delete building
        </LoadingButton>
      }
    />
  );
}
