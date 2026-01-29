'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Grid, Button } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import React, { useMemo, useState, useEffect } from 'react';
import { useSearchParam } from 'src/hooks/use-search-param';
import { useLazyGetFilterStudentsQuery } from 'src/redux/student';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import GroupManagement from './group-managemnet';
import GrNoGenerationScreen from './gr-generation';
import ChangeDivisionScreen from './change-division';
import RollNoGenerationScreen from './roll-generation';

import type { IInquiryData } from '../enrollment/Inquiry/type';

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
      />

      <Grid
        container
        spacing={1}
        sx={{
          mt: 0,
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: '0',
        }}
      >
        {/* Left Section - Navigation List */}
        <Grid size={{ xs: 12, md: 3, lg: 2 }} sx={{ height: '100%' }}>
          <Card sx={{ height: '100%', p: 1 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              {TABS.map((tab) => {
                const isSelected = searchParams.tab === tab.value;
                return (
                  <Button
                    key={tab.value}
                    onClick={() => setSearchParams({ tab: tab.value })}
                    variant="text"
                    color="inherit"
                    startIcon={tab.icon}
                    sx={{
                      position: 'relative',
                      justifyContent: 'flex-start',
                      px: 2,
                      py: 1.5,

                      textAlign: 'left',
                      backgroundColor: (theme) =>
                        isSelected ? theme.palette.action.hover : 'transparent',
                      color: isSelected ? 'inherit' : 'text.secondary',
                      // '&:hover': {
                      //   backgroundColor: (theme) =>
                      //     isSelected ? theme.palette.primary.light : theme.palette.action.hover,
                      // },

                      ...(isSelected
                        ? {
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              left: '2px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              width: '4px',
                              height: '80%',
                              borderLeft: (theme) =>
                                isSelected ? `4px solid ${theme.palette.primary.main}` : 'none',
                            },
                          }
                        : {}),
                    }}
                  >
                    {tab.label}
                  </Button>
                );
              })}
            </Box>
          </Card>
        </Grid>

        {/* Right Section - Content */}
        <Grid size={{ xs: 12, md: 9, lg: 10 }} sx={{ height: '100%' }}>
          <Box
            sx={{
              gap: 1,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '0',
            }}
          >
            {/* Filters Section */}
            <Card sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
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
            </Card>

            {/* Component Render Section */}
            <Card sx={{ p: 1, flexGrow: 1 }}>
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
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentManagementScreen;
