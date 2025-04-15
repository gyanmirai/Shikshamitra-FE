import React, { useState } from 'react';

import { Box, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import quizPortalData from 'src/json/academic/examination/quizPortalData.json';
import activeQuizTableData from 'src/json/academic/examination/activeQuizTableData.json';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';

import QuizPortal from '../quizPortal';
import QuizTable from './components/activeQuizTable';
import AddNewQuiz from './components/quizFormComponent';

const ActiveQuiz = () => {
  // State to store and manage quiz table data
  const [tableData, setTableData] = useState(activeQuizTableData);
  // Dialog state for adding new quiz
  const addQuizDialog = useBoolean();
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        {open ? (
          <Button
            startIcon={<Iconify icon="mdi:arrow-back" />}
            variant="contained"
            size="small"
            onClick={() => {
              setOpen(false);
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
        <AddNewQuiz />
      </CustomDialog>
    </Box>
  );
};

export default ActiveQuiz;
