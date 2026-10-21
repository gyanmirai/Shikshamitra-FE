import type { Standards } from 'src/types/school';

import { LoadingButton } from '@mui/lab';
import { useDispatch } from 'react-redux';
import { useBoolean } from 'src/hooks/use-boolean';
import { boardApi } from 'src/redux/board/boardApi';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useDeleteClassMutation } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { ClassForm } from '../class-setup';
import { DivisionForm } from '../division-setup';
import { AcademicFormDialog } from '../academic-form-dialog';
import { AcademicActionButtons } from './academic-action-buttons';

import type { AcademicSetupParents } from '../academic-setup-model';

export const StandardActions = ({
  standard,
  parents,
}: {
  standard: Standards;
  parents: AcademicSetupParents;
}) => {
  const addDialog = useBoolean();
  const editDialog = useBoolean();
  const deleteDialog = useBoolean();
  const dispatch = useDispatch();
  const [deleteStandard, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteClassMutation,
    popupConfig: { success: true, successMessage: 'Standard deleted successfully' },
  });

  const handleDelete = async () => {
    await deleteStandard(standard.id);
    dispatch(boardApi.util.invalidateTags([{ type: 'Board' }]));
    deleteDialog.onFalse();
  };

  return (
    <>
      <AcademicFormDialog
        kind="division"
        title={`Add Division to ${standard.name}`}
        handleClose={addDialog.onFalse}
        open={addDialog.value}
      >
        <DivisionForm
          handleClose={addDialog.onFalse}
          editData={null}
          classId={standard.id}
          existingDivisions={standard.divisions}
        />
      </AcademicFormDialog>
      <AcademicFormDialog
        kind="standard"
        title={`Edit Standard ${standard.name}`}
        handleClose={editDialog.onFalse}
        open={editDialog.value}
      >
        <ClassForm
          handleClose={editDialog.onFalse}
          editData={standard}
          organizationId={parents.organization?.id ?? ''}
          existingStandards={parents.organization?.standards}
        />
      </AcademicFormDialog>
      <ConfirmDialog
        open={deleteDialog.value}
        onClose={deleteDialog.onFalse}
        title="Delete standard"
        content={
          <>
            Delete <strong>{standard.name}</strong> and its divisions?
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
            Delete standard
          </LoadingButton>
        }
      />
      <AcademicActionButtons
        recordName={standard.name}
        recordType="standard"
        addLabel="Add division"
        onAdd={addDialog.onTrue}
        onEdit={editDialog.onTrue}
        onDelete={deleteDialog.onTrue}
      />
    </>
  );
};
