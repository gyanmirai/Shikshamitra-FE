'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React, { useState, useEffect } from 'react';
import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import DashBoardQuickAction from 'src/components/dashboard-quick-action';

import CousreDetails from './component/cousreDetails';
import StudentPerformance from './component/studentPerformance';
import StudentCoursePerfoemance from './component/studentCoursePerfoemance';

const Dashboard = (props: TabComponentType) => {
  const theme = useTheme();
  const [classes3, setClasses3] = useState<string>('');
  const [classes4, setClasses4] = useState<string>('');
  const [classes5, setClasses5] = useState<string>('All');

  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const classOptions = React.useMemo(() => {
    const allOption = { name: 'All', value: 'all' };
    return [allOption, ...(classData?.items || [])];
  }, [classData]);

  useEffect(() => {
    if (classData?.items?.length) {
      if (!classes3 || !classes4) {
        const firstClass = classData.items[0];
        setClasses3(firstClass?.id);
        setClasses4(firstClass?.id);
      }
    }
  }, [classData, classes3, classes4]);

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Dashboard"
        links={[{ name: 'Academics' }, { name: 'Course' }, { name: 'Dashboard' }]}
        sx={{ px: 1, mb: 2 }}
        action={
          <DashBoardQuickAction
            actions={[
              {
                icon: 'mdi:plus',
                label: 'Add New Course',
                href: '/academic/course-management/subjects',
                color: 'primary',
              },
              {
                icon: 'mdi:progress-helper',
                label: 'Course Progress',
                href: '/academic/course-management/courseProgress',
                color: 'warning',
              },
              {
                icon: 'simple-icons:googledocs',
                label: 'General Reports',
                href: '/academic/course-management/reports',
                color: 'secondary',
              },
            ]}
          />
        }
      />
      <StudentPerformance />
      <StudentCoursePerfoemance />
      <CousreDetails />
    </Box>
  );
};

export default Dashboard;
