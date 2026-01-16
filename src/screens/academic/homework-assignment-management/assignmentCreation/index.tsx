import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { Medium, Division, Standards, Organization } from 'src/types/school';

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
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import assignmentTableData from 'src/json/academic/homeworkAssignment/assignment-table-data.json';
import {
  assignmentApi,
  useGetAssignmentsQuery,
  useDeleteAssignmentMutation,
  usePublishAssignmentMutation,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/LearningTasksApi/assignment-api';

import AssignmentForm from './components/assignmentForm';
import AssignmentTable from './components/assignmentTable';
import ViewAssignmentDetails from './assignmentDetail/assignmentDetail';
import { StudentSubmissions } from './studentSubmission/studentSubmission';

import type { IAssignment } from './type';

const AssignmentCreation = ({ addAssignmentDialog }: any) => {
  // State to store list of all assignments
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const [assignmentData] = useState<any[]>(assignmentTableData);

  // Dialog state for add/edit assignment form
  // const addAssignmentDialog = useBoolean();
  // Dialog state for delete assignment confirmation
  const deleteAssignmentDialog = useBoolean();
  // Dialog state for publish assignment confirmation
  const publishAssignmentDialog = useBoolean();
  // Dialog state for viewing student assignment submissions
  const viewAssignmentSubmissionDialog = useBoolean();
  // Dialog state for viewing assignment details
  const viewAssignmentDetails = useBoolean();
  // Get changes state from redux store
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  // State to store currently selected assignment for edit/delete/publish
  const [selectedAssignment, setSelectedAssignment] = useState<IAssignment | null>(null);
  // Redux dispatch function
  const dispatch = useDispatch();
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
  const {
    data: tableData,
    isLoading,
    isFetching,
    refetch,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAssignmentsQuery,
    params: {
      academicMediumId: (currentMedium as Medium)?.id,
      classId: classes,
      divisionId: division,
      subjectId: subject,
      assignmentDate: date?.toISOString(),
    },
    options: {
      skip: !(currentMedium as Medium)?.id,
    },
  });

  // Get current board, medium and medium setter from global state
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const [deleteAssignment, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteAssignmentMutation,
  });

  const [publishAssignment, { isLoading: isPublishLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePublishAssignmentMutation,
  });
  const { confirmWithUndo } = useConfirmWithUndo();

  // Update classes when organization changes
  useEffect(() => {
    // Flatten the list of standards from all stages
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

    setAllClass(allClasses);
    setClass(allClasses[0]?.id || '');
  }, [medium]);

  // Update divisions when class changes
  useEffect(() => {
    setAllDivision(allClass.find((org: any) => org?.id === classes)?.divisions || []);
    setDivision(allClass.find((org: any) => org?.id === classes)?.divisions?.[0]?.name || '');
  }, [allClass, classes]);

  /**
   * Handles dialog close with confirmation if there are unsaved changes
   * @param _e - Event object
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setSelectedAssignment(null);
        dispatch(setIsChanges(false));
      }, 200); // Adjust duration to match your dialog animation timing
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addAssignmentDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      addAssignmentDialog.onFalse();
      setTimeout(() => {
        setSelectedAssignment(null);
      }, 200);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        display="flex"
        sx={{
          borderRadius: '8px',
          bgcolor: 'background.paper',
          boxShadow: 'var(--shadows-3)',
          mb: 2,
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
          valueKey="id"
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
          label="Assignment Date"
          slotProps={{ textField: { size: 'small', fullWidth: true } }}
          name="date"
          value={date}
          onChange={(val) => {
            setDate(val);
          }}
          format="DD-MM-YYYY"
          sx={{ maxWidth: '250px' }}
        />
      </Box>
      {/* <Box display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            onClick={addAssignmentDialog.onTrue}
            startIcon={<Add />}
            size="small"
            disabled={!date || dayjs(date).isBefore(dayjs().startOf('day'))}
          >
            Assignment
          </Button>
        </Box> */}

      <CustomDialog
        open={addAssignmentDialog.value}
        handleClose={() => {
          addAssignmentDialog.onFalse();
          setTimeout(() => {
            setSelectedAssignment(null);
          }, 200); // Adjust delay to match your Dialog transition (typically 200–300ms)
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedAssignment ? 'Update Assignment' : 'Add Assignment'}
            </Typography>
            <CustomTooltip
              sx={{ textAlign: 'justify' }}
              arrow
              placement="right"
              title={
                selectedAssignment
                  ? 'You can update the assignment details including title, description, due date and other information'
                  : 'You can create a new assignment by entering the title, description, due date and other required details'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        maxWidth="md"
      >
        <AssignmentForm
          classes={classes}
          dialog={addAssignmentDialog}
          onClose={handleClose}
          editData={selectedAssignment}
        />
      </CustomDialog>

      <AssignmentTable
        assignmentData={assignmentData}
        dialog={addAssignmentDialog}
        selectedDivision={division}
        selectedClass={classes}
        onSwitchToggle={(row) => {
          setSelectedAssignment(row);
          publishAssignmentDialog.onTrue();
        }}
        onEdit={(row) => {
          setSelectedAssignment(row);
          addAssignmentDialog.onTrue();
        }}
        onDelete={(row) => {
          setSelectedAssignment(row);
          deleteAssignmentDialog.onTrue();
        }}
        onView={(row) => {
          viewAssignmentDetails.onTrue();
          setSelectedAssignment(row);
        }}
        onViewSubmission={(row) => {
          viewAssignmentSubmissionDialog.onTrue();
          setSelectedAssignment(row);
        }}
      />

      <ConfirmDialog
        open={deleteAssignmentDialog.value}
        onClose={() => {
          setSelectedAssignment(null);
          deleteAssignmentDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete assignment <strong>{selectedAssignment?.title}</strong>?
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            color="error"
            size="small"
            loading={isDeleteLoading}
            onClick={async () => {
              confirmWithUndo({
                item: selectedAssignment,
                onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
                  dispatchFn(
                    assignmentApi.util.updateQueryData(
                      'getAssignments',
                      {
                        classId: allClass.find((org: any) => org?.id === classes)?.id,
                        divisionId: allClass
                          .find((org: any) => org?.id === classes)
                          ?.divisions?.find((d: any) => d?.name === division)?.id,
                        subjectId: subject,
                        assignmentDate: date?.toISOString(),
                      },
                      (draft: any) => {
                        const index = draft.findIndex(
                          (item: any) => item.id === selectedAssignment?.id
                        );
                        setDeleteIndex(index);
                        if (index !== -1) draft.splice(index, 1);
                      }
                    )
                  ),
                onUndoRestore: () => refetch(),
                onCommit: () => deleteAssignment(selectedAssignment?.id),
              });
              deleteAssignmentDialog.onFalse();
              setSelectedAssignment(null);
            }}
          >
            Yes
          </LoadingButton>
        }
      />

      <ConfirmDialog
        open={publishAssignmentDialog.value}
        onClose={() => {
          publishAssignmentDialog.onFalse();
          setSelectedAssignment(null);
        }}
        title="Publish"
        content={
          <>
            Are you sure you want to publish assignment <strong>{selectedAssignment?.title}</strong>
            ?
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
                item: selectedAssignment,
                onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
                  dispatchFn(
                    assignmentApi.util.updateQueryData(
                      'getAssignments',
                      {
                        classId: allClass.find((org: any) => org?.id === classes)?.id,
                        divisionId: allClass
                          .find((org: any) => org?.id === classes)
                          ?.divisions?.find((d: any) => d?.name === division)?.id,
                        subjectId: subject,
                        assignmentDate: date?.toISOString(),
                      },
                      (draft: any) => {
                        const index = draft.findIndex(
                          (item: any) => item.id === selectedAssignment?.id
                        );
                        if (index !== -1) {
                          draft[index].status = nextStatus;
                        }
                      }
                    )
                  ),
                onUndoRestore: (dispatchFn, index) =>
                  dispatchFn(
                    assignmentApi.util.updateQueryData(
                      'getAssignments',
                      {
                        classId: allClass.find((org: any) => org?.id === classes)?.id,
                        divisionId: allClass
                          .find((org: any) => org?.id === classes)
                          ?.divisions?.find((d: any) => d?.name === division)?.id,
                        subjectId: subject,
                        assignmentDate: date?.toISOString(),
                      },
                      (draft: any) => {
                        const itemIndex = draft.findIndex(
                          (item: any) => item.id === selectedAssignment?.id
                        );
                        if (itemIndex !== -1) {
                          draft[itemIndex].status = selectedAssignment?.status;
                        }
                      }
                    )
                  ),
                onCommit: () =>
                  publishAssignment({
                    assignmentId: selectedAssignment?.id,
                    status: nextStatus,
                  }),
              });

              publishAssignmentDialog.onFalse();
              setSelectedAssignment(null);
            }}
          >
            Publish
          </LoadingButton>
        }
      />

      <CustomDialog
        title={selectedAssignment?.title || ''}
        open={viewAssignmentSubmissionDialog.value}
        handleClose={() => {
          viewAssignmentSubmissionDialog.onFalse();
          setSelectedAssignment(null);
        }}
        maxWidth="lg"
      >
        <Box sx={{ p: 2 }}>
          <StudentSubmissions
            selectedAssignment={selectedAssignment}
            selectedClass={classes}
            selectedDivision={division}
            selectedSubject={subject}
          />
        </Box>
      </CustomDialog>

      <CustomDialog
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Assignment Details</Typography>
            <CustomTooltip
              sx={{ textAlign: 'justify' }}
              arrow
              placement="right"
              title="View complete details of the assignment including title, description, due date, submission status and other information"
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        open={viewAssignmentDetails.value}
        handleClose={() => {
          viewAssignmentDetails.onFalse();
          setSelectedAssignment(null);
        }}
        maxWidth="md"
      >
        <ViewAssignmentDetails assignment={selectedAssignment} />
      </CustomDialog>
    </Box>
  );
};

export default AssignmentCreation;
