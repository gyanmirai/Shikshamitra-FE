import type { Board } from 'src/types/school';

import { LoadingButton } from '@mui/lab';
import { useDispatch } from 'react-redux';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { boardApi, useGetBoardsQuery, useDeleteBoardMutation } from 'src/redux/board/boardApi';

import { BoardForm } from '../board-setup';
import { MediumForm } from '../medium-setup';
import { AcademicActionButtons } from './academic-action-buttons';

import type { AcademicSetupParents } from '../academic-setup-model';

export const BoardActions = ({
  board,
  parents,
}: {
  board: Board;
  parents: AcademicSetupParents;
}) => {
  const addDialog = useBoolean();
  const editDialog = useBoolean();
  const deleteDialog = useBoolean();
  const dispatch = useDispatch();
  const { data: boardsData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBoardsQuery,
  });
  const siblingBoards = ((boardsData?.items ?? []) as Board[]).filter(
    (candidate) => candidate.academicYearId === board.academicYearId
  );
  const [deleteBoard, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteBoardMutation,
    popupConfig: { success: true, successMessage: 'Board deleted successfully' },
  });

  const handleDelete = async () => {
    await deleteBoard(board.id);
    dispatch(boardApi.util.invalidateTags([{ type: 'Board' }]));
    deleteDialog.onFalse();
  };

  return (
    <>
      <CustomDialog
        title={`Add medium to ${board.name}`}
        handleClose={addDialog.onFalse}
        open={addDialog.value}
      >
        <MediumForm handleClose={addDialog.onFalse} editData={null} boardId={board.id} />
      </CustomDialog>
      <CustomDialog
        title={`Edit board ${board.name}`}
        handleClose={editDialog.onFalse}
        open={editDialog.value}
        maxWidth="sm"
      >
        {editDialog.value && (
          <BoardForm
            handleClose={editDialog.onFalse}
            editData={board}
            academicYearId={board.academicYearId}
            academicYear={parents.year}
            boards={siblingBoards}
          />
        )}
      </CustomDialog>
      <ConfirmDialog
        open={deleteDialog.value}
        onClose={deleteDialog.onFalse}
        title="Delete board"
        content={
          <>
            Delete <strong>{board.name}</strong> and its hierarchy?
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
            Delete board
          </LoadingButton>
        }
      />
      <AcademicActionButtons
        recordName={board.name}
        recordType="board"
        addLabel="Add medium"
        onAdd={addDialog.onTrue}
        onEdit={editDialog.onTrue}
        onDelete={deleteDialog.onTrue}
      />
    </>
  );
};
