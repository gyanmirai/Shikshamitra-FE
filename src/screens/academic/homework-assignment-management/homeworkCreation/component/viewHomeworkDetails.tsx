import type { UseTabsReturn } from 'src/hooks/use-tabs';

import React, { useMemo, useState } from 'react';

import { Box, Tab, Tabs, Divider, Typography } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import {
  PublishUnpublishStatusType,
  PublishUnpublishStatusTypeColors,
} from 'src/enums/publishUnpublish-status';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Label, type LabelColor } from 'src/components/label';

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
    value: 'attachments',
    label: 'Attachments',
    icon: <Iconify icon="solar:bill-list-bold" width={20} />,
    component: (props: { tabs: UseTabsReturn; homework: IHomework }) => (
      <HomeworkDocuments {...props} />
    ),
  },
];

const ViewHomeworkDetails = ({ homework }: { homework: IHomework | null }) => {
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

  // Handler for subject accordion expansion/collapse events
  // @param _event - React synthetic event (unused)
  // @param isExpanded - Boolean indicating if accordion should be expanded
  const handleAccordionChange = (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setIsSubjectExpanded(isExpanded);
  };

  return (
    <Box sx={{ p: 2, height: '100%' }}>
      <Scrollbar sx={{ height: '600px' }}>
        {/* Homework Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography>
                  <strong>Type : </strong>
                </Typography>
                <Typography mt={0.3}>{homework?.homeworkType}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography mt={0.3}>
                  <strong>Class : </strong>
                </Typography>
                <Typography mt={0.3}>{homework?.class}</Typography>
              </Box>

              <Label
                variant="soft"
                color={
                  PublishUnpublishStatusTypeColors[
                    homework?.status as PublishUnpublishStatusType
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
                    homework?.status as PublishUnpublishStatusType
                  ] as string
                }
              </Label>
              {/* {homework?.isDailyTask && (
                  <Label color="warning" sx={{ fontSize: '0.875rem' }}>
                    Daily Task
                  </Label>
                )} */}
            </Box>
          </Box>
        </Box>

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
