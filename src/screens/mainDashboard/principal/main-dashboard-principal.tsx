'use client';

import { useFormik } from 'formik';
import React, { useState, useCallback } from 'react';

import { useTheme } from '@mui/material/styles';
import {
  Box,
  Card,
  Grid,
  Button,
  TextField,
  Typography,
  ButtonGroup,
  Autocomplete,
} from '@mui/material';

import { formatNumber } from 'src/utils/formate_number';

import { CONFIG } from 'src/config-global';
import SeoIllustration from 'src/assets/illustrations/seo-illustration';

import { SvgColor } from 'src/components/svg-color';
import CustomSelect from 'src/components/custom-select';

import { AppWelcome } from 'src/sections/overview/app/app-welcome';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

import TimeTableView from '../component/time-table-view';
import { AnalyticsClassResults } from './component/result-graph';
import ExamOverviewForPrincipal from './component/exam-overview';
import { PrincipalDashboardCard } from './component/principal-dashboard-card';
import WhatsNewInMonthComponent from './component/whats-new-in-month-component';

const _ExamSalesOverview = [
  'Ongoing Exams',
  'Upcoming Exams',
  'Completed Exams',
  'Pending Grading',
].map((label, index) => ({
  label,
  totalAmount: (19 + index) * 100,
  value: 10 + index,
}));

const MainDashboardPrincipal = () => {
  const [timeTable, setTimeTable] = useState('student');
  const handleChangeView = useCallback(
    (event: React.MouseEvent<HTMLElement>, newView: string | null) => {
      if (newView !== null) {
        setTimeTable(newView);
      }
    },
    []
  );
  const theme = useTheme();
  const formik = useFormik({
    initialValues: {
      selectedClassForStudent: '',
    },

    onSubmit: async (values) => {},
  });
  const icon = (name: string) => (
    <SvgColor src={`${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`} />
  );
  return (
    <Grid container spacing={3} px={2} py={3}>
      <Grid item xs={12}>
        <AppWelcome
          title={`Good Morning 👋 \n Jeet`}
          description="If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything."
          img={<SeoIllustration hideBackground />}
        />
      </Grid>

      <Grid container spacing={3} item xs={12}>
        <Grid item xs={12} md={4}>
          <PrincipalDashboardCard
            dropdownLabel="Select Class"
            icon="hugeicons:students"
            title="Total Students"
            count={2500}
            color="primary.main"
            bgColor="primary"
            href="/dashboard"
            labels={[
              { name: 'Female', color: 'warning', value: 500 },
              { name: 'Male', color: 'info', value: 500 },
              { name: 'Present', color: 'success', value: 500 },
              { name: 'Absent', color: 'error', value: 500 },
            ]}
            selectOptions={[
              { value: 'all', label: 'All' },
              { value: '1', label: '1' },
              { value: '2', label: '3' },
            ]}
            selectedValue="all"
            onSelectChange={(val) => console.log('Selected:', val)}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <PrincipalDashboardCard
            icon="clarity:employee-group-solid"
            title="Total Employees"
            count={250}
            dropdownLabel="Select Employee"
            color="primary.main"
            bgColor="primary"
            href="/dashboard"
            labels={[
              { name: 'Present', color: 'success', value: 500 },
              { name: 'Absent', color: 'error', value: 500 },
            ]}
            selectOptions={[
              { value: 'all', label: 'All' },
              { value: 'Teaching', label: 'Teaching' },
              { value: 'Non-Teaching', label: 'Non-Teaching' },
            ]}
            selectedValue="all"
            onSelectChange={(val) => console.log('Selected Employee:', val)}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <PrincipalDashboardCard
            dropdownLabel="Select Month"
            icon="noto:receipt"
            title="Payroll generated"
            count={formatNumber(250000, 'INR')}
            color="primary.main"
            bgColor="primary"
            href="/dashboard"
            labels={[
              { name: 'Teaching', color: 'warning', value: formatNumber(250000, 'INR') },
              { name: 'Non-teaching', color: 'info', value: formatNumber(250000, 'INR') },
            ]}
            selectOptions={[
              { value: 'all', label: 'All' },
              { value: 'January', label: 'January' },
              { value: 'February', label: 'February' },
              { value: 'March', label: 'March' },
            ]}
            selectedValue="all"
            onSelectChange={(val) => console.log('Selected Month:', val)}
          />
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <Card sx={{ boxShadow: 'var(--shadows-2)' }}>
          <AnalyticsWebsiteVisits
            firstDropdownOnChange={() => {}}
            firstDropdownValue="2024"
            firstDropdownLabel="Year"
            firstDropdownOptions={[
              { value: '2024', label: '2024-2025' },
              { value: '2023', label: '2023-2024' },
              { value: '2022', label: '2022-2023' },
            ]}
            title="Fees Summary"
            chart={{
              categories: [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec',
              ],
              series: [
                { name: 'Fee Collected', data: [43, 33, 22, 37, 67, 68, 37, 24, 55, 50, 90, 70] },
                { name: 'Fee Outstanding', data: [51, 70, 47, 67, 40, 37, 24, 70, 24, 89, 90, 50] },
                { name: 'Fee Overdue', data: [43, 33, 22, 37, 67, 68, 37, 24, 55, 50, 90, 70] },
              ],
            }}
            sx={{ height: '100%', boxShadow: 'none' }}
          />
        </Card>
      </Grid>

      <Grid item lg={4} px={1}>
        <Card
          sx={{
            p: 2,
            cursor: 'pointer',
            height: '100%',
          }}
        >
          <WhatsNewInMonthComponent />
        </Card>
      </Grid>

      <Grid item lg={8}>
        <Typography sx={{ pt: '13px' }} variant="h6" fontWeight={600} mb="24px">
          Exam Overview
        </Typography>

        <ExamOverviewForPrincipal />
      </Grid>
      <Grid item lg={12} px={1}>
        <Card sx={{ boxShadow: 'var(--shadows-2)' }}>
          <AnalyticsClassResults
            title="Class & Subject Wise Results"
            subheader="View student performance data"
          />
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <ButtonGroup>
              <Button
                variant={timeTable === 'student' ? 'outlined' : 'contained'}
                color="inherit"
                onClick={() => setTimeTable('employee')}
                startIcon={icon('ic-hr')}
              >
                Employee
              </Button>
              <Button
                color="inherit"
                variant={timeTable === 'student' ? 'contained' : 'outlined'}
                onClick={() => setTimeTable('student')}
                startIcon={icon('ic-student')}
              >
                Student
              </Button>
            </ButtonGroup>

            {timeTable === 'student' && (
              <>
                <CustomSelect
                  label="Class"
                  options={[]}
                  labelKey="name"
                  valueKey="id"
                  onChange={(val) => {}}
                  value=""
                  formControlProps={{ sx: { width: '100%', minWidth: '180px' } }}
                />
                <CustomSelect
                  label="Division"
                  disabled
                  labelKey="name"
                  valueKey="id"
                  options={[]}
                  value=""
                  onChange={(val) => {}}
                  formControlProps={{ sx: { width: '100%', minWidth: '180px' } }}
                />
              </>
            )}
            {timeTable === 'employee' && (
              <Autocomplete
                options={[
                  { id: 1, firstName: '987374' },
                  { id: 2, firstName: '838738' },
                ]}
                getOptionLabel={(option) => option.firstName}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="GR No"
                    placeholder="Search GR No"
                    size="small"
                    fullWidth
                    sx={{ width: '100%', minWidth: '200px' }}
                  />
                )}
                onChange={(e, value) => console.log('GR No', value ? value.firstName : '')}
              />
            )}
          </Box>
        </Box>
        <TimeTableView />
      </Grid>
    </Grid>
  );
};

export default MainDashboardPrincipal;
