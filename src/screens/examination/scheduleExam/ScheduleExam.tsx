'use client';

import type { RootState } from 'src/redux/store';
import type { TooltipProps } from '@mui/material';

import dayjs from 'dayjs';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { Box, Card } from '@mui/material';
import { useState, useEffect } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { motion, AnimatePresence } from 'framer-motion';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { examScheduledStatus } from 'src/enums/exam-scheduled-status';
import {
  scheduleExamApi,
  useDeleteExamMutation,
} from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/schedule-examApi';

import NewExamForm from './components/examFormComponent';
import { useExamFormClose } from './use-exam-form-close';
import ScheduledExamTable from './components/scheduleExamTable';
import ExamTimetableDialog from './components/ExamTimetableDialog';
import { useScheduleExamListQuery } from './use-schedule-exam-list-query';

import type { IExamFormValues } from './type';

const ScheduleExam = ({ showBreadCumb = true }: { showBreadCumb?: boolean }) => {
  // State to control exam form visibility
  const [open, setOpen] = useState(false);
  const [isFormBusy, setIsFormBusy] = useState(false);
  // State to store currently selected exam for editing
  const [selectedExam, setSelectedExam] = useState<IExamFormValues | null>(null);
  // Active status tab driving the API query
  const [activeStatus, setActiveStatus] = useState<number>(examScheduledStatus.Pending);
  const [examPagination, setExamPagination] = useState({ page: 1, pageSize: 10 });
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null]>([
    dayjs().startOf('week'),
    dayjs().endOf('week'),
  ]);

  // Redux selector to track unsaved changes
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  // Reset selected class if medium changes
  useEffect(() => {
    setSelectedClass('all');
  }, [medium?.id]);

  // Boolean hook to control delete confirmation dialog
  const deleteDialog = useBoolean();
  const insightsDrawer = useBoolean();
  // Boolean hook to control time view dialog
  const viewTimeDialog = useBoolean(); // Dynamic breadcrumb navigation links based on current view (form or list)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { query: getExams, params: examQueryParams } = useScheduleExamListQuery({
    mediumId: medium?.id,
    activeStatus,
    selectedClass,
    dateRange,
    page: examPagination.page,
    pageSize: examPagination.pageSize,
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
          scheduleExamApi.util.updateQueryData('getExams', examQueryParams, (draft: any) => {
            const index = draft?.items?.findIndex(
              (item: any) => item.examId === selectedExam?.examId
            );
            setDeleteIndex(index);
            if (index !== -1) draft?.items?.splice(index, 1);
          })
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

  const { handleClose, confirmation } = useExamFormClose(
    open,
    isChanges,
    () => {
      setOpen(false);
      setSelectedExam(null);
    },
    isFormBusy
  );
  const listTooltip = "Manage all your institution's exams from a single place.";

  const createTooltip =
    'Complete Basic Details, Schedule, Room Details, and Review. Save each step as a draft, then publish the exam separately from the list.';
  const updateTooltip =
    'Update the exam details, subject schedule, and optional room assignments. Save each changed step before finishing the draft.';

  return (
    <Box height="100%" display="flex" flexDirection="column" overflow="hidden">
      {showBreadCumb &&
        (open ? (
          <CustomBreadcrumbs
            sx={{ mb: 1 }}
            heading={selectedExam?.examName ? 'Update Exam' : 'Schedule Exam'}
            description={
              selectedExam?.examName
                ? 'Update the exam details, subject schedule and room allocation, then review the draft.'
                : 'Set the exam details, schedule each subject, allocate rooms and review the exam draft.'
            }
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
            backDisabled={isFormBusy}
            onBack={() => {
              handleClose(null, false);
            }}
          />
        ) : (
          <CustomBreadcrumbs
            sx={{ mb: 1 }}
            heading="Schedule Exam"
            description="Review scheduled exams, filter by class and date, and manage their publication status."
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
            <Card sx={{ height: '100%', boxShadow: 'none' }}>
              <NewExamForm
                onClose={() => handleClose(null, true)}
                onBusyChange={setIsFormBusy}
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
              onStatusChange={(status) => {
                setActiveStatus(status);
                setExamPagination((current) => ({ ...current, page: 1 }));
              }}
              selectedClass={selectedClass}
              onClassChange={(cls) => {
                setSelectedClass(cls);
                setExamPagination((current) => ({ ...current, page: 1 }));
              }}
              dateRange={dateRange}
              onDateRangeChange={(range) => {
                setDateRange(range);
                setExamPagination((current) => ({ ...current, page: 1 }));
              }}
              page={examPagination.page}
              rowsPerPage={examPagination.pageSize}
              totalCount={getExams?.data?.totalCount ?? 0}
              onServerPagination={(page, pageSize) => {
                setExamPagination({ page, pageSize });
              }}
              insightsOpen={insightsDrawer.value}
              onOpenInsights={insightsDrawer.onTrue}
              onCloseInsights={insightsDrawer.onFalse}
            />
          </Box>
        )}
      </AnimatePresence>
      <ConfirmDialog
        open={deleteDialog.value}
        disableBackdropClick
        onClose={() => {
          deleteDialog.onFalse();
          setSelectedExam(null);
        }}
        title="Delete exam?"
        content={
          <>
            This will delete exam <strong>{selectedExam?.examName}</strong>.
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
            Delete
          </LoadingButton>
        }
      />

      {confirmation}

      <ExamTimetableDialog
        open={viewTimeDialog.value}
        examData={selectedExam}
        onClose={() => {
          viewTimeDialog.onFalse();
          setSelectedExam(null);
        }}
      />
    </Box>
  );
};

export default ScheduleExam;
