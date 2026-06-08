import type { UseTabsReturn } from 'src/hooks/use-tabs';

import { varAlpha } from 'src/theme/styles';
import { useTabs } from 'src/hooks/use-tabs';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Tab, Tabs, Grid, Card } from '@mui/material';
import React, { useMemo, useState, useEffect } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetSubjectAssignmentByIdQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';

import SubjectSidebar from './SubjectSidebar';
import SubjectOverview from './subjectOverview';
import SubjectSyllabus from './subjectSyllabus';
import SubjectDocument from './subjectDocument';
import { ViewSubjectSkeleton } from './ViewSubjectSkeleton';

import type { ISubjectDetail, IViewSubjectProps } from '../type';

export interface StudentTabsComponentType {
  tabs?: UseTabsReturn;
  subject?: ISubjectDetail;
}

const TABS = [
  {
    value: 'overview',
    label: 'Overview',
    icon: <Iconify icon="ic:round-space-dashboard" width={20} />,
    component: (props: { tabs: UseTabsReturn; subject: ISubjectDetail }) => (
      <SubjectOverview {...props} />
    ),
  },
  {
    value: 'syllabus',
    label: 'Syllabus',
    icon: <Iconify icon="solar:user-id-bold" width={20} />,
    component: (props: { tabs: UseTabsReturn; subject: ISubjectDetail }) => (
      <SubjectSyllabus {...props} />
    ),
  },
  {
    value: 'documents',
    label: 'Documents',
    icon: <Iconify icon="solar:bill-list-bold" width={20} />,
    component: (props: { tabs: UseTabsReturn; subject: ISubjectDetail }) => (
      <SubjectDocument {...props} />
    ),
  },
];

export const ViewSubject = ({ subject, classId, classes }: IViewSubjectProps) => {
  const theme = useTheme();
  const tabs = useTabs('overview');

  const { data: subjectAssignmentData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectAssignmentByIdQuery,
    params: { assignmentId: subject?.id },
  });

  /**
   * Memoization Justification:
   * TABS is a static array; find operation runs on every render without memo.
   * Prevents unnecessary object allocation when tab value hasn't changed.
   */
  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === tabs.value),
    [tabs.value]
  );

  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  useEffect(() => {
    if (subject?.subjects && subject.subjects.length > 0) {
      setExpandedSubject(subject.subjects[0].subjectCode);
    }
  }, [subject]);

  if (isLoading) {
    return <ViewSubjectSkeleton />;
  }

  return (
    <Grid container spacing={2} sx={{ height: '100%' }}>
      <Grid size={{ xs: 12, md: 3 }} sx={{ height: '100%' }}>
        <SubjectSidebar
          subjectAssignmentData={subjectAssignmentData}
          expandedSubject={expandedSubject}
          onSubjectSelect={setExpandedSubject}
          classes={classes}
          classId={classId}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 9 }} sx={{ height: '100%' }}>
        <Card
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadows-10)',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          {(subjectAssignmentData?.data?.subjects as ISubjectDetail[] | undefined)?.map(
            (sub: ISubjectDetail) => {
              const enrichedSub: ISubjectDetail = sub.classId ? sub : { ...sub, classId };
              return (
                enrichedSub.subjectCode === expandedSubject && (
                  <React.Fragment key={enrichedSub.subjectCode}>
                    <Box
                      sx={{
                        px: 2,
                        pt: 2,
                        bgcolor: () => varAlpha(theme.palette.grey['500Channel'], 0.04),
                        borderBottom: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Tabs
                        value={tabs.value}
                        onChange={tabs.onChange}
                        sx={{
                          '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
                          '& .MuiTab-root': { minHeight: 48, minWidth: 100, mr: 1 },
                        }}
                      >
                        {TABS.map((tab) => (
                          <Tab
                            key={tab.value}
                            value={tab.value}
                            icon={tab.icon}
                            iconPosition="start"
                            label={tab.label}
                            disableRipple
                          />
                        ))}
                      </Tabs>
                    </Box>

                    <Box sx={{ flexGrow: 1, overflow: 'hidden', p: 3 }}>
                      <Scrollbar sx={{ height: '100%' }}>
                        {currentActiveComponent?.component && (
                          <currentActiveComponent.component tabs={tabs} subject={enrichedSub} />
                        )}
                      </Scrollbar>
                    </Box>
                  </React.Fragment>
                )
              );
            }
          )}
        </Card>
      </Grid>
    </Grid>
  );
};
