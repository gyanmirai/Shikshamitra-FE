import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';
import type { UseTabsReturn } from 'src/hooks/use-tabs';

import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useTabs } from 'src/hooks/use-tabs';
import { Label } from 'src/components/label';
import { hrPaths } from 'src/constants/hr-menus';
import { useSelector, useDispatch } from 'react-redux';
import { FormSlider } from 'src/components/form-slider';
import React, { useId, useMemo, useEffect } from 'react';
import { EmptyContent } from 'src/components/empty-content';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useLazyGetEmployeeByIdQuery } from 'src/redux/hr/employeeApi';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { Tab, Box, Tabs, Paper, Avatar, Skeleton, Typography } from '@mui/material';

import PayrollSummary from './payroll-summary';
import EmployeeInformation from './information';
import EmployeeLibrary from './EmployeeLibrary';
import EmployeeCalendar from './EmployeeCalendar';
import LeaveBalance from '../leave-balance/leave-balance';
import EmployeeAcademic from './employeeAcademic/academic';
import EmployeeProfileDashboard from './employee-dashboard';
import EmployeeCommunication from './employee-communication';
import { convertBase64Format } from '../../../utils/base64Formate';
import EmployeeAttendanceHistory from './employee-attendance-history';
import { getEmployeeStatusDisplayValue } from './employee-status-display';
import QualificationAndCertification from './qualification-certification';
import { EmployeeStatusTypeColor } from '../../../enums/employee-status-type';

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
  setSearchParams: any;
  searchParams: any;
}

// ── Skeleton ─────────────────────────────────
function EmployeeViewSkeleton() {
  return (
    <>
      {/* Breadcrumbs skeleton */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
          <Skeleton width={60} height={14} />
          <Skeleton variant="circular" width={4} height={4} />
          <Skeleton width={70} height={14} />
          <Skeleton variant="circular" width={4} height={4} />
          <Skeleton width={100} height={14} />
          <Skeleton variant="circular" width={4} height={4} />
          <Skeleton width={130} height={14} />
        </Box>
        <Skeleton width={260} height={34} sx={{ mb: 1, maxWidth: '100%' }} />
        <Skeleton width={480} height={14} sx={{ maxWidth: '100%' }} />
      </Box>

      {/* Profile header card */}
      <Paper sx={{ p: 2, mb: 1, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, minWidth: 0 }}>
          <Skeleton variant="circular" width={64} height={64} sx={{ flexShrink: 0 }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
              <Skeleton width={180} height={28} sx={{ maxWidth: '100%' }} />
              <Skeleton width={48} height={24} />
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                columnGap: 2,
                rowGap: 0.5,
                mt: 0.5,
              }}
            >
              <Skeleton width={180} height={22} sx={{ maxWidth: '100%' }} />
              <Skeleton width={100} height={22} sx={{ maxWidth: '100%' }} />
            </Box>
            <Skeleton width={360} height={22} sx={{ mt: 0.5, maxWidth: '100%' }} />
          </Box>
        </Box>
      </Paper>

      {/* Tabs skeleton */}
      <Paper elevation={2} sx={{ mb: 1, overflow: 'hidden' }}>
        <Box sx={{ px: 0.5, display: 'flex', gap: 0.5, overflow: 'hidden' }}>
          {TABS.map((tab) => (
            <Box
              key={tab.value}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.25,
                minHeight: 48,
                flexShrink: 0,
              }}
            >
              <Skeleton variant="circular" width={18} height={18} />
              <Skeleton width={tab.label.length * 7} height={22} />
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Content area — mirrors dashboard tab layout */}
      <Paper sx={{ p: 2.5 }}>
        {/* Stat cards row */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(4, minmax(0, 1fr))',
            },
            gap: 2,
            mb: 3,
          }}
        >
          {[...Array(4)].map((_, i) => (
            <Paper key={i} variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Skeleton width="50%" height={13} />
                <Skeleton variant="circular" width={28} height={28} />
              </Box>
              <Skeleton width="65%" height={28} sx={{ mb: 0.5 }} />
              <Skeleton width="45%" height={12} />
            </Paper>
          ))}
        </Box>

        {/* Chart + sidebar row */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 2fr) minmax(0, 1fr)' },
            gap: 2,
            mb: 2,
          }}
        >
          {/* Chart card */}
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
            >
              <Skeleton width="35%" height={18} />
              <Skeleton width={80} height={28} sx={{ borderRadius: 1 }} />
            </Box>
            <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 1, mb: 1 }} />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {[...Array(3)].map((_, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Skeleton variant="circular" width={10} height={10} />
                  <Skeleton width={50} height={12} />
                </Box>
              ))}
            </Box>
          </Paper>

          {/* List card */}
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
            <Skeleton width="55%" height={18} sx={{ mb: 2 }} />
            {[...Array(5)].map((_, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.75 }}>
                <Skeleton variant="circular" width={36} height={36} sx={{ flexShrink: 0 }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton width="72%" height={14} sx={{ mb: 0.5 }} />
                  <Skeleton width="50%" height={12} />
                </Box>
                <Skeleton width={40} height={22} sx={{ borderRadius: 1 }} />
              </Box>
            ))}
          </Paper>
        </Box>

        {/* Bottom detail row */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(3, minmax(0, 1fr))' },
            gap: 2,
          }}
        >
          {[...Array(3)].map((_, i) => (
            <Paper key={i} variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
              <Skeleton width="50%" height={16} sx={{ mb: 1.5 }} />
              {[...Array(3)].map((__, j) => (
                <Box key={j} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Skeleton width="40%" height={13} />
                  <Skeleton width="35%" height={13} />
                </Box>
              ))}
            </Paper>
          ))}
        </Box>
      </Paper>
    </>
  );
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
      sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}
    >
      <motion.div variants={fadeSlideUp} initial="hidden" animate="show">
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
        initial="hidden"
        animate="show"
        style={{ transitionDelay: '80ms' }}
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
      </motion.div>
    </Box>
  );
}

const EmployeeView = ({ setSearchParams, searchParams }: EmployeeViewProps) => {
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();
  const [getEmployById, { data: employee, isLoading, isError }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetEmployeeByIdQuery,
  });

  useEffect(() => {
    if (searchParams?.employee) {
      getEmployById(searchParams?.employee.trim());
    }
  }, [getEmployById, searchParams?.employee]);

  return isLoading || (!employee && !!searchParams?.employee) ? (
    <EmployeeViewSkeleton />
  ) : isError ? (
    <EmptyContent title="Staff not found" />
  ) : (
    <>
      <CustomBreadcrumbs
        heading={`${employee?.fullName} Profile`}
        links={[
          { name: 'HR/Staff', href: hrPaths.dashboard },
          { name: 'Staff', onClick: () => setSearchParams('employee', '') },
          { name: 'Staff Directory', onClick: () => setSearchParams('employee', '') },
          { name: `${employee?.fullName} Profile` },
        ]}
        description={`View and manage ${employee?.fullName} information including personal details, documents, payroll, transportation, academic records and communications`}
        isBack
        onBack={() => {
          if (isChanges && window.confirm('Are you sure you want to leave this page?')) {
            setSearchParams('employee', '');
            dispatch(setIsChanges(false));
          } else if (!isChanges) {
            setSearchParams('employee', '');
          }
        }}
      />
      <EmployeeCard
        key={employee?.id}
        employee={employee}
        initialTab={searchParams?.tab || 'dashboard'}
        setSearchParams={setSearchParams}
      />
      {/* </Scrollbar> */}
    </>
  );
};

export default EmployeeView;
