'use client';

import type { UseTabsReturn } from 'src/hooks/use-tabs';

import { useMemo } from 'react';

import VisibilityIcon from '@mui/icons-material/Visibility';
import { Box, Tab, Card, Tabs, Button, Avatar, Typography } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';
import { useSearchParam } from 'src/hooks/use-search-param';

import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import Records from './records';
import Finance from './finance';
import Academic from './academic';
import Document from './document';
import Attendance from './attendance';
import { ProfileCover } from './profile-cover';
import StudentDashboard from './studentDashboard';
import { StudentInformation } from './information';

const students = [
  {
    id: 1,
    name: 'John Doe',
    rollNo: '001',
    GrNo: 'GR001',
    class: '10th',
    division: 'A',
    medium: 'GUJ',
    organization: 'Primary',
    board: 'CBSE',
  },
  {
    id: 2,
    name: 'Jane Smith',
    rollNo: '002',
    GrNo: 'GR002',
    class: '10th',
    division: 'B',
    medium: 'ENG',
    organization: 'Primary',
    board: 'ICSE',
  },
  {
    id: 3,
    name: 'Alice Johnson',
    rollNo: '003',
    GrNo: 'GR003',
    class: '10th',
    division: 'A',
    medium: 'ENG',
    organization: 'Secondary',
    board: 'ICSE',
  },
  {
    id: 4,
    name: 'Bob Williams',
    rollNo: '004',
    GrNo: 'GR004',
    class: '10th',
    division: 'D',
    medium: 'ENG',
    organization: 'Secondary',
    board: 'GSEB',
  },
  {
    id: 5,
    name: 'Emma Brown',
    rollNo: '005',
    GrNo: 'GR005',
    class: '10th',
    division: 'E',
    medium: 'GUJ',
    organization: 'Primary',
    board: 'GSEB',
  },
];

export interface StudentTabsComponentType {
  tabs?: UseTabsReturn;
}

const TABS = [
  {
    value: 'dashboard',
    label: 'Dashboard',
    icon: <Iconify icon="ic:round-space-dashboard" width={20} />,
    component: (props: { tabs: UseTabsReturn }) => <StudentDashboard {...props} />,
  },
  {
    value: 'information',
    label: 'Information',
    icon: <Iconify icon="solar:user-id-bold" width={20} />,
    component: (props: { tabs: UseTabsReturn }) => <StudentInformation {...props} />,
  },
  {
    value: 'attendance',
    label: 'Attendance',
    icon: <Iconify icon="solar:bill-list-bold" width={20} />,
    component: (props: { tabs: UseTabsReturn }) => <Attendance {...props} />,
  },
  {
    value: 'academic',
    label: 'Academic',
    icon: <Iconify icon="solar:square-academic-cap-bold" width={20} />,
    component: (props: { tabs: UseTabsReturn }) => <Academic {...props} />,
  },
  {
    value: 'records',
    label: 'Records',
    icon: <Iconify icon="vaadin:records" width={20} />,
    component: (props: { tabs: UseTabsReturn }) => <Records {...props} />,
  },
  {
    value: 'finance',
    label: 'Finance',
    icon: <Iconify icon="map:finance" width={20} />,
    component: (props: { tabs: UseTabsReturn }) => <Finance {...props} />,
  },
  {
    value: 'documents',
    label: 'Documents',
    icon: <Iconify icon="ion:documents" width={20} />,
    component: (props: { tabs: UseTabsReturn }) => <Document {...props} />,
  },
  {
    value: 'communications',
    label: 'Communications',
    icon: <Iconify icon="maki:communications-tower" width={20} />,
  },
  {
    value: 'Transportation',
    label: 'transportation',
    icon: <Iconify icon="solar:bus-bold" width={20} />,
  },
  {
    value: 'library',
    label: 'Library',
    icon: <Iconify icon="mdi:library" width={20} />,
  },
];
export function StudentProfile() {
  const [searchParams, setSearchParams] = useSearchParam();
  const tabs = useTabs('dashboard');

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === tabs.value),
    [tabs.value]
  );

  const currentStudent = students.find((item) => item.id === Number(searchParams?.student));

  return (
    <>
      {!currentStudent &&
        (students.length ? (
          <CustomizableTable
            data={students}
            columns={[
              {
                id: 'name',
                label: 'Name',
                render: (value, row) => (
                  <Box style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                      sx={{ width: 32, height: 32, mr: 1 }}
                      src={row.avatarUrl}
                      alt={row.name}
                    />
                    <Typography component="span" fontSize="12px">
                      {row.name}
                    </Typography>
                  </Box>
                ),
              },
              { id: 'rollNo', label: 'Roll No' },
              { id: 'GrNo', label: 'Gr No' },
              { id: 'board', label: 'Board' },
              { id: 'medium', label: 'Medium' },
              { id: 'organization', label: 'Organization' },
              { id: 'class', label: 'Class' },
              { id: 'division', label: 'Division' },
              {
                id: 'action',
                label: 'Action',
                render: (value, row) => (
                  <Button
                    onClick={() => {
                      setSearchParams({
                        student: `${row.id}`,
                        isSearch: 'false',
                        searchValue: row.name,
                      });
                    }}
                    sx={{ justifyContent: 'start' }}
                  >
                    <VisibilityIcon sx={{ fontSize: '18px' }} />
                  </Button>
                ),
              },
            ]}
          />
        ) : (
          <EmptyContent title="Student Not Found" />
        ))}
      {currentStudent && (
        <>
          <CustomBreadcrumbs
            heading={currentActiveComponent?.label}
            links={[
              { name: 'Student' },
              { name: 'Student Profile' },
              { name: currentActiveComponent?.label },
            ]}
            sx={{ px: 1, pb: 1 }}
          />
          <Card sx={{ mb: 3, height: 290 }}>
            <ProfileCover
              // eslint-disable-next-line jsx-a11y/aria-role
              role={`${currentStudent?.class} - ${currentStudent?.division}`}
              name={currentStudent?.name}
              avatarUrl="https://api-dev-minimal-v6.vercel.app/assets/images/avatar/avatar-25.webp"
              coverUrl=""
              setSearchParams={setSearchParams}
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
      )}
    </>
  );
}
