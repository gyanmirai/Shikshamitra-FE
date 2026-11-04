'use client';

import type { RootState } from 'src/redux/store';
import type { Medium, Division, Standards, Organization } from 'src/types/school';
import type { AssignmentV2Dto } from 'src/redux/academicAPI/HomeworkAssignmentApi/contracts';

import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
import { EmptyContent } from 'src/components/empty-content';
import { Box, TextField, Autocomplete } from '@mui/material';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { AcademicInsights } from 'src/screens/academic/components/academic-insights';
import { useGetAssignmentsQuery } from 'src/redux/academicAPI/HomeworkAssignmentApi/LearningTasksApi/assignment-api';
import {
  AssignmentStatus,
  AssignmentEvaluationMethod,
  ASSIGNMENT_SUBMISSION_TYPE_LABELS,
} from 'src/enums/assignment';
import { useGetSubjectAssignmentsQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';
import { useGetAssignmentSubmissionsQuery } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/AssignmentAssessmentAndFeedbackApi';

import { dedupeEvaluationRows, getEvaluationSummary } from './evaluationWorkspaceUi';
import { StudentSubmissions } from '../assignmentCreation/studentSubmission/studentSubmission';
import { SubjectAssignmentStatus } from '../../curriculum-management/subjectAssignment/enum/subjectType';

import type { MarksFeedbackTabProps } from './index';

const AssignmentMarksAndFeedback = ({ actionsContainer }: MarksFeedbackTabProps) => {
  // State to store selected assignment data
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  // Dialog state for modal/popup control
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
  // State to store selected assignment type
  // const [assignmentType, setAssignmentType] = useState('');
  // State to store selected assignment title
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

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
    setSubjectSelectValue('');
  }, [allClass, classes]);

  useEffect(() => {
    setAssignmentTitle('');
    setSelectedAssignment(null);
  }, [subject]);

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
    currentData: assignmentData,
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
    (assignmentData?.items || [])
      .filter((assignment: AssignmentV2Dto) => assignment.status === AssignmentStatus.Published)
      .map((assignment: AssignmentV2Dto) => ({
        ...assignment,
        label: `${assignment.title} - ${ASSIGNMENT_SUBMISSION_TYPE_LABELS[assignment.submissionType]}`,
        evaluationMethod:
          assignment.evaluationMethod ??
          assignment.defaultEvaluationMethod ??
          AssignmentEvaluationMethod.Marks,
      })) || [];

  const {
    currentData: assignmentSubmissions,
    isLoading: areInsightsLoading,
    isFetching: areInsightsFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAssignmentSubmissionsQuery,
    params: {
      academicMediumId: (medium as Medium)?.id,
      ClassId: classes,
      DivisionId: division,
      SubjectId: subject,
      AssignmentId: selectedAssignment?.id,
    },
    options: { skip: !selectedAssignment?.id || !classes || !division || !subject },
  });
  const insightsSummary = getEvaluationSummary(
    dedupeEvaluationRows(assignmentSubmissions?.data || []),
    assignmentSubmissions?.summary
  );

  // Dialog control for bulk grade assignment

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
        {' '}
        <CustomSelect
          options={allClass}
          label="Class"
          value={classes}
          onChange={(val) => {
            setClass(val as string);
            setDivision('');
            setSubject('');
            setSubjectSelectValue('');
            setAssignmentTitle('');
            setSelectedAssignment(null);
            setActiveFilter('all');
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
            setAssignmentTitle('');
            setSelectedAssignment(null);
            setActiveFilter('all');
          }}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { minWidth: 0, width: 1 } }}
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
          isLoading={isSubjectOptionsLoading || isSubjectOptionsFetching}
          label="Subject"
          value={subjectSelectValue}
          onChange={(val) => {
            const strVal = String(val);
            // Extract the actual subjectId from composite key "assignmentId::subjectId"
            const resolvedSubjectId = strVal.includes('::') ? strVal.split('::')[1] : strVal;
            setSubjectSelectValue(strVal);
            setSubject(resolvedSubjectId);
            setAssignmentTitle('');
            setSelectedAssignment(null);
            setActiveFilter('all');
          }}
          labelKey="label"
          valueKey="value"
          formControlProps={{ sx: { minWidth: 0, width: 1 } }}
          disabled={!division}
        />
        <CustomTooltip
          placement="top"
          title={selectedAssignment ? `${selectedAssignment.label}` : undefined}
        >
          <Autocomplete
            sx={{ minWidth: 0, width: 1 }}
            options={assignmentOptions}
            getOptionLabel={(option: any) => option.label || ''}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={assignmentOptions.find((opt: any) => opt.id === assignmentTitle) || null}
            onChange={(event, newValue) => {
              setAssignmentTitle(newValue?.id || '');
              setSelectedAssignment(newValue || null);
              setActiveFilter('all');
            }}
            loading={isAssignmentDataLoading || isAssignmentDataFetching}
            disabled={!subject}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Assignment title"
                size="small"
                fullWidth
                disabled={!subject}
              />
            )}
          />
        </CustomTooltip>
        {assignmentTitle &&
          actionsContainer &&
          createPortal(
            <AcademicInsights
              title="Assignment evaluation insights"
              description={`Submission and feedback for ${selectedAssignment?.title || 'the selected assignment'}.`}
              isLoading={areInsightsLoading || areInsightsFetching}
              buttonSx={{ mb: 0 }}
              chart={{
                title: 'Evaluation status overview',
                description: 'Students by evaluation status for the selected assignment.',
                categories: ['Needs review', 'Reviewed', 'Not submitted'],
                values: [
                  insightsSummary.needsReview,
                  insightsSummary.reviewed,
                  insightsSummary.notSubmitted,
                ],
                seriesName: 'Students',
              }}
              metrics={[
                {
                  id: 'students',
                  label: 'Students',
                  value: insightsSummary.totalStudents,
                  icon: 'solar:users-group-rounded-bold',
                  selected: activeFilter === 'all',
                  onClick: () => setActiveFilter('all'),
                },
                {
                  id: 'submitted',
                  label: 'Submitted',
                  value: insightsSummary.submitted,
                  icon: 'solar:inbox-in-bold',
                  selected: activeFilter === 'submitted',
                  onClick: () => setActiveFilter('submitted'),
                },
                {
                  id: 'needs-review',
                  label: 'Needs review',
                  value: insightsSummary.needsReview,
                  icon: 'solar:clipboard-check-bold',
                  selected: activeFilter === 'needsReview',
                  onClick: () => setActiveFilter('needsReview'),
                },
                {
                  id: 'reviewed',
                  label: 'Reviewed',
                  value: insightsSummary.reviewed,
                  icon: 'solar:check-circle-bold',
                  selected: activeFilter === 'reviewed',
                  onClick: () => setActiveFilter('reviewed'),
                },
                {
                  id: 'not-submitted',
                  label: 'Not submitted',
                  value: insightsSummary.notSubmitted,
                  icon: 'solar:clock-circle-bold',
                  selected: activeFilter === 'notSubmitted',
                  onClick: () => setActiveFilter('notSubmitted'),
                },
                {
                  id: 'average-marks',
                  label: 'Average marks',
                  value: insightsSummary.averageMarks ?? '-',
                  icon: 'solar:chart-2-bold',
                },
              ]}
            />,
            actionsContainer
          )}
      </Box>
      {assignmentTitle ? (
        <StudentSubmissions
          key={`${classes}:${division}:${subject}:${assignmentTitle}`}
          selectedClass={classes}
          selectedDivision={division}
          selectedSubject={subject}
          activeFilter={activeFilter}
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
