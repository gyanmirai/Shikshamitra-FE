'use client';

import React, { useMemo } from 'react';
import { Tab, Box } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import { useSearchParam } from 'src/hooks/use-search-param';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetEmployeeCustomAttendanceRuleQuery } from 'src/redux/employee/employeeApi';

import Notification from './notification';
import AttendanceRule from './attendance-rule';
import AttendanceType from './attendance-type';
import NotificationMethod from './notification-method';

const TABS = [
  {
    value: 'notification',
    label: 'Notification',
    icon: <Iconify icon="mage:notification-bell-fill" width={20} />,
    component: () => <Notification />,
  },
  {
    value: 'method',
    label: 'Notification Method',
    icon: <Iconify icon="hugeicons:configuration-02" width={20} />,
    component: () => <NotificationMethod />,
  },
  {
    value: 'rule',
    label: 'Attendance Rule',
    icon: <Iconify icon="carbon:rule-draft" width={20} />,
    component: () => <AttendanceRule />,
  },

  {
    value: 'attendanceType',
    label: 'Attendance Type',
    icon: <Iconify icon="fluent-mdl2:date-time-mirrored" width={20} />,
    component: () => <AttendanceType />,
  },
];

const HrAttendanceSettingScreen = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'notification' });

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );
  const { data } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeCustomAttendanceRuleQuery,
  });
  console.log(data, 'data');
  // const handleClose = () => {
  //   setEditData(null);
  //   dialog.onFalse();
  // };
  return (
    <Box>
      <CustomBreadcrumbs
        heading={currentActiveComponent?.label}
        links={[{ name: 'HR' }, { name: 'Setting' }]}
        sx={{ px: 1, mb: 2 }}
      />
      <CustomTabs
        value={searchParams.tab}
        onChange={(e, value) => setSearchParams({ tab: value })}
        sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 } }}
        role="tablist"
      >
        {TABS.map((tab) => (
          <Tab
            sx={{ fontSize: '12px' }}
            key={tab.value}
            value={tab.value}
            icon={tab.icon}
            label={tab.label}
            role="tab"
          />
        ))}
      </CustomTabs>
      <Scrollbar sx={{ p: 1 }}>
        {currentActiveComponent?.component && (
          <currentActiveComponent.component
          // searchParams={searchParams}
          // setSearchParams={setSearchParams}
          />
        )}
      </Scrollbar>
    </Box>
  );
};

export default HrAttendanceSettingScreen;
