'use client';

import type { RootState } from 'src/redux/store';
import type { TabComponentType } from 'src/screens/hr/leave-request';
import type { Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';

import { Box } from '@mui/material';

import CustomSelect from 'src/components/custom-select';

import { StudentSubmissions } from '../homeworkCreation/studentSubmission/homeworkStudentSubmission';

const HomeworkMarksAndFeedback = (props: TabComponentType) => {
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
  const [homeworkType, setHomeworkType] = useState('');
  // State to store homework title
  const [homeworkTitle, setHomeworkTitle] = useState('');

  // Get current board and medium from global state
  const {
    currentBoard,
    currentMedium: medium,
    setCurrentMedium: setMedium,
  } = useSelector((state: RootState) => state.globalState);

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
    <Box>
      <Box display="flex" gap={2} flexWrap="wrap" alignItems="center" mb={1}>
        <CustomSelect
          options={allClass}
          label="Class"
          value={classes}
          onChange={(val) => setClass(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
        />
        <CustomSelect
          options={allDivision}
          label="Division"
          value={division}
          onChange={(val) => setDivision(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
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
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          disabled={!division}
        />
        <CustomSelect
          label="Homework Type"
          disabled={!subject}
          options={[
            { value: 'daily', label: 'Daily Homework' },
            { value: 'weekly', label: 'Weekly Homework' },
            { value: 'project', label: 'Project Work' },
          ]}
          onChange={(val) => {
            setHomeworkType(val as string);
          }}
          value={homeworkType}
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
        />
        <CustomSelect
          label="Homework Title"
          disabled={!homeworkType}
          options={[
            { value: 'HW 1', label: 'HW 1' },
            { value: 'HW 2', label: 'HW 2' },
            { value: 'Holiday Project', label: 'Holiday Project' },
            { value: 'Chapter 1 HW', label: 'Chapter 1 HW' },
            { value: 'Worksheet A', label: 'Worksheet A' },
          ]}
          onChange={(val) => {
            setHomeworkTitle(val as string);
          }}
          value={homeworkTitle}
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
        />
      </Box>
      <StudentSubmissions />
    </Box>
  );
};

export default HomeworkMarksAndFeedback;
