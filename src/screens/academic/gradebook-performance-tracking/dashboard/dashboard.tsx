'use client';

import type { Division, Standards } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import { Box, Grid } from '@mui/material';
// import { useTheme } from '@mui/material/styles';
import React, { useState, useEffect } from 'react';
// import { useBoolean } from 'src/hooks/use-boolean';
import CustomSelect from 'src/components/custom-select';
import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import DashBoardQuickAction from 'src/components/dashboard-quick-action';

import SubjectsList from './component/subjectsList';
import TotalStudents from './component/totalStudents';
import TotalGradeEntered from './component/totalGradeEntered';
import AvgClassPerformace from './component/avgClassPerformace';
import StudentPerformance from './component/studentPerformance';

export const subjects = [
  {
    name: 'math',
    assignments: ['Assignment 1', 'Assignment 2', 'Quiz 3'],
  },
  {
    name: 'science',
    assignments: ['Lab Report', 'Assignment 4'],
  },
  {
    name: 'english',
    assignments: ['Essay on WW2'],
  },
];

const Dashboard = (props: TabComponentType) => {
  const { searchParams, setSearchParams } = props;
  const classes = searchParams?.classId ? searchParams?.classId : '';
  const [division, setDivision] = useState('');
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);
  // const [subject, setSubject] = useState('');

  const { data: classData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  useEffect(() => {
    if (classData?.items?.length) {
      if (classes) {
        const selectedClass = classData.items.find((i: Standards) => i.id === classes);
        setDivisionOptions(selectedClass?.divisions || []);
        // Set first division if available
        if (selectedClass?.divisions?.length) {
          setDivision(selectedClass.divisions[0].id);
        }
      } else {
        const firstClass = classData.items[0];
        setSearchParams?.({
          classId: firstClass.id,
        });
        setDivisionOptions(firstClass?.divisions || []);
        // Set first division if available
        if (firstClass?.divisions?.length) {
          setDivision(firstClass.divisions[0].id);
        }
      }
    }
  }, [classData, classes, setSearchParams]);

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Dashboard"
        links={[
          { name: 'Academics' },
          { name: 'Gradebook And Performace Tracking' },
          { name: 'Dashboard' },
        ]}
        sx={{ mb: 2 }}
        action={
          <DashBoardQuickAction
            actions={[
              {
                icon: 'mdi:plus',
                label: 'Gradebook',
                href: '/academic/gradebook-performance-tracking/gradebook',
                color: 'primary',
              },
              {
                icon: 'simple-icons:googledocs',
                label: 'Reports',
                href: '/academic/gradebook-performance-tracking/reports',
                color: 'secondary',
              },
            ]}
          />
        }
      />
      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <CustomSelect
          label="Class"
          options={classData?.items || []}
          labelKey="name"
          valueKey="id"
          onChange={(val) => {
            const selectedClass: Standards = classData.items.find((i: Standards) => i.id === val);
            // formik.setFieldValue('class', selectedClass?.name || '');
            setSearchParams?.({
              classId: val as string,
            });
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
      </Box>
      <Grid container spacing={2} alignItems="stretch">
        <TotalGradeEntered />
        <AvgClassPerformace />
        <StudentPerformance />
        <SubjectsList />
        <TotalStudents />
      </Grid>
    </Box>
  );
};

export default Dashboard;
