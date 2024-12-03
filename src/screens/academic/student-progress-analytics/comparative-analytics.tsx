import type { Division, Standards } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState, useEffect } from 'react';

import { Box, Card, Grid, alpha, useTheme, Typography, CircularProgress } from '@mui/material';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

import { PerformanceOverTime } from '../gradebook-performance-tracking/progress-report';

const ComparativeAnalytics = (props: TabComponentType) => {
  const { searchParams, setSearchParams } = props;
  const [classes1, setClasses1] = useState('');
  const [classes2, setClasses2] = useState('');
  const [classes3, setClasses3] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [division, setDivision] = useState('');
  const [subject, setSubject] = useState('');
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
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1">Class Comparison</Typography>
              <CustomSelect
                label="Class"
                options={classData?.items || []}
                labelKey="name"
                valueKey="id"
                onChange={(val) => {
                  const selectedClass: Standards = classData.items.find(
                    (i: Standards) => i.id === val
                  );
                  // formik.setFieldValue('class', selectedClass?.name || '');
                  setClasses1(val as string);
                  setDivisionOptions(selectedClass?.divisions || []);
                }}
                value={classes1}
                formControlProps={{
                  sx: { width: '100%', maxWidth: '200px' },
                }}
              />{' '}
              <CustomSelect
                label="Subject"
                options={[
                  { value: 'Math', label: 'Math' },
                  { value: 'Science', label: 'Science' },
                  { value: 'English', label: 'English' },
                  { value: 'History', label: 'History' },
                ]}
                onChange={() => {}}
                value=""
                formControlProps={{
                  sx: { width: '100%', maxWidth: '200px' },
                }}
              />
            </Box>
            <AnalyticsWebsiteVisits
              title=""
              //   subheader="(+43%) than last year"
              chart={{
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
                series: [
                  { name: 'Class 10-A', data: [43, 33, 22, 37, 67, 68, 37, 24, 55] },
                  { name: 'Class 10-B', data: [51, 70, 47, 67, 40, 37, 24, 70, 24] },
                  { name: 'Class 10-C', data: [51, 67, 47, 97, 40, 57, 24, 60, 24] },
                ],
                colors: [
                  alpha(theme.palette.primary.dark, 0.8),
                  alpha(theme.palette.warning.main, 0.8),
                  alpha(theme.palette.error.main, 0.8),
                ],
              }}
              sx={{ height: '100%', boxShadow: 'none' }}
            />
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1">Subject Performance Comparison</Typography>
              <CustomSelect
                label="Class"
                options={classData?.items || []}
                labelKey="name"
                valueKey="id"
                onChange={(val) => {
                  const selectedClass: Standards = classData.items.find(
                    (i: Standards) => i.id === val
                  );
                  // formik.setFieldValue('class', selectedClass?.name || '');
                  setClasses2(val as string);
                  setDivisionOptions(selectedClass?.divisions || []);
                }}
                value={classes2}
                formControlProps={{
                  sx: { width: '100%', maxWidth: '200px' },
                }}
              />{' '}
            </Box>
            <AnalyticsWebsiteVisits
              title=""
              //   subheader="(+43%) than last year"
              chart={{
                categories: ['Math', 'Science', 'History', 'ENG'],
                series: [
                  { name: '', data: [43, 33, 22, 37] },
                  { name: '', data: [51, 70, 47, 67] },
                  { name: '', data: [51, 67, 47, 97] },
                ],
                colors: [
                  alpha(theme.palette.primary.dark, 0.8),
                  alpha(theme.palette.warning.main, 0.8),
                  alpha(theme.palette.error.main, 0.8),
                ],
                options: {
                  legend: {
                    show: false,
                    position: 'top',
                  },
                },
              }}
              sx={{ height: '100%', boxShadow: 'none' }}
            />
          </Card>
        </Grid>
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
                const selectedClass: Standards = classData.items.find(
                  (i: Standards) => i.id === val
                );
                // formik.setFieldValue('class', selectedClass?.name || '');
                setClasses3(val as string);
                setDivisionOptions(selectedClass?.divisions || []);
              }}
              value={classes1}
              formControlProps={{
                sx: { width: '100%', maxWidth: '200px' },
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
                sx: { width: '100%', maxWidth: '200px' },
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
                sx: { width: '100%', maxWidth: '200px' },
              }}
            />
          </Box>
        </Grid>

        <StudentPerformance />
        <Grid item xs={12}>
          <Typography variant="h6">Subject Comparison</Typography>
          <StudentSubjectPerformace />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ComparativeAnalytics;

export const StudentPerformance = () => (
  <>
    <Grid item xs={12} md={6}>
      <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1">Student Comparison</Typography>
        </Box>
        <PerformanceOverTime
          id="demo__4"
          //   title="Performance Over Time"
          //   subheader="(+43%) than last year"
          chart={{
            categories: ['Math', 'Science', 'History', 'Eng', 'May'],
            series: [
              {
                name: 'Student Performance',
                data: [10, 41, 35, 51],
              },
              {
                name: 'Class Average',
                data: [49, 51, 35, 10],
              },
            ],
            options: {
              legend: {
                show: true,
                position: 'top',
              },
            },
          }}
          sx={{ height: '100%', boxShadow: 'none' }}
        />
      </Card>
    </Grid>
    <Grid item xs={12} md={6}>
      <Card
        sx={{
          // Dark background color
          padding: 2,
          height: '100%',
        }}
      >
        <Typography variant="h6" gutterBottom>
          Performance Deviation
        </Typography>
        <Box display="flex" alignItems="center" mb={2}>
          <Box position="relative" display="inline-flex" mr={2}>
            <CircularProgress
              variant="determinate"
              value={73.9}
              size={45}
              thickness={2}
              color="success"
            />
            <Box
              top={0}
              left={0}
              bottom={0}
              right={0}
              position="absolute"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Typography variant="caption" component="div">
                73.9%
              </Typography>
            </Box>
          </Box>
          <Typography>+10% above class average in Math</Typography>
        </Box>

        <Box display="flex" alignItems="center">
          <Box position="relative" display="inline-flex" mr={2}>
            <CircularProgress
              variant="determinate"
              value={73.9}
              size={45}
              thickness={2}
              color="error"
            />
            <Box
              top={0}
              left={0}
              bottom={0}
              right={0}
              position="absolute"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Typography variant="caption" component="div">
                73.9%
              </Typography>
            </Box>
          </Box>
          <Typography>+10% below class average in English</Typography>
        </Box>
      </Card>
    </Grid>
  </>
);

export const StudentSubjectPerformace = () => (
  <CustomizableTable
    columns={[
      { id: 'subject', label: 'Subject' },
      { id: 'studentGrade', label: 'Student Grade' },
      { id: 'classAverage', label: 'Class Average' },
    ]}
    data={[
      { subject: 'Math', studentGrade: 'A', classAverage: 'B+' },
      { subject: 'Science', studentGrade: 'B', classAverage: 'B' },
      { subject: 'English', studentGrade: 'B+', classAverage: 'A-' },
      { subject: 'History', studentGrade: 'A-', classAverage: 'B' },
      { subject: 'Physics', studentGrade: 'B+', classAverage: 'B+' },
    ]}
  />
);
