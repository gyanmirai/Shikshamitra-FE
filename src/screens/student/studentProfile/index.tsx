'use client';

import type { RootState } from 'src/redux/store';
import type { UseTabsReturn } from 'src/hooks/use-tabs';
import type { Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import { useMemo, useState, useEffect } from 'react';

import VisibilityIcon from '@mui/icons-material/Visibility';
import { Box, Tab, Card, Tabs, Paper, Button, Avatar, Typography, IconButton } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';
import { useSearchParam } from 'src/hooks/use-search-param';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import Records from './records';
import Finance from './finance';
import Academic from './academic';
import Document from './document';
import Attendance from './attendance';
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
    contactNo: '+91 12345 67890',
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
    contactNo: '+91 98765 43210',
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
    contactNo: '+91 55555 55555',
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
    contactNo: '+91 11111 11111',
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
    contactNo: '+91 99999 99999',
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
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [organization, setOrganization] = useState<string>('');
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [classes, setClass] = useState<string>('');
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  const [division, setDivision] = useState<string>('');
  const {
    currentBoard,
    currentMedium: medium,
    setCurrentMedium: setMedium,
  } = useSelector((state: RootState) => state.globalState);

  useEffect(() => {
    setAllOrganization(medium?.educationMediumStages || []);
    setOrganization(medium?.educationMediumStages?.[0]?.id || '');
  }, [medium]);

  useEffect(() => {
    setAllClass(allOrganization.find((org: any) => org?.id === organization)?.standards || []);
    setClass(
      allOrganization.find((org: any) => org?.id === organization)?.standards?.[0]?.id || ''
    );
  }, [organization, allOrganization]);

  useEffect(() => {
    setAllDivision(allClass.find((org: any) => org?.id === classes)?.divisions || []);
    setDivision(allClass.find((org: any) => org?.id === classes)?.divisions?.[0]?.id || '');
  }, [allClass, classes]);

  const [searchParams, setSearchParams] = useSearchParam();
  const tabs = useTabs('dashboard');

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === tabs.value),
    [tabs.value]
  );

  const currentStudent = students.find((item) => item.id === Number(searchParams?.student));

  return (
    <>
      <CustomBreadcrumbs
        heading="Student List"
        links={[{ name: 'Student' }, { name: 'Student Records' }, { name: 'Student List' }]}
        sx={{ px: 1, mb: 2 }}
        action={
          currentStudent && (
            <Button
              size="small"
              variant="soft"
              onClick={() => setSearchParams({ isSearch: '', student: '', searchValue: '' })}
              startIcon={<Iconify icon="mingcute:back-2-fill" />}
            >
              Back To Student list
            </Button>
          )
        }
      />

      {!currentStudent && (
        <>
          <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
            <CustomSelect
              options={allOrganization}
              label="Organization"
              value={organization}
              onChange={(val: string | string[]) => setOrganization(val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
              disabled={!medium}
            />
            <CustomSelect
              options={allClass}
              label="Class"
              value={classes}
              onChange={(val: string | string[]) => setClass(val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
              disabled={!organization}
            />
            <CustomSelect
              options={allDivision}
              label="Division"
              value={division}
              onChange={(val: string | string[]) => setDivision(val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
              disabled={!classes}
            />
          </Box>
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
              { id: 'organization', label: 'Organization' },
              { id: 'class', label: 'Class' },
              { id: 'division', label: 'Division' },
              { id: 'contactNo', label: 'Contact No' },
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
        </>
      )}

      {currentStudent && (
        <>
          <Card
            sx={{
              mb: 3,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              boxShadow: 'var(--shadows-4)',
            }}
          >
            <Paper
              sx={{
                p: 1,
                borderBottom: '1px dashed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderLeft: (theme) => `4px solid ${theme.palette.success.main}`,
                borderRadius: 1,
              }}
            >
              <Box display="flex" gap={2} alignItems="center">
                <Avatar
                  src="https://api-dev-minimal-v6.vercel.app/assets/images/avatar/avatar-25.webp"
                  sx={{ width: 64, height: 64 }}
                />
                <Label variant="filled" color="primary" sx={{ fontSize: '12px' }}>
                  John Doe
                </Label>
                <Label variant="filled" color="info" sx={{ fontSize: '12px' }}>
                  GR01
                </Label>
                <Label variant="filled" color="secondary" sx={{ fontSize: '12px' }}>
                  Roll No 20
                </Label>
                <Label variant="filled" color="warning" sx={{ fontSize: '12px' }}>
                  10-A
                </Label>
                <Label variant="filled" color="error" sx={{ fontSize: '12px' }}>
                  Higher Secondary
                </Label>
              </Box>
              <Box display="flex" gap={2} alignItems="center">
                <Button size="small" variant="outlined">
                  View I-card
                </Button>
                <CustomTooltip
                  arrow
                  title={
                    <Box p={1}>
                      <Label variant="soft" color="success">
                        Volunteer
                      </Label>
                      <Label variant="soft" color="warning" sx={{ ml: 1 }}>
                        New
                      </Label>
                      <Label variant="soft" color="info" sx={{ ml: 1 }}>
                        VIP
                      </Label>
                      <Label variant="soft" color="error" sx={{ ml: 1 }}>
                        Good Listener
                      </Label>
                    </Box>
                  }
                >
                  <IconButton sx={{ color: 'primary.main' }}>
                    <Iconify
                      icon="iconamoon:certificate-badge-fill"
                      sx={{ height: '24px', width: '24px' }}
                    />
                  </IconButton>
                </CustomTooltip>
              </Box>
            </Paper>
            <Tabs
              value={tabs.value}
              onChange={tabs.onChange}
              sx={{ px: 2, '& .MuiTabs-flexContainer': { gap: 1.5 } }}
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
          </Card>
          {/* <Scrollbar sx={{ flexGrow: 1 }}> */}
          {currentActiveComponent?.component && <currentActiveComponent.component tabs={tabs} />}
          {/* </Scrollbar> */}
        </>
      )}
    </>
  );
}
