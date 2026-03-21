import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/useBoolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/custom-dialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirm-popup/confirmPopupSlice';
import {
  quizManagementApi,
  useGetQuizzesQuery,
  useDeleteQuizMutation,
} from 'src/redux/academic-api/examination-api/quiz-management-api/quizManagementApi';

import QuizPortal from '../quizPortal';
import QuizTable from './components/activeQuizTable';
import AddNewQuiz from './components/quizFormComponent';

const ActiveQuiz = () => {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);

  // Fetch quizzes
  const { data: quizzes } = useGetQuizzesQuery(
    { academicMediumId: currentMedium?.id },
    { skip: !currentMedium?.id }
  );

  const [deleteQuiz] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteQuizMutation,
  });

  // Dialog state for adding new quiz
  const addQuizDialog = useBoolean();
  const deleteQuizDialog = useBoolean();
  const [selectedQuizData, setSelectedQuizData] = useState<any>(null);
  const [editData, setEditData] = useState<any>(null);

  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();
  const { confirmWithUndo } = useConfirmWithUndo();

  // State to control quiz portal visibility
  const [open, setOpen] = useState(false);

  const handleTogglePublish = (row: any) => {};

  const handleAttemptClick = (row: any) => {
    setOpen(true);
  };

  const handleEdit = (row: any) => {
    setEditData(row);
    addQuizDialog.onTrue();
  };

  const handleDeleteClick = (row: any) => {
    setSelectedQuizData(row);
    deleteQuizDialog.onTrue();
  };

  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      addQuizDialog.onFalse();
      setEditData(null);
      setOpen(false);
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      setOpen(false);
      setEditData(null);
      addQuizDialog.onFalse();
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        {addQuizDialog.value ? (
          <Button
            startIcon={<Iconify icon="mdi:arrow-back" />}
            variant="contained"
            size="small"
            onClick={() => {
              handleClose(null, false);
            }}
          >
            Back
          </Button>
        ) : (
          <Button
            startIcon={<Iconify icon="mdi:plus" />}
            variant="contained"
            size="small"
            onClick={() => {
              addQuizDialog.onTrue();
            }}
          >
            Quiz
          </Button>
        )}
      </Box>

      {open ? (
        <QuizPortal handleClose={() => handleClose(null, false)} />
      ) : (
        <QuizTable
          addQuizDialog={addQuizDialog}
          onDelete={handleDeleteClick}
          onEdit={handleEdit}
          data={quizzes || []}
          onTogglePublish={handleTogglePublish}
          onAttemptClick={handleAttemptClick}
          setOpenDialog={(val: boolean) => (val ? addQuizDialog.onTrue() : addQuizDialog.onFalse())}
        />
      )}

      <CustomDialog
        maxWidth="lg"
        open={addQuizDialog.value}
        handleClose={() => handleClose(null, false)}
        title={editData ? 'Update Quiz' : 'New Quiz'}
      >
        <AddNewQuiz dialog={addQuizDialog} onClose={handleClose} editData={editData} />
      </CustomDialog>

      <ConfirmDialog
        open={deleteQuizDialog.value}
        onClose={() => {
          deleteQuizDialog.onFalse();
        }}
        title="Delete"
        content="Are you sure you want to Delete Quiz?"
        action={
          <Button
            startIcon={<Iconify icon={GlobalIcons.delete} />}
            variant="contained"
            color="error"
            onClick={async () => {
              confirmWithUndo({
                item: selectedQuizData,
                onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
                  dispatchFn(
                    quizManagementApi.util.updateQueryData(
                      'getQuizzes',
                      { academicMediumId: currentMedium?.id },
                      (draft: any) => {
                        const index = draft.data.findIndex(
                          (item: any) => item.id === (selectedQuizData as any).id
                        );
                        setDeleteIndex(index);
                        if (index !== -1) draft.data.splice(index, 1);
                      }
                    )
                  ),
                onUndoRestore: (dispatchFn, index) =>
                  dispatchFn(
                    quizManagementApi.util.updateQueryData(
                      'getQuizzes',
                      { academicMediumId: currentMedium?.id },
                      (draft: any) => {
                        if (!draft) return;
                        draft.data.splice(index, 0, selectedQuizData);
                      }
                    )
                  ),
                onCommit: async () => {
                  if (selectedQuizData?.id) {
                    await deleteQuiz(selectedQuizData.id).unwrap();
                  }
                },
              });
              deleteQuizDialog.onFalse();
              setSelectedQuizData(null);
            }}
          >
            Delete
          </Button>
        }
      />
    </Box>
  );
};

export default ActiveQuiz;
