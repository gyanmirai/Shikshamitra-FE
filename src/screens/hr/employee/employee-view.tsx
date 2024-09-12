import type { UseTabsReturn } from 'src/hooks/use-tabs';

import React, { useMemo, useEffect } from 'react';

import { Tab, Box, Card, Tabs, Typography, ListItemText } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { convertBase64Format } from 'src/utils/base64Formate';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetEmployeeByIdQuery } from 'src/redux/employee/employeeApi';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import EmployeeHistory from './employee-history';
import { EmployeeInformation } from './information';
import { EmployeeProfileCover } from './employee-profile-cover';
import QualificationAndCertification from './qualification-certification';

const TABS = [
  //   {
  //     value: 'dashboard',
  //     label: 'Dashboard',
  //     icon: <Iconify icon="ic:round-space-dashboard" width={20} />,
  //     component: (props: { tabs: UseTabsReturn }) => <>Dashboard</>,
  //   },
  {
    value: 'personalInformation',
    label: 'Personal Information',
    icon: <Iconify icon="solar:user-id-bold" width={20} />,
    component: (props: { tabs: UseTabsReturn }) => <EmployeeInformation />,
  },
  {
    value: 'qualificationsCertifications',
    label: 'Qualifications and Certifications',
    icon: <Iconify icon="healthicons:i-exam-qualification" width={20} />,
    component: (props: { tabs: UseTabsReturn }) => <QualificationAndCertification />,
  },
  {
    value: 'employmentHistory',
    label: 'Employment History',
    icon: <Iconify icon="mdi:clipboard-text-history" width={20} />,
    component: (props: { tabs: UseTabsReturn }) => <EmployeeHistory />,
  },
];
interface EmployeeViewProps {
  setSearchParams: any;
  searchParams: any;
}
const EmployeeView = ({ setSearchParams, searchParams }: EmployeeViewProps) => {
  const tabs = useTabs('personalInformation');
  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === tabs.value),
    [tabs.value]
  );
  const [getEmployById, { data: employee }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetEmployeeByIdQuery,
  });

  useEffect(() => {
    if (searchParams?.employee) {
      getEmployById(searchParams?.employee.trim());
    }
  }, [getEmployById, searchParams?.employee]);

  return (
    <>
      <CustomBreadcrumbs
        heading="Employee"
        links={[{ name: 'HR' }, { name: 'Employee Profile' }, { name: 'Employee' }]}
        sx={{ px: 1, pb: 1 }}
      />
      <Card sx={{ mb: 3, height: 290 }}>
        <EmployeeProfileCover
          name={`${employee?.firstName} ${employee?.lastName}`}
          avatarUrl={convertBase64Format(employee?.profilePicture)}
          setSearchParams={setSearchParams}
          extraContent={
            <Box sx={{ mt: 3, ml: { md: 3 }, textAlign: { xs: 'center', md: 'unset' } }}>
              <ListItemText
                sx={{ textAlign: { xs: 'center', md: 'unset' } }}
                primary={`${employee?.firstName} ${employee?.lastName}`}
                secondary=""
                primaryTypographyProps={{ typography: 'h4' }}
                secondaryTypographyProps={{
                  mt: 0.5,
                  color: 'inherit',
                  component: 'span',
                  typography: 'body2',
                  sx: { opacity: 0.48 },
                }}
              />
              <Box display="flex" flexDirection="column" gap={1}>
                <Typography variant="caption" fontWeight="bold" mt={1}>
                  <Label variant="soft" color="success">
                    {employee?.role || 'Teacher'}
                  </Label>
                </Typography>
                <Typography variant="caption" fontWeight="bold">
                  <Label variant="soft" color="info">
                    GSEB
                  </Label>
                  &nbsp;
                  <Label variant="soft" color="info">
                    ENG-Primary
                  </Label>
                </Typography>
              </Box>
            </Box>
          }
        />

        <Box
          display="flex"
          sx={{
            width: 1,
            bottom: 0,
            zIndex: 9,
            px: { md: 3 },
            position: 'absolute',
            bgcolor: 'background.paper',
          }}
        >
          <Tabs
            value={tabs.value}
            onChange={tabs.onChange}
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
          </Tabs>
        </Box>
      </Card>
      {/* <Scrollbar sx={{ height: '100%', overflowY: 'auto' }}> */}
      {currentActiveComponent?.component && <currentActiveComponent.component tabs={tabs} />}
      {/* </Scrollbar> */}
    </>
  );
};

export default EmployeeView;
