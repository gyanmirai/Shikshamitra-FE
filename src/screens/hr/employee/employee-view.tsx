import type { RootState } from 'src/redux/store';
import type { UseTabsReturn } from 'src/hooks/useTabs';

import { Icon } from '@iconify/react';
import { useTabs } from 'src/hooks/useTabs';
import { hrPaths } from 'src/constants/hr-menus';
import React, { useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { EmptyContent } from 'src/components/empty-content';
import { LoadingScreen } from 'src/components/loading-screen';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useLazyGetEmployeeByIdQuery } from 'src/redux/hr/employeeApi';
import { setIsChanges } from 'src/redux/confirm-popup/confirmPopupSlice';
import { FormSlider } from 'src/screens/student/enrollment/register/register-form';
import { Tab, Box, Tabs, Paper, Avatar, Divider, Typography } from '@mui/material';

import PayrollSummary from './payroll-summary';
import EmployeeInformation from './information';
import EmployeeLibrary from './EmployeeLibrary';
import EmployeeCalendar from './EmployeeCalendar';
import EmployeeAcademic from './employee-academic/academic';
import EmployeeProfileDashboard from './employee-dashboard';
import EmployeeCommunication from './employee-communication';
import { convertBase64Format } from '../../../utils/base64Formate';
import { EmployeeStatusType } from '../../../enums/employee-status-type';
import QualificationAndCertification from './qualification-certification';

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
          <Box display="flex" gap={2} alignItems="center">
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
            <Box>
              <Typography variant="caption" color="text.secondary">
                Name
              </Typography>
              <Typography fontWeight={500} variant="body2">
                {employee?.fullName}
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ my: '10px' }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Employee Code
              </Typography>
              <Typography fontWeight={500} variant="body2">
                {employee?.employeeIdentifier}
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ my: '10px' }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Role
              </Typography>
              <Typography fontWeight={500} variant="body2">
                {employee?.roleName}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Paper>
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

  return isLoading ? (
    <LoadingScreen />
  ) : isError ? (
    <EmptyContent title="Employee not found" />
  ) : (
    <>
      <CustomBreadcrumbs
        heading="Employee Profile"
        links={[
          { name: 'HR/Staff', href: hrPaths.dashboard },
          { name: 'Employee', href: hrPaths.employee.list },
          { name: 'Employee Profile' },
        ]}
        description="View and manage employee information including personal details, documents, payroll, transportation, academic records and communications"
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
