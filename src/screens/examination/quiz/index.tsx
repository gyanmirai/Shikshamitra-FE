'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Add } from '@mui/icons-material';
import { Box, Card, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import quizTableData from 'src/json/academic/examination/quizTableData.json';
import quizPortalData from 'src/json/academic/examination/quizPortalData.json';

import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import QuizPortal from '../quizManagement/quizPortal';
import QuizTable from '../quizManagement/activeQuiz/components/activeQuizTable';
import AddNewQuiz from '../quizManagement/activeQuiz/components/quizFormComponent';

import type { IQuizData } from './type';
import type { TabComponentType } from '../../hr/leave-request';

const QuizManagement = (props: TabComponentType) => {
  // State to control quiz form visibility
  const [open, setOpen] = useState(false);
  // State to store currently selected quiz for editing
  const [selectedQuiz, setSelectedQuiz] = useState<IQuizData | null>(null);
  // State to store all quiz data, initialized with data from JSON
  const [quizData, setQuizData] = useState<IQuizData[]>(quizTableData);
  // Redux selector to track unsaved changes
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  // Boolean hook to control delete confirmation dialog
  const deleteDialog = useBoolean();
  // Redux dispatch hook for state management
  const dispatch = useDispatch();
  // Boolean hook to control quiz view dialog
  const viewQuizDialog = useBoolean();
  // Boolean hook to control the add new quiz form visibility
  const addNewQuiz = useBoolean();
  // Boolean hook to control the attempt quiz dialog visibility
  const attemptQuizDialog = useBoolean();
  // Boolean hook to control the quiz result dialog visibility
  const viewResultDialog = useBoolean();

  // Dynamic breadcrumb navigation links based on current view (form or list)
  const links = open
    ? [
        { name: 'Academic and Assignment', href: '/academic/dashboard' },
        { name: 'Examination', href: '/academic/examinationDashboard' },
        { name: 'Quiz Management' },
        { name: 'Quiz Form' },
      ]
    : [
        { name: 'Academic and Assignment', href: '/academic/dashboard' },
        { name: 'Examination', href: '/academic/examinationDashboard' },
        { name: 'Quiz Management' },
      ];

  /**
   * Handles the deletion of a quiz from the quiz data
   * @param id - The unique identifier of the quiz to be deleted
   */
  const handleDelete = (id: string | undefined) => {
    const updatedQuizData = quizData.filter((quiz) => quiz.id !== id);
    setQuizData(updatedQuizData);
    deleteDialog.onFalse();
    setSelectedQuiz(null);
  };

  /**
   * Handles closing the quiz form with confirmation if there are unsaved changes
   * @param _e - Event object (unused)
   * @param isSubmit - Boolean indicating if form was submitted successfully
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure to leave this page?'))) {
      setOpen(false);
      addNewQuiz.onFalse();
      viewResultDialog.onFalse();
      dispatch(setIsChanges(false));
      setSelectedQuiz(null);
    } else if (!isChanges) {
      setOpen(false);
      addNewQuiz.onFalse();
      setSelectedQuiz(null);
      viewResultDialog.onFalse();
    }
  };

  return attemptQuizDialog.value ? (
    <>
      <Box display="flex" justifyContent="flex-end" mb={2} mt={2}>
        <Button
          variant="contained"
          startIcon={<Iconify icon="eva:arrow-back-fill" />}
          onClick={() => {
            attemptQuizDialog.onFalse();
            setSelectedQuiz(null);
          }}
        >
          Back
        </Button>
      </Box>
      <QuizPortal quizData={quizPortalData} />
    </>
  ) : (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Quiz Management"
        description={
          open
            ? 'Create or update quiz details, including the quiz title, date, duration, and questions. Easily manage quiz schedules and make adjustments as needed.'
            : 'View and manage all quizzes, including quiz details, questions, and timings. Add new quizzes, update existing ones, or remove them as necessary.'
        }
        links={links}
        sx={{ px: 1, mb: 2 }}
        action={
          <Button
            size="small"
            startIcon={addNewQuiz.value ? <Iconify icon="eva:arrow-back-fill" /> : <Add />}
            variant="contained"
            onClick={
              addNewQuiz.value
                ? () => handleClose(null, false)
                : () => {
                    addNewQuiz.onTrue();
                  }
            }
          >
            {addNewQuiz.value ? 'Back' : 'Quiz'}
          </Button>
        }
      />

      {addNewQuiz.value ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <AddNewQuiz
            dialog={addNewQuiz}
            onClose={() => {
              setOpen(false);
            }}
          />
        </Card>
      ) : (
        <QuizTable
          onDelete={(data: IQuizData) => {
            setSelectedQuiz(data);
            deleteDialog.onTrue();
          }}
          openDialog={open}
          setOpenDialog={setOpen}
          editData={selectedQuiz}
          setEditData={setSelectedQuiz}
          data={quizData}
          onAttemptClick={(data: IQuizData) => {
            attemptQuizDialog.onTrue();
            setSelectedQuiz(data);
          }}
          onViewQuiz={(data: IQuizData) => {
            viewQuizDialog.onTrue();
            setSelectedQuiz(data);
          }}
          onEdit={(data: IQuizData) => {
            setSelectedQuiz(data);
            addNewQuiz.onTrue();
          }}
          onQuizResult={(data: IQuizData) => {
            viewResultDialog.onTrue();
            setSelectedQuiz(data);
          }}
        />
      )}

      <ConfirmDialog
        open={deleteDialog.value}
        onClose={() => {
          deleteDialog.onFalse();
          setSelectedQuiz(null);
        }}
        title="Delete"
        content="Are you sure you want to Delete Quiz?"
        action={
          <Button
            variant="contained"
            color="error"
            startIcon={<Iconify icon={GlobalIcons.delete} />}
            onClick={() => {
              handleDelete(selectedQuiz?.id);
            }}
          >
            Delete
          </Button>
        }
      />
    </Box>
  );
};

export default QuizManagement;
