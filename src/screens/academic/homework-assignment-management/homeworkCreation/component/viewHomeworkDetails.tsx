import type { UseTabsReturn } from 'src/hooks/use-tabs';

import React, { useMemo, useState } from 'react';

import { Box, Tab, Tabs, Divider, Typography } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import HomeworkOverview from './viewHomeworkDetails/homeworkOverview';
import HomeworkDocuments from './viewHomeworkDetails/homeworkDocuments';

import type { IHomework } from '../type';

const HOMEWORK_TABS = [
  {
    value: 'overview',
    label: 'Overview',
    icon: <Iconify icon="ic:round-space-dashboard" width={20} />,
    component: (props: { tabs: UseTabsReturn; homework: IHomework }) => (
      <HomeworkOverview {...props} />
    ),
  },
  {
    value: `attachments`,
    label: 'Attachments (5)',
    icon: <Iconify icon="solar:bill-list-bold" width={20} />,
    component: (props: { tabs: UseTabsReturn; homework: IHomework }) => (
      <HomeworkDocuments {...props} />
    ),
  },
];

const ViewHomeworkDetails = ({ homework }: { homework: IHomework | null }) => {
  console.log('homework---', homework);

  // Custom hook to manage tab state with 'overview' as the default selected tab
  const tabs = useTabs('overview');

  // State to track whether the subject accordion section is expanded or collapsed
  const [isSubjectExpanded, setIsSubjectExpanded] = useState<boolean>(true);

  // Memoized value that finds and returns the currently active tab component
  // Updates only when the selected tab value changes
  const currentActiveComponent = useMemo(
    () => HOMEWORK_TABS.find((tab) => tab.value === tabs.value),
    [tabs.value]
  );

  return (
    <Box sx={{ p: 2, height: '100%' }}>
      <Scrollbar sx={{ height: '600px' }}>
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
              {homework?.subject}
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
              {homework?.class} - {homework?.divisionMeta?.divisionId}
            </Typography>
          </Box>

          {homework?.chapter && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Iconify
                icon="cil:book"
                sx={{
                  color: 'text.secondary',
                  width: 18,
                  height: 18,
                  mr: 0.5,
                }}
              />

              <Typography variant="body2" component="span" sx={{ color: 'text.primary' }}>
                {homework?.chapter}
              </Typography>
            </Box>
          )}
        </Box>
        {/* Homework Header */}

        {/* Subject Accordion - Single Subject */}
        <Box sx={{ borderColor: 'divider', mb: 2 }}>
          {homework ? (
            <Box
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                p: 2,
                mb: 2,
              }}
            >
              <Tabs
                value={tabs.value}
                onChange={tabs.onChange}
                sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 } }}
                role="tablist"
              >
                {HOMEWORK_TABS.map((tab) => (
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
                <currentActiveComponent.component tabs={tabs} homework={homework} />
              )}
            </Box>
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
                No homework details available
              </Typography>
            </Box>
          )}
        </Box>
      </Scrollbar>
    </Box>
  );
};

export default ViewHomeworkDetails;
