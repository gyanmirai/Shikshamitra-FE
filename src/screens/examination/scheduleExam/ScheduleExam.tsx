'use client';

import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Box, Card } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import {
  scheduleExamApi,
  useGetExamsQuery,
  useDeleteExamMutation,
} from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/schedule-examApi';

import NewExamForm from './components/examFormComponent';
import ViewTimetableComp from './components/viewTimetableComp';
import ScheduledExamTable from './components/scheduleExamTable';

import type { IExamFormValues } from './type';

const ScheduleExam = ({ showBreadCumb = true }: { showBreadCumb?: boolean }) => {
  // State to control exam form visibility
  const [open, setOpen] = useState(false);
  // State to store currently selected exam for editing
  const [selectedExam, setSelectedExam] = useState<IExamFormValues | null>(null);

  // Redux selector to track unsaved changes
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  // Boolean hook to control delete confirmation dialog
  const deleteDialog = useBoolean();
  // Redux dispatch hook for state management
  const dispatch = useDispatch();
  // Boolean hook to control time view dialog
  const viewTimeDialog = useBoolean(); // Dynamic breadcrumb navigation links based on current view (form or list)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getExams = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamsQuery,
    params: {
      AcademicMediumId: medium?.id,
    },
  });

  const [deleteExam, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteExamMutation,
  });

  console.log('ScheduleExam render - selectedExam:', selectedExam, 'isChanges:', isChanges);

  const { confirmWithUndo } = useConfirmWithUndo();

  const handleDeleteExam = async () => {
    confirmWithUndo({
      item: selectedExam,
      onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
        dispatchFn(
          scheduleExamApi.util.updateQueryData(
            'getExams',
            { AcademicMediumId: medium?.id },
            (draft: any) => {
              const index = draft?.items?.findIndex(
                (item: any) => item.examId === selectedExam?.examId
              );
              setDeleteIndex(index);
              if (index !== -1) draft?.items?.splice(index, 1);
            }
          )
        ),
      onUndoRestore: () => getExams.refetch(),
      onCommit: async () => {
        await deleteExam({
          examId: selectedExam?.examId,
        });
      },
    });
    deleteDialog.onFalse();
    setSelectedExam(null);
  };

  /**
   * Handles closing the exam form with confirmation if there are unsaved changes
   * @param _e - Event object (unused)
   * @param isSubmit - Boolean indicating if form was submitted successfully
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      setOpen(false);
      dispatch(setIsChanges(false));
      setSelectedExam(null);
    } else if (!isChanges) {
      setOpen(false);
      setSelectedExam(null);
    }
  };
  return (
    <Box height="100%" display="flex" flexDirection="column">
      {showBreadCumb &&
        (open ? (
          <CustomBreadcrumbs
            heading="Schedule Exam"
            description={
              selectedExam?.examName
                ? 'Update existing exam details including title, date, duration and assigned subjects. Make necessary adjustments to the exam schedule.'
                : 'Create new exam by entering exam title, date, duration and assigning subjects. Set up the complete exam schedule.'
            }
            links={[
              { name: 'Academics', href: '/academic/dashboard' },
              { name: 'Examination', href: '/academic/scheduleExam' },
              { name: 'Schedule Exam' },
            ]}
            isBack
            onBack={() => {
              handleClose(null, false);
            }}
          />
        ) : (
          <CustomBreadcrumbs
            heading="Schedule Exam"
            description="Manage all scheduled exams with complete details—subjects, timings. Add, edit, or delete exams as required."
            links={[
              { name: 'Academics', href: '/academic/dashboard' },
              { name: 'Examination', href: '/academic/examinationDashboard' },
              { name: 'Schedule Exam' },
            ]}
          />
        ))}
      <AnimatePresence mode="wait">
        {open ? (
          <motion.div
            key="exam-form"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            style={{ height: '100%' }}
          >
            <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
              <NewExamForm
                onClose={() => {
                  setOpen(false);
                }}
                editData={selectedExam as any}
              />
            </Card>
          </motion.div>
        ) : (
          <Box
            component={motion.div}
            key="exam-table"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '0',
            }}
          >
            <ScheduledExamTable
              onDelete={(data) => {
                setSelectedExam(data);
                deleteDialog.onTrue();
              }}
              openDialog={open}
              setOpenDialog={setOpen}
              editData={selectedExam}
              setEditData={setSelectedExam}
              onViewTimetable={(data) => {
                viewTimeDialog.onTrue();
                setSelectedExam(data);
              }}
              getExams={getExams}
            />
          </Box>
        )}
      </AnimatePresence>
      <ConfirmDialog
        open={deleteDialog.value}
        onClose={() => {
          deleteDialog.onFalse();
          setSelectedExam(null);
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete exam <strong>{selectedExam?.examName}</strong>?
          </>
        }
        action={
          <LoadingButton
            loading={isDeleteLoading}
            variant="contained"
            color="error"
            size="small"
            onClick={handleDeleteExam}
          >
            Yes
          </LoadingButton>
        }
      />

      <CustomDialog
        title={`${selectedExam?.examName} Timetable`}
        open={viewTimeDialog.value}
        handleClose={() => {
          viewTimeDialog.onFalse();
          setSelectedExam(null);
        }}
        maxWidth="md"
      >
        <ViewTimetableComp examData={selectedExam} />
      </CustomDialog>
    </Box>
  );
};

export default ScheduleExam;
