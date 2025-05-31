'use client';

import React, { useMemo } from 'react';

import { Add } from '@mui/icons-material';
import { Tab, Box, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSearchParam } from 'src/hooks/use-search-param';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import LeavePolicy from './leave-policy';
import AttendanceRule from './attendance-rule';

const TABS = [
  // {
  //   value: 'notification',
  //   label: 'Notification',
  //   icon: <Iconify icon="mage:notification-bell-fill" width={20} />,
  //   component: () => <Notification />,
  // },
  // {
  //   value: 'method',
  //   label: 'Notification Method',
  //   icon: <Iconify icon="hugeicons:configuration-02" width={20} />,
  //   component: () => <NotificationMethod />,
  // },
  {
    value: 'rule',
    label: 'Attendance Rule',
    icon: <Iconify icon="carbon:rule-draft" width={20} />,
    component: (props: any) => <AttendanceRule {...props} />,
  },
  {
    value: 'leavePolicy',
    label: 'Leave Policy',
    icon: <Iconify icon="iconoir:privacy-policy" width={20} />,
    component: (props: any) => <LeavePolicy {...props} />,
  },
  // {
  //   value: 'lateArrivalPolicy',
  //   label: 'Late Arrival Policy',
  //   icon: <Iconify icon="fluent-mdl2:date-time-mirrored" width={20} />,
  //   component: () => <LateArrivalPolicy />,
  // },
];

const HrAttendanceSettingScreen = () => {
  const attendanceRuleDialog = useBoolean(false);
  const leavePolicyDialog = useBoolean(false);
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'rule' });

  const renderButton = useMemo(
    () => ({
      rule: (
        <Button
          sx={{ width: '160px' }}
          startIcon={<Add />}
          variant="contained"
          onClick={attendanceRuleDialog.onTrue}
          size="small"
        >
          Attendance Rule
        </Button>
      ),
      leavePolicy: (
        <Button
          sx={{ width: '160px' }}
          startIcon={<Add />}
          onClick={leavePolicyDialog.onTrue}
          variant="contained"
          size="small"
        >
          Leave Policy
        </Button>
      ),
    }),
    [attendanceRuleDialog.onTrue, leavePolicyDialog.onTrue]
  );

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );

  // console.log(data, 'data');
  // const handleClose = () => {
  //   setEditData(null);
  //   dialog.onFalse();
  // };
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Setting"
        links={[{ name: 'HR', href: '/hr/dashboard/' }, { name: 'Setting' }]}
        sx={{ px: 1, mb: 2 }}
        action={renderButton[searchParams?.tab as keyof typeof renderButton]}
        description="Here, you can configure settings for Attendance Types, Leave Policies, and Late Arrival Rules to ensure accurate attendance tracking and policy enforcement."
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
            attendanceRuleDialog={attendanceRuleDialog}
            leavePolicyDialog={leavePolicyDialog}
            // searchParams={searchParams}
            // setSearchParams={setSearchParams}
          />
        )}
      </Scrollbar>
    </Box>
  );
};

export default HrAttendanceSettingScreen;
