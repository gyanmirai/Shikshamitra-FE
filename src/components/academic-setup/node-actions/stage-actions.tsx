import type { Organization } from 'src/types/school';

import { LoadingButton } from '@mui/lab';
import { useDispatch } from 'react-redux';
import { useBoolean } from 'src/hooks/use-boolean';
import { boardApi } from 'src/redux/board/boardApi';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomDialog from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useDeleteOrganizationMutation } from 'src/redux/oraganization/oraganization';

import type { AcademicSetupParents } from '../academic-setup-model';

import { ClassForm } from '../class-setup';
import { OrganizationForm } from '../organization-setup';
import { AcademicActionButtons } from './academic-action-buttons';

export const StageActions = ({
  stage,
  parents,
}: {
  stage: Organization;
  parents: AcademicSetupParents;
}) => {
  const addDialog = useBoolean();
  const editDialog = useBoolean();
  const deleteDialog = useBoolean();
  const dispatch = useDispatch();
  const [deleteStage, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteOrganizationMutation,
    popupConfig: { success: true, successMessage: 'Stage deleted successfully' },
  });

  const handleDelete = async () => {
    await deleteStage(stage.id);
    dispatch(boardApi.util.invalidateTags([{ type: 'Board' }]));
    deleteDialog.onFalse();
  };

  return (
    <>
      <CustomDialog
        title={`Add standard to ${stage.name}`}
        handleClose={addDialog.onFalse}
        open={addDialog.value}
      >
        <ClassForm handleClose={addDialog.onFalse} editData={null} organizationId={stage.id} />
      </CustomDialog>
      <CustomDialog
        title={`Edit stage ${stage.name}`}
        handleClose={editDialog.onFalse}
        open={editDialog.value}
      >
        <OrganizationForm
          handleClose={editDialog.onFalse}
          editData={stage}
          mediumId={parents.medium?.id ?? ''}
        />
      </CustomDialog>
      <ConfirmDialog
        open={deleteDialog.value}
        onClose={deleteDialog.onFalse}
        title="Delete stage"
        content={
          <>
            Delete <strong>{stage.name}</strong> and its standards?
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
            Delete stage
          </LoadingButton>
        }
      />
      <AcademicActionButtons
        recordName={stage.name}
        recordType="stage"
        addLabel="Add standard"
        onAdd={addDialog.onTrue}
        onEdit={editDialog.onTrue}
        onDelete={deleteDialog.onTrue}
      />
    </>
  );
};
