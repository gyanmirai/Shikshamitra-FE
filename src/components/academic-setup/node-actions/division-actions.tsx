import type { Division } from 'src/types/school';

import { LoadingButton } from '@mui/lab';
import { useDispatch } from 'react-redux';
import { useBoolean } from 'src/hooks/use-boolean';
import { boardApi } from 'src/redux/board/boardApi';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomDialog from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useDeleteDivisionMutation } from 'src/redux/division/divisionApi';

import type { AcademicSetupParents } from '../academic-setup-model';

import { DivisionForm } from '../division-setup';
import { AcademicActionButtons } from './academic-action-buttons';

export const DivisionActions = ({
  division,
  parents,
}: {
  division: Division;
  parents: AcademicSetupParents;
}) => {
  const editDialog = useBoolean();
  const deleteDialog = useBoolean();
  const dispatch = useDispatch();
  const [deleteDivision, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteDivisionMutation,
    popupConfig: { success: true, successMessage: 'Division deleted successfully' },
  });

  const handleDelete = async () => {
    await deleteDivision(division.id);
    dispatch(boardApi.util.invalidateTags([{ type: 'Board' }]));
    deleteDialog.onFalse();
  };

  return (
    <>
      <CustomDialog
        title={`Edit division ${division.name}`}
        handleClose={editDialog.onFalse}
        open={editDialog.value}
      >
        <DivisionForm
          handleClose={editDialog.onFalse}
          editData={division}
          classId={parents.standard?.id ?? ''}
        />
      </CustomDialog>
      <ConfirmDialog
        open={deleteDialog.value}
        onClose={deleteDialog.onFalse}
        title="Delete division"
        content={
          <>
            Delete <strong>{division.name}</strong>?
          </>
        }
        action={
          <LoadingButton
            size="small"
            variant="contained"
            color="error"
            loading={isLoading}
            onClick={handleDelete}
          >
            Delete division
          </LoadingButton>
        }
      />
      <AcademicActionButtons
        recordName={division.name}
        recordType="division"
        onEdit={editDialog.onTrue}
        onDelete={deleteDialog.onTrue}
      />
    </>
  );
};
