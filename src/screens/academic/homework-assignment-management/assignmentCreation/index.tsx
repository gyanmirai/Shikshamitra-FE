import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { Medium, Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Box, Typography } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { academicPermissions } from 'src/constants/academic-menu';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { AcademicDatePicker as DatePicker } from 'src/components/academic-date-picker';
import {
  AssignmentStatus,
  AssignmentSubmissionType,
} from 'src/enums/assignment';
import { useGetSubjectAssignmentsQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';
import {
  useGetAssignmentsQuery,
  useGetAssignmentByIdQuery,
  useDeleteAssignmentMutation,
  useUpdateAssignmentStatusMutation,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/LearningTasksApi/assignment-api';

import AssignmentForm from './components/assignmentForm';
import AssignmentTable from './components/assignmentTable';
import ViewAssignmentDetails from './assignmentDetail/assignmentDetail';
import { StudentSubmissions } from './studentSubmission/studentSubmission';
import { SubjectAssignmentStatus } from '../../curriculum-management/subjectAssignment/enum/subjectType';

import type { IAssignment } from './type';

const AssignmentCreation = ({ addAssignmentDialog }: any) => {
  // Dialog state for add/edit assignment form
  // const addAssignmentDialog = useBoolean();
  // Dialog state for delete assignment confirmation
  const deleteAssignmentDialog = useBoolean();
  // Dialog state for publish assignment confirmation
  const publishAssignmentDialog = useBoolean();
  const closeAssignmentDialog = useBoolean();
  // Dialog state for viewing student assignment submissions
  const viewAssignmentSubmissionDialog = useBoolean();
  // Dialog state for viewing assignment details
  const viewAssignmentDetails = useBoolean();
  // Get changes state from redux store
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  const { permissions } = useSelector((state: RootState) => state.auth);

  // Permission checks
  const canAdd = hasGrantedPermission(
    permissions,
    `${academicPermissions.homework.learningTasks}.Add`
  );
  const canView = hasGrantedPermission(
    permissions,
    `${academicPermissions.homework.learningTasks}.View`
  );
  const canDelete = hasGrantedPermission(
    permissions,
    `${academicPermissions.homework.learningTasks}.Delete`
  );
  // State to store currently selected assignment for edit/delete/publish
  const [selectedAssignment, setSelectedAssignment] = useState<IAssignment | null>(null);
  const [viewAssignmentId, setViewAssignmentId] = useState<string | null>(null);
  // Redux dispatch function
  const dispatch = useDispatch();
  // const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [subject, setSubject] = useState('');
  const [subjectSelectValue, setSubjectSelectValue] = useState('');
  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [dateError, setDateError] = useState<string | null>(null);
  // State to store selected class/standard ID
  const [classes, setClass] = useState<string>('');
  // State to store all divisions for the selected class
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  // State to store selected division ID
  const [division, setDivision] = useState<string>('');
  // State to store and update the selected date using dayjs
  const [date, setDate] = useState<Dayjs | null>(dayjs().startOf('day'));
  // Get current board, medium and medium setter from global state
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const selectedClassData = allClass.find((c: any) => c?.id === classes);
  const selectedDivisionData = allDivision.find((d: any) => d?.id === division);

  const isValidDate = !!date && date.isValid() && !dateError;

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
      AssignmentDate: isValidDate ? date!.format('YYYY-MM-DD') : undefined,
    },
    options: {
      skip: !(medium as Medium)?.id || !classes || !division || !subject || !isValidDate,
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
      divisionId: division,
    },
    options: {
      skip: !classes || !division,
    },
  });

  const [deleteAssignment, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteAssignmentMutation,
  });

  const [updateAssignmentStatus, { isLoading: isStatusLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateAssignmentStatusMutation,
  });

  // Auto-select first subject when subjects load
  useEffect(() => {
    const firstItem = subjectOptionsData?.data?.items?.find(
      (item: any) => item.status !== SubjectAssignmentStatus.Draft
    );
    if (firstItem && !subject) {
      const firstSubjectId = firstItem.subjects?.[0]?.subjectId || firstItem.id;
      const firstSelectValue = `${firstItem.id}::${firstSubjectId}`;
      setSubject(firstSubjectId);
      setSubjectSelectValue(firstSelectValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectOptionsData]);

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
    setSubjectSelectValue('');
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
          gap: 1,
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
          onChange={(val) => {
            setDivision(val as string);
            setSubject('');
            setSubjectSelectValue('');
          }}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '248px', width: '100%' } }}
          disabled={!classes}
        />
        <CustomSelect
          options={(() => {
            const allOptions: { value: string; label: string }[] = [];
            subjectOptionsData?.data?.items?.forEach((item: any) => {
              if (item.status === SubjectAssignmentStatus.Draft) return;
              if (item.subjects?.length > 1 && item.electiveGroupName) {
                // Elective group — each subject as its own dropdown entry
                item.subjects.forEach((sub: any, index: number) => {
                  const subId = sub.subjectId || String(index);
                  allOptions.push({
                    value: `${item.id}::${subId}`,
                    label: sub.subjectName || `${item.electiveGroupName} ${index + 1}`,
                  });
                });
              } else {
                // Regular single subject
                allOptions.push({
                  value: `${item.id}::${item.subjects?.[0]?.subjectId || item.id}`,
                  label: item.subjects?.[0]?.subject?.name || item.subjects?.[0]?.subjectName || '',
                });
              }
            });
            return allOptions;
          })()}
          label="Subject"
          value={subjectSelectValue}
          onChange={(val) => {
            const strVal = String(val);
            // Extract the actual subjectId from composite key "assignmentId::subjectId"
            const resolvedSubjectId = strVal.includes('::') ? strVal.split('::')[1] : strVal;
            setSubjectSelectValue(strVal);
            setSubject(resolvedSubjectId);
          }}
          labelKey="label"
          valueKey="value"
          isLoading={isSubjectOptionsLoading || isSubjectOptionsFetching}
          formControlProps={{ sx: { maxWidth: '248px', width: '100%' } }}
          disabled={!division}
        />
        <DatePicker
          label="Assignment Date"
          slotProps={{ textField: { size: 'small', fullWidth: true } }}
          name="date"
          value={date}
          onError={(error) => setDateError(error ? String(error) : null)}
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
        hasForm={false}
        open={addAssignmentDialog.value}
        handleClose={() => {
          addAssignmentDialog.onFalse();
          setTimeout(() => {
            setSelectedAssignment(null);
            dispatch(setIsChanges(false));
          }, 200);
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
        assignmentData={isValidDate ? assignmentData?.items || [] : []}
        isLoading={isLoading || isFetching}
        dialog={addAssignmentDialog}
        selectedDivision={division}
        selectedClass={classes}
        canAdd={canAdd}
        canView={canView}
        canDelete={canDelete}
        onSwitchToggle={(row) => {
          setSelectedAssignment(row);
          publishAssignmentDialog.onTrue();
        }}
        onClose={(row) => {
          setSelectedAssignment(row);
          closeAssignmentDialog.onTrue();
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
          if (
            row.status !== AssignmentStatus.Published ||
            row.submissionType === AssignmentSubmissionType.NoSubmissionRequired
          ) {
            return;
          }
          viewAssignmentSubmissionDialog.onTrue();
          setSelectedAssignment(row);
        }}
      />

      <ConfirmDialog
        open={deleteAssignmentDialog.value}
        disableBackdropClick
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
                AssignmentDate: isValidDate ? date.format('YYYY-MM-DD') : undefined,
              };

              try {
                await deleteAssignment(selectedAssignment?.id).unwrap();
                shikshaMitraToast.success({ message: 'Assignment deleted successfully' });
              } catch (error: any) {
                shikshaMitraToast.error({
                  message: error?.data?.message || 'Failed to delete assignment.',
                });
              }

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
        disableBackdropClick
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
            loading={isStatusLoading}
            startIcon={<Iconify icon={GlobalIcons.publish} />}
            onClick={async () => {
              try {
                await updateAssignmentStatus({
                  assignmentId: selectedAssignment?.id,
                  status: AssignmentStatus.Published,
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

      <ConfirmDialog
        open={closeAssignmentDialog.value}
        disableBackdropClick
        onClose={() => {
          closeAssignmentDialog.onFalse();
          setSelectedAssignment(null);
        }}
        icon="warning"
        title="Close Assignment"
        content={
          <>
            Close assignment <strong>{selectedAssignment?.title}</strong>? Students will no longer be
            able to submit work.
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            color="warning"
            size="small"
            loading={isStatusLoading}
            onClick={async () => {
              if (!selectedAssignment?.id) return;
              try {
                await updateAssignmentStatus({
                  assignmentId: selectedAssignment.id,
                  status: AssignmentStatus.Closed,
                }).unwrap();
                shikshaMitraToast.success({
                  message: `Assignment "${selectedAssignment.title}" has been closed.`,
                });
              } catch (error: unknown) {
                shikshaMitraToast.error({
                  message: parseApiProblemDetail(error).detail || 'Failed to close assignment.',
                });
              }
              closeAssignmentDialog.onFalse();
              setSelectedAssignment(null);
            }}
          >
            Close Assignment
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
