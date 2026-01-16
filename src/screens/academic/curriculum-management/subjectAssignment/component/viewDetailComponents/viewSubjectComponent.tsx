import type { LabelColor } from 'src/components/label';
import type { UseTabsReturn } from 'src/hooks/use-tabs';

import { varAlpha } from 'src/theme/styles';
import { useTabs } from 'src/hooks/use-tabs';
import { Label } from 'src/components/label';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { SubjectType } from 'src/enums/subject-type';
import { Scrollbar } from 'src/components/scrollbar';
import React, { useMemo, useState, useEffect } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Tab, Tabs, Grid, Card, Typography } from '@mui/material';
import {
  PublishUnpublishStatusType,
  PublishUnpublishStatusTypeColors,
} from 'src/enums/publishUnpublish-status';
import { useGetSubjectAssignmentByIdQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';

import SubjectOverview from './subjectOverview';
import SubjectSyllabus from './subjectSyllabus';
import SubjectDocument from './subjectDocument';

import type { ISubjectDetail, IViewSubjectProps } from '../type';

// Interface for the tab panel props
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

export const ViewSubject = ({ subject }: IViewSubjectProps) => {
  const theme = useTheme();
  const tabs = useTabs('overview');

  const {
    data: subjectAssignmentData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isLoading,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectAssignmentByIdQuery,
    params: { assignmentId: subject?.id },
  });

  // Find the currently active tab component based on selected tab value
  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === tabs.value),
    [tabs.value]
  );

  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  useEffect(() => {
    if (subject?.subjects && subject.subjects.length > 0) {
      setExpandedSubject(subject.subjects[0].subjectCode); // Open first subject by default
    }
  }, [subject]);

  return (
    <Grid container spacing={3} sx={{ height: 'calc(100vh - 225px)' }}>
      {/* Left Sidebar: Subject List */}
      <Grid size={{ xs: 12, md: 3 }} sx={{ height: '100%' }}>
        <Card
          sx={{
            height: '100%',
            p: 2,
            boxShadow: 'var(--shadows-10)',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
          }}
        >
          {/* Header Section */}
          <Box
            sx={{
              pb: 2,
              mb: 2,
              borderBottom: `1px dashed ${theme.palette.divider}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            }}
          >
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
            >
              <Box>
                {subjectAssignmentData?.subjectType === 1 && (
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    {subjectAssignmentData?.electiveGroupName}
                  </Typography>
                )}
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                  <Iconify icon="mdi:google-classroom" width={16} />
                  {subjectAssignmentData?.className || 'N/A'} {' - '}
                  {subjectAssignmentData?.subjectType !== undefined
                    ? SubjectType[subjectAssignmentData.subjectType]
                    : ''}
                </Typography>
              </Box>

              <Label
                variant="soft"
                color={
                  PublishUnpublishStatusTypeColors[
                    subjectAssignmentData?.status as PublishUnpublishStatusType
                  ] as LabelColor
                }
              >
                {
                  PublishUnpublishStatusType[
                    subjectAssignmentData?.status as PublishUnpublishStatusType
                  ] as string
                }
              </Label>
            </Box>
          </Box>

          {/* Subject List */}
          <Typography variant="overline" sx={{ color: 'text.disabled', mb: 1, px: 1 }}>
            Subjects
          </Typography>

          <Scrollbar sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {subjectAssignmentData?.subjects?.map((sub: any) => {
                const isSelected = expandedSubject === sub.subjectCode;
                return (
                  <Box
                    key={sub.subjectCode}
                    onClick={() => setExpandedSubject(sub.subjectCode)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 1.5,
                      cursor: 'pointer',
                      borderRadius: 1.5,
                      transition: 'all 0.2s',
                      bgcolor: isSelected
                        ? () => varAlpha(theme.palette.primary.mainChannel, 0.08)
                        : 'transparent',
                      color: isSelected ? 'primary.main' : 'text.secondary',
                      '&:hover': {
                        bgcolor: isSelected
                          ? () => varAlpha(theme.palette.primary.mainChannel, 0.12)
                          : 'action.hover',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: isSelected ? 'primary.main' : 'text.disabled',
                        transition: 'background-color 0.2s',
                      }}
                    />
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: isSelected ? 600 : 500,
                        color: isSelected ? 'text.primary' : 'text.secondary',
                      }}
                    >
                      {sub.subjectName || 'UNNAMED SUBJECT'}
                    </Typography>

                    {isSelected && (
                      <Iconify
                        icon="eva:arrow-ios-forward-fill"
                        width={16}
                        sx={{ ml: 'auto', color: 'primary.main' }}
                      />
                    )}
                  </Box>
                );
              })}
            </Box>
          </Scrollbar>
        </Card>
      </Grid>

      {/* Right Content Area */}
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
          {subjectAssignmentData?.subjects?.map(
            (sub: any) =>
              expandedSubject === sub.subjectCode && (
                <React.Fragment key={sub.subjectCode}>
                  {/* Tabs Header */}
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
                        '& .MuiTab-root': {
                          minHeight: 48,
                          minWidth: 100,
                          mr: 1,
                        },
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

                  {/* Tab Content */}
                  <Box sx={{ flexGrow: 1, overflow: 'hidden', p: 3 }}>
                    <Scrollbar sx={{ height: '100%' }}>
                      {currentActiveComponent?.component && (
                        <currentActiveComponent.component tabs={tabs} subject={sub} />
                      )}
                    </Scrollbar>
                  </Box>
                </React.Fragment>
              )
          )}
        </Card>
      </Grid>
    </Grid>
  );
};
