'use client';

import type { Division, Standards } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState, useEffect } from 'react';

import { CheckCircle } from '@mui/icons-material';
import {
  Box,
  Grid,
  Card,
  List,
  Paper,
  alpha,
  Button,
  Tooltip,
  useTheme,
  ListItem,
  Typography,
  CardContent,
  LinearProgress,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { varAlpha } from 'src/theme/styles';
import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import DashBoardQuickAction from 'src/components/dashboard-quick-action';

import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

const subjects = [
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
  const dialog = useBoolean();
  const { searchParams, setSearchParams } = props;
  const theme = useTheme();
  const classes = searchParams?.classId ? searchParams?.classId : '';
  const [division, setDivision] = useState('');
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);
  const [subject, setSubject] = useState('');

  const { data: classData, isLoading } = useQueryAndMutation({
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
          { name: 'Academic and Assignment' },
          { name: 'Gradebook And Performace Tracking' },
          { name: 'Dashboard' },
        ]}
        sx={{ px: 1, mb: 2 }}
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
        <Grid item xs={12} md={6}>
          <Card
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              height: '100%',
              bgcolor: varAlpha(theme.palette.secondary.mainChannel, 0.1),
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: 'var(--shadows-8)',
                scale: 1.03,
              },
              cursor: 'pointer',
            }}
            onClick={() => {
              setSearchParams?.({
                tab: 'settings',
              });
            }}
          >
            <CheckCircle sx={{ fontSize: 32, mr: 2, color: 'secondary.main' }} />
            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Total Grades Entered
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                03
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              bgcolor: varAlpha(theme.palette.primary.mainChannel, 0.1),
              height: '100%',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: 'var(--shadows-8)',
                scale: 1.03,
              },
              cursor: 'pointer',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Average Class Performance
            </Typography>
            <Typography variant="h6">GPA: 3.2 (B)</Typography>
            <LinearProgress variant="determinate" value={80} sx={{ mt: 2, mb: 1 }} />
            <Grid container justifyContent="space-between">
              <Grid item>
                <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
                  Highest: 4.0 (A)
                </Typography>
              </Grid>
              <Grid item>
                <Typography variant="body2" color="error" sx={{ fontWeight: 'bold' }}>
                  Lowest: 2.0 (C)
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* <Grid item xs={12} md={4}>
          <Paper
            elevation={3}
            sx={{ p: 2, bgcolor: varAlpha(theme.palette.warning.mainChannel, 0.4) }}
          >
            <Typography variant="h6" gutterBottom>
              Pending Grades
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="h6">
                  <AccessTime color="action" sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Pending: 10
                </Typography>
                <Typography variant="body2">Quizzes: 2</Typography>
                <Typography variant="body2">Tests: 3</Typography>
                <Typography variant="body2">Assignments: 5</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h6">
                  <Warning color="error" sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Overdue: 3
                </Typography>
                <Typography variant="body2">Tests: 1</Typography>
                <Typography variant="body2">Assignments: 2</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid> */}
        <Grid item xs={12} md={12}>
          <AnalyticsWebsiteVisits
            title="Student Performance Levels"
            //   subheader="(+43%) than last year"
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
              series: [
                { name: 'High', data: [43, 33, 22, 37, 67, 68, 37, 24, 55] },
                { name: 'Medium', data: [51, 70, 47, 67, 40, 37, 24, 70, 24] },
                { name: 'Low', data: [51, 67, 47, 97, 40, 57, 24, 60, 24] },
              ],
              colors: [
                alpha(theme.palette.primary.dark, 0.8),
                alpha(theme.palette.warning.main, 0.8),
                alpha(theme.palette.error.main, 0.8),
              ],
            }}
            sx={{ height: '100%' }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: 2,
              backgroundColor: varAlpha(theme.palette.warning.mainChannel, 0.1),
              height: '100%',
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Iconify icon="solar:pen-bold" color={theme.palette.warning.main} sx={{ mr: 1 }} />
                <Typography variant="subtitle1">Pending Grade Submissions</Typography>
              </Box>
              <Typography variant="subtitle2" gutterBottom>
                Hover a subject to view Assignment&apos;s
              </Typography>
              <Box my={2}>
                {subjects.map((sub, index) => (
                  <Tooltip
                    key={index}
                    title={
                      <List disablePadding>
                        {sub.assignments.map((assignment, idx) => (
                          <ListItem key={idx}>
                            <Button
                              variant="outlined"
                              fullWidth
                              onClick={() => {
                                setSearchParams?.({
                                  tab: 'gradebook',
                                  subject: sub.name,
                                  assignmentType: 'quiz',
                                  assigngmentTitle: assignment,
                                });
                              }}
                            >
                              {assignment}
                            </Button>
                          </ListItem>
                        ))}
                      </List>
                    }
                    placement="right"
                    arrow
                  >
                    <Box component="div" key={index} sx={{ mb: 2 }}>
                      <Button variant="outlined" fullWidth sx={{ justifyContent: 'start' }}>
                        {sub.name}
                      </Button>
                    </Box>
                  </Tooltip>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Overdue Performance Evaluations */}

        {/* Reminders */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: 2,
              backgroundColor: varAlpha(theme.palette.info.mainChannel, 0.1),
              height: '100%',
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Iconify icon="mdi:reminder" color={theme.palette.info.main} sx={{ mr: 1 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Reminders
                </Typography>
              </Box>

              <Typography variant="subtitle2" gutterBottom>
                Total Underperforming students - 30
              </Typography>
              <Box my={2}>
                {subjects.map((sub, index) => (
                  <Box component="div" key={index} sx={{ mb: 2 }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ justifyContent: 'start' }}
                      onClick={() => {
                        dialog.onTrue();
                      }}
                    >
                      {sub.name} - 10
                    </Button>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <CustomDialog
        maxWidth="sm"
        open={dialog.value}
        title="Underperforming students"
        handleClose={() => {
          dialog.onFalse();
        }}
      >
        <Typography variant="h6">Student List</Typography>
      </CustomDialog>
    </Box>
  );
};

export default Dashboard;
