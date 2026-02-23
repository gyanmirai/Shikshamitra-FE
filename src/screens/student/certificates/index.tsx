'use client';

import React, { useMemo } from 'react';
import { Iconify } from 'src/components/iconify';
import { Box, Grid, Card, Button } from '@mui/material';
import { useSearchParam } from 'src/hooks/use-search-param';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import LeavingCertificate from './leaving-certificate';
import BonofiedCertificate from './bonofied-certificate';
import CharacterCertificate from './character-certificate';
import FirstTrialCertificate from './first-trial-certificate';

const TABS = [
  {
    value: 'bonafiedCertificates',
    label: 'Bonafide',
    component: () => <BonofiedCertificate />,
    icon: <Iconify icon="tdesign:certificate" width={20} />,
  },
  {
    value: 'firstTrialCertificates',
    label: 'First Trial',
    component: () => <FirstTrialCertificate />,
    icon: <Iconify icon="ph:certificate-light" width={20} />,
  },
  {
    value: 'leavingCertificates',
    label: 'Leaving',
    component: () => <LeavingCertificate />,
    icon: <Iconify icon="streamline-cyber:wedding-certificate" width={20} />,
  },
  {
    value: 'characterCertificates',
    label: 'Character',
    component: () => <CharacterCertificate />,
    icon: <Iconify icon="la:certificate" width={20} />,
  },
];

const StudentCertificatesScreen = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'bonafiedCertificates' });

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );

  // const CurrentComponent = TABS.find((tab) => tab.value === tabs.value)?.component;
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Certificates"
        links={[
          { name: 'Student', href: '/student/enrollment/dashboard/' },
          { name: 'Student Records', href: '/student/overview/' },
          { name: 'Certificates' },
        ]}
        description="Generate certificates like Bonafide, Leaving, and others here."
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
            {/* Component Render Section */}
            <Card sx={{ p: 1, flexGrow: 1 }}>
              {currentActiveComponent?.component && (
                <currentActiveComponent.component
                // addSubjectDialog={addSubjectDialog}
                // addElectiveGroupDialog={addElectiveGroupDialog}
                // searchParams={searchParams}
                // setSearchParams={setSearchParams}
                />
              )}{' '}
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentCertificatesScreen;
