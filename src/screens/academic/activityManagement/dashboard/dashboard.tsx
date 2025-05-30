'use client';

import type { Division } from 'src/types/school';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState } from 'react';

import { Box, Card, Link, useTheme, CardContent } from '@mui/material';

import { fNumber } from 'src/utils/format-number';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { Label, type LabelColor } from 'src/components/label';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import DashBoardQuickAction from 'src/components/dashboard-quick-action';

import ActivityDashboardCards from './component/activityDashboardCards';
import ActivityDashboardGroup from './component/activityDashboardGroup';
import ActivityStudentEnrollment from './component/activityStudentEnrollment';

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
        links={[{ name: 'Academics' }, { name: 'Activity' }, { name: 'Dashboard' }]}
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
      <ActivityDashboardCards />
      <ActivityStudentEnrollment />
      <ActivityDashboardGroup />
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
