import type { Medium } from 'src/types/school';

import { LoadingButton } from '@mui/lab';
import { useDispatch } from 'react-redux';
import { useBoolean } from 'src/hooks/use-boolean';
import { boardApi } from 'src/redux/board/boardApi';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useDeleteMediumMutation } from 'src/redux/medium/mediumApi';

import { MediumForm } from '../medium-form';
import { OrganizationForm } from '../stage-form';
import { AcademicFormDialog } from '../academic-form-dialog';
import { AcademicActionButtons } from './academic-action-buttons';

import type { AcademicSetupParents } from '../academic-setup-model';

export const MediumActions = ({
  medium,
  parents,
}: {
  medium: Medium;
  parents: AcademicSetupParents;
}) => {
  const addDialog = useBoolean();
  const editDialog = useBoolean();
  const deleteDialog = useBoolean();
  const dispatch = useDispatch();
  const [deleteMedium, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteMediumMutation,
    popupConfig: { success: true, successMessage: 'Medium deleted successfully' },
  });

  const handleDelete = async () => {
    await deleteMedium(medium.id);
    dispatch(boardApi.util.invalidateTags([{ type: 'Board' }]));
    deleteDialog.onFalse();
  };

  return (
    <>
      <AcademicFormDialog
        kind="stage"
        title={`Add Stage to ${medium.name}`}
        handleClose={addDialog.onFalse}
        open={addDialog.value}
      >
        <OrganizationForm handleClose={addDialog.onFalse} editData={null} mediumId={medium.id} />
      </AcademicFormDialog>
      <AcademicFormDialog
        kind="medium"
        title={`Edit Medium ${medium.name}`}
        handleClose={editDialog.onFalse}
        open={editDialog.value}
      >
        <MediumForm
          handleClose={editDialog.onFalse}
          editData={medium}
          boardId={parents.board?.id ?? ''}
        />
      </AcademicFormDialog>
      <ConfirmDialog
        open={deleteDialog.value}
        onClose={deleteDialog.onFalse}
        title="Delete medium"
        content={
          <>
            Delete <strong>{medium.name}</strong> and its stages?
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
            Delete medium
          </LoadingButton>
        }
      />
      <AcademicActionButtons
        recordName={medium.name}
        recordType="medium"
        addLabel="Add stage"
        onAdd={addDialog.onTrue}
        onEdit={editDialog.onTrue}
        onDelete={deleteDialog.onTrue}
      />
    </>
  );
};
