'use client';

import type { RootState } from 'src/redux/store';
import type { Medium, Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
import { EmptyContent } from 'src/components/empty-content';
import { Box, TextField, Autocomplete } from '@mui/material';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetAssignmentsQuery } from 'src/redux/academicAPI/HomeworkAssignmentApi/LearningTasksApi/assignment-api';
import { useGetSubjectAssignmentsQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';

import { StudentSubmissions } from '../assignmentCreation/studentSubmission/studentSubmission';

import type { MarksFeedbackTabProps } from './index';

const AssignmentMarksAndFeedback = (props: MarksFeedbackTabProps) => {
  // State to store selected assignment data
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  // Dialog state for modal/popup control
  const [subject, setSubject] = useState('');
  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store selected class/standard ID
  const [classes, setClass] = useState<string>('');
  // State to store all divisions for the selected class
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  // State to store selected division ID
  const [division, setDivision] = useState<string>('');
  // State to store selected assignment type
  // const [assignmentType, setAssignmentType] = useState('');
  // State to store selected assignment title
  const [assignmentTitle, setAssignmentTitle] = useState('');

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
    setSubject('');
  }, [allClass, classes]);

  useEffect(() => {
    setAssignmentTitle('');
    setSelectedAssignment(null);
  }, [subject]);

  const selectedClassData = allClass.find((c) => c.id === classes);
  const selectedDivisionData = allDivision.find((d) => d.id === division);

  const {
    data: subjectOptionsData,
    isLoading: isSubjectOptionsLoading,
    isFetching: isSubjectOptionsFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectAssignmentsQuery,
    params: { standardId: classes },
    options: { skip: !classes },
  });

  const {
    data: assignmentData,
    isLoading: isAssignmentDataLoading,
    isFetching: isAssignmentDataFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAssignmentsQuery,
    params: {
      academicMediumId: (medium as Medium)?.id,
      StandardId: selectedClassData?.id,
      DivisionId: selectedDivisionData?.id,
      SubjectId: subject,
    },
    options: {
      skip: !(medium as Medium)?.id || !classes || !division || !subject,
    },
  });

  const assignmentOptions =
    (assignmentData?.items || []).map((hw: any) => ({
      id: hw.id,
      label: hw.title,
      submissionType: hw.submissionType,
    })) || [];

  // Dialog control for bulk grade assignment

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
          isLoading={isSubjectOptionsLoading || isSubjectOptionsFetching}
          label="Subject"
          value={subject}
          onChange={(val) => setSubject(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '248px', width: '100%' } }}
          disabled={!division}
        />
        <CustomTooltip
          placement="top"
          title={selectedAssignment ? `${selectedAssignment.label}` : undefined}
        >
          <Autocomplete
            options={assignmentOptions}
            getOptionLabel={(option: any) => option.label || ''}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={assignmentOptions.find((opt: any) => opt.id === assignmentTitle) || null}
            onChange={(event, newValue) => {
              setAssignmentTitle(newValue?.id || '');
              setSelectedAssignment(newValue || null);
            }}
            loading={isAssignmentDataLoading || isAssignmentDataFetching}
            disabled={!subject}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Assignment Title"
                size="small"
                fullWidth
                sx={{ minWidth: '248px', width: '100%' }}
                disabled={!subject}
              />
            )}
          />
        </CustomTooltip>
      </Box>
      {assignmentTitle ? (
        <StudentSubmissions
          selectedClass={classes}
          selectedDivision={division}
          selectedSubject={subject}
          selectedAssignment={selectedAssignment}
          selectedStudents={[]}
          handleBulkUpdate={() => {}}
          tableData={[]}
          setTableData={() => {}}
        />
      ) : (
        <EmptyContent title="Please select an assignment title to view student submissions." />
      )}
    </Box>
  );
};

export default AssignmentMarksAndFeedback;
