import type { LabelColor } from 'src/components/label';
import type { UseTabsReturn } from 'src/hooks/use-tabs';

import React, { useMemo, useState, useEffect } from 'react';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Box,
  Tab,
  Tabs,
  Chip,
  Divider,
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import {
  PublishUnpublishStatusType,
  PublishUnpublishStatusTypeColors,
} from 'src/enums/publishUnpublish-status';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import SubjectOverview from './subjectOverview';
import SubjectSyllabus from './subjectSyllabus';
import SubjectDocument from './subjectDocument';

import type { ISubject, IViewSubjectProps } from '../type';

// Interface for the tab panel props
export interface StudentTabsComponentType {
  tabs?: UseTabsReturn;
  subject?: ISubject;
}

const TABS = [
  {
    value: 'overview',
    label: 'Overview',
    icon: <Iconify icon="ic:round-space-dashboard" width={20} />,
    component: (props: { tabs: UseTabsReturn; subject: ISubject }) => (
      <SubjectOverview {...props} />
    ),
  },
  {
    value: 'syllabus',
    label: 'Syllabus',
    icon: <Iconify icon="solar:user-id-bold" width={20} />,
    component: (props: { tabs: UseTabsReturn; subject: ISubject }) => (
      <SubjectSyllabus {...props} />
    ),
  },
  {
    value: 'documents',
    label: 'Documents',
    icon: <Iconify icon="solar:bill-list-bold" width={20} />,
    component: (props: { tabs: UseTabsReturn; subject: ISubject }) => (
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
    <Box sx={{ p: 2, height: '100%' }}>
      <Scrollbar sx={{ height: '600px' }}>
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              mb: 1,
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box display="flex" flexDirection="column" gap={0.5}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={`Type : ${subject?.subjectType}`}
                      variant="outlined"
                      sx={{ fontSize: '0.9rem' }}
                    />
                    <Chip
                      label={`Class : ${subject?.className}`}
                      variant="outlined"
                      sx={{ fontSize: '0.9rem' }}
                    />
                    <Label
                      variant="soft"
                      color={
                        PublishUnpublishStatusTypeColors[
                          subject?.status as PublishUnpublishStatusType
                        ] as LabelColor
                      }
                      sx={
                        {
                          // p: 1.8,
                          // fontSize: '1rem',
                          // fontWeight: 500,
                          // minWidth: '100px',
                          // textAlign: 'center',
                        }
                      }
                    >
                      {
                        PublishUnpublishStatusType[
                          subject?.status as PublishUnpublishStatusType
                        ] as string
                      }
                    </Label>
                    {/* <Label
                      label={`Status : ${subject?.status === 1 ? 'Draft' : 'Published'}`}
                      variant="outlined"
                      sx={{
                        fontSize: '0.9rem',
                        color:
                          PublishUnpublishStatusTypeColors[
                            subject?.status as PublishUnpublishStatusType
                          ],
                        borderColor:
                          PublishUnpublishStatusTypeColors[
                            subject?.status as PublishUnpublishStatusType
                          ],
                      }}
                    /> */}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box sx={{ borderColor: 'divider', mb: 2 }}>
          {subject?.subjects?.map((sub) => (
            <Accordion
              key={sub.subjectCode}
              expanded={expandedSubject === sub.subjectCode}
              onChange={handleAccordionChange(sub.subjectCode)}
              sx={{
                border: '1px solid #ccc',
                boxShadow: 'none', // optional, remove default shadow
                '&:before': {
                  display: 'none', // remove default divider line at top
                },
                borderRadius: 1, // optional, round corners
                marginBottom: 1, // optional, add space between accordions
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" gap={2}>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      mt: 0.5,
                      backgroundColor: sub?.subjectColor,
                      p: 0,
                    }}
                  />
                  <Typography variant="subtitle1" fontWeight={600}>
                    {sub.subjectName || 'CHEMISTRY'}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Tabs
                  value={tabs.value}
                  onChange={tabs.onChange}
                  sx={{ px: 2, '& .MuiTabs-flexContainer': { gap: 1.5 } }}
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
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Scrollbar>
    </Box>
  );
};
