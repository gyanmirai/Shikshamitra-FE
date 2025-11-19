'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Box, Card, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import examTableData from 'src/json/examination/examTableData.json';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import NewExamForm from './components/examFormComponent';
import ViewTimetableComp from './components/viewTimetableComp';
import ScheduledExamTable from './components/scheduleExamTable';

import type { IExamFormValues } from './type';

const ScheduleExam = ({ showBreadCumb = true }: { showBreadCumb?: boolean }) => {
  // State to control exam form visibility
  const [open, setOpen] = useState(false);
  // State to store currently selected exam for editing
  const [selectedExam, setSelectedExam] = useState<IExamFormValues | null>(null);
  // State to store all exam data, initialized with data from JSON
  const [examData] = useState<IExamFormValues[]>(examTableData);
  // Redux selector to track unsaved changes
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  // Boolean hook to control delete confirmation dialog
  const deleteDialog = useBoolean();
  // Redux dispatch hook for state management
  const dispatch = useDispatch();
  // Boolean hook to control time view dialog
  const viewTimeDialog = useBoolean(); // Dynamic breadcrumb navigation links based on current view (form or list)

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
            sx={{ px: 1 }}
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
            sx={{ px: 1 }}
          />
        ))}
      {open ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)', mt: 2 }}>
          <NewExamForm
            onClose={() => {
              setOpen(false);
            }}
          />
        </Card>
      ) : (
        <ScheduledExamTable
          onDelete={(data) => {
            setSelectedExam(data);
            deleteDialog.onTrue();
          }}
          openDialog={open}
          setOpenDialog={setOpen}
          editData={selectedExam}
          setEditData={setSelectedExam}
          data={examData}
          onViewTimetable={(data) => {
            viewTimeDialog.onTrue();
            setSelectedExam(data);
          }}
        />
      )}
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
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              deleteDialog.onFalse();
              shikshaMitraToast.success({
                message: `Exam ${selectedExam?.examName} deleted successfully`,
              });
            }}
          >
            Yes
          </Button>
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
