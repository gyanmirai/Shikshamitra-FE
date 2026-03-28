import type { RootState } from 'src/redux/store';
import type { UseTabsReturn } from 'src/hooks/use-tabs';

import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useTabs } from 'src/hooks/use-tabs';
import { hrPaths } from 'src/constants/hr-menus';
import React, { useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { EmptyContent } from 'src/components/empty-content';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useLazyGetEmployeeByIdQuery } from 'src/redux/hr/employeeApi';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { FormSlider } from 'src/screens/student/enrollment/register/register-form';
import { Tab, Box, Tabs, Paper, Avatar, Divider, Skeleton, Typography } from '@mui/material';

import PayrollSummary from './payroll-summary';
import EmployeeInformation from './information';
import EmployeeLibrary from './EmployeeLibrary';
import EmployeeCalendar from './EmployeeCalendar';
import EmployeeAcademic from './employeeAcademic/academic';
import EmployeeProfileDashboard from './employee-dashboard';
import EmployeeCommunication from './employee-communication';
import { convertBase64Format } from '../../../utils/base64Formate';
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
        <Skeleton width={260} height={34} sx={{ mb: 1 }} />
        <Skeleton width={480} height={14} />
      </Box>

      {/* Profile header card */}
      <Paper
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
            borderRadius: 1,
            borderLeft: (theme) => `4px solid ${theme.vars.palette.grey[300]}`,
          }}
        >
          <Box display="flex" gap={2} alignItems="center">
            {/* Avatar */}
            <Skeleton variant="circular" width={64} height={64} sx={{ flexShrink: 0 }} />

            {/* Name */}
            <Box>
              <Skeleton width={36} height={13} sx={{ mb: 0.75 }} />
              <Skeleton width={130} height={18} />
            </Box>

            <Divider orientation="vertical" flexItem sx={{ my: '10px' }} />

            {/* Employee Code */}
            <Box>
              <Skeleton width={92} height={13} sx={{ mb: 0.75 }} />
              <Skeleton width={80} height={18} />
            </Box>

            <Divider orientation="vertical" flexItem sx={{ my: '10px' }} />

            {/* Role */}
            <Box>
              <Skeleton width={36} height={13} sx={{ mb: 0.75 }} />
              <Skeleton width={100} height={18} />
            </Box>
          </Box>
        </Paper>
      </Paper>

      {/* Tabs skeleton */}
      <Paper elevation={2} sx={{ mb: 1 }}>
        <Box
          sx={{
            px: 1.5,
            display: 'flex',
            gap: 1.5,
            overflowX: 'auto',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {TABS.map((tab) => (
            <Box
              key={tab.value}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.75,
                py: 1.25,
                minWidth: 76,
              }}
            >
              <Skeleton variant="circular" width={18} height={18} />
              <Skeleton width={58} height={11} />
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
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
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
            gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
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
            <Box sx={{ display: 'flex', gap: 2 }}>
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
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
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

export function EmployeeCard({ employee }: any) {
  const tabs = useTabs('dashboard');
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
    <>
      <motion.div variants={fadeSlideUp} initial="hidden" animate="show">
        <Paper
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
              <Box display="flex" gap={2} alignItems="center">
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
                      Employee Code
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
        <Paper elevation={2} sx={{ mb: 1 }}>
          <Tabs
            value={tabs.value}
            onChange={(...rest) => {
              const newIndex = TABS.findIndex((tab) => tab.value === rest[1]);
              if (currentIndex > newIndex) {
                setIsBackClick(true);
              } else {
                setIsBackClick(false);
              }
              tabs.onChange(...rest);
            }}
            sx={{
              px: 1.5,

              '& .MuiTabs-flexContainer': { gap: 1.5 },
            }}
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
          </Tabs>
        </Paper>
      </motion.div>

      <motion.div
        variants={fadeSlideUp}
        initial="hidden"
        animate="show"
        style={{ transitionDelay: '160ms' }}
      >
        <FormSlider
          steps={TABS}
          isBackClick={isBackClick}
          step={currentIndex}
          containerProps={{ sx: { p: 0, minHeight: 0 } }}
        >
          <Box sx={{ height: '100%' }}>
            {currentActiveComponent?.component && (
              <currentActiveComponent.component tabs={tabs} employee={employee} />
            )}
          </Box>
        </FormSlider>
      </motion.div>
    </>
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
    <EmptyContent title="Employee not found" />
  ) : (
    <>
      <CustomBreadcrumbs
        heading={`${employee?.fullName} Profile`}
        links={[
          { name: 'HR/Staff', href: hrPaths.dashboard },
          { name: 'Employee', onClick: () => setSearchParams('employee', '') },
          { name: 'Employee List', onClick: () => setSearchParams('employee', '') },
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
      <EmployeeCard employee={employee} />
      {/* </Scrollbar> */}
    </>
  );
};

export default EmployeeView;
