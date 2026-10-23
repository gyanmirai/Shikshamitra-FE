import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import React, { useMemo, useCallback } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { studentPaths } from 'src/constants/student-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import { Box, Card, Grid, Stack, Button } from '@mui/material';
import { StudentFeedback } from 'src/components/student-feedback';
import { useCustomSearchParams } from 'src/hooks/use-search-param';
import { StudentInformationForm } from 'src/components/studentProfile/StudentInformationForm';
import StudentRecordGuardianAccess from 'src/screens/student/records/student-record-guardian-access';

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
    const permissions = useSelector((state: RootState) => state.auth.permissions);
    const canCreate = hasGrantedPermission(permissions, 'Students.Records.Changes.Add');
    const section = [
      'general',
      'family',
      'communication',
      'additional',
      'medical',
      'previous-school',
      'bank',
    ][Math.max(currentTabIndex, 0)];
    const groups = [
      ['Identity', 'Contact'],
      ['Guardian', 'Contact'],
      ['Contact'],
      ['Identity', 'Medical', 'Contact'],
      ['Medical'],
      [],
      ['Bank'],
    ][Math.max(currentTabIndex, 0)];
    const restricted = groups.some((group) => student?.maskedFields?.includes(group));

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
                  {restricted ? (
                    <StudentFeedback
                      notificationKey="STU-0749"
                      presentation="inline"
                      severity="info"
                    >
                      This section contains fields restricted by school policy.
                    </StudentFeedback>
                  ) : (
                    <>
                      <StudentFeedback
                        notificationKey="STU-0750"
                        presentation="inline"
                        severity="info"
                        sx={{ mb: 2 }}
                        action={
                          canCreate ? (
                            <Button
                              component={RouterLink}
                              href={`${studentPaths.records.changes}?mode=new&student=${encodeURIComponent(student.studentId)}&section=${section}`}
                            >
                              Request change
                            </Button>
                          ) : undefined
                        }
                      >
                        Changes to these details are submitted through Changes & Approvals.
                      </StudentFeedback>
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
                        {hasGrantedPermission(permissions, 'Students.Records.Changes.View') && (
                          <Button
                            component={RouterLink}
                            href={`${studentPaths.records.changes}?student=${encodeURIComponent(student.studentId)}`}
                          >
                            Change history
                          </Button>
                        )}
                        {section === 'general' && canCreate && (
                          <Button
                            component={RouterLink}
                            href={`${studentPaths.records.changes}?mode=new&student=${encodeURIComponent(student.studentId)}&section=photo`}
                          >
                            Change photo
                          </Button>
                        )}
                        {section === 'general' &&
                          canCreate &&
                          student.placementEditable === true && (
                            <Button
                              component={RouterLink}
                              href={`${studentPaths.records.changes}?mode=new&student=${encodeURIComponent(student.studentId)}&section=placement`}
                            >
                              Change class & division
                            </Button>
                          )}
                      </Stack>
                      <Box
                        component="fieldset"
                        disabled
                        sx={{ p: 0, m: 0, border: 0, minWidth: 0 }}
                      >
                        <StudentInformationForm
                          tabIndex={currentTabIndex !== -1 ? currentTabIndex : 0}
                          editData={student}
                          isEdit={false}
                          refetch={refetch}
                        />
                      </Box>
                      {section === 'family' && (
                        <Box sx={{ mt: 3 }}>
                          <StudentRecordGuardianAccess studentId={student.studentId} />
                        </Box>
                      )}
                    </>
                  )}
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
    (prevProps.student?.maskedFields ?? []).join(',') ===
      (nextProps.student?.maskedFields ?? []).join(',') &&
    prevProps.refetch === nextProps.refetch
);
