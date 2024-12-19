import type { Division, Standards } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState } from 'react';

import { Box, Grid, Card, Link, alpha, useTheme, CardContent } from '@mui/material';

import { fNumber } from 'src/utils/format-number';
import { formatNumber } from 'src/utils/formate_number';
import { formatCurrency } from 'src/utils/cureencyFormater';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { Label, type LabelColor } from 'src/components/label';

import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

const icons = {
  groups: 'mdi:account-multiple',
  activity: 'mdi:local-activity',
  newJoiners: 'mdi:account-plus',
  leaveRequests: 'mdi:clock-alert',
  payroll: 'mdi:wallet',
};

const Dashboard = (props: TabComponentType) => {
  const theme = useTheme();
  const [classes1, setClasses1] = useState<string>('');

  const [division1, setDivision1] = useState<string>('');
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);

  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  return (
    <Box sx={{ p: 1 }}>
      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} sm={6} md={4}>
          <ActivityDashboardCard
            title="Total Dynamic Group"
            icon={icons.groups}
            value={20}
            labels={[]}
            color="primary.main"
            href="/activityManagement/studentGroup"
            classRequire
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <ActivityDashboardCard
            title="Total Static Group"
            icon={icons.groups}
            value={30}
            labels={[]}
            color="info.main"
            href="/activityManagement/studentGroup"
            classRequire
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <ActivityDashboardCard
            title="Total Activity"
            icon={icons.activity}
            value={25}
            labels={[]}
            color="secondary.main"
            href="/activityManagement/activityManagement"
          />
        </Grid>
      </Grid>
      <Grid item xs={12} sx={{ mt: 2 }}>
        <AnalyticsWebsiteVisits
          title="Student Enrollment in Different Activities"
          subheader=""
          chart={{
            categories: ['Cricket', 'Dance', 'Drawing', 'Essay Writing', 'Singing'],
            series: [{ name: 'Payroll', data: [5, 75, 35, 60, 25, 100] }],
            options: {
              yaxis: {
                labels: {
                  formatter: (value: number) => `${formatNumber(value)}`,
                },
              },
              tooltip: {
                y: {
                  formatter: (value: number) => `${formatCurrency(value)}`,
                },
              },
            },
          }}
          sx={{ height: '100%' }}
        />
      </Grid>

      <Grid item xs={12} md={12} sx={{ mt: 2 }}>
        <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
          <Box display="flex" alignItems="center" sx={{ mt: 2, gap: 1, mb: 2 }}>
            <CustomSelect
              label="Class"
              name="className"
              options={classData?.items || []}
              labelKey="name"
              valueKey="id"
              value={classes1}
              onChange={(val) => {
                const selectedClass: Standards = classData.items.find(
                  (i: Standards) => i.id === val
                );
                setClasses1(val as string);
                setDivisionOptions(selectedClass?.divisions || []);
              }}
              formControlProps={{
                sx: { width: '100%', maxWidth: '200px' },
              }}
            />
            <CustomSelect
              label="Division"
              disabled={!classes1}
              labelKey="name"
              valueKey="id"
              options={divisionOptions}
              value={division1}
              onChange={(val) => {
                const selectedDivision = divisionOptions.find((i: Division) => val.includes(i.id));
                setDivision1(val as string);
              }}
              formControlProps={{
                sx: { width: '100%', maxWidth: '200px' },
              }}
            />
          </Box>
          <AnalyticsWebsiteVisits
            title="Dynamic Vs Static Group"
            //   subheader="(+43%) than last year"
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
              series: [
                { name: 'Dynamic', data: [43, 33, 22, 37, 67, 68, 37, 24, 55] },
                { name: 'Static', data: [51, 70, 47, 67, 40, 37, 24, 70, 24] },
              ],
              colors: [
                alpha(theme.palette.warning.dark, 0.8),
                alpha(theme.palette.secondary.main, 0.8),
              ],
            }}
            sx={{ height: '100%' }}
          />
        </Card>
      </Grid>
    </Box>
  );
};

export default Dashboard;

interface DashboardCardProps {
  title: string;
  icon: string;
  value?: number | string;
  labels?: { name: string; color: LabelColor }[];
  color: string;
  href?: string;
  classRequire?: boolean;
}

export const ActivityDashboardCard = ({
  title,
  icon,
  value,
  labels = [],
  href = '',
  color,
  classRequire = false,
}: DashboardCardProps) => {
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const [classes1, setClasses1] = useState<string>('All');
  console.log('class requie====', classRequire);

  const classOptions = React.useMemo(() => {
    const allOption = { name: 'All', value: 'all' };
    return [allOption, ...(classData?.items || [])];
  }, [classData]);

  return (
    <Box
      component={Link}
      href={href}
      sx={{
        textDecoration: 'none',
        '&:hover': {
          textDecoration: 'none',
        },
      }}
    >
      <Card
        sx={{
          height: '100%',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: 'var(--shadows-8)',
            scale: 1.03,
          },
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '100%',
          }}
        >
          <Box display="flex" flexDirection="column" justifyContent="space-between" height="100%">
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
              <Box sx={{ typography: 'subtitle1' }}>{title}</Box>
              {/* <Typography variant="h6">Total Employees</Typography> */}
              {classRequire && (
                <CustomSelect
                  label="Class"
                  name="className"
                  options={classOptions}
                  labelKey="name"
                  valueKey="name"
                  value={classes1}
                  onChange={(val) => setClasses1(val as string)}
                  formControlProps={{
                    sx: {
                      minWidth: 120,
                      marginLeft: 'auto', // Align dropdown to the right
                    },
                  }}
                />
              )}
            </Box>
            {typeof value === 'number' && (
              <Box sx={{ mt: 1.5, mb: 1, typography: 'h3' }}>{fNumber(value)}</Box>
            )}
            {typeof value === 'string' && (
              <Box sx={{ mt: 1.5, mb: 1, typography: 'h3' }}>{value}</Box>
            )}
            {/* <Typography variant="h4">{stats.totalEmployees}</Typography> */}
            <Box
              sx={{
                mt: 1.5,
                mb: 1,
                typography: 'subtitle2',
                display: 'flex',
                gap: 1,
                flexWrap: 'wrap',
              }}
            >
              {labels.map((label, index) => (
                <Label color={label.color || 'success'}>{label.name}</Label>
              ))}
            </Box>
          </Box>
          <Iconify icon={icon} sx={{ width: 50, height: 50, color }} />
          {/* <Typography variant="body2"></Typography> */}
        </CardContent>
      </Card>
    </Box>
  );
};
