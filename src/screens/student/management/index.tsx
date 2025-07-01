'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import React, { useMemo, useState, useEffect } from 'react';

import { Tab, Box, Card, useTheme } from '@mui/material';

import { useSearchParam } from 'src/hooks/use-search-param';

import { useLazyGetFilterStudentsQuery } from 'src/redux/student';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import ChangeClassScreen from './change-class';
import GroupManagement from './group-managemnet';
import GrNoGenerationScreen from './gr-generation';
import ChangeDivisionScreen from './change-division';
import RollNoGenerationScreen from './roll-generation';

import type { IInquiryData } from '../enrollment/Inquiry';

const TABS = [
  {
    value: 'grGeneration',
    label: 'GR. No. Generation',
    icon: <Iconify icon="cil:badge" width={20} />,
    component: (props: {
      isLoading: boolean;
      tableData: IInquiryData[];
      allDivision: Division[];
      division: string;
    }) => <GrNoGenerationScreen {...props} />,
  },
  {
    value: 'rollGeneration',
    label: ' Roll No. Generation',
    icon: <Iconify icon="token:scroll" width={20} />,
    component: (props: {
      isLoading: boolean;
      tableData: IInquiryData[];
      allDivision: Division[];
      division: string;
    }) => <RollNoGenerationScreen {...props} />,
  },
  {
    value: 'changeDivision',
    label: 'Change Division',
    icon: <Iconify icon="mage:exchange-a" width={20} />,
    component: (props: {
      isLoading: boolean;
      tableData: IInquiryData[];
      allDivision: Division[];
      division: string;
    }) => <ChangeDivisionScreen {...props} />,
  },
  {
    value: 'changeClass',
    label: 'Change Class',
    icon: <Iconify icon="icon-park-outline:exchange-one" width={20} />,
    component: (props: {
      isLoading: boolean;
      tableData: IInquiryData[];
      allClass: Standards[];
      classes: string;
    }) => <ChangeClassScreen {...props} />,
  },
  // { value: 'bulkDataUpdate', label: 'Bulk Data Update', component: () => <BulkDataUpdateScreen /> },
  // { value: 'bulkStudentAdd', label: 'Bulk Student Add', component: () => <BulkStudentAddScreen /> },
  {
    value: 'groupManageMent',
    label: 'House Management',
    icon: <Iconify icon="mdi:house" width={20} />,
    component: (props: { tableData: IInquiryData[]; isLoading: boolean }) => (
      <GroupManagement {...props} />
    ),
  },
];

const StudentManagementScreen = () => {
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [organization, setOrganization] = useState<string>('');
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [classes, setClass] = useState<string>('');
  const [allDivision, setAllDivision] = useState<Division[]>([]);

  const [division, setDivision] = useState<string>('');
  const theme = useTheme();
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'grGeneration' });

  const [value, setValue] = React.useState(0);

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

  // const tabs = useTabs('grGeneration');

  const CurrentComponent = TABS.find((tab) => tab.value === searchParams.tab)?.component;

  const [getStudents, { data: StudentsData, isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetFilterStudentsQuery,
  });

  useEffect(() => {
    if (division && classes && organization) {
      getStudents({
        educationMediumStageId: organization,
        standardId: classes,
        divisionId: division,
      });
    }
  }, [division, classes, organization, getStudents]);

  const tableData = useMemo(
    () =>
      StudentsData?.items?.map((item: any) => ({
        ...item,
        name: `${item.firstName} ${item.lastName} ${item.middleName}`,
      })) || [],
    [StudentsData?.items]
  );
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Student Management"
        description="Manage student records by class and division. Generate GR numbers manually or automatically, and perform actions like changing class, division, or house allocation"
        links={[
          { name: 'Student', href: '/student/enrollment/dashboard/' },
          { name: 'Student Records', href: '/student/overview/' },
          { name: 'Student Management' },
        ]}
        sx={{ px: 1, mb: 2 }}
      />
      <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
        <CustomSelect
          options={allOrganization}
          label="Organization"
          value={organization}
          onChange={(val) => setOrganization(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          disabled={!medium}
        />
        <CustomSelect
          options={allClass}
          label="Class"
          value={classes}
          onChange={(val) => setClass(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          disabled={!organization}
        />
        <CustomSelect
          options={allDivision}
          label="Division"
          value={division}
          onChange={(val) => setDivision(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          disabled={!classes}
        />
      </Box>
      <Card
        sx={{
          mt: 1,
          '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
        }}
      >
        <CustomTabs
          value={searchParams.tab}
          onChange={(_, val) => setSearchParams({ tab: val })}
          // variant=""
          sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 } }}
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} icon={tab.icon} value={tab.value} label={tab.label} />
          ))}
        </CustomTabs>
      </Card>
      <Box pb={2} mt={2}>
        {CurrentComponent?.({ tableData, isLoading, allDivision, division, allClass, classes })}
      </Box>
    </Box>
  );
};

export default StudentManagementScreen;
