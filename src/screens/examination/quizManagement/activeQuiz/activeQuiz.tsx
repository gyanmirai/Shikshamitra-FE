import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Box, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import quizPortalData from 'src/json/academic/examination/quizPortalData.json';
import activeQuizTableData from 'src/json/academic/examination/activeQuizTableData.json';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';

import QuizPortal from '../quizPortal';
import QuizTable from './components/activeQuizTable';
import AddNewQuiz from './components/quizFormComponent';

const ActiveQuiz = () => {
  // State to store and manage quiz table data
  const [tableData, setTableData] = useState(activeQuizTableData);
  // Dialog state for adding new quiz
  const addQuizDialog = useBoolean();
  const deleteQuizDialog = useBoolean();
  const [selectedQuizData, setSelectedQuizData] = useState('');
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();
  // Dialog state for attempting quiz
  const attemptQuizDialog = useBoolean();
  // State to control quiz portal visibility
  const [open, setOpen] = useState(false);
  const handleTogglePublish = (row: any) => {
    // Handle status toggle here
    console.log('Toggling publish for:', row.id);
  };

  const handleAttemptClick = (row: any) => {
    setOpen(true);
  };

  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      addQuizDialog.onFalse();
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      addQuizDialog.onFalse();
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        {open ? (
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
        <QuizPortal quizData={quizPortalData} />
      ) : (
        <QuizTable
          addQuizDialog={addQuizDialog}
          handleDelete={(id: string) => {
            deleteQuizDialog.onTrue();
            setSelectedQuizData(id);
          }}
          data={tableData}
          onTogglePublish={handleTogglePublish}
          onAttemptClick={handleAttemptClick}
        />
      )}

      <CustomDialog
        maxWidth="lg"
        open={addQuizDialog.value}
        handleClose={addQuizDialog.onFalse}
        title="New Quiz"
      >
        <AddNewQuiz onClose={handleClose} />
      </CustomDialog>

      <ConfirmDialog
        open={deleteQuizDialog.value}
        onClose={() => {
          deleteQuizDialog.onFalse();
        }}
        title="Delete"
        content="Are you sure want to Delete?"
        action={
          <Button variant="contained" color="error" onClick={() => {}}>
            Delete
          </Button>
        }
      />
    </Box>
  );
};

export default ActiveQuiz;
