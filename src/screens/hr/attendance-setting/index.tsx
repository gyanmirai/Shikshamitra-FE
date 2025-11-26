'use client';

import { Add } from '@mui/icons-material';
import React, { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { CustomTabs } from 'src/components/custom-tabs';
import { Tab, Box, Paper, Button } from '@mui/material';
import { useSearchParam } from 'src/hooks/use-search-param';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { FormSlider } from 'src/screens/student/enrollment/register/register-form';

import LeaveType from './leave-type';
import LeavePolicy from './leave-policy';
import ShiftManagement from './shift-management';

const TABS = [
  {
    value: 'shiftManagement',
    label: 'Shift Management',
    icon: <Iconify icon="mdi:clock" width={20} />,
    component: (props: any) => <ShiftManagement {...props} />,
  },
  // {
  //   value: 'method',
  //   label: 'Notification Method',
  //   icon: <Iconify icon="hugeicons:configuration-02" width={20} />,
  //   component: () => <NotificationMethod />,
  // },
  // {
  //   value: 'rule',
  //   label: 'Attendance Rule',
  //   icon: <Iconify icon="carbon:rule-draft" width={20} />,
  //   component: (props: any) => <AttendanceRule {...props} />,
  // },
  {
    value: 'leaveType',
    label: 'Leave Type',
    icon: <Iconify icon="fluent:notepad-edit-16-filled" width={20} />,
    component: (props: any) => <LeaveType {...props} />,
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
  const shiftManagementDialog = useBoolean(false);
  const leaveTypeDialog = useBoolean(false);
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'shiftManagement' });
  const currentIndex = useMemo(
    () => TABS.findIndex((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );

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
      shiftManagement: (
        <Button
          sx={{ width: '160px' }}
          startIcon={<Add />}
          variant="contained"
          size="small"
          onClick={shiftManagementDialog.onTrue}
        >
          Shift Rule
        </Button>
      ),
      leaveType: (
        <Button
          sx={{ width: '160px' }}
          startIcon={<Add />}
          variant="contained"
          size="small"
          onClick={leaveTypeDialog.onTrue}
        >
          Leave Type
        </Button>
      ),
    }),
    [
      attendanceRuleDialog.onTrue,
      leavePolicyDialog.onTrue,
      leaveTypeDialog.onTrue,
      shiftManagementDialog.onTrue,
    ]
  );

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );

  const [isBackClick, setIsBackClick] = useState(false);

  //
  // const handleClose = () => {
  //   setEditData(null);
  //   dialog.onFalse();
  // };
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Setting"
        links={[
          { name: 'HR/Staff', href: '/hr/dashboard/' },
          { name: 'Attendance & Leave', href: `/hr/attendance-setting` },
          { name: 'Setting' },
        ]}
        sx={{ mb: 2 }}
        action={renderButton[searchParams?.tab as keyof typeof renderButton]}
        description="Configure attendance settings including shift management, leave types, and leave policies for effective workforce management"
      />
      <Paper
        sx={{
          '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
        }}
      >
        <CustomTabs
          value={searchParams.tab}
          onChange={(e, value) => {
            const newIndex = TABS.findIndex((tab) => tab.value === value);
            if (currentIndex > newIndex) {
              setIsBackClick(true);
            } else {
              setIsBackClick(false);
            }

            setSearchParams({ tab: value });
          }}
          sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 } }}
          role="tablist"
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} icon={tab.icon} />
          ))}
        </CustomTabs>
      </Paper>
      <FormSlider
        steps={TABS}
        isBackClick={isBackClick}
        step={currentIndex}
        containerProps={{
          sx: {
            p: 0,
            minHeight: 0,
          },
        }}
      >
        <Box sx={{ height: '100%' }}>
          {currentActiveComponent?.component && (
            <currentActiveComponent.component
              attendanceRuleDialog={attendanceRuleDialog}
              leavePolicyDialog={leavePolicyDialog}
              shiftManagementDialog={shiftManagementDialog}
              leaveTypeDialog={leaveTypeDialog}
              // searchParams={searchParams}
              // setSearchParams={setSearchParams}
            />
          )}{' '}
        </Box>
      </FormSlider>
    </Box>
  );
};

export default HrAttendanceSettingScreen;
