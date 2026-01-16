import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Box, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import {
  homeworkApi,
  useGetHomeworksQuery,
  useDeleteHomeworkMutation,
  useUpdateHomeworkMutation,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/LearningTasksApi/homework-api';

import HomeworkForm from './homeworkForm';
import HomeworkTable from './homeworkTable';
import ViewHomeworkDetails from './viewHomeworkDetails';

import type { IHomework, IHomeworkDetail } from '../type';

const HomeworkCreation = ({ addHomeworkDialog }: any) => {
  // Dialog state for adding disciplinary incidents
  // const addHomeworkDialog = useBoolean();
  // Dialog state for deleting homework assignments
  const deleteHomeworkDialog = useBoolean();
  // Dialog state for publishing homework assignments
  const publishHomeworkDialog = useBoolean();
  // Dialog state for viewing homework assignment details
  const viewHomeworkDetailDialog = useBoolean();
  // Dialog state for viewing homework submissions from students
  const viewHomeworkSubmissionDialog = useBoolean();
  // State to store all organizations/stages from the selected medium
  // const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [subject, setSubject] = useState('');
  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store selected class/standard ID
  const [classes, setClass] = useState<string>('');
  // State to store all divisions for the selected class
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  // State to store selected division ID
  const [division, setDivision] = useState<string>('');
  // State to store and update the selected date using dayjs
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const [deleteHomework, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteHomeworkMutation,
  });
  const { confirmWithUndo } = useConfirmWithUndo();

  const [publishHomework, { isLoading: isPublishLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateHomeworkMutation,
  });
  // Get current board, medium and medium setter from global state
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  // Update classes when organization changes
  useEffect(() => {
    // Flatten the list of standards from all stages
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

    setAllClass(allClasses);
    setClass(allClasses[0]?.name || '');
  }, [medium]);

  // Update divisions when class changes
  useEffect(() => {
    setAllDivision(allClass.find((org: any) => org?.name === classes)?.divisions || []);
    setDivision(allClass.find((org: any) => org?.name === classes)?.divisions?.[0]?.name || '');
  }, [allClass, classes]);

  // Controls form visibility
  const [, setOpen] = useState(false);
  // Breadcrumb navigation links based on form state
  // Redux state for tracking unsaved changes
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  // State to track the currently selected homework assignment for editing
  const [selectedHomework, setSelectedHomework] = useState<IHomework | null>(null);
  const [, setViewHomework] = useState<IHomeworkDetail | null>(null);

  // State to store the list of homework/subject assignments
  // const [homeworkData] = useState<any[]>(homeworkTableData);
  // Redux dispatch
  const dispatch = useDispatch();

  const selectedClassData = allClass.find((c: any) => c?.name === classes);
  const selectedDivisionData = allDivision.find((d: any) => d?.name === division);

  const { data: homeworkData, refetch } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetHomeworksQuery,
    params: {
      classId: selectedClassData?.id,
      divisionId: selectedDivisionData?.id,
      subjectId: subject,
      homeworkDate: date?.toISOString(),
    },
  });

  // Handles closing the incident form
  const handleClose = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setOpen(false);
        setSelectedHomework(null);
        dispatch(setIsChanges(false));
      }, 200); // Adjust delay as per your Dialog transition timing
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addHomeworkDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      addHomeworkDialog.onFalse();
      resetState();
    }
  };

  const { currentYear } = useSelector((state: RootState) => state.globalState);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        display="flex"
        sx={{
          borderRadius: '8px',
          bgcolor: 'background.paper',
          boxShadow: 'var(--shadows-3)',
          mt: 1,

          p: 1,
          gap: 2,
        }}
      >
        {' '}
        <CustomSelect
          options={allClass}
          label="Class"
          value={classes}
          onChange={(val) => setClass(val as string)}
          labelKey="name"
          valueKey="name"
          formControlProps={{ sx: { maxWidth: '248px', width: '100%' } }}
        />
        <CustomSelect
          options={allDivision}
          label="Division"
          value={division}
          onChange={(val) => setDivision(val as string)}
          labelKey="name"
          valueKey="name"
          formControlProps={{ sx: { maxWidth: '248px', width: '100%' } }}
          disabled={!classes}
        />
        <CustomSelect
          options={[
            { id: '1', name: 'Mathematics' },
            { id: '2', name: 'Science' },
            { id: '3', name: 'English' },
            { id: '4', name: 'History' },
            { id: '5', name: 'Geography' },
            { id: '6', name: 'Physics' },
            { id: '7', name: 'Chemistry' },
            { id: '8', name: 'Biology' },
          ]}
          label="Subject"
          value={subject}
          onChange={(val) => setSubject(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '248px', width: '100%' } }}
          disabled={!division}
        />
        <DatePicker
          label="Homework Date"
          slotProps={{ textField: { size: 'small', fullWidth: true } }}
          name="date"
          minDate={dayjs(currentYear?.startDate)}
          maxDate={dayjs(currentYear?.endDate)}
          value={date}
          onChange={(val) => {
            setDate(val);
          }}
          format="DD-MM-YYYY"
          sx={{ maxWidth: '250px' }}
        />
      </Box>

      <CustomDialog
        open={addHomeworkDialog.value}
        handleClose={() => {
          addHomeworkDialog.onFalse();
          setTimeout(() => {
            setSelectedHomework(null);
          }, 200); // Delay should match your dialog transition (usually 200–300ms)
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedHomework ? 'Update Homework' : 'Add Homework'}
            </Typography>
            <CustomTooltip
              sx={{ textAlign: 'justify' }}
              arrow
              placement="right"
              title={
                selectedHomework
                  ? 'You can update the homework details including title, description and other information'
                  : 'You can create a new homework by entering the title, description and other required details'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        maxWidth="md"
      >
        <HomeworkForm
          classes={classes}
          subject={subject}
          dialog={addHomeworkDialog}
          onClose={handleClose}
          editData={selectedHomework}
        />
      </CustomDialog>

      <HomeworkTable
        homeworkData={homeworkData || []}
        selectedDivision={division}
        setOpen={setOpen}
        dialog={addHomeworkDialog}
        handleSwitchChange={(row) => {
          setSelectedHomework(row);
          publishHomeworkDialog.onTrue();
        }}
        onEditDetails={(row) => {
          setSelectedHomework(row);
          addHomeworkDialog.onTrue();
          setOpen(true);
        }}
        onDeleteDetails={(row) => {
          setSelectedHomework(row);
          deleteHomeworkDialog.onTrue();
        }}
        onViewDetails={(row) => {
          viewHomeworkDetailDialog.onTrue();
          setSelectedHomework(row);
        }}
        onViewSubmission={(row) => {
          viewHomeworkSubmissionDialog.onTrue();
          setViewHomework(row);
        }}
      />

      <ConfirmDialog
        open={publishHomeworkDialog.value}
        onClose={() => {
          publishHomeworkDialog.onFalse();
          setSelectedHomework(null);
        }}
        title="Publish"
        content={
          <>
            Are you sure you want to publish homework <strong>{selectedHomework?.title}</strong>?
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            size="small"
            loading={isPublishLoading}
            startIcon={<Iconify icon={GlobalIcons.publish} />}
            onClick={async () => {
              const nextStatus = 'PUBLISHED';
              confirmWithUndo({
                item: selectedHomework,
                onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
                  dispatchFn(
                    homeworkApi.util.updateQueryData(
                      'getHomeworks',
                      {
                        classId: selectedClassData?.id,
                        divisionId: selectedDivisionData?.id,
                        subjectId: subject,
                        homeworkDate: date?.toISOString(),
                      },
                      (draft: any) => {
                        const index = draft.findIndex(
                          (item: any) => item.id === selectedHomework?.id
                        );
                        if (index !== -1) {
                          draft[index].status = nextStatus;
                        }
                      }
                    )
                  ),
                onUndoRestore: () => refetch(),
                onCommit: () =>
                  publishHomework({
                    homeworkId: selectedHomework?.id,
                    status: nextStatus,
                  }),
              });
              publishHomeworkDialog.onFalse();
              setSelectedHomework(null);
            }}
          >
            Publish
          </LoadingButton>
        }
      />

      <ConfirmDialog
        open={deleteHomeworkDialog.value}
        onClose={() => {
          setSelectedHomework(null);
          deleteHomeworkDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete homework <strong>{selectedHomework?.title}</strong>?
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            color="error"
            size="small"
            loading={isDeleteLoading}
            onClick={async () => {
              try {
                const payload = {
                  homeworkId: selectedHomework?.id,
                };

                await deleteHomework(payload).unwrap();

                shikshaMitraToast.success({
                  message: `Homework for "${selectedHomework?.title}" has been successfully deleted from Class ${classes} - ${division}.`,
                });

                deleteHomeworkDialog.onFalse();
                setSelectedHomework(null);
              } catch (error: any) {
                shikshaMitraToast.error({
                  message: error?.data?.message || 'Failed to delete homework.',
                });
              }
            }}
          >
            Yes
          </LoadingButton>
        }
      />

      {/* View subject details dialog */}
      <CustomDialog
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Homework Details</Typography>
            <CustomTooltip
              sx={{ textAlign: 'justify' }}
              arrow
              placement="right"
              title="View homework details — title, description, due date, submission status, and more."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        open={viewHomeworkDetailDialog.value}
        handleClose={() => {
          viewHomeworkDetailDialog.onFalse();
          setSelectedHomework(null);
        }}
        maxWidth="md"
      >
        <ViewHomeworkDetails homework={selectedHomework} />
      </CustomDialog>

      {/* <CustomDialog
        title={selectedHomework?.title || 'Homework Details'}
        open={viewHomeworkSubmissionDialog.value}
        handleClose={() => {
          viewHomeworkSubmissionDialog.onFalse();
          setSelectedHomework(null);
        }}
        maxWidth="lg"
      >
        <Box sx={{ p: 2 }}>
          <StudentSubmissions selectedHomework={selectedHomework} />
        </Box>
      </CustomDialog> */}
    </Box>
  );
};

export default HomeworkCreation;
