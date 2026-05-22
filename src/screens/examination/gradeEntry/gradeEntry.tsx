'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { motion } from 'framer-motion';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { examScheduledStatus } from 'src/enums/exam-scheduled-status';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Box, MenuList, MenuItem, TextField, Typography, Autocomplete } from '@mui/material';
import { useGetExamsQuery } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/schedule-examApi';
import { usePublishExamMarksMutation } from 'src/redux/academicAPI/ExaminationApi/RecordMarksApi/recordMarksApi';
import { useGetSubjectsQuery } from 'src/redux/classManagementApi/subjectProgressManageApi/subjectProgressManageApi';

import AssignGrade from './components/assignGradeForm';
import GradeEntryTable from './components/GradeEntryTable';

import type { IStudentExamGradeEntry } from './type';
import type { TabComponentType } from '../../hr/leave-request';

const GradeEntry = (props: TabComponentType) => {
  // Dialog control for showing/hiding modal
  const dialog = useBoolean();
  // Search parameters from URL and function to update them
  const { searchParams } = props;

  // Selected subject for grade entry
  const [subject, setSubject] = useState(searchParams?.subject ? searchParams?.subject : '');
  // Type of assignment (quiz, test, homework etc)
  const [assignmentType] = useState(
    searchParams?.assignmentType ? searchParams?.assignmentType : ''
  );
  // Title of the selected assignment
  const [examId, setExamId] = useState(searchParams?.examId ? searchParams?.examId : '');
  // Query to fetch class data
  // const { data: classData, isLoading } = useQueryAndMutation({
  //   type: 'query',
  //   currentQueryAndMutation: useGetClassQuery,
  // });

  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store selected class/standard ID
  const [classes, setClass] = useState<string>('');
  // State to store all divisions for the selected class
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  // State to store selected division ID
  const [division, setDivision] = useState<string>('');

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
  }, [allClass, classes]);

  // Reset subject and examId when class or division changes
  useEffect(() => {
    setSubject('');
    setExamId('');
  }, [classes, division]);

  // Reset examId when subject changes
  useEffect(() => {
    setExamId('');
  }, [subject]);

  // Fetch subjects dynamically based on selected class and division
  const {
    data: subjectData,
    isLoading: isSubjectsLoading,
    isFetching: isSubjectsFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectsQuery,
    params: {
      academicMediumId: medium?.id,
      classId: classes,
      divisionId: division,
    },
    options: {
      skip: !(medium?.id && classes && division),
    },
  });

  // Map API response to { id, name } options for the Subject dropdown
  const subjectOptions = useMemo<{ id: string; name: string }[]>(() => {
    const raw: any[] = Array.isArray(subjectData)
      ? subjectData
      : (subjectData?.data?.items ?? subjectData?.items ?? subjectData?.records ?? []);
    return raw.map((s: any) => ({
      id: s.subjectId ?? s.id ?? '',
      name: s.subjectName ?? s.name ?? '',
    }));
  }, [subjectData]);

  // Fetch exams dynamically based on selected class, division, and subject
  const {
    data: examData,
    isLoading: isExamsLoading,
    isFetching: isExamsFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamsQuery,
    params: {
      AcademicMediumId: medium?.id,
      StandardId: classes,
      DivisionId: division,
      SubjectId: subject,
      Status: examScheduledStatus.Completed,
      ...(assignmentType ? { ExamType: assignmentType } : {}),
    },
    options: {
      skip: !(medium?.id && classes && division && subject),
    },
  });

  // Map API exam items to a stable options array for the Exam Title Autocomplete
  const examOptions = useMemo<{ examId: string; examName: string }[]>(() => {
    const raw: any[] = examData?.data?.items ?? examData?.items ?? [];
    return raw.map((e: any) => ({
      examId: e.examId ?? e.id ?? '',
      examName: e.examName ?? e.name ?? '',
    }));
  }, [examData]);

  // Currently selected student for grade entry
  const [selectedStudent, setSelectedStudent] = useState<IStudentExamGradeEntry | null>(null);
  // Array of selected student IDs for bulk grade assignment
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  // True when every student row has status === 1 (marks assigned)
  const [allMarksAssigned, setAllMarksAssigned] = useState(false);

  // Dialog control for viewing student submission
  const viewSubmissionDialog = useBoolean();
  // Dialog control for viewing student submission
  const publishMarksDialog = useBoolean();
  // Dialog control for bulk grade assignment
  const bulkGradeDialog = useBoolean();

  /**
   * Handles selection/deselection of a student for bulk grade assignment
   * @param studentId - The ID of the student to toggle selection
   */
  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId);
      }
      return [...prev, studentId];
    });
  };

  const [publishExamMarks, { isLoading: isPublishLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePublishExamMarksMutation,
  });

  const handlePublishMarks = async () => {
    if (!examId || !division) return;
    try {
      await publishExamMarks({ examId, divisionId: division }).unwrap();
      publishMarksDialog.onFalse();
      shikshaMitraToast.success({
        message: `Marks published successfully for ${examOptions.find((o) => o.examId === examId)?.examName ?? 'selected exam'}.`,
      });
    } catch (error) {
      console.error('[GradeEntry] Failed to publish marks:', error);
    }
  };

  // Get the changes status from the confirm popup redux state
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // Redux dispatch function for triggering actions
  const dispatch = useDispatch();

  /**
   * Closes all dialogs and resets selected student state
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setSelectedStudent(null);
        dispatch(setIsChanges(false));
      }, 200); // Adjust timing based on your dialog close animation
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      viewSubmissionDialog.onFalse();
      dialog.onFalse();
      bulkGradeDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      viewSubmissionDialog.onFalse();
      dialog.onFalse();
      bulkGradeDialog.onFalse();
      setTimeout(() => {
        setSelectedStudent(null);
      }, 200);
    }
  };

  const actions = useCallback(
    ({ popover, row }: any) => (
      <>
        {' '}
        <MenuList>
          {row.status === 0 && (
            <MenuItem
              onClick={() => {
                viewSubmissionDialog.onTrue();
                popover.onClose();
                setSelectedStudent({ ...row, subjectId: subject, examId: row.examId || examId });
              }}
            >
              {' '}
              <Iconify icon="mdi:arrow-right-circle" />
              Assign Marks
            </MenuItem>
          )}

          {row.status === 1 && (
            <MenuItem
              onClick={() => {
                popover.onClose();
                viewSubmissionDialog.onTrue();
                setSelectedStudent({ ...row, subjectId: subject, examId: row.examId || examId });
              }}
            >
              {' '}
              <Iconify icon={GlobalIcons.edit} sx={{ height: '16px', width: '16px' }} />
              Update Marks
            </MenuItem>
          )}
        </MenuList>
      </>
    ),
    [viewSubmissionDialog, subject, examId]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <CustomBreadcrumbs
          heading="Grade Entry"
          description="Enter and manage student examination marks and grades"
          links={[
            { name: 'Academics', href: '/academic/dashboard' },
            { name: 'Examination', href: '/academic/scheduleExam' },
            { name: 'Grade Entry' },
          ]}
          action={
            <LoadingButton
              variant="contained"
              size="small"
              disabled={!examId || !allMarksAssigned}
              startIcon={<Iconify icon={GlobalIcons.publish} />}
              onClick={() => {
                publishMarksDialog.onTrue();
              }}
              loading={isPublishLoading}
              title="Publish marks to make them visible to students"
              sx={{ px: '32px' }}
            >
              {} Publish Marks
            </LoadingButton>
          }
        />
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Box
            display="flex"
            sx={{
              borderRadius: '8px',
              bgcolor: 'background.paper',
              boxShadow: 'var(--shadows-3)',
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
              label="Subject"
              disabled={!division}
              options={subjectOptions}
              labelKey="name"
              valueKey="id"
              isLoading={isSubjectsLoading || isSubjectsFetching}
              onChange={(val) => {
                setSubject(val as string);
              }}
              value={subject}
              formControlProps={{ sx: { maxWidth: '248px', width: '100%' } }}
            />
            <CustomTooltip
              placement="top"
              title={examId && examOptions.find((o) => o.examId === examId)?.examName}
            >
              <Autocomplete
                disabled={!subject}
                loading={isExamsLoading || isExamsFetching}
                options={examOptions}
                getOptionLabel={(option: any) => option.examName || ''}
                isOptionEqualToValue={(option, value) => option.examId === value.examId}
                value={examOptions.find((opt) => opt.examId === examId) || null}
                onChange={(_event, newValue) => {
                  setExamId(newValue?.examId || '');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Exam Title"
                    size="small"
                    fullWidth
                    sx={{ minWidth: '248px', width: '100%' }}
                  />
                )}
              />
            </CustomTooltip>
          </Box>
        </motion.div>
        <GradeEntryTable
          selectedStudents={selectedStudents}
          handleSelectStudent={handleSelectStudent}
          actions={actions}
          classId={classes}
          divisionId={division}
          subjectId={subject}
          examId={examId}
          onAllAssignedChange={setAllMarksAssigned}
        />

        <CustomDialog
          open={viewSubmissionDialog.value}
          handleClose={() => {
            viewSubmissionDialog.onFalse();
            setTimeout(() => {
              setSelectedStudent(null);
            }, 200); // Adjust timing based on dialog animation if needed
          }}
          title={
            <Box display="flex" flexDirection="row" gap={1} alignItems="center">
              <Typography variant="h5">
                {selectedStudent?.status === 1 ? 'Update Marks' : 'Assign Marks'}
              </Typography>
              <CustomTooltip
                sx={{ textAlign: 'justify' }}
                arrow
                placement="right"
                title={
                  selectedStudent?.status === 1
                    ? 'You can modify the existing marks, grades and feedback for this student.'
                    : 'Input marks, assign grades, and give feedback for the student.'
                }
              >
                <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
              </CustomTooltip>
            </Box>
          }
        >
          <AssignGrade data={selectedStudent} onClose={handleClose} />
        </CustomDialog>

        <CustomDialog
          open={bulkGradeDialog.value}
          handleClose={bulkGradeDialog.onFalse}
          title={`Assign Grade to ${selectedStudents.length} Students`}
        >
          <AssignGrade />
        </CustomDialog>

        <ConfirmDialog
          open={publishMarksDialog.value}
          onClose={() => {
            publishMarksDialog.onFalse();
          }}
          title="Publish Marks"
          content={
            <>
              Are you sure you want to publish marks for{' '}
              <strong>{examOptions.find((o) => o.examId === examId)?.examName ?? examId}</strong>?
              This will make the marks visible to students and cannot be undone.
            </>
          }
          action={
            <LoadingButton
              variant="contained"
              size="small"
              loading={isPublishLoading}
              startIcon={<Iconify icon={GlobalIcons.publish} />}
              onClick={handlePublishMarks}
            >
              Publish
            </LoadingButton>
          }
        />
      </Box>
    </Box>
  );
};

export default GradeEntry;
