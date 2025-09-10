'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import quizTableData from 'src/json/academic/examination/quizTableData.json';
import quizPortalData from 'src/json/academic/examination/quizPortalData.json';

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
        { name: 'Academics', href: '/academic/dashboard' },
        { name: 'Examination', href: '/academic/scheduleExam' },
        { name: 'Quiz Management' },
        { name: 'Quiz Form' },
      ]
    : [
        { name: 'Academics', href: '/academic/dashboard' },
        { name: 'Examination', href: '/academic/scheduleExam' },
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
      <CustomDialog
        title={
          <Box display="flex" alignItems="center" gap={1}>
            {selectedQuiz?.quizTitle || 'Attempt Quiz'}{' '}
            <CustomTooltip
              sx={{ textAlign: 'justify' }}
              arrow
              placement="right"
              title="Take the quiz by answering all questions within the allocated time. Your responses will be automatically submitted when the timer ends."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>{' '}
          </Box>
        }
        handleClose={() => {
          attemptQuizDialog.onFalse();
          setSelectedQuiz(null);
        }}
        open={attemptQuizDialog.value}
        fullScreen
      >
        <QuizPortal
          quizData={quizPortalData}
          handleClose={() => {
            attemptQuizDialog.onFalse();
            setSelectedQuiz(null);
          }}
        />
      </CustomDialog>
    </>
  ) : (
    <Box height="100%" display="flex" flexDirection="column">
      {open ? (
        <CustomBreadcrumbs
          heading="Quiz Management"
          description={
            selectedQuiz
              ? 'Update existing quiz information including title, questions, duration, and schedule. Make necessary modifications to keep assessments current and aligned with learning objectives.'
              : 'Create a new quiz by providing essential details such as title, questions, duration and schedule. Add various question types to effectively assess student understanding.'
          }
          links={[
            { name: 'Academics', href: '/academic/dashboard' },
            { name: 'Examination', href: '/academic/scheduleExam' },
            { name: 'Quiz Management' },
          ]}
          isBack
          onBack={() => {
            handleClose(null, false);
          }}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Quiz Management"
          description="Access to manage all quizzes and track pending quizzes and analyze students performance on completed ones."
          links={[
            { name: 'Academics', href: '/academic/dashboard' },
            { name: 'Examination', href: '/academic/scheduleExam' },
            { name: 'Quiz Management' },
          ]}
        />
      )}

      {open ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)', mt: 2 }}>
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
            setOpen(true);
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
        content={
          <>
            Are you sure you want to delete the quiz <strong>{selectedQuiz?.quizTitle}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              handleDelete(selectedQuiz?.id);
            }}
          >
            Yes
          </Button>
        }
      />
    </Box>
  );
};

export default QuizManagement;
