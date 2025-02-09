'use client';

import React, { useState, useCallback } from 'react';

import { Box, Tab, Card, Button } from '@mui/material';

import { useSearchParam } from 'src/hooks/use-search-param';

import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import SendCustomAlert from './component/send-custom-alert';
import SendAlertToOthers from './component/send-alert-to-others';
import NotificationCategory from './component/notification-category';
import CreateNotificationTemplates from './component/create-templates';
import SendNotificationScreen from './component/send-notification-screen';
import AddNotificationCategoryDialog from './component/add-notification-category-dialog';
import AddNotificationTemplateDialog from './component/add-notification-template-dialog';

// Store components in an object instead of recreating them every render
const COMPONENTS: any = {
  'send-notification': SendNotificationScreen,
  'notification-templates': CreateNotificationTemplates,
  'notification-category': NotificationCategory,
  'send-alert-others': SendAlertToOthers,
  'send-custom-alert': SendCustomAlert,
};

const TABS = [
  { value: 'send-notification', label: 'Send Notification' },
  { value: 'notification-templates', label: 'Notification Templates' },
  { value: 'notification-category', label: 'Category' },
  { value: 'send-alert-others', label: 'Send Alert to Others' },
  { value: 'send-custom-alert', label: 'Send Custom Alert' },
];

const NotificationScreen = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'send-notification' });
  const [openForNotificationCategory, setOpenForNotificationCategory] = useState(false);
  const [openForTemplates, setOpenForTemplates] = useState(false);

  // Find the selected tab once and reuse the result
  const selectedTab = TABS.find((tab) => tab.value === searchParams.tab) || TABS[0];
  const breadcrumbTabName = selectedTab.label;

  // Get the active component
  const ActiveComponent = COMPONENTS[selectedTab.value];

  // Memoize tab change handler to avoid unnecessary re-renders
  const handleTabChange = useCallback(
    (_: any, value: any) => {
      setSearchParams({ tab: value });

      // Close any open dialogs when switching tabs
      setOpenForNotificationCategory(false);
      setOpenForTemplates(false);
    },
    [setSearchParams]
  );

  const addHandler = () => {
    if (breadcrumbTabName === 'Category') {
      setOpenForTemplates(false);
      setOpenForNotificationCategory(true);
    } else {
      setOpenForTemplates(true);
      setOpenForNotificationCategory(false);
    }
  };

  const closeHandler = () => {
    setOpenForTemplates(false);
    setOpenForNotificationCategory(false);
  };
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" flexDirection="row" alignItems="center">
        <CustomBreadcrumbs
          heading="Notification"
          links={[{ name: 'Communication' }, { name: 'Notification' }, { name: breadcrumbTabName }]}
          sx={{ px: 1, mb: 2 }}
        />
        {breadcrumbTabName !== 'Send Notification' &&
          breadcrumbTabName !== 'Send Alert to Others' &&
          breadcrumbTabName !== 'Send Custom Alert' &&
          (openForNotificationCategory || openForTemplates ? (
            <Button
              startIcon={<Iconify icon="eva:arrow-back-fill" />}
              onClick={closeHandler}
              variant="contained"
              size="small"
            >
              Back
            </Button>
          ) : (
            <Button
              startIcon={<Iconify icon="ic:outline-plus" />}
              onClick={addHandler}
              variant="contained"
              size="small"
            >
              {breadcrumbTabName}
            </Button>
          ))}
      </Box>
      <Card>
        <CustomTabs
          value={searchParams.tab}
          onChange={handleTabChange}
          sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 } }}
          role="tablist"
        >
          {TABS.map((tab) => (
            <Tab sx={{ fontSize: '12px' }} key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </CustomTabs>
      </Card>
      <Box px={1} pt={2}>
        {!openForTemplates && !openForNotificationCategory && ActiveComponent && (
          <ActiveComponent />
        )}
      </Box>

      {openForNotificationCategory && (
        <AddNotificationCategoryDialog onClose={() => setOpenForNotificationCategory(false)} />
      )}
      {openForTemplates && <AddNotificationTemplateDialog />}
    </Box>
  );
};

export default NotificationScreen;
