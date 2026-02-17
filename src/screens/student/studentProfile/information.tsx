import { Iconify } from 'src/components/iconify';
import React, { useMemo, useCallback } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Card, Grid, Button } from '@mui/material';
import { useCustomSearchParams } from 'src/hooks/use-search-param';
import { StudentInformationForm } from 'src/components/studentProfile/StudentInformationForm';

import type { StudentTabsComponentType } from '.';

// ----------------------------------------------------------------------

// Move TABS outside component to prevent recreation on every render
const TABS = [
  {
    value: 'general',
    label: 'General',
    icon: <Iconify icon="icon-park-outline:id-card" width={20} />,
  },
  {
    value: 'admission',
    label: 'Family',
    icon: <Iconify icon="material-symbols:family-restroom" width={20} />,
  },
  {
    value: 'communication',
    label: 'Communication',
    icon: <Iconify icon="material-symbols:contact-phone-outline" width={20} />,
  },
  {
    value: 'additionalDetails',
    label: 'Additional Details',
    icon: <Iconify icon="material-symbols:feed-outline" width={20} />,
  },
  {
    value: 'medicalRecords',
    label: 'Medical Records',
    icon: <Iconify icon="material-symbols:medical-services-outline" width={20} />,
  },
  {
    value: 'previousSchool',
    label: 'Prev. School Details',
    icon: <Iconify icon="mdi:school-outline" width={20} />,
  },
  {
    value: 'bankDetails',
    label: 'Bank Details',
    icon: <Iconify icon="mdi:bank-outline" width={20} />,
  },
];

// Memoized tab button component to prevent unnecessary re-renders
const TabButton = React.memo(
  ({
    tab,
    isSelected,
    onTabChange,
  }: {
    tab: (typeof TABS)[0];
    isSelected: boolean;
    onTabChange: (value: string) => void;
  }) => (
    <Button
      onClick={() => onTabChange(tab.value)}
      variant="text"
      color="inherit"
      startIcon={tab.icon}
      sx={{
        position: 'relative',
        justifyContent: 'flex-start',
        px: 2,
        py: 1.5,
        textAlign: 'left',
        backgroundColor: (theme) => (isSelected ? theme.palette.action.hover : 'transparent'),
        color: isSelected ? 'inherit' : 'text.secondary',
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
  )
);

export const StudentInformation = React.memo(
  (props: StudentTabsComponentType) => {
    const { student, refetch } = props;
    const { getAllParams, setParam } = useCustomSearchParams({ tab: 'general' });
    const searchParams = getAllParams();

    const currentTabIndex = useMemo(
      () => TABS.findIndex((tab) => tab.value === searchParams.tab),
      [searchParams.tab]
    );

    // Memoize tab change handler to prevent recreation
    const handleTabChange = useCallback(
      (tabValue: string) => {
        setParam('tab', tabValue);
      },
      [setParam]
    );

    return (
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
              {TABS.map((tab) => (
                <TabButton
                  key={tab.value}
                  tab={tab}
                  isSelected={searchParams.tab === tab.value}
                  onTabChange={handleTabChange}
                />
              ))}
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
            <Card sx={{ p: 1, flexGrow: 1, height: '100%', overflow: 'hidden' }}>
              <Scrollbar sx={{ height: '100%' }}>
                <Box sx={{ p: 2 }}>
                  <StudentInformationForm
                    tabIndex={currentTabIndex !== -1 ? currentTabIndex : 0}
                    editData={student}
                    isEdit
                    refetch={refetch}
                  />
                </Box>
              </Scrollbar>
            </Card>
          </Box>
        </Grid>
      </Grid>
    );
  },
  // Custom comparison function to prevent re-renders when props haven't meaningfully changed
  (prevProps, nextProps) =>
    prevProps.student?.studentId === nextProps.student?.studentId &&
    prevProps.refetch === nextProps.refetch
);
