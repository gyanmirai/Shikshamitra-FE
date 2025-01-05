'use client';

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
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import DashBoardQuickAction from 'src/components/dashboard-quick-action';

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
    <Box>
      <CustomBreadcrumbs
        heading="Dashboard"
        links={[
          { name: 'Academic and Assignment' },
          { name: 'Activity Management' },
          { name: 'Dashboard' },
        ]}
        sx={{ px: 1, mb: 2 }}
        action={
          <DashBoardQuickAction
            actions={[
              {
                icon: 'mdi:plus',
                label: 'Dynamic Group',
                href: '/academic/activityManagement/dynamicGroup',
                color: 'primary',
              },
              {
                icon: 'mdi:plus',
                label: 'Activity',
                href: '/academic/activityManagement/activityManagement',
                color: 'warning',
              },
              {
                icon: 'mdi:plus',
                label: 'Student Group',
                href: '/academic/activityManagement/studentGroup',
                color: 'secondary',
              },
            ]}
          />
        }
      />
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
  const { data: classData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const [classes1, setClasses1] = useState<string>('');

  return (
    <Box
      component={Link}
      href={href}
      sx={{
        textDecoration: 'none',
        height: '100%',
        display: 'block',
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
            flexDirection: 'column',
            height: '100%',
            position: 'relative',
            pt: 3, // Consistent top padding for all cards
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start', // Changed from center to flex-start
              width: '100%',
              mb: 2,
              minHeight: classRequire ? 56 : 40, // Minimum height to accommodate dropdown
            }}
          >
            <Box
              sx={{
                typography: 'subtitle1',
                flex: 1,
                mr: 2,
                mt: classRequire ? 1 : 0, // Add top margin when dropdown is present
              }}
            >
              {title}
            </Box>
            {classRequire && (
              <CustomSelect
                label="Class"
                name="className"
                options={classData?.items || []}
                labelKey="name"
                valueKey="name"
                value={classes1}
                onChange={(val) => setClasses1(val as string)}
                formControlProps={{
                  size: 'small',
                  sx: {
                    minWidth: 120,
                    '& .MuiInputBase-root': {
                      height: 40,
                    },
                  },
                }}
              />
            )}
          </Box>

          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Box
              sx={{
                typography: 'h3',
                mb: 2,
                mt: classRequire ? 0 : 1, // Adjust margin based on presence of dropdown
              }}
            >
              {typeof value === 'number' ? fNumber(value) : value}
            </Box>

            <Box
              sx={{
                typography: 'subtitle2',
                display: 'flex',
                gap: 1,
                flexWrap: 'wrap',
                mb: 2,
              }}
            >
              {labels.map((label, index) => (
                <Label key={index} color={label.color || 'success'}>
                  {label.name}
                </Label>
              ))}
            </Box>
          </Box>

          <Box sx={{ position: 'absolute', right: 24, bottom: 24 }}>
            <Iconify icon={icon} sx={{ width: 50, height: 50, color }} />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
