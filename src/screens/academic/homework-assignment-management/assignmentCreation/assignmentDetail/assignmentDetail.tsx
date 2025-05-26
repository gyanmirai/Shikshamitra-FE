import type { LabelColor } from 'src/components/label';
import type { UseTabsReturn } from 'src/hooks/use-tabs';
import type { PublishUnpublishStatusType } from 'src/enums/publishUnpublish-status';

import React, { useMemo, useState } from 'react';

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

import { PublishUnpublishStatusTypeColors } from 'src/enums/publishUnpublish-status';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import AssignmentOverview from './assignmentOverview';
import AssignmentDocuments from './assignmentDocuments';

import type { IAssignment } from '../type';

const ASSIGNMENT_TABS = [
  {
    value: 'overview',
    label: 'Overview',
    icon: <Iconify icon="ic:round-space-dashboard" width={20} />,
    component: (props: { tabs: UseTabsReturn; assignment: IAssignment }) => (
      <AssignmentOverview {...props} />
    ),
  },
  {
    value: 'attachments',
    label: 'Attachments',
    icon: <Iconify icon="solar:bill-list-bold" width={20} />,
    component: (props: { tabs: UseTabsReturn; assignment: IAssignment }) => (
      <AssignmentDocuments {...props} />
    ),
  },
];

const ViewAssignmentDetails = ({ assignment }: { assignment: IAssignment | null }) => {
  // Hook to manage tab state with 'overview' as the default selected tab
  const tabs = useTabs('overview');

  // State to track expanded/collapsed state of individual subjects
  // Record<string, boolean> maps subject IDs to their expanded state
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});

  // State to track whether the main subject accordion is expanded
  const [isSubjectExpanded, setIsSubjectExpanded] = useState<boolean>(true);

  // Handler for main subject accordion expansion/collapse
  // @param event - React synthetic event
  // @param isExpanded - Boolean indicating if accordion is expanded
  const handleAccordionChange = (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setIsSubjectExpanded(isExpanded);
  };

  // Find the currently active tab component based on selected tab value
  const currentActiveComponent = useMemo(
    () => ASSIGNMENT_TABS.find((tab) => tab.value === tabs.value),
    [tabs.value]
  );

  return (
    <Box sx={{ p: 2, height: '100%' }}>
      <Scrollbar sx={{ height: '700px' }}>
        {/* Assignment Header */}
        <Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Chip
                  label={`Class : ${assignment?.class}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '1rem' }}
                />
                <Chip
                  label={`Type : ${assignment?.assignmentType}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '1rem' }}
                />
                <Label
                  color={
                    PublishUnpublishStatusTypeColors[
                      assignment?.status as PublishUnpublishStatusType
                    ] as LabelColor
                  }
                  sx={{ fontSize: '1rem' }}
                >
                  Status : Published
                </Label>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Subjects Accordions - Multiple Subjects */}
        <Box sx={{ borderColor: 'divider', mb: 2 }}>
          {assignment?.subjects ? (
            <Accordion
              expanded={isSubjectExpanded}
              onChange={handleAccordionChange}
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                boxShadow: 'none',
                '&:before': {
                  display: 'none',
                },
                mb: 2,
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {assignment.subjects}
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
                  {ASSIGNMENT_TABS.map((tab) => (
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
                  <currentActiveComponent.component tabs={tabs} assignment={assignment} />
                )}
              </AccordionDetails>
            </Accordion>
          ) : (
            <Box
              sx={{
                textAlign: 'center',
                py: 4,
                border: '1px dashed #ccc',
                borderRadius: 2,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No subject assigned to this homework
              </Typography>
            </Box>
          )}
        </Box>
      </Scrollbar>
    </Box>
  );
};

export default ViewAssignmentDetails;
