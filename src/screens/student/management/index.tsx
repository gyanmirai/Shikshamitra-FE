'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import { Tab, Box, Paper } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { CustomTabs } from 'src/components/custom-tabs';
import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParam } from 'src/hooks/use-search-param';
import { useLazyGetFilterStudentsQuery } from 'src/redux/student';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import GroupManagement from './group-managemnet';
import GrNoGenerationScreen from './gr-generation';
import ChangeDivisionScreen from './change-division';
import RollNoGenerationScreen from './roll-generation';
import { FormSlider } from '../enrollment/register/register-form';

import type { IInquiryData } from '../enrollment/Inquiry';

const TABS = [
  {
    value: 'grGeneration',
    label: 'GR. No. Generation',
    icon: <Iconify icon="cil:badge" width={20} />,
    component: (props: { division: string }) => <GrNoGenerationScreen {...props} />,
  },
  {
    value: 'rollGeneration',
    label: ' Roll No. Generation',
    icon: <Iconify icon="token:scroll" width={20} />,
    component: (props: { division: string }) => <RollNoGenerationScreen {...props} />,
  },
  {
    value: 'changeDivision',
    label: 'Change Division',
    icon: <Iconify icon="mage:exchange-a" width={20} />,
    component: (props: { allDivision: Division[]; division: string }) => (
      <ChangeDivisionScreen {...props} />
    ),
  },
  {
    value: 'groupManageMent',
    label: 'House Management',
    icon: <Iconify icon="mdi:house" width={20} />,
    component: (props: { tableData: IInquiryData[]; isLoading: boolean; division: string }) => (
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
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'grGeneration' });

  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

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

  const CurrentComponent: any = TABS.find((tab) => tab.value === searchParams.tab)?.component;

  const [getStudents, { data: StudentsData, isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetFilterStudentsQuery,
  });
  const currentIndex = useMemo(
    () => TABS.findIndex((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );
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

  // Memoize the current active component based on searchParams.tab
  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );

  const [isBackClick, setIsBackClick] = useState(false);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CustomBreadcrumbs
        heading="Student Management"
        description="Manage student records by class and division. Generate GR numbers manually or automatically, and perform actions like changing class, division, or house allocation."
        links={[
          { name: 'Student', href: '/student/enrollment/dashboard/' },
          { name: 'Student Records', href: '/student/overview/' },
          { name: 'Student Management' },
        ]}
        sx={{ px: 1, mb: 1 }}
      />
      <Paper
        elevation={2}
        sx={{ display: 'flex', gap: 1, alignItems: 'center', px: 2, py: 1, mb: 1 }}
      >
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
      </Paper>
      <Paper>
        <CustomTabs
          value={searchParams.tab}
          onChange={(e, value) => {
            const newIndex = TABS.findIndex((tab) => tab.value === value);
            if (currentIndex > newIndex) {
              setIsBackClick(true);
            } else {
              setIsBackClick(false);
            }
            setSearchParams({ tab: value });
          }}
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
        </CustomTabs>
      </Paper>
      <FormSlider
        steps={TABS}
        isBackClick={isBackClick}
        step={currentIndex}
        containerProps={{
          sx: {
            p: 0,
            minHeight: 0,
          },
        }}
      >
        <Box sx={{ p: 1, height: '100%' }}>
          {currentActiveComponent?.component && (
            <CurrentComponent
              tableData={tableData}
              isLoading={isLoading}
              allDivision={allDivision}
              division={division}
              allClass={allClass}
              classes={classes}
            />
          )}
        </Box>
      </FormSlider>
    </Box>
  );
};

export default StudentManagementScreen;
