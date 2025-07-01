'use client';

import React, { useMemo } from 'react';

import { Add as AddIcon } from '@mui/icons-material';
import { Tab, Box, Button, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSearchParam } from 'src/hooks/use-search-param';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { CustomTabs } from 'src/components/custom-tabs';
import CustomTooltip from 'src/components/custom-tooltip';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import AttendanceRule, { AttendanceRuleForm } from './attendance-rule';
import AttendanceType, { AttendanceTypeForm } from './attendance-type';

const HrAttendanceSettingScreen = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'rule' });

  const attendanceRuleDialog = useBoolean();
  const leaveTypeDialog = useBoolean();

  const TABS = useMemo(
    () => [
      {
        value: 'rule',
        label: 'Attendance Rule',
        icon: <Iconify icon="carbon:rule-draft" width={20} />,
        buttonText: 'Attendance Rule',
        onClick: () => {
          attendanceRuleDialog.onTrue();
        },
        component: () => <AttendanceRule />,
      },

      {
        value: 'leaveType',
        label: 'Leave Type',
        icon: <Iconify icon="fluent-mdl2:date-time-mirrored" width={20} />,
        buttonText: 'Leave Type',
        onClick: () => {
          leaveTypeDialog.onTrue();
        },
        component: () => <AttendanceType />,
      },
    ],
    [attendanceRuleDialog, leaveTypeDialog]
  );

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [TABS, searchParams.tab]
  );

  // Handle click event for the add button in header
  const handleClick = () => {
    currentActiveComponent?.onClick?.(); // Safely call action if it exists
  };

  // Get the button text for the current active tab
  const getButtonText = () => currentActiveComponent?.buttonText || 'Add';

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Setting"
        description="Define leave types like Sick or Casual under Leave Type"
        links={[
          { name: 'Student', href: '/student/enrollment/dashboard/' },
          { name: 'Attendance', href: '/student/attendance/dashboard/' },
          { name: 'Setting' },
        ]}
        sx={{ px: 1, mb: 2 }}
        action={
          <Button
            variant="contained"
            size="small"
            onClick={handleClick}
            startIcon={<AddIcon />}
            sx={{ textTransform: 'capitalize', width: '160px' }}
          >
            {getButtonText()}
          </Button>
        }
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

      {attendanceRuleDialog.value && (
        <CustomDialog
          title={
            <Box display="flex" flexDirection="row" gap={1} alignItems="center">
              <Typography variant="h5">Add Rule</Typography>
              <CustomTooltip
                arrow
                placement="right"
                title="Define the criteria for half-day and late attendance by creating rules here."
              >
                <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
              </CustomTooltip>
            </Box>
          }
          open={attendanceRuleDialog.value}
          handleClose={() => {
            attendanceRuleDialog.onFalse();
          }}
        >
          <AttendanceRuleForm
            handleClose={() => {
              attendanceRuleDialog.onFalse();
            }}
            editData={null}
          />
        </CustomDialog>
      )}

      {leaveTypeDialog.value && (
        <CustomDialog
          open={leaveTypeDialog.value}
          handleClose={() => {
            leaveTypeDialog.onFalse();
          }}
          title={
            <Box display="flex" flexDirection="row" gap={1} alignItems="center">
              <Typography variant="h5">Leave Type</Typography>
              <CustomTooltip
                arrow
                placement="right"
                title="Define Leave types (like Sick or Casual) and choose a distinct color for each. To quickly differentiate them in attendance"
              >
                <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
              </CustomTooltip>
            </Box>
          }
        >
          <AttendanceTypeForm
            handleClose={() => {
              leaveTypeDialog.onFalse();
            }}
            editData={null}
          />
        </CustomDialog>
      )}
    </Box>
  );
};
export default HrAttendanceSettingScreen;
