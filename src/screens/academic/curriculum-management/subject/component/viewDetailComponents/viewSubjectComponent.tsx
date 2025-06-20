import type { LabelColor } from 'src/components/label';
import type { UseTabsReturn } from 'src/hooks/use-tabs';

import React, { useMemo, useState, useEffect } from 'react';

import { Box, Tab, Tabs, Grid, Paper, Divider, Typography } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import {
  PublishUnpublishStatusType,
  PublishUnpublishStatusTypeColors,
} from 'src/enums/publishUnpublish-status';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';

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
  const [tabValue, setTabValue] = useState(0);
  const tabs = useTabs('overview');

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

  const handleAccordionChange =
    (subjectCode: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedSubject(isExpanded ? subjectCode : null);
    };

  return (
    <Grid container spacing={1} height="calc(100vh - 225px)">
      <Grid item xs={3} height="100%">
        <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
          <Box
            display="flex"
            justifyContent="space-between"
            sx={{ borderBottom: `1px dashed gray`, pb: 2 }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {subject?.subjectType === 'Elective' && subject?.subjectName && (
                <Typography fontWeight="bold">{subject.subjectName}</Typography>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="body2" component="span" sx={{ color: 'text.primary' }}>
                  {subject?.className}- {subject?.subjectType}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flex: 1, justifyContent: 'flex-end', mt: 0.3 }}>
              <Label
                variant="soft"
                color={
                  PublishUnpublishStatusTypeColors[
                    subject?.status as PublishUnpublishStatusType
                  ] as LabelColor
                }
                sx={{
                  ml: 'auto',
                }}
              >
                {
                  PublishUnpublishStatusType[
                    subject?.status as PublishUnpublishStatusType
                  ] as string
                }
              </Label>
            </Box>
          </Box>

          <Scrollbar sx={{ height: 'calc(100% -  60px)' }}>
            <Box mt={1} p={0.5} display="flex" flexDirection="column" gap={1}>
              {subject?.subjects?.map((sub, index) => (
                <Box
                  key={sub.subjectCode}
                  onClick={() => setExpandedSubject(sub.subjectCode)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1,
                    cursor: 'pointer',
                    borderRadius: 1,
                    backgroundColor:
                      expandedSubject === sub.subjectCode ? 'action.selected' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <SubjectColorIndicator color={sub?.subjectColor} />
                  <Typography variant="subtitle2" fontWeight={600}>
                    {sub.subjectName || 'CHEMISTRY'}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Scrollbar>
        </Paper>
      </Grid>
      <Grid item xs={9} height="100%">
        <Paper elevation={3} sx={{ height: '100%' }}>
          <Scrollbar sx={{ height: 'calc(100% - 60px)', p: 1 }}>
            {subject?.subjects?.map(
              (sub) =>
                expandedSubject === sub.subjectCode && (
                  <Box key={sub.subjectCode}>
                    <Tabs
                      value={tabs.value}
                      onChange={tabs.onChange}
                      sx={{
                        '& .MuiTabs-flexContainer': { gap: 1.5 },
                        position: 'sticky',
                        top: 0,
                        backgroundColor: 'background.paper',
                        zIndex: 1,
                      }}
                      role="tablist"
                    >
                      {TABS.map((tab) => (
                        <Tab
                          key={tab.value}
                          value={tab.value}
                          icon={tab.icon}
                          label={tab.label}
                          role="tab"
                          sx={{ fontSize: '12px' }}
                        />
                      ))}
                    </Tabs>
                    <Divider sx={{ mb: 2 }} />

                    {currentActiveComponent?.component && (
                      <currentActiveComponent.component tabs={tabs} subject={sub} />
                    )}
                  </Box>
                )
            )}
          </Scrollbar>
        </Paper>
      </Grid>
    </Grid>
  );
};
