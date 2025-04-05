'use client';

import React, { useState, useCallback } from 'react';

import { Box, Tab, Card, Button } from '@mui/material';

import { useSearchParam } from 'src/hooks/use-search-param';

import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import eventList from './component/eventList';
import SendCustomAlert from './component/send-custom-alert';
import SendAlertToOthers from './component/send-alert-to-others';
import AddEventListDialog from './component/add-eventList-dialog';
import NotificationCategory from './component/notification-category';
import CreateNotificationTemplates from './component/create-templates';
import SendNotificationScreen from './component/send-notification-screen';
import AddNotificationCategoryDialog from './component/add-notification-category-dialog';
import AddNotificationTemplateDialog from './component/add-notification-template-dialog';
// import AutoNotificationConfigurationDialog from './component/auto-notification-configuration-dialog';

// Store components in an object instead of recreating them every render
const COMPONENTS: any = {
  'send-notification': SendNotificationScreen,
  'notification-templates': CreateNotificationTemplates,
  'notification-category': NotificationCategory,
  'send-alert-others': SendAlertToOthers,
  'send-custom-alert': SendCustomAlert,
  event: eventList,
};

const TABS = [
  { value: 'send-notification', label: 'Send Notification' },
  { value: 'notification-templates', label: 'Notification Templates' },
  { value: 'notification-category', label: 'Category' },
  { value: 'send-alert-others', label: 'Send Alert to Others' },
  { value: 'send-custom-alert', label: 'Send Custom Alert' },
  // { value: 'auto-notification-configuration', label: 'Auto Notification Configuration' },
  { value: 'auto-notification-configuration', label: 'Auto Notification Configuration' },
  { value: 'event', label: 'Add Event' },
];

const NotificationScreen = () => {
  // Search params for managing active tab state
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'send-notification' });

  // State for managing notification category dialog visibility
  const [openForNotificationCategory, setOpenForNotificationCategory] = useState(false);

  // State for managing notification templates dialog visibility
  const [openForTemplates, setOpenForTemplates] = useState(false);

  // State for managing event category dialog visibility
  const [openAddEventCategory, setOpenEventCategory] = useState(false);

  // State for managing auto notification configuration dialog visibility
  const [openForAutoNotificationConfiguration, setOpenForAutoNotificationConfiguration] =
    useState(false);
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
      setOpenForAutoNotificationConfiguration(false);
      setOpenEventCategory(false);
    },
    [setSearchParams]
  );

  /**
   * Handles the add button click based on the current breadcrumb tab name.
   * Opens the corresponding dialog and closes others.
   */
  const addHandler = () => {
    if (breadcrumbTabName === 'Category') {
      setOpenForTemplates(false);
      setOpenForNotificationCategory(true);
      setOpenForAutoNotificationConfiguration(false);
      setOpenEventCategory(false);
    }
    if (breadcrumbTabName === 'Auto Notification Configuration') {
      setOpenForTemplates(false);
      setOpenForNotificationCategory(false);
      setOpenForAutoNotificationConfiguration(true);
      setOpenEventCategory(false);
    }
    if (breadcrumbTabName === 'Notification Templates') {
      setOpenForTemplates(true);
      setOpenForNotificationCategory(false);
      setOpenForAutoNotificationConfiguration(false);
      setOpenEventCategory(false);
    }
    if (breadcrumbTabName === 'Add Event') {
      setOpenForTemplates(false);
      setOpenForNotificationCategory(false);
      setOpenForAutoNotificationConfiguration(false);
      setOpenEventCategory(true);
    }
  };

  /**
   * Handles closing all dialogs by setting their states to false.
   */
  const closeHandler = () => {
    setOpenForTemplates(false);
    setOpenForNotificationCategory(false);
    setOpenForAutoNotificationConfiguration(false);
    setOpenEventCategory(false);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" flexDirection="row" alignItems="center">
        <CustomBreadcrumbs
          heading="Notification"
          description="Create and manage notifications for various events, including sending alerts to others and customizing notification templates."
          links={[
            { name: 'Communication', href: '/communication/dashboard' },
            { name: 'Notification' },
            { name: breadcrumbTabName },
          ]}
          sx={{ px: 1, mb: 2 }}
        />
        {breadcrumbTabName !== 'Send Notification' &&
          breadcrumbTabName !== 'Send Alert to Others' &&
          breadcrumbTabName !== 'Send Custom Alert' &&
          (openForNotificationCategory ||
          openForTemplates ||
          openAddEventCategory ||
          openForAutoNotificationConfiguration ? (
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
        {!openForTemplates &&
          !openForNotificationCategory &&
          !openForAutoNotificationConfiguration &&
          !openAddEventCategory &&
          ActiveComponent && <ActiveComponent />}
      </Box>

      {openForNotificationCategory && (
        <AddNotificationCategoryDialog onClose={() => setOpenForNotificationCategory(false)} />
      )}
      {openForTemplates && <AddNotificationTemplateDialog />}

      {openAddEventCategory && <AddEventListDialog onClose={() => setOpenEventCategory(false)} />}

      {/* {openForAutoNotificationConfiguration && (
        <AutoNotificationConfigurationDialog onClose={() => setOpenForAutoNotificationConfiguration(false)} />
      )} */}
    </Box>
  );
};

export default NotificationScreen;
