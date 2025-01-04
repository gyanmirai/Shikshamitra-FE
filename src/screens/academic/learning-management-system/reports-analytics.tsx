'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { BarChart, CheckCircle, Description } from '@mui/icons-material';
import { Box, Grid, alpha, Paper, Button, useTheme, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

const ReportsAnalytics = (props: TabComponentType) => {
  const theme = useTheme();
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Reports And Analytics"
        links={[
          { name: 'Academic and Assignment' },
          { name: 'Learning Management System' },
          { name: 'Reports And Analytics' },
        ]}
        sx={{ px: 1, mb: 2 }}
      />
      <Typography variant="h6" sx={{ mb: 3 }}>
        Course performance
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
        <CustomSelect
          options={[]}
          value=""
          label="Course"
          onChange={() => {}}
          formControlProps={{ sx: { maxWidth: '150px', width: '100%' } }}
        />
        <DatePicker label="Start Date" slotProps={{ textField: { size: 'small' } }} />
        <DatePicker label="End Date" slotProps={{ textField: { size: 'small' } }} />
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, bgcolor: '#1976d2' }}>
            <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
              Average Course Performance
            </Typography>
            <Typography variant="h3" sx={{ color: '#fff', fontWeight: 'bold' }}>
              90%
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <BarChart sx={{ color: '#fff', mr: 1 }} />
              <Typography variant="body2" sx={{ color: '#e0e0e0' }}>
                Overall progress
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, bgcolor: '#388e3c' }}>
            <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
              Total Assignments Submitted
            </Typography>
            <Typography variant="h3" sx={{ color: '#fff', fontWeight: 'bold' }}>
              20
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <CheckCircle sx={{ color: '#fff', mr: 1 }} />
              <Typography variant="body2" sx={{ color: '#e0e0e0' }}>
                Submitted assignments
              </Typography>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <AnalyticsWebsiteVisits
            title="Assignment Analytics"
            //   subheader="(+43%) than last year"
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
              series: [
                { name: 'Submission rates', data: [43, 33, 22, 37, 67, 68, 37, 24, 55] },
                { name: 'Average grades', data: [51, 70, 47, 67, 40, 37, 24, 70, 24] },
                { name: 'Overdue assignments', data: [51, 67, 47, 97, 40, 57, 24, 60, 24] },
              ],
              colors: [
                alpha(theme.palette.primary.dark, 0.8),
                alpha(theme.palette.warning.main, 0.8),
                alpha(theme.palette.error.main, 0.8),
              ],
            }}
            sx={{ height: 360 }}
          />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
            Assignment Table
          </Typography>
          <CustomizableTable
            columns={[
              { id: 'assignmentName', label: 'Assignment Name' },
              { id: 'dueDate', label: 'Due Date' },
              { id: 'submissionRate', label: 'Submission Rate' },
              { id: 'averageGrade', label: 'Average Garde' },
              { id: 'overdueStatus', label: 'Overdue Status' },
              { id: 'actions', label: 'Actions' },
            ]}
            data={[]}
          />
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ mt: 4, mb: 2 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
              Generate Individual Reports
            </Typography>
          </Box>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={3} alignItems="flex-end">
              <Grid item xs={12} sm={3}>
                <CustomSelect
                  options={[]}
                  label="class"
                  value=""
                  onChange={() => {}}
                  formControlProps={{ sx: { maxWidth: '150px', width: '100%' } }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <CustomSelect
                  options={[]}
                  label="Student"
                  value=""
                  onChange={() => {}}
                  formControlProps={{ sx: { maxWidth: '150px', width: '100%' } }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <CustomSelect
                  options={[]}
                  label="Report Type"
                  value=""
                  onChange={() => {}}
                  formControlProps={{ sx: { maxWidth: '150px', width: '100%' } }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <DatePicker label="Start Date" slotProps={{ textField: { size: 'small' } }} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <DatePicker label="End Date" slotProps={{ textField: { size: 'small' } }} />
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button variant="contained" color="primary" startIcon={<Description />}>
                Generate Reports
              </Button>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
            Student Progress Table
          </Typography>
          <CustomizableTable
            columns={[
              { id: 'studentName', label: 'Student Name' },
              { id: 'corseProgress', label: 'Course Progress' },
              { id: 'participationRate', label: 'Participation Rate' },
              { id: 'averageGrade', label: 'Average Garde' },

              { id: 'actions', label: 'Actions' },
            ]}
            data={[]}
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ mt: 4, mb: 2 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
              Download Reports Section
            </Typography>
          </Box>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={3} alignItems="flex-end">
              <Grid item xs={12} sm={3}>
                <CustomSelect
                  options={[]}
                  label="class"
                  value=""
                  onChange={() => {}}
                  formControlProps={{ sx: { maxWidth: '150px', width: '100%' } }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <CustomSelect
                  options={[]}
                  label="Subject"
                  value=""
                  onChange={() => {}}
                  formControlProps={{ sx: { maxWidth: '150px', width: '100%' } }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <CustomSelect
                  options={[]}
                  label="Assignment Status"
                  value=""
                  onChange={() => {}}
                  formControlProps={{ sx: { maxWidth: '150px', width: '100%' } }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <DatePicker label="Start Date" slotProps={{ textField: { size: 'small' } }} />
              </Grid>
              <Grid item xs={12} sm={3}>
                <DatePicker label="End Date" slotProps={{ textField: { size: 'small' } }} />
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
              <Button variant="contained" color="primary" startIcon={<Description />}>
                Download as PDF
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<Iconify icon="mdi:file-excel" />}
              >
                Download as Excel
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReportsAnalytics;
