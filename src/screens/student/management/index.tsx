'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Grid, Button } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import { useLazyGetFilterStudentsQuery } from 'src/redux/student';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams as useNextSearchParams } from 'next/navigation';

import GroupManagement from './group-managemnet';
import GrNoGenerationScreen from './gr-generation';
import ChangeDivisionScreen from './change-division';
import RollNoGenerationScreen from './roll-generation';

import type { IInquiryData } from '../enrollment/Inquiry/type';

// Stable component references defined OUTSIDE the component to prevent
// new function identities on every render (which causes remount + re-fetch loops)
const GrGenerationTab = (props: { division: string }) => <GrNoGenerationScreen {...props} />;
const RollGenerationTab = (props: { division: string }) => <RollNoGenerationScreen {...props} />;
const ChangeDivisionTab = (props: { allDivision: Division[]; division: string }) => (
  <ChangeDivisionScreen {...props} />
);
const GroupManagementTab = (props: {
  tableData: IInquiryData[];
  isLoading: boolean;
  division: string;
}) => <GroupManagement {...props} />;

const TABS = [
  {
    value: 'grGeneration',
    label: 'GR. No. Generation',
    icon: <Iconify icon="cil:badge" width={20} />,
    component: GrGenerationTab,
  },
  {
    value: 'rollGeneration',
    label: ' Roll No. Generation',
    icon: <Iconify icon="token:scroll" width={20} />,
    component: RollGenerationTab,
  },
  {
    value: 'changeDivision',
    label: 'Change Division',
    icon: <Iconify icon="mage:exchange-a" width={20} />,
    component: ChangeDivisionTab,
  },
  {
    value: 'groupManageMent',
    label: 'House Management',
    icon: <Iconify icon="mdi:house" width={20} />,
    component: GroupManagementTab,
  },
];

const StudentManagementScreen = () => {
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [organization, setOrganization] = useState<string>('');
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [classes, setClass] = useState<string>('');
  const [allDivision, setAllDivision] = useState<Division[]>([]);

  const [division, setDivision] = useState<string>('');

  // Read tab directly from the URL — stable, no hook loops
  const nativeSearchParams = useNextSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const activeTab = nativeSearchParams.get('tab') || 'grGeneration';
  const setActiveTab = useCallback(
    (tab: string) => {
      const params = new URLSearchParams(nativeSearchParams.toString());
      params.set('tab', tab);
      router.push(`${pathname}?${params.toString()}`);
    },
    [nativeSearchParams, router, pathname]
  );

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

  const [getStudents, { data: StudentsData, isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetFilterStudentsQuery,
  });

  // Keep a stable ref to getStudents so the effect doesn't re-run
  // every time the query hook returns a new function reference
  const getStudentsRef = useRef(getStudents);
  useEffect(() => {
    getStudentsRef.current = getStudents;
  });

  useEffect(() => {
    if (division && classes && organization) {
      getStudentsRef.current({
        educationMediumStageId: organization,
        standardId: classes,
        divisionId: division,
      });
    }
  }, [division, classes, organization]);

  const tableData = useMemo(
    () =>
      StudentsData?.items?.map((item: any) => ({
        ...item,
        name: `${item.firstName} ${item.lastName} ${item.middleName}`,
      })) || [],
    [StudentsData?.items]
  );

  // Derive current tab — TABS is a module-level constant so no memoization needed
  const currentActiveComponent = TABS.find((tab) => tab.value === activeTab);
  // Must be capitalized so React treats it as a component (not a DOM element)
  const TabComponent = currentActiveComponent?.component as React.ComponentType<any> | undefined;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CustomBreadcrumbs
        heading="Student Management"
        description="Manage student records by class and division. Generate GR numbers manually or automatically, and perform actions like changing class, division, or house allocation."
        links={[
          { name: 'Student', href: '/student/dashboard/' },
          { name: 'Student Records', href: '/student/dashboard/' },
          { name: 'Student Management', href: '/student/dashboard/' },
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
        <Grid size={{ xs: 12, md: 4, lg: 2.3 }} sx={{ height: '100%' }}>
          <Card sx={{ height: '100%', p: 1 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              {TABS.map((tab) => {
                const isSelected = activeTab === tab.value;
                return (
                  <Button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
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
        <Grid size={{ xs: 12, md: 8, lg: 9.7 }} sx={{ height: '100%' }}>
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
            <Card
              sx={{
                p: 1,
                display: 'flex',
                gap: 2,
                alignItems: 'center',
                minHeight: 0,
                flexShrink: 0,
              }}
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
            </Card>

            {/* Component Render Section */}
            <Card sx={{ p: 1, flexGrow: 1 }}>
              {TabComponent && (
                <TabComponent
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
