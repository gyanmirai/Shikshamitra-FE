'use client';

import type { RootState } from 'src/redux/store';
import type { TooltipProps } from '@mui/material';

import { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Box, Card, Typography } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { motion, AnimatePresence } from 'framer-motion';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { examScheduledStatus } from 'src/enums/exam-scheduled-status';
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
  // Active status tab driving the API query
  const [activeStatus, setActiveStatus] = useState<number>(examScheduledStatus.Pending);
  const apiStatus = activeStatus;

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
      Status: apiStatus,
    },
  });

  const [deleteExam, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteExamMutation,
  });

  const { confirmWithUndo } = useConfirmWithUndo();

  const handleDeleteExam = async () => {
    confirmWithUndo({
      item: selectedExam,
      onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
        dispatchFn(
          scheduleExamApi.util.updateQueryData(
            'getExams',
            { AcademicMediumId: medium?.id, Status: apiStatus },
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
  const listTooltip = (
    <Box sx={{ p: 1.5, maxWidth: 320 }}>
      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
        Schedule Exam — Overview
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
        Manage all your institution&apos;s exams from a single place.
      </Typography>

      <Typography
        variant="caption"
        fontWeight={700}
        color="text.primary"
        sx={{ display: 'block', mb: 0.5 }}
      >
        How to use:
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2, '& li': { mb: 0.25 } }}>
        <Typography component="li" variant="caption" color="text.secondary">
          Use <strong>status tabs</strong> (Pending / Published / Ongoing / Completed) to filter
          exams.
        </Typography>
        <Typography component="li" variant="caption" color="text.secondary">
          Click <strong>+ Create Exam</strong> to open the multi-step exam wizard.
        </Typography>
        <Typography component="li" variant="caption" color="text.secondary">
          Click any row&apos;s <strong>Edit</strong> icon to update exam details.
        </Typography>
        <Typography component="li" variant="caption" color="text.secondary">
          Click <strong>Timetable</strong> to preview the full subject-wise schedule.
        </Typography>
        <Typography component="li" variant="caption" color="text.secondary">
          Click <strong>Delete</strong> (trash icon) to remove a pending exam.
        </Typography>
      </Box>
    </Box>
  );

  const createTooltip = (
    <Box sx={{ p: 1.5, maxWidth: 340 }}>
      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
        Creating a New Exam — 4 Steps
      </Typography>

      <Box component="ol" sx={{ m: 0, pl: 2.5, '& li': { mb: 0.5 } }}>
        <Typography component="li" variant="caption" color="text.secondary">
          <strong>Basic Details</strong> — Enter exam name, type, class, medium, and exam dates.
          Mark it for <em>Online</em> or <em>Offline</em> mode.
        </Typography>
        <Typography component="li" variant="caption" color="text.secondary">
          <strong>Subject Schedule</strong> — Assign each subject its exam date, start time, end
          time, total marks, and passing marks. Set grade scaling and add notes if needed.
        </Typography>
        <Typography component="li" variant="caption" color="text.secondary">
          <strong>Room Allocation</strong> — Assign rooms and seating capacity per subject so
          students are distributed correctly.
        </Typography>
        <Typography component="li" variant="caption" color="text.secondary">
          <strong>Review &amp; Submit</strong> — Verify all details, resolve any readiness issues,
          and submit to finalise the schedule.
        </Typography>
      </Box>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}
      >
        Tip: You can save progress and return to continue later before submitting.
      </Typography>
    </Box>
  );

  const updateTooltip = (
    <Box sx={{ p: 1.5, maxWidth: 320 }}>
      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
        Updating an Existing Exam
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
        Edit any section of the previously saved exam without losing your other data.
      </Typography>

      <Box component="ul" sx={{ m: 0, pl: 2, '& li': { mb: 0.25 } }}>
        <Typography component="li" variant="caption" color="text.secondary">
          Navigate between steps freely using <strong>Back</strong> / <strong>Next</strong>.
        </Typography>
        <Typography component="li" variant="caption" color="text.secondary">
          Changes to <strong>Subject Schedule</strong> or <strong>Rooms</strong> are independent of
          other steps.
        </Typography>
        <Typography component="li" variant="caption" color="text.secondary">
          The <strong>Review</strong> step highlights any incomplete fields before final submission.
        </Typography>
        <Typography component="li" variant="caption" color="text.secondary">
          Only <strong>Pending</strong> exams can be fully edited. Scheduled exams allow limited
          updates.
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box height="100%" display="flex" flexDirection="column" overflow="hidden">
      {showBreadCumb &&
        (open ? (
          <CustomBreadcrumbs
            sx={{ mb: 1 }}
            heading={selectedExam?.examName ? 'Update Exam' : 'Schedule Exam'}
            description=" "
            tooltipProps={
              {
                title: selectedExam?.examName ? updateTooltip : createTooltip,
                sx: { textAlign: 'left' },
              } as TooltipProps
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
            sx={{ mb: 1 }}
            heading="Schedule Exam"
            description=" "
            tooltipProps={
              {
                title: listTooltip,
                sx: { textAlign: 'left' },
              } as TooltipProps
            }
            links={[
              { name: 'Academics', href: '/academic/dashboard' },
              { name: 'Examination' },
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
            style={{ flex: 1, minHeight: 0 }}
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
              activeStatus={activeStatus}
              onStatusChange={setActiveStatus}
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
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedExam?.examName ? `${selectedExam?.examName} Timetable` : ''}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={selectedExam?.examName ? `View  ${selectedExam?.examName} Timetable` : ''}
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        open={viewTimeDialog.value}
        handleClose={() => {
          viewTimeDialog.onFalse();
          setSelectedExam(null);
        }}
        maxWidth="md"
      >
        <Box sx={{ px: 2, pb: 2, pt: 2 }}>
          <ViewTimetableComp examData={selectedExam} />
        </Box>
      </CustomDialog>
    </Box>
  );
};

export default ScheduleExam;
