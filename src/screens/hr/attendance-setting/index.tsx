'use client';

import { Add } from '@mui/icons-material';
import React, { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { hrPaths } from 'src/constants/hr-menus';
import { useBoolean } from 'src/hooks/use-boolean';
import { RouterLink } from 'src/routes/components';
import { CustomTabs } from 'src/components/custom-tabs';
import { FormSlider } from 'src/components/form-slider';
import { useSearchParam } from 'src/hooks/use-search-param';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Tab, Box, Paper, Stack, Button, Typography } from '@mui/material';

import ShiftManagement from './shift-management';

const TABS = [
  {
    value: 'shiftManagement',
    label: 'Shifts',
    icon: <Iconify icon="mdi:clock" width={20} />,
    component: (props: any) => <ShiftManagement {...props} />,
  },
  {
    value: 'attendancePolicy',
    label: 'Attendance Policy',
    icon: <Iconify icon="mdi:account-clock-outline" width={20} />,
    component: () => <AttendancePolicyBridge />,
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
    value: 'deviceIntegration',
    label: 'Device Integration',
    icon: <Iconify icon="mdi:fingerprint" width={20} />,
    component: () => <DeviceIntegrationBridge />,
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
  const shiftManagementDialog = useBoolean(false);
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
      attendancePolicy: (
        <Button
          sx={{ width: '190px' }}
          component={RouterLink}
          href={hrPaths.policies.attendance}
          startIcon={<Iconify icon="mdi:open-in-new" />}
          variant="contained"
          size="small"
        >
          Open Policies
        </Button>
      ),
      deviceIntegration: (
        <Button
          sx={{ width: '190px' }}
          component={RouterLink}
          href={hrPaths.attendance.biometricAttendance}
          startIcon={<Iconify icon="mdi:open-in-new" />}
          variant="contained"
          size="small"
        >
          Open Devices
        </Button>
      ),
    }),
    [attendanceRuleDialog.onTrue, shiftManagementDialog.onTrue]
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
          { name: 'Attendance Management', href: `/hr/attendance-setting` },
          { name: 'Setting' },
        ]}
        action={renderButton[searchParams?.tab as keyof typeof renderButton]}
        description="Keep standard attendance simple: set shifts, use one standard attendance policy, and connect imports or devices when required."
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
              shiftManagementDialog={shiftManagementDialog}
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

const AttendancePolicyBridge = () => (
  <Stack
    spacing={2}
    sx={{
      p: 3,
      minHeight: 220,
      border: (theme) => `1px solid ${theme.palette.divider}`,
      borderRadius: 1,
      bgcolor: 'background.paper',
    }}
  >
    <Stack direction="row" spacing={1.25} alignItems="center">
      <Iconify icon="mdi:account-clock-outline" width={24} />
      <Typography variant="h6">Standard Attendance Policy</Typography>
    </Stack>
    <Typography color="text.secondary" sx={{ maxWidth: 760 }}>
      Most schools can run HR attendance with one active default policy: 75% full day, 50% half day,
      missing punches sent for review, manual correction enabled, and payroll impact visible.
      Detailed late, overtime, and holiday rules stay inside Advanced Settings.
    </Typography>
    <Box>
      <Button
        component={RouterLink}
        href={hrPaths.policies.attendance}
        variant="contained"
        size="small"
        startIcon={<Iconify icon="mdi:open-in-new" />}
      >
        Open Attendance Policies
      </Button>
    </Box>
  </Stack>
);

const DeviceIntegrationBridge = () => (
  <Stack
    spacing={2}
    sx={{
      p: 3,
      minHeight: 220,
      border: (theme) => `1px solid ${theme.palette.divider}`,
      borderRadius: 1,
      bgcolor: 'background.paper',
    }}
  >
    <Stack direction="row" spacing={1.25} alignItems="center">
      <Iconify icon="mdi:fingerprint" width={24} />
      <Typography variant="h6">Device Integration</Typography>
    </Stack>
    <Typography color="text.secondary" sx={{ maxWidth: 760 }}>
      Excel import is available now. Biometric, RFID, and vendor-specific device sync will stay as
      placeholders until the device company requirements are finalized.
    </Typography>
    <Box>
      <Button
        component={RouterLink}
        href={hrPaths.attendance.biometricAttendance}
        variant="contained"
        size="small"
        startIcon={<Iconify icon="mdi:open-in-new" />}
      >
        Open Device Integration
      </Button>
    </Box>
  </Stack>
);
