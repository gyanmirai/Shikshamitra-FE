import type { Division, Standards } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState, useEffect } from 'react';

import { Box, MenuItem, MenuList, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const Gradebook = (props: TabComponentType) => {
  const [classes, setClasses] = useState('');
  const [division, setDivision] = useState('');
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);
  const [subject, setSubject] = useState('');
  const [assignmentType, setAssignmentType] = useState('');

  const dialog = useBoolean();

  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  useEffect(() => {
    if (classData?.items?.length) {
      if (!classes) {
        const firstClass = classData.items[0];
        setClasses(firstClass?.id);
        setDivisionOptions(firstClass?.divisions || []);
        // Set first division if available
        if (firstClass?.divisions?.length) {
          setDivision(firstClass.divisions[0].id);
        }
      }
    }
  }, [classData, classes]);

  return (
    <Box>
      <Box display="flex" gap={2} flexWrap="wrap" alignItems="center" mb={3}>
        <CustomSelect
          label="Class"
          options={classData?.items || []}
          labelKey="name"
          valueKey="id"
          onChange={(val) => {
            const selectedClass: Standards = classData.items.find((i: Standards) => i.id === val);
            // formik.setFieldValue('class', selectedClass?.name || '');
            setClasses(val as string);
            setDivisionOptions(selectedClass?.divisions || []);
          }}
          value={classes}
          formControlProps={{
            sx: { width: '100%', maxWidth: '200px' },
          }}
        />
        <CustomSelect
          label="Division"
          disabled={!classes}
          labelKey="name"
          valueKey="id"
          options={divisionOptions}
          value={division}
          onChange={(val) => {
            // const selectedDivision = divisionOptions.find((i: Division) => val.includes(i.id));
            // formik.setFieldValue('division', selectedDivision?.name || '');
            setDivision(val as string);
          }}
          formControlProps={{
            sx: { width: '100%', maxWidth: '200px' },
          }}
        />
        <CustomSelect
          label="Subject"
          options={[
            { value: 'math', label: 'Mathematics' },
            { value: 'science', label: 'Science' },
            { value: 'english', label: 'English' },
          ]}
          onChange={(val) => {
            setSubject(val as string);
          }}
          value={subject}
          formControlProps={{
            sx: { width: '100%', maxWidth: '200px' },
          }}
        />
        <CustomSelect
          label="Assignment Type"
          options={[
            { value: 'homework', label: 'Homework' },
            { value: 'quiz', label: 'Quiz' },
            { value: 'exam', label: 'Exam' },
          ]}
          onChange={(val) => {
            setAssignmentType(val as string);
          }}
          value={assignmentType}
          formControlProps={{
            sx: { width: '100%', maxWidth: '200px' },
          }}
        />
      </Box>
      <CustomizableTable
        columns={[
          { id: 'studentName', label: 'Student Name' },
          { id: 'assignments', label: 'Assignments' },
          {
            id: 'grade',
            label: 'Grade',
            render: (value, row) => (
              <Typography
                fontSize="12px"
                gutterBottom
                onClick={() => {
                  dialog.onTrue();
                }}
              >
                {value || '-'}
              </Typography>
            ),
          },
          { id: 'weightedAverage', label: 'Weighted Average' },
          {
            id: 'action',
            label: 'Action',
            render(value, row) {
              return (
                <ThreeDotsActions
                  actions={() => (
                    <MenuList>
                      <MenuItem>Edit</MenuItem>
                    </MenuList>
                  )}
                />
              );
            },
          },
        ]}
        data={[
          {
            studentName: 'John',
            assignments: 'Abc Quiz',
            grade: '',
            weightedAverage: '80%',
          },
        ]}
      />

      {/* <CustomDialog
        maxWidth="sm"
        open={dialog.value}
        handleClose={() => {
          dialog.onFalse();
        }}
        title="Assign Grade"
      >
        <AssignGrade />
      </CustomDialog> */}
    </Box>
  );
};

export default Gradebook;
