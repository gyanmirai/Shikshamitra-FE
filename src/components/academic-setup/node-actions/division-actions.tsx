import type { Division } from 'src/types/school';

import { LoadingButton } from '@mui/lab';
import { useDispatch } from 'react-redux';
import { useBoolean } from 'src/hooks/use-boolean';
import { boardApi } from 'src/redux/board/boardApi';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useDeleteDivisionMutation } from 'src/redux/division/divisionApi';

import { DivisionForm } from '../division-setup';
import { AcademicFormDialog } from '../academic-form-dialog';
import { AcademicActionButtons } from './academic-action-buttons';

import type { AcademicSetupParents } from '../academic-setup-model';

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
      <AcademicFormDialog
        kind="division"
        title={`Edit Division ${division.name}`}
        handleClose={editDialog.onFalse}
        open={editDialog.value}
      >
        <DivisionForm
          handleClose={editDialog.onFalse}
          editData={division}
          classId={parents.standard?.id ?? ''}
          existingDivisions={parents.standard?.divisions}
        />
      </AcademicFormDialog>
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
