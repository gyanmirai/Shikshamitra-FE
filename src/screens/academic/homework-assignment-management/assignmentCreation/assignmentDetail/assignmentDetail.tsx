import type { UseTabsReturn } from 'src/hooks/use-tabs';

import React, { useMemo, useState } from 'react';

import { Box, Typography } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

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
    label: 'Attachments (5)',
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
      <Scrollbar sx={{ height: '450px' }}>
        {/* Assignment Header */}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 2,
            mb: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Iconify
              icon="mdi:book-open-page-variant"
              sx={{
                color: 'text.secondary',
                width: 20,
                height: 20,
                mr: 0.5,
              }}
            />
            <Typography variant="body2" component="span" sx={{ color: 'text.primary' }}>
              {assignment?.subjects}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Iconify
              icon="mdi:google-classroom"
              sx={{
                color: 'text.secondary',
                width: 20,
                height: 20,
                mr: 0.5,
              }}
            />
            <Typography variant="body2" component="span" sx={{ color: 'text.primary' }}>
              {assignment?.class} - {assignment?.divisionMeta?.divisionId}
            </Typography>
          </Box>
        </Box>
        {/* Subjects Accordions - Multiple Subjects */}
        <Box sx={{ borderColor: 'divider', mb: 2 }}>
          {assignment ? (
            <AssignmentOverview assignment={assignment} />
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
                No Assignment details available
              </Typography>
            </Box>
          )}
        </Box>
      </Scrollbar>
    </Box>
  );
};

export default ViewAssignmentDetails;
