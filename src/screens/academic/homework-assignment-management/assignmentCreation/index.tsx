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
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useGetSubjectAssignmentsQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';
import {
  assignmentApi,
  useGetAssignmentsQuery,
  useGetAssignmentByIdQuery,
  useDeleteAssignmentMutation,
  useUpdateAssignmentStatusMutation,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/LearningTasksApi/assignment-api';

import AssignmentForm from './components/assignmentForm';
import AssignmentTable from './components/assignmentTable';
import ViewAssignmentDetails from './assignmentDetail/assignmentDetail';
import { StudentSubmissions } from './studentSubmission/studentSubmission';

import type { IAssignment } from './type';

const AssignmentCreation = ({ addAssignmentDialog }: any) => {
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
  const [viewAssignmentId, setViewAssignmentId] = useState<string | null>(null);
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
  // Get current board, medium and medium setter from global state
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const selectedClassData = allClass.find((c: any) => c?.id === classes);
  const selectedDivisionData = allDivision.find((d: any) => d?.id === division);

  const {
    data: assignmentData,
    isLoading,
    isFetching,
    refetch,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAssignmentsQuery,
    params: {
      academicMediumId: (medium as Medium)?.id,
      StandardId: selectedClassData?.id,
      DivisionId: selectedDivisionData?.id,
      SubjectId: subject,
      AssignmentDate: date?.isValid() ? date.toISOString() : undefined,
    },
    options: {
      skip: !(medium as Medium)?.id || !classes || !division || !subject,
    },
  });

  // Fetch full assignment details when a specific assignment is selected for viewing
  const {
    data: assignmentDetailData,
    isLoading: isAssignmentDetailLoading,
    isFetching: isAssignmentDetailFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAssignmentByIdQuery,
    params: {
      assignmentId: viewAssignmentId,
      academicMediumId: (medium as Medium)?.id,
    },
    options: { skip: !viewAssignmentId },
  });

  // Fetch subjects for the selected class
  const {
    data: subjectOptionsData,
    isLoading: isSubjectOptionsLoading,
    isFetching: isSubjectOptionsFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectAssignmentsQuery,
    params: {
      standardId: classes,
    },
    options: {
      skip: !classes,
    },
  });

  const [deleteAssignment, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteAssignmentMutation,
  });

  const [updateAssignmentStatus, { isLoading: isPublishLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateAssignmentStatusMutation,
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
    setDivision(allClass.find((org: any) => org?.id === classes)?.divisions?.[0]?.id || '');
    setSubject(''); // reset subject when class changes
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
          mt: 1,
          p: 1,
          gap: 2,
          mb: 1,
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
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '248px', width: '100%' } }}
          disabled={!classes}
        />
        <CustomSelect
          options={
            subjectOptionsData?.data?.items?.map((item: any) => ({
              id: item.id,
              name:
                item.subjects?.length > 1
                  ? item.electiveGroupName
                  : item.subjects?.[0]?.subject?.name || item.subjects?.[0]?.subjectName || '',
            })) || []
          }
          label="Subject"
          value={subject}
          onChange={(val) => setSubject(val as string)}
          labelKey="name"
          valueKey="id"
          isLoading={isSubjectOptionsLoading || isSubjectOptionsFetching}
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
        assignmentData={assignmentData?.items || []}
        isLoading={isLoading || isFetching}
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
          setViewAssignmentId(row.id);
          setSelectedAssignment(row);
          viewAssignmentDetails.onTrue();
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
              const assignmentQueryParams = {
                academicMediumId: (medium as Medium)?.id,
                StandardId: selectedClassData?.id,
                DivisionId: selectedDivisionData?.id,
                SubjectId: subject,
                AssignmentDate: date?.isValid() ? date.toISOString() : undefined,
              };

              confirmWithUndo({
                item: selectedAssignment,
                onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
                  dispatchFn(
                    assignmentApi.util.updateQueryData(
                      'getAssignments',
                      assignmentQueryParams,
                      (draft: any) => {
                        const index = draft.items?.findIndex(
                          (a: any) => a.id === selectedAssignment?.id
                        );
                        setDeleteIndex(index);
                        if (index !== -1) {
                          draft.items.splice(index, 1);
                        }
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
              try {
                await updateAssignmentStatus({
                  assignmentId: selectedAssignment?.id,
                  status: 1,
                }).unwrap();
                shikshaMitraToast.success({
                  message: `Assignment "${selectedAssignment?.title}" has been successfully published.`,
                });
              } catch (error: any) {
                shikshaMitraToast.error({
                  message: error?.data?.message || 'Failed to publish assignment.',
                });
              }
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
          setTimeout(() => {
            setSelectedAssignment(null);
            setViewAssignmentId(null);
          }, 200);
        }}
        maxWidth="md"
      >
        <ViewAssignmentDetails
          assignment={assignmentDetailData?.data ?? selectedAssignment}
          isLoading={isAssignmentDetailLoading || isAssignmentDetailFetching}
        />
      </CustomDialog>
    </Box>
  );
};

export default AssignmentCreation;
