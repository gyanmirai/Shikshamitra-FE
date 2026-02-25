'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';
import CustomTooltip from 'src/components/custom-tooltip';
import { EmptyContent } from 'src/components/empty-content';
import { Box, TextField, Autocomplete } from '@mui/material';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';

import { StudentSubmissions } from '../homeworkCreation/studentSubmission/homeworkStudentSubmission';

import type { MarksFeedbackTabProps } from './index';

const SUBJECTS = [
  { id: '1', name: 'Mathematics' },
  { id: '2', name: 'Science' },
  { id: '3', name: 'English' },
  { id: '4', name: 'History' },
  { id: '5', name: 'Geography' },
  { id: '6', name: 'Physics' },
  { id: '7', name: 'Chemistry' },
  { id: '8', name: 'Biology' },
];

const HOMEWORK_OPTIONS = [
  {
    value: 'Addition and Subtraction Practice',
    label: 'Addition and Subtraction Practice',
    submissionType: 'online_text',
  },
  {
    value: 'Multiplication Tables Exercise',
    label: 'Multiplication Tables Exercise',
    submissionType: 'online_text',
  },
  {
    value: 'Summer Vacation Project',
    label: 'Summer Vacation Project',
    submissionType: 'file_upload',
  },
  {
    value: 'Chapter 1: Number System Assignment',
    label: 'Chapter 1: Number System Assignment',
    submissionType: 'file_upload',
  },
  {
    value: 'Geometry Worksheet',
    label: 'Geometry Worksheet',
    submissionType: 'online_text',
  },
  {
    value: 'Problem Solving Challenge',
    label: 'Problem Solving Challenge',
    submissionType: 'online_text',
  },
  {
    value: 'Mental Math Quiz Preparation',
    label: 'Mental Math Quiz Preparation',
    submissionType: 'file_upload',
  },
  {
    value: 'Real-life Math Applications',
    label: 'Real-life Math Applications',
    submissionType: 'file_upload',
  },
];

const HomeworkMarksAndFeedback = (props: MarksFeedbackTabProps) => {
  // State to store selected subject
  const [subject, setSubject] = useState('');
  // State to store list of all available classes/standards
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store selected class/standard
  const [classes, setClass] = useState<string>('');
  // State to store list of all divisions for selected class
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  // State to store selected division
  const [division, setDivision] = useState<string>('');
  // State to store selected homework type (daily/weekly/project)
  // const [homeworkType, setHomeworkType] = useState('');
  // State to store homework title
  const [homeworkTitle, setHomeworkTitle] = useState('');
  const [selectedHomework, setSelectedHomework] = useState<any>(null);

  // Get current board and medium from global state
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

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
  }, [allClass, classes]);

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
            const items = SUBJECTS || [];
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
                  label: SUBJECTS.find((s: any) => s.id === subject)?.name || '',
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
          title={selectedHomework ? `${selectedHomework.label}` : undefined}
        >
          <Autocomplete
            options={HOMEWORK_OPTIONS}
            getOptionLabel={(option: any) => option.label || ''}
            isOptionEqualToValue={(option, value) => option.value === value.value}
            value={HOMEWORK_OPTIONS.find((opt) => opt.value === homeworkTitle) || null}
            onChange={(event, newValue) => {
              setHomeworkTitle(newValue?.value || '');
              setSelectedHomework(newValue || null);
            }}
            disabled={!subject}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Homework Title"
                size="small"
                fullWidth
                sx={{ minWidth: '248px', width: '100%' }}
                disabled={!subject}
              />
            )}
          />
        </CustomTooltip>
      </Box>
      {homeworkTitle ? (
        <StudentSubmissions
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
