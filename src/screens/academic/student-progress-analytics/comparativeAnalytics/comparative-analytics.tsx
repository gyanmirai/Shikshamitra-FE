'use client';

import type { Division, Standards } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import StudentVsClass from './component/studentVsClass';
import ClassComparison from './component/classComparison';
import StudentPerformance from './component/studentPerformance';
import { StudentSubjectPerformace } from './component/studentSubjectPerformance';
import SubjectPerformanceComparison from './component/subjectPerformanceComparison';

const ComparativeAnalytics = (props: TabComponentType) => {
  const [classes1, setClasses1] = useState('');
  const [classes2, setClasses2] = useState('');
  const [classes3, setClasses3] = useState('');
  const [, setDivision] = useState('');
  const [, setDivisionOptions] = useState<Division[]>([]);
  const { data: classData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

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
        setClasses1(firstClass?.id);
        setClasses2(firstClass?.id);
        setClasses3(firstClass?.id);
        setDivisionOptions(firstClass?.divisions || []);
        // Set first division if available
        if (firstClass?.divisions?.length) {
          setDivision(firstClass.divisions[0].id);
        }
      }
    }
  }, [classData, classes1, classes2, classes3]);

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Comparative Analytics"
        links={[
          { name: 'Academics' },
          { name: 'Student Progress Analytics' },
          { name: 'Comparative Analytics' },
        ]}
        sx={{ mb: 2 }}
      />
      <Grid container spacing={2}>
        <SubjectPerformanceComparison />
        <ClassComparison />
        <StudentVsClass />
        <StudentPerformance />
        <Grid size={12}>
          <Typography variant="h6">Subject Comparison</Typography>
          <StudentSubjectPerformace />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ComparativeAnalytics;
