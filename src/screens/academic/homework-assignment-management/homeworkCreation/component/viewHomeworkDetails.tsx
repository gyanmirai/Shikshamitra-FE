import type { UseTabsReturn } from 'src/hooks/use-tabs';

import React, { useMemo } from 'react';
import { useTabs } from 'src/hooks/use-tabs';
import { alpha } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
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
  // Custom hook to manage tab state with 'overview' as the default selected tab
  const tabs = useTabs('overview');

  // Memoized value that finds and returns the currently active tab component
  const currentTab = useMemo(
    () => HOMEWORK_TABS.find((tab) => tab.value === tabs.value),
    [tabs.value]
  );

  if (!homework) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Box
          sx={{
            p: 4,
            borderRadius: 2,
            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
            border: (theme) => `1px dashed ${theme.palette.divider}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Iconify
            icon="solar:clipboard-list-bold-duotone"
            sx={{ width: 64, height: 64, color: 'text.disabled' }}
          />
          <Typography variant="h6" sx={{ color: 'text.secondary' }}>
            No homework details available
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header Section */}
      <Box sx={{ px: 3, pt: 3, pb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 2,
            mb: 3,
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {homework.subject}
              </Typography>
              <Box
                sx={{
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: 'primary.lighter',
                  color: 'primary.dark',
                  typography: 'subtitle2',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <Iconify icon="mdi:google-classroom" width={16} />
                {homework.class} - {homework.divisionMeta?.divisionId}
              </Box>
            </Box>

            {homework.chapter && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                <Iconify icon="solar:bookmark-circle-bold" width={20} sx={{ color: 'info.main' }} />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {homework.chapter}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Custom Modern Tabs */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            p: 0.5,
            bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
            borderRadius: 1.5,
          }}
        >
          {HOMEWORK_TABS.map((tab) => {
            const isSelected = tabs.value === tab.value;
            return (
              <Box
                key={tab.value}
                onClick={(e) => tabs.onChange(e, tab.value)}
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  py: 1.5,
                  px: 2,
                  borderRadius: 1,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  bgcolor: isSelected ? 'background.paper' : 'transparent',
                  boxShadow: isSelected ? '0 2px 8px 0 rgba(0,0,0,0.08)' : 'none',
                  color: isSelected ? 'text.primary' : 'text.secondary',
                  '&:hover': {
                    bgcolor: isSelected ? 'background.paper' : 'action.hover',
                    color: 'text.primary',
                  },
                }}
              >
                <Box
                  sx={{
                    color: isSelected ? 'primary.main' : 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {tab.icon}
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: isSelected ? 600 : 500 }}>
                  {tab.label}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Content Area */}
      <Box sx={{ flexGrow: 1, overflow: 'hidden', position: 'relative' }}>
        <Scrollbar sx={{ height: '100%', px: 3, pb: 3 }}>
          <Box sx={{ py: 1 }}>{currentTab?.component({ tabs, homework })}</Box>
        </Scrollbar>
      </Box>
    </Box>
  );
};

export default ViewHomeworkDetails;
