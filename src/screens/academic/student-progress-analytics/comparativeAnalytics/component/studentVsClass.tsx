'use client';

import type { Division, Standards } from 'src/types/school';

import React, { useState, useEffect } from 'react';

import { Box, Grid, useTheme, Typography } from '@mui/material';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import CustomSelect from 'src/components/custom-select';

const StudentVsClass = () => {
  const [classes3, setClasses3] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [division, setDivision] = useState('');
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });
  const theme = useTheme();

  useEffect(() => {
    if (classData?.items?.length) {
      if (classes3) {
        const selectedClass = classData.items.find((i: Standards) => i.id === classes3);
        setDivisionOptions(selectedClass?.divisions || []);
        // Set first division if available
        if (selectedClass?.divisions?.length) {
          setDivision(selectedClass.divisions[0].id);
        }
      } else {
        const firstClass = classData.items[0];
        setClasses3(firstClass?.id);
        setDivisionOptions(firstClass?.divisions || []);
        // Set first division if available
        if (firstClass?.divisions?.length) {
          setDivision(firstClass.divisions[0].id);
        }
      }
    }
  }, [classData, classes3]);

  return (
    <Grid item xs={12}>
      <Typography variant="h6" mb={2}>
        Student vs Class Average
      </Typography>
      <Box display="flex" gap={2}>
        <CustomSelect
          label="Class"
          options={classData?.items || []}
          labelKey="name"
          valueKey="id"
          onChange={(val) => {
            const selectedClass: Standards = classData.items.find((i: Standards) => i.id === val);
            // formik.setFieldValue('class', selectedClass?.name || '');
            setClasses3(val as string);
            setDivisionOptions(selectedClass?.divisions || []);
          }}
          value={classes3}
          formControlProps={{
            sx: { width: '100%', maxWidth: '150px' },
          }}
        />{' '}
        <CustomSelect
          label="Division"
          disabled={!classes3}
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
            sx: { width: '100%', maxWidth: '150px' },
          }}
        />{' '}
        <CustomSelect
          label="Select Student"
          options={[
            { value: 'student1', label: 'Student 1' },
            { value: 'student2', label: 'Student 2' },
            { value: 'student3', label: 'Student 3' },
          ]}
          disabled={!classes3 || !division}
          value={selectedStudent}
          isSearch
          onChange={(val) => {
            setSelectedStudent(val as string);
          }}
          formControlProps={{
            sx: { width: '100%', maxWidth: '150px' },
          }}
        />
      </Box>
    </Grid>
  );
};

export default StudentVsClass;
