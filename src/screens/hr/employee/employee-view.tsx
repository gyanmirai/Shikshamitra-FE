import type { UseTabsReturn } from 'src/hooks/use-tabs';

import React, { useMemo, useEffect } from 'react';

import { Tab, Box, Card, Tabs, Paper, Avatar, Divider, Typography } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetEmployeeByIdQuery } from 'src/redux/employee/employeeApi';
import { FormSlider } from 'src/screens/student/enrollment/register/register-form';

import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { LoadingScreen } from 'src/components/loading-screen';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import PayrollSummary from './payroll-summary';
import EmployeeInformation from './information';
import EmployeeAcademic from './employeeAcademic/academic';
import EmployeeCommunication from './employee-communication';
import { convertBase64Format } from '../../../utils/base64Formate';
import { EmployeeStatusType } from '../../../enums/employee-status-type';
import QualificationAndCertification from './qualification-certification';

export const TABS = [
  // {
  //   value: 'dashboard',
  //   label: 'Dashboard',
  //   icon: <Iconify icon="ic:round-space-dashboard" width={20} />,
  //   component: (props: { tabs: UseTabsReturn }) => <EmployeeDashboard />,
  // },
  {
    value: 'personalInformation',
    label: 'Information',
    icon: <Iconify icon="solar:user-id-bold" width={20} />,
    component: (props: { tabs: UseTabsReturn; employee: any }) => (
      <EmployeeInformation editData={props.employee} />
    ),
  },
  {
    value: 'qualificationsCertifications',
    label: 'Documents',
    icon: <Iconify icon="healthicons:i-exam-qualification" width={20} />,
    component: (props: { tabs: UseTabsReturn; employee: any }) => (
      <QualificationAndCertification employee={props.employee} />
    ),
  },
  // {
  //   value: 'employmentHistory',
  //   label: 'Employment History',
  //   icon: <Iconify icon="mdi:clipboard-text-history" width={20} />,
  //   component: (props: { tabs: UseTabsReturn }) => <EmployeeHistory />,
  // },
  {
    value: 'payrollSummary',
    label: 'Payroll Summary',
    icon: <Iconify icon="fluent:payment-16-filled" width={20} />,
    component: (props: { tabs: UseTabsReturn; employee: any }) => (
      <PayrollSummary employee={props.employee} />
    ),
  },
  {
    value: 'transport',
    label: 'Transportation',
    icon: <Iconify icon="solar:bus-bold" width={20} />,
    component: (props: { tabs: UseTabsReturn }) => <></>,
  },
  {
    value: 'academic',
    label: 'Academic',
    icon: <Iconify icon="solar:square-academic-cap-bold" width={20} />,
    component: (props: { tabs: UseTabsReturn; employee: any }) => (
      <EmployeeAcademic employee={props.employee} />
    ),
  },
  {
    value: 'communications',
    label: 'Communication',
    icon: <Iconify icon="maki:communications-tower" width={20} />,
    component: (props: { tabs: UseTabsReturn; employee: any }) => (
      <EmployeeCommunication employee={props.employee} />
    ),
  },
];

interface EmployeeViewProps {
  setSearchParams: any;
  searchParams: any;
}

export function EmployeeCard({ employee }: any) {
  const tabs = useTabs('personalInformation');
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
      <Card
        sx={{
          mb: 2,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          boxShadow: 'var(--shadows-4)',
          mt: 2,
        }}
      >
        <Paper
          sx={{
            p: 1,
            borderBottom: '1px dashed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderLeft: (theme) =>
              employee?.employeeStatusType === EmployeeStatusType.Active
                ? `4px solid ${theme.palette.success.main}`
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
                border: (theme) => `1px solid ${theme.palette.grey[400]}`,
              }}
            />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Name
              </Typography>
              <Typography fontWeight={500} variant="body2">
                {employee?.employeeName}
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ my: '10px' }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Employee Code
              </Typography>
              <Typography fontWeight={500} variant="body2">
                {employee?.employeeCode}
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem sx={{ my: '10px' }} />
            <Box>
              <Typography variant="caption" color="text.secondary">
                Role
              </Typography>
              <Typography fontWeight={500} variant="body2">
                {employee?.role?.name}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Card>
      <Card sx={{ mb: 2, p: 1 }}>
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

            '& .MuiTabs-flexContainer': {
              gap: 1.5,
            },
          }}
          role="tablist"
        >
          {TABS.map((tab) => (
            <Tab
              sx={{
                fontSize: '12px',
              }}
              key={tab.value}
              value={tab.value}
              icon={tab.icon}
              label={tab.label}
              role="tab"
            />
          ))}
        </Tabs>
      </Card>

      <FormSlider
        steps={TABS}
        isBackClick={isBackClick}
        step={currentIndex}
        containerProps={{
          sx: {
            p: 0,
          },
        }}
      >
        <Box>
          {currentActiveComponent?.component && (
            <currentActiveComponent.component tabs={tabs} employee={employee} />
          )}
        </Box>
      </FormSlider>
    </>
  );
}

const EmployeeView = ({ setSearchParams, searchParams }: EmployeeViewProps) => {
  const tabs = useTabs('personalInformation');
  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === tabs.value),
    [tabs.value]
  );
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
        heading="Employee List"
        links={[{ name: 'HR/Staff' }, { name: 'Employee' }, { name: 'Employee List' }]}
        isBack
        onBack={() => setSearchParams({ employee: '' })}
        sx={{ px: 1, pb: 1 }}
        // action={
        //   searchParams?.employee && (
        //     <Button
        //       size="small"
        //       variant="soft"
        //       onClick={() => setSearchParams({ employee: '' })}
        //       startIcon={<Iconify icon="mingcute:back-2-fill" />}
        //     >
        //       Back To Employee list
        //     </Button>
        //   )
        // }
      />
      <EmployeeCard employee={employee} />
      {/* </Scrollbar> */}
    </>
  );
};

export default EmployeeView;
