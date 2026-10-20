import type { LabelColor } from 'src/components/label';
import type { UseTabsReturn } from 'src/hooks/use-tabs';

import dynamic from 'next/dynamic';
import { Icon } from '@iconify/react';
import { useTabs } from 'src/hooks/use-tabs';
import { Label } from 'src/components/label';
import React, { useId, useMemo } from 'react';
import { FormSlider } from 'src/components/form-slider';
import { motion, useReducedMotion } from 'framer-motion';
import { EmptyContent } from 'src/components/empty-content';
import { Tab, Box, Tabs, Paper, Avatar, Skeleton, Typography } from '@mui/material';

import EmployeeViewSkeleton from './employee-view-skeleton';
import EmployeeProfileDashboard from './employee-dashboard';
import { convertBase64Format } from '../../../utils/base64Formate';
import { getEmployeeStatusDisplayValue } from './employee-status-display';
import { EmployeeStatusTypeColor } from '../../../enums/employee-status-type';

function ProfilePanelSkeleton() {
  return (
    <Box role="status" aria-label="Loading profile section" sx={{ p: 2 }}>
      <Skeleton variant="rounded" height={240} />
    </Box>
  );
}

const PayrollSummary = dynamic(() => import('./payroll-summary'), {
  loading: ProfilePanelSkeleton,
});
const EmployeeInformation = dynamic(() => import('./information'), {
  loading: ProfilePanelSkeleton,
});
const EmployeeLibrary = dynamic(() => import('./EmployeeLibrary'), {
  loading: ProfilePanelSkeleton,
});
const EmployeeCalendar = dynamic(() => import('./EmployeeCalendar'), {
  loading: ProfilePanelSkeleton,
});
const LeaveBalance = dynamic(() => import('../leave-balance/leave-balance'), {
  loading: ProfilePanelSkeleton,
});
const EmployeeAcademic = dynamic(() => import('./employeeAcademic/academic'), {
  loading: ProfilePanelSkeleton,
});
const EmployeeCommunication = dynamic(() => import('./employee-communication'), {
  loading: ProfilePanelSkeleton,
});
const EmployeeAttendanceHistory = dynamic(() => import('./employee-attendance-history'), {
  loading: ProfilePanelSkeleton,
});
const QualificationAndCertification = dynamic(() => import('./qualification-certification'), {
  loading: ProfilePanelSkeleton,
});

// ── Animation variants ──────────────────────
const enterCurve = [0.22, 1, 0.36, 1] as const;

const fadeSlideUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: enterCurve } },
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
  const reduceMotion = useReducedMotion();
  const tabs = useTabs(initialTab || 'dashboard');
  // Mount routed panels only after their URL is current, including browser history changes.
  const activeTab = setSearchParams ? initialTab || 'dashboard' : tabs.value;
  const profileId = useId();
  const statusLabel = getEmployeeStatusDisplayValue(employee?.status, employee?.doj);
  const statusColor: LabelColor =
    statusLabel === 'Upcoming'
      ? 'info'
      : (EmployeeStatusTypeColor[
          employee?.status as keyof typeof EmployeeStatusTypeColor
        ] as LabelColor) || 'default';
  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === activeTab),
    [activeTab]
  );
  const currentIndex = useMemo(() => TABS.findIndex((tab) => tab.value === activeTab), [activeTab]);
  const [isBackClick, setIsBackClick] = React.useState(false);
  return (
    <Box
      data-testid="hr-employee-profile"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: activeTab === 'dashboard' ? 'auto' : '100%',
        minHeight: 0,
        flexShrink: 0,
      }}
    >
      <motion.div
        variants={fadeSlideUp}
        initial={reduceMotion || activeTab === 'dashboard' ? false : 'hidden'}
        animate="show"
      >
        <Paper data-testid="hr-employee-profile-header" sx={{ p: 2, mb: 1, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, minWidth: 0 }}>
            <Avatar
              alt={employee?.fullName || 'Staff member'}
              src={
                employee?.profilePicture
                  ? convertBase64Format(employee.profilePicture)
                  : 'https://api-dev-minimal-v6.vercel.app/assets/images/avatar/avatar-25.webp'
              }
              sx={{ width: 64, height: 64, flexShrink: 0 }}
            />
            <Box sx={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" component="h2" sx={{ minWidth: 0 }}>
                  {employee?.fullName || '-'}
                </Typography>
                {statusLabel && <Label color={statusColor}>{statusLabel}</Label>}
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  flexDirection: { xs: 'column', sm: 'row' },
                  columnGap: 2,
                  rowGap: 0.5,
                  mt: 0.5,
                }}
              >
                <Typography variant="body2">
                  <Box component="span" sx={{ color: 'text.secondary', mr: 0.75 }}>
                    Staff Code:
                  </Box>
                  {employee?.employeeIdentifier || '-'}
                </Typography>
                <Typography variant="body2">
                  <Box component="span" sx={{ color: 'text.secondary', mr: 0.75 }}>
                    Role:
                  </Box>
                  {employee?.roleName || '-'}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                <Box component="span" sx={{ mr: 0.75 }}>
                  Organization:
                </Box>
                {employee?.organizationNames?.join(', ') || '-'}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </motion.div>

      <motion.div
        variants={fadeSlideUp}
        initial={reduceMotion || activeTab === 'dashboard' ? false : 'hidden'}
        animate="show"
        style={{ flexShrink: 0 }}
      >
        <Paper elevation={2} sx={{ mb: 1, overflow: 'hidden' }}>
          <Tabs
            value={activeTab}
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
              minHeight: 48,
              '& .MuiTabs-flexContainer': { gap: 0.5, alignItems: 'stretch' },
              '& .MuiTab-root': {
                minWidth: 'auto',
                minHeight: 48,
                px: 1.25,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 0.75,
                whiteSpace: 'nowrap',
                typography: 'body2',
                fontWeight: 'fontWeightMedium',
                '&.Mui-selected': { fontWeight: 'fontWeightBold' },
                '&.Mui-focusVisible': {
                  outline: (theme) => `2px solid ${theme.vars.palette.primary.main}`,
                  outlineOffset: -2,
                  borderRadius: 1,
                },
              },
              '& .MuiTab-iconWrapper': {
                mb: '0 !important',
              },
            }}
            role="tablist"
          >
            {TABS.map((tab) => (
              <Tab
                key={tab.value}
                id={`${profileId}-tab-${tab.value}`}
                aria-controls={
                  activeTab === tab.value ? `${profileId}-panel-${tab.value}` : undefined
                }
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
        initial={reduceMotion || activeTab === 'dashboard' ? false : 'hidden'}
        animate="show"
        style={{
          flex: activeTab === 'dashboard' ? undefined : 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {activeTab === 'dashboard' || reduceMotion ? (
          <Box
            role="tabpanel"
            id={`${profileId}-panel-${activeTab}`}
            aria-labelledby={`${profileId}-tab-${activeTab}`}
            tabIndex={0}
            sx={{ height: activeTab === 'dashboard' ? 'auto' : '100%', minWidth: 0 }}
          >
            {currentActiveComponent?.component && (
              <currentActiveComponent.component tabs={tabs} employee={employee} />
            )}
          </Box>
        ) : (
          <FormSlider
            steps={TABS}
            isBackClick={isBackClick}
            step={currentIndex}
            containerProps={{ sx: { p: 0, minHeight: 0, flex: 1 } }}
          >
            <Box
              role="tabpanel"
              id={`${profileId}-panel-${activeTab}`}
              aria-labelledby={`${profileId}-tab-${activeTab}`}
              tabIndex={0}
              sx={{ height: '100%' }}
            >
              {currentActiveComponent?.component && (
                <currentActiveComponent.component tabs={tabs} employee={employee} />
              )}
            </Box>
          </FormSlider>
        )}
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
