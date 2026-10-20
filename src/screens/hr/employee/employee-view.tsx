import type { UseTabsReturn } from 'src/hooks/use-tabs';

import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import React, { useMemo } from 'react';
import { useTabs } from 'src/hooks/use-tabs';
import { FormSlider } from 'src/components/form-slider';
import { EmptyContent } from 'src/components/empty-content';
import { Tab, Box, Tabs, Paper, Avatar, Divider, Typography } from '@mui/material';

import PayrollSummary from './payroll-summary';
import EmployeeInformation from './information';
import EmployeeLibrary from './EmployeeLibrary';
import EmployeeCalendar from './EmployeeCalendar';
import LeaveBalance from '../leave-balance/leave-balance';
import EmployeeAcademic from './employeeAcademic/academic';
import EmployeeViewSkeleton from './employee-view-skeleton';
import EmployeeProfileDashboard from './employee-dashboard';
import EmployeeCommunication from './employee-communication';
import { convertBase64Format } from '../../../utils/base64Formate';
import EmployeeAttendanceHistory from './employee-attendance-history';
import { EmployeeStatusType } from '../../../enums/employee-status-type';
import QualificationAndCertification from './qualification-certification';

// ── Animation variants ──────────────────────
const enterCurve = [0.22, 1, 0.36, 1] as const;

const fadeSlideUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: enterCurve } },
};

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.24, ease: enterCurve } },
};

const avatarVariant = {
  hidden: { opacity: 0, scale: 0.88 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.28, ease: enterCurve } },
};

export const TABS = [
  {
    value: 'dashboard',
    label: 'Dashboard',
    icon: <Icon icon="lucide:layout-dashboard" width={18} height={18} />,
    component: (props: { tabs: UseTabsReturn; employee: any }) => (
      <EmployeeProfileDashboard editData={props.employee} />
    ),
  },
  {
    value: 'personalInformation',
    label: 'Information',
    icon: <Icon icon="solar:user-id-outline" width={18} height={18} />,
    component: (props: { tabs: UseTabsReturn; employee: any }) => (
      <EmployeeInformation editData={props.employee} />
    ),
  },
  {
    value: 'qualificationsCertifications',
    label: 'Documents',
    icon: <Icon icon="solar:document-broken" width={18} height={18} />,
    component: (props: { tabs: UseTabsReturn; employee: any }) => (
      <QualificationAndCertification employee={props.employee} />
    ),
  },
  {
    value: 'payrollSummary',
    label: 'Payroll Summary',
    icon: <Icon icon="lucide:landmark" width={18} height={18} />,
    component: (props: { tabs: UseTabsReturn; employee: any }) => (
      <PayrollSummary employee={props.employee} />
    ),
  },
  {
    value: 'academic',
    label: 'Academic',
    icon: <Icon icon="solar:square-academic-cap-2-broken" width={18} height={18} />,
    component: (props: { tabs: UseTabsReturn; employee: any }) => (
      <EmployeeAcademic employee={props.employee} />
    ),
  },
  {
    value: 'communications',
    label: 'Communication',
    icon: <Icon icon="fluent-mdl2:office-chat" width={18} height={18} />,
    component: (props: { tabs: UseTabsReturn; employee: any }) => (
      <EmployeeCommunication employee={props.employee} />
    ),
  },
  {
    value: 'library',
    label: 'Library',
    icon: <Icon icon="ph:books-light" width={18} height={18} />,
    component: (props: { employee: any; tabs: UseTabsReturn }) => (
      <EmployeeLibrary employee={props.employee} />
    ),
  },
  {
    value: 'calendar',
    label: 'Calendar',
    icon: <Icon icon="radix-icons:calendar" width={18} height={18} />,
    component: (props: { tabs: UseTabsReturn; employee: any }) => (
      <EmployeeCalendar employee={props.employee} />
    ),
  },
  {
    value: 'leaveBalance',
    label: 'Leave Center',
    icon: <Icon icon="solar:calendar-mark-linear" width={18} height={18} />,
    component: (props: { tabs: UseTabsReturn; employee: any }) => (
      <LeaveBalance employeeId={props.employee?.id} showBreadcrumbs={false} />
    ),
  },
  {
    value: 'attendance',
    label: 'Attendance',
    icon: <Icon icon="mdi:calendar-clock-outline" width={18} height={18} />,
    component: (props: { tabs: UseTabsReturn; employee: any }) => (
      <EmployeeAttendanceHistory employeeId={props.employee?.id} />
    ),
  },
];

interface EmployeeViewProps {
  employee: any;
  isLoading: boolean;
  isError: boolean;
  setSearchParams: any;
  searchParams: any;
}

export function EmployeeCard({
  employee,
  initialTab,
  setSearchParams,
}: {
  employee: any;
  initialTab?: string;
  setSearchParams?: any;
}) {
  const tabs = useTabs(initialTab || 'dashboard');
  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === tabs.value),
    [tabs.value]
  );
  const currentIndex = useMemo(
    () => TABS.findIndex((tab) => tab.value === tabs.value),
    [tabs.value]
  );
  const [isBackClick, setIsBackClick] = React.useState(false);
  return (
    <Box
      data-testid="hr-employee-profile"
      sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}
    >
      <motion.div variants={fadeSlideUp} initial="hidden" animate="show">
        <Paper
          data-testid="hr-employee-profile-header"
          sx={{
            mb: 1,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            boxShadow: 'var(--shadows-4)',
          }}
        >
          <Paper
            sx={{
              p: 1,
              // borderBottom: '1px dashed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderLeft: (theme) =>
                employee?.status === EmployeeStatusType.Active
                  ? `4px solid ${theme.vars.palette.success.main}`
                  : `4px solid ${theme.palette.error.main}`,
              borderRadius: 1,
            }}
          >
            <motion.div variants={staggerContainer} initial="hidden" animate="show">
              <Box display="flex" gap={1} alignItems="center">
                <motion.div variants={avatarVariant}>
                  <Avatar
                    src={
                      employee?.profilePicture
                        ? convertBase64Format(employee?.profilePicture)
                        : 'https://api-dev-minimal-v6.vercel.app/assets/images/avatar/avatar-25.webp'
                    }
                    sx={{
                      width: 64,
                      height: 64,
                      border: (theme) => `1px solid ${theme.vars.palette.grey[400]}`,
                    }}
                  />
                </motion.div>
                <motion.div variants={staggerItem}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Name
                    </Typography>
                    <Typography fontWeight={500} variant="body2">
                      {employee?.fullName}
                    </Typography>
                  </Box>
                </motion.div>
                <Divider orientation="vertical" flexItem sx={{ my: '10px' }} />
                <motion.div variants={staggerItem}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Staff Code
                    </Typography>
                    <Typography fontWeight={500} variant="body2">
                      {employee?.employeeIdentifier}
                    </Typography>
                  </Box>
                </motion.div>
                <Divider orientation="vertical" flexItem sx={{ my: '10px' }} />
                <motion.div variants={staggerItem}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Role
                    </Typography>
                    <Typography fontWeight={500} variant="body2">
                      {employee?.roleName}
                    </Typography>
                  </Box>
                </motion.div>
                <Divider orientation="vertical" flexItem sx={{ my: '10px' }} />
                <motion.div variants={staggerItem}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Organization
                    </Typography>
                    <Typography fontWeight={500} variant="body2">
                      {employee?.organizationNames?.join(', ') || '-'}
                    </Typography>
                  </Box>
                </motion.div>
              </Box>
            </motion.div>
          </Paper>
        </Paper>
      </motion.div>

      <motion.div
        variants={fadeSlideUp}
        initial="hidden"
        animate="show"
        style={{ transitionDelay: '80ms' }}
      >
        <Paper elevation={2} sx={{ mb: 1, overflow: 'hidden' }}>
          <Tabs
            value={tabs.value}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            aria-label="Staff profile sections"
            onChange={(...rest) => {
              const newIndex = TABS.findIndex((tab) => tab.value === rest[1]);
              if (currentIndex > newIndex) {
                setIsBackClick(true);
              } else {
                setIsBackClick(false);
              }
              tabs.onChange(...rest);
              setSearchParams?.('tab', rest[1]);
            }}
            sx={{
              px: 0.5,
              minHeight: 46,
              '& .MuiTabs-flexContainer': { gap: 0.5, alignItems: 'stretch' },
              '& .MuiTab-root': {
                minWidth: 'auto',
                minHeight: 46,
                px: 1.25,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 0.75,
                whiteSpace: 'nowrap',
              },
              '& .MuiTab-iconWrapper': {
                mb: '0 !important',
              },
            }}
            role="tablist"
          >
            {TABS.map((tab) => (
              <Tab
                sx={{ fontSize: '0.75rem' }}
                key={tab.value}
                value={tab.value}
                icon={tab.icon}
                iconPosition="start"
                label={tab.label}
                role="tab"
              />
            ))}
          </Tabs>
        </Paper>
      </motion.div>

      <motion.div
        variants={fadeSlideUp}
        initial="hidden"
        animate="show"
        style={{
          transitionDelay: '160ms',
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <FormSlider
          steps={TABS}
          isBackClick={isBackClick}
          step={currentIndex}
          containerProps={{ sx: { p: 0, minHeight: 0, flex: 1 } }}
        >
          <Box sx={{ height: '100%' }}>
            {currentActiveComponent?.component && (
              <currentActiveComponent.component tabs={tabs} employee={employee} />
            )}
          </Box>
        </FormSlider>
      </motion.div>
    </Box>
  );
}

const EmployeeView = ({
  employee,
  isLoading,
  isError,
  setSearchParams,
  searchParams,
}: EmployeeViewProps) =>
  isLoading ? (
    <EmployeeViewSkeleton />
  ) : isError ? (
    <EmptyContent title="Staff not found" />
  ) : (
    <EmployeeCard
      key={employee?.id}
      employee={employee}
      initialTab={searchParams?.tab || 'dashboard'}
      setSearchParams={setSearchParams}
    />
  );

export default EmployeeView;
