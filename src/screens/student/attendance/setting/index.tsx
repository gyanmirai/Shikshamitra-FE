'use client';

import React, { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Add as AddIcon } from '@mui/icons-material';
import { CustomTabs } from 'src/components/custom-tabs';
import { Box, Tab, Paper, Button } from '@mui/material';
import { useSearchParam } from 'src/hooks/use-search-param';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { FormSlider } from 'src/screens/student/enrollment/register/register-form';

import AttendanceType from './attendance-type';
// import AttendanceRule from './attendance-rule'; // Uncomment if needed

const TABS = [
  // Uncomment below if adding attendance rule tab
  // {
  //   value: 'rule',
  //   label: 'Attendance Rule',
  //   icon: <Iconify icon="carbon:rule-draft" width={20} />,
  //   buttonText: 'Attendance Rule',
  //   component: (props: any) => <AttendanceRule {...props} />,
  // },
  {
    value: 'leaveType',
    label: 'Leave Type',
    icon: <Iconify icon="fluent-mdl2:date-time-mirrored" width={20} />,
    buttonText: 'Leave Type',
    component: (props: any) => <AttendanceType {...props} />,
  },
];

const HrAttendanceSettingScreen = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'leaveType' });

  const addLeaveTypeDialog = useBoolean(false);
  // const addAttendanceRuleDialog = useBoolean(false); // For rule tab if needed

  const renderButton = useMemo(
    () => ({
      leaveType: (
        <Button
          variant="contained"
          size="small"
          onClick={addLeaveTypeDialog.onTrue}
          startIcon={<AddIcon />}
          sx={{ textTransform: 'capitalize', width: '160px' }}
        >
          Leave Type
        </Button>
      ),
      // rule: (
      //   <Button
      //     variant="contained"
      //     size="small"
      //     onClick={addAttendanceRuleDialog.onTrue}
      //     startIcon={<AddIcon />}
      //     sx={{ textTransform: 'capitalize', width: '160px' }}
      //   >
      //     Attendance Rule
      //   </Button>
      // ),
    }),
    [addLeaveTypeDialog.onTrue]
  );

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );

  const currentIndex = useMemo(
    () => TABS.findIndex((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );

  const [isBackClick, setIsBackClick] = useState(false);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Setting"
        description="Define leave types like Sick or Casual under Leave Type"
        links={[
          { name: 'Student', href: '/student/enrollment/dashboard/' },
          { name: 'Attendance', href: '/student/attendance/dashboard/' },
          { name: 'Setting' },
        ]}
        action={renderButton[searchParams?.tab as keyof typeof renderButton]}
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
            setIsBackClick(currentIndex > newIndex);
            setSearchParams({ tab: value });
          }}
          sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 } }}
          role="tablist"
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} icon={tab.icon} label={tab.label} role="tab" />
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
        <Box sx={{ p: 1, height: '100%' }}>
          {currentActiveComponent?.component && (
            <currentActiveComponent.component
              dialog={addLeaveTypeDialog}
              // addAttendanceRuleDialog={addAttendanceRuleDialog}
            />
          )}
        </Box>
      </FormSlider>
    </Box>
  );
};

export default HrAttendanceSettingScreen;
