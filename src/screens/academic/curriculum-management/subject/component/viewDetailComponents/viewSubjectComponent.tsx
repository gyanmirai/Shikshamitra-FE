import type { UseTabsReturn } from 'src/hooks/use-tabs';

import React, { useMemo, useState, useEffect } from 'react';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Box,
  Tab,
  Tabs,
  Chip,
  Avatar,
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

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
    <Box sx={{ p: 3, height: '100%' }}>
      <Scrollbar sx={{ height: '700px' }}>
        <Box sx={{ mb: 3 }}>
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
                <Avatar
                  sx={{
                    bgcolor: subject?.subjects?.[0]?.subjectColor || 'primary.main',
                    width: 56,
                    height: 56,
                    mr: 2,
                  }}
                >
                  <Iconify icon="mdi:atom" sx={{ fontSize: 28 }} />
                </Avatar>
                <Box>
                  <Typography variant="h4">
                    {subject?.subjects?.[0]?.subjectName || 'Physics'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mr: 1 }}>
                      {subject?.subjects?.[0]?.subjectCode || 'PHY-10'}
                    </Typography>
                    <Chip
                      label={subject?.subjectType || 'Elective'}
                      size="small"
                      variant="outlined"
                      sx={{ mr: 1 }}
                    />
                    <Chip
                      label={subject?.className || '10th Grade'}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          {subject?.subjects?.map((sub) => (
            <Accordion
              key={sub.subjectCode}
              expanded={expandedSubject === sub.subjectCode}
              onChange={handleAccordionChange(sub.subjectCode)}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {sub.subjectName || 'CHEMISTRY'}
                </Typography>
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
