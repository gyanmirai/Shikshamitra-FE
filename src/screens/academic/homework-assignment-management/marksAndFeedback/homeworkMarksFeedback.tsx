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
import { useGetHomeworksQuery } from 'src/redux/academicAPI/HomeworkAssignmentApi/LearningTasksApi/homework-api';
import { SubjectAssignmentStatus } from 'src/screens/academic/curriculum-management/subjectAssignment/enum/subjectType';
import { useGetSubjectAssignmentsQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';

import { StudentSubmissions } from '../homeworkCreation/studentSubmission/homeworkStudentSubmission';

import type { MarksFeedbackTabProps } from './index';

const HomeworkMarksAndFeedback = (props: MarksFeedbackTabProps) => {
  // State to store selected subject
  const [subject, setSubject] = useState('');
  // Composite key for subject dropdown display (handles elective groups: "assignmentId::subjectId")
  const [subjectSelectValue, setSubjectSelectValue] = useState('');
  // State to store list of all available classes/standards
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store selected class/standard
  const [classes, setClass] = useState<string>('');
  // State to store list of all divisions for selected class
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  // State to store selected division
  const [division, setDivision] = useState<string>('');
  // State to store homework title
  const [homeworkTitle, setHomeworkTitle] = useState('');
  const [selectedHomework, setSelectedHomework] = useState<any>(null);

  // Get current board and medium from global state
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const selectedClassData = allClass.find((c) => c.id === classes);
  const selectedDivisionData = allDivision.find((d) => d.id === division);

  const {
    currentData: subjectOptionsData,
    isLoading: isSubjectOptionsLoading,
    isFetching: isSubjectOptionsFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectAssignmentsQuery,
    params: { standardId: classes },
    options: { skip: !classes },
  });

  const {
    currentData: homeworkData,
    isLoading: isHomeworkDataLoading,
    isFetching: isHomeworkDataFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetHomeworksQuery,
    params: {
      academicMediumId: (medium as Medium)?.id,
      StandardId: selectedClassData?.id,
      DivisionId: selectedDivisionData?.id,
      SubjectId: subject,
    },
    options: {
      skip:
        !(medium as Medium)?.id || !selectedClassData?.id || !selectedDivisionData?.id || !subject,
    },
  });

  const homeworkOptions =
    (homeworkData?.items || [])
      .filter((hw: any) => isPublishedTask(hw))
      .map((hw: any) => ({
        id: hw.id,
        label: `${hw.title} · ${submissionTypeLabels[Number(hw.submissionType)] || 'Submission'}`,
        title: hw.title,
        description: hw.description,
        submissionType: hw.submissionType,
        evaluationRequired: hw.evaluationRequired,
        defaultEvaluationMethod: hw.defaultEvaluationMethod,
        defaultMarks: hw.defaultMarks,
        defaultDueDays: hw.defaultDueDays,
        homeworkTypeId: hw.homeworkTypeId,
        homeworkTypeName: hw.homeworkTypeName,
      })) || [];

  const subjectOptions = (() => {
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
  })();

  // Effect to update available classes when medium changes
  useEffect(() => {
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];
    setAllClass(allClasses);
    setClass(allClasses[0]?.id || '');
  }, [medium]);

  // Effect to update available divisions when selected class changes
  useEffect(() => {
    const selectedClass = allClass.find((cls) => cls.id === classes);
    setAllDivision(selectedClass?.divisions || []);
    setDivision(selectedClass?.divisions?.[0]?.id || '');
    setSubject('');
    setSubjectSelectValue('');
    setHomeworkTitle('');
    setSelectedHomework(null);
  }, [allClass, classes]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1, minHeight: 0 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            sm: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(4, minmax(0, 1fr))',
          },
          flexShrink: 0,
          borderRadius: 1,
          bgcolor: 'background.paper',
          boxShadow: 'var(--shadows-3)',
          mt: 1,
          p: 1,
          gap: 1,
          mb: 1,
        }}
      >
        <CustomSelect
          options={allClass}
          label="Class"
          value={classes}
          onChange={(val) => {
            setClass(val as string);
            setDivision('');
            setSubject('');
            setSubjectSelectValue('');
            setHomeworkTitle('');
            setSelectedHomework(null);
          }}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { minWidth: 0, width: 1 } }}
        />
        <CustomSelect
          options={allDivision}
          label="Division"
          value={division}
          onChange={(val) => {
            setDivision(val as string);
            setHomeworkTitle('');
            setSelectedHomework(null);
          }}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { minWidth: 0, width: 1 } }}
          disabled={!classes}
        />
        <CustomSelect
          options={subjectOptions}
          label="Subject"
          value={subjectSelectValue}
          onChange={(val) => {
            const strVal = String(val);
            // Extract the actual subjectId from composite key "assignmentId::subjectId"
            const resolvedSubjectId = strVal.includes('::') ? strVal.split('::')[1] : strVal;
            setSubjectSelectValue(strVal);
            setSubject(resolvedSubjectId);
            setHomeworkTitle('');
            setSelectedHomework(null);
          }}
          labelKey="label"
          valueKey="value"
          isLoading={isSubjectOptionsLoading || isSubjectOptionsFetching}
          formControlProps={{ sx: { minWidth: 0, width: 1 } }}
          disabled={!division}
        />

        <CustomTooltip
          placement="top"
          title={selectedHomework ? `${selectedHomework.label}` : undefined}
        >
          <Autocomplete
            sx={{ minWidth: 0, width: 1 }}
            options={homeworkOptions}
            getOptionLabel={(option: any) => option.label || ''}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={homeworkOptions.find((opt: any) => opt.id === homeworkTitle) || null}
            onChange={(event, newValue) => {
              setHomeworkTitle(newValue?.id || '');
              setSelectedHomework(newValue || null);
            }}
            loading={isHomeworkDataLoading || isHomeworkDataFetching}
            disabled={!subject}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Homework title"
                size="small"
                fullWidth
                disabled={!subject}
              />
            )}
          />
        </CustomTooltip>
      </Box>
      {homeworkTitle ? (
        <StudentSubmissions
          key={`${classes}:${division}:${subject}:${homeworkTitle}`}
          selectedClass={classes}
          selectedDivision={division}
          selectedSubject={subject}
          selectedHomework={selectedHomework}
        />
      ) : (
        <EmptyContent title="Please select a homework title to view student submissions." />
      )}
    </Box>
  );
};

export default HomeworkMarksAndFeedback;

const submissionTypeLabels: Record<number, string> = {
  0: 'Online Text',
  1: 'File Upload',
  2: 'In-Person',
  3: 'No Submission Required',
};

const isPublishedTask = (task: any) =>
  Number(task?.status) === 1 || String(task?.status || '').toLowerCase() === 'published';
