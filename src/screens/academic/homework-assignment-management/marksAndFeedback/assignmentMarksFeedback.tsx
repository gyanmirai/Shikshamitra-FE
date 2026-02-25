'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';
import CustomTooltip from 'src/components/custom-tooltip';
import { EmptyContent } from 'src/components/empty-content';
import { Box, TextField, Autocomplete } from '@mui/material';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';

import { StudentSubmissions } from '../assignmentCreation/studentSubmission/studentSubmission';

import type { MarksFeedbackTabProps } from './index';

const ASSIGNMENT_OPTIONS = [
  { value: 'Periodic Assessment 1', label: 'Periodic Assessment 1' },
  { value: 'Mid-Term Examination', label: 'Mid-Term Examination' },
  { value: 'Final Term Examination', label: 'Final Term Examination' },
  { value: 'Project Work: Environmental Study', label: 'Project Work: Environmental Study' },
  { value: 'Research Paper: Scientific Method', label: 'Research Paper: Scientific Method' },
  { value: 'Laboratory Experiment Report', label: 'Laboratory Experiment Report' },
  { value: 'Case Study Analysis', label: 'Case Study Analysis' },
  { value: 'Group Presentation', label: 'Group Presentation' },
  { value: 'Portfolio Assessment', label: 'Portfolio Assessment' },
  { value: 'Practical Skills Evaluation', label: 'Practical Skills Evaluation' },
];

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
  }, [allClass, classes]);

  // Dialog control for bulk grade assignment

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        display="flex"
        sx={{
          borderRadius: '8px',
          bgcolor: 'background.paper',
          boxShadow: 'var(--shadows-3)',
          mt: 2,
          p: 1,
          gap: 2,
        }}
      >
        {' '}
        <PaginatedSearchSelect
          label="Class"
          fetchOptions={async (query) => {
            const items = allClass || [];
            const filtered = items.filter((item: any) =>
              item?.name?.toLowerCase().includes(query.toLowerCase())
            );
            return {
              data: filtered.map((item: any) => ({
                label: item.name,
                id: item.id,
              })),
              hasMore: false,
            };
          }}
          value={
            classes
              ? {
                  label: allClass.find((c: any) => c.id === classes)?.name || '',
                  id: classes,
                }
              : null
          }
          isOptionEqualToValue={(option, value) => option.id === value?.id}
          getOptionLabel={(option: any) => option?.label || ''}
          renderOption={(prop, option: any) => (
            <li {...prop} key={option.id}>
              {option.label}
            </li>
          )}
          minChars={0}
          onChange={(_, value: any) => {
            setClass(value?.id || '');
          }}
          sx={{ maxWidth: '248px', width: '100%' }}
          size="small"
        />
        <PaginatedSearchSelect
          label="Division"
          fetchOptions={async (query) => {
            const items = allDivision || [];
            const filtered = items.filter((item: any) =>
              item?.name?.toLowerCase().includes(query.toLowerCase())
            );
            return {
              data: filtered.map((item: any) => ({
                label: item.name,
                id: item.id,
              })),
              hasMore: false,
            };
          }}
          value={
            division
              ? {
                  label: allDivision.find((d: any) => d.id === division)?.name || division,
                  id: division,
                }
              : null
          }
          isOptionEqualToValue={(option, value) => option.id === value?.id}
          getOptionLabel={(option: any) => option?.label || ''}
          renderOption={(prop, option: any) => (
            <li {...prop} key={option.id}>
              {option.label}
            </li>
          )}
          minChars={0}
          onChange={(_, value: any) => {
            setDivision(value?.id || '');
          }}
          sx={{ maxWidth: '248px', width: '100%' }}
          size="small"
          disabled={!classes}
        />
        <PaginatedSearchSelect
          label="Subject"
          fetchOptions={async (query) => {
            const items = [
              { id: '1', name: 'Mathematics' },
              { id: '2', name: 'Science' },
              { id: '3', name: 'English' },
              { id: '4', name: 'History' },
              { id: '5', name: 'Geography' },
              { id: '6', name: 'Physics' },
              { id: '7', name: 'Chemistry' },
              { id: '8', name: 'Biology' },
            ];
            const filtered = items.filter((item: any) =>
              item?.name?.toLowerCase().includes(query.toLowerCase())
            );
            return {
              data: filtered.map((item: any) => ({
                label: item.name,
                id: item.id,
              })),
              hasMore: false,
            };
          }}
          value={
            subject
              ? {
                  label:
                    [
                      { id: '1', name: 'Mathematics' },
                      { id: '2', name: 'Science' },
                      { id: '3', name: 'English' },
                      { id: '4', name: 'History' },
                      { id: '5', name: 'Geography' },
                      { id: '6', name: 'Physics' },
                      { id: '7', name: 'Chemistry' },
                      { id: '8', name: 'Biology' },
                    ].find((s) => s.id === subject)?.name || '',
                  id: subject,
                }
              : null
          }
          isOptionEqualToValue={(option, value) => option.id === value?.id}
          getOptionLabel={(option: any) => option?.label || ''}
          renderOption={(prop, option: any) => (
            <li {...prop} key={option.id}>
              {option.label}
            </li>
          )}
          minChars={0}
          onChange={(_, value: any) => {
            setSubject(value?.id || '');
          }}
          sx={{ maxWidth: '248px', width: '100%' }}
          size="small"
          disabled={!division}
        />
        <CustomTooltip
          placement="top"
          title={selectedAssignment ? `${selectedAssignment.title}` : undefined}
        >
          <Autocomplete
            options={ASSIGNMENT_OPTIONS}
            disabled={!subject}
            getOptionLabel={(option: any) => option.label || ''}
            isOptionEqualToValue={(option, value) => option.value === value.value}
            value={ASSIGNMENT_OPTIONS.find((opt) => opt.value === assignmentTitle) || null}
            onChange={(event, newValue) => {
              const selectedValue = newValue?.value || '';
              setAssignmentTitle(selectedValue);
              setSelectedAssignment({
                id: selectedValue,
                title: newValue?.label || selectedValue,
                submissionType: 1, // Default to file upload type
              });
            }}
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
