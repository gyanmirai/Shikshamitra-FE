import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { Medium, Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Box, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import React, { useMemo, useState, useEffect } from 'react';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { academicPermissions } from 'src/constants/academic-menu';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { SubjectAssignmentStatus } from 'src/screens/academic/curriculum-management/subjectAssignment/enum/subjectType';
import { useGetSubjectAssignmentsQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';
import {
  homeworkApi,
  useGetHomeworksQuery,
  useGetHomeworkByIdQuery,
  useDeleteHomeworkMutation,
  useUpdateHomeworkStatusMutation,
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
  // State to store all organizations/stages from the selected medium
  // const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [subject, setSubject] = useState('');
  // Composite key for subject dropdown display (handles elective groups: "assignmentId::subjectId")
  const [subjectSelectValue, setSubjectSelectValue] = useState('');
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
  // Tracks DatePicker's own validation error
  const [dateError, setDateError] = useState<string | null>(null);
  // AND the DatePicker itself reports no error (rules out partial manual typing)
  const isValidDate = !!date && date.isValid() && !dateError;
  const [deleteHomework, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteHomeworkMutation,
  });
  const [updateHomeworkStatus, { isLoading: isPublishLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateHomeworkStatusMutation,
  });

  // Get current board, medium and medium setter from global state
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

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

  // Controls form visibility
  const [, setOpen] = useState(false);
  // Breadcrumb navigation links based on form state
  // Redux state for tracking unsaved changes
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  // State to track the currently selected homework assignment for editing
  const [selectedHomework, setSelectedHomework] = useState<IHomework | null>(null);
  const [, setViewHomework] = useState<IHomeworkDetail | null>(null);
  // ID of homework to fetch detail for — drives the GET-by-id query
  const [viewHomeworkId, setViewHomeworkId] = useState<string | null>(null);

  // State to store the list of homework/subject assignments
  // const [homeworkData] = useState<any[]>(homeworkTableData);
  // Redux dispatch
  const dispatch = useDispatch();

  const selectedClassData = allClass.find((c: any) => c?.id === classes);
  const selectedDivisionData = allDivision.find((d: any) => d?.id === division);

  const homeworkQueryParams = useMemo(
    () => ({
      academicMediumId: (medium as Medium)?.id,
      StandardId: selectedClassData?.id,
      DivisionId: selectedDivisionData?.id,
      SubjectId: subject,
      HomeworkDate: isValidDate ? date!.toISOString() : undefined,
    }),
    [date, isValidDate, medium, selectedClassData?.id, selectedDivisionData?.id, subject]
  );

  // Fetch full homework details when a specific homework is selected for viewing
  const {
    data: homeworkDetailData,
    isLoading: isHomeworkDetailLoading,
    isFetching: isHomeworkDetailFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetHomeworkByIdQuery,
    params: {
      homeworkId: viewHomeworkId,
      academicMediumId: (medium as Medium)?.id,
    },
    options: { skip: !viewHomeworkId },
  });

  const {
    data: homeworkData,
    refetch,
    isLoading: isHomeworkDataLoading,
    isFetching: isHomeworkDataFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetHomeworksQuery,
    params: homeworkQueryParams,
    options: {
      skip: !(medium as Medium)?.id || !classes || !division || !subject || !isValidDate,
    },
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
          label="Homework Date"
          slotProps={{ textField: { size: 'small', fullWidth: true } }}
          name="date"
          minDate={dayjs(currentYear?.startDate)}
          maxDate={dayjs(currentYear?.endDate)}
          value={date}
          onError={(error) => setDateError(error ? String(error) : null)}
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
        homeworkData={isValidDate ? homeworkData?.items || [] : []}
        isLoading={isHomeworkDataLoading || isHomeworkDataFetching}
        selectedDivision={division}
        setOpen={setOpen}
        dialog={addHomeworkDialog}
        canAdd={canAdd}
        canView={canView}
        canDelete={canDelete}
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
          setViewHomeworkId(row.id);
          setSelectedHomework(row);
          viewHomeworkDetailDialog.onTrue();
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
              if (!selectedHomework?.id) {
                publishHomeworkDialog.onFalse();
                setSelectedHomework(null);
                return;
              }

              try {
                await updateHomeworkStatus({
                  homeworkId: selectedHomework.id,
                  status: 1,
                }).unwrap();

                dispatch(
                  // @ts-ignore
                  homeworkApi.util.updateQueryData(
                    'getHomeworks',
                    homeworkQueryParams,
                    (draft: any) => {
                      const homework = draft.items?.find(
                        (item: any) => item.id === selectedHomework.id
                      );

                      if (!homework) return;

                      homework.status = 1;

                      const schedules = homework.divisionSchedules || homework.divisions || [];
                      const currentDivisionId =
                        (selectedHomework as any).currentDivisionId || division;

                      schedules.forEach((schedule: any) => {
                        if (!currentDivisionId || schedule.divisionId === currentDivisionId) {
                          schedule.status = 1;
                          schedule.isPublished = true;
                        }
                      });
                    }
                  )
                );

                shikshaMitraToast.success({
                  message: `Homework "${selectedHomework?.title}" has been successfully published.`,
                });
              } catch (error: any) {
                shikshaMitraToast.error({
                  message: error?.data?.message || 'Failed to publish homework.',
                });
              }
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
              const homeworkQueryParam = {
                academicMediumId: (medium as Medium)?.id,
                StandardId: selectedClassData?.id,
                DivisionId: selectedDivisionData?.id,
                SubjectId: subject,
                HomeworkDate: isValidDate ? date!.toISOString() : undefined,
              };

              try {
                await deleteHomework({ homeworkId: selectedHomework?.id }).unwrap();
                shikshaMitraToast.success({ message: 'Homework deleted successfully' });
              } catch (error: any) {
                shikshaMitraToast.error({
                  message: error?.data?.message || 'Failed to delete homework.',
                });
              }

              deleteHomeworkDialog.onFalse();
              setSelectedHomework(null);
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
          setTimeout(() => {
            setSelectedHomework(null);
            setViewHomeworkId(null);
          }, 200);
        }}
        maxWidth="md"
      >
        <ViewHomeworkDetails
          homework={homeworkDetailData?.data ?? selectedHomework}
          isLoading={isHomeworkDetailLoading || isHomeworkDetailFetching}
        />
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
