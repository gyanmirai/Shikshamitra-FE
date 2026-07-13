'use client';

import { Box, Tab } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { CustomTabs } from 'src/components/custom-tabs';
import { FormSlider } from 'src/components/form-slider';
import { useSearchParam } from 'src/hooks/use-search-param';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import EventNotification from './Components/EventNotification';
import SurveyNotification from './Components/SurveyNotification';
import AnnouncementNotification from './Components/AnnouncementNotification';

import type { INotificationComponentProps } from './types';

const TABS = [
  {
    value: 'announcement',
    label: 'Announcement',
    icon: <Iconify icon="mdi:bullhorn-outline" width={20} />,
    component: (props: INotificationComponentProps) => <AnnouncementNotification {...props} />,
  },
  {
    value: 'event',
    label: 'Event',
    icon: <Iconify icon="mdi:calendar-outline" width={20} />,
    component: (props: INotificationComponentProps) => <EventNotification {...props} />,
  },
  {
    value: 'survey',
    label: 'Survey',
    icon: <Iconify icon="mdi:clipboard-outline" width={20} />,
    component: (props: INotificationComponentProps) => <SurveyNotification {...props} />,
  },
];

const NotificationSettingScreen = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'announcement' });
  const dialog = useBoolean(false);

  /**
   * Memoization Justification:
   * Prevents re-calculation of currentActiveComponent on every render.
   * Only re-calculates when the tab in searchParams changes.
   */
  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams?.tab]
  );

  /**
   * Memoization Justification:
   * Prevents re-calculation of currentIndex on every render.
   * Only re-calculates when the tab in searchParams changes.
   */
  const currentIndex = useMemo(
    () => TABS.findIndex((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );

  const [isViewMode, setIsViewMode] = useState(false);
  const [isBackClick, setIsBackClick] = useState(false);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {dialog.value ? (
        <CustomBreadcrumbs
          heading={isViewMode ? 'View Notification' : 'Edit Notification'}
          description="Configure notifications for announcements, events, and surveys."
          links={[
            { name: 'Communication', href: '/communication/dashboard' },
            { name: 'Notification', href: '/communication/notification/notificationSetting' },
            { name: 'Notification Setting' },
          ]}
          isBack
          onBack={() => {
            dialog.onFalse();
          }}
          sx={{ px: 2 }}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Notification Setting"
          description="Configure notifications for announcements, events, and surveys."
          links={[
            { name: 'Communication', href: '/communication/dashboard' },
            { name: 'Notification', href: '/communication/notification/notificationSetting' },
            { name: 'Notification Setting' },
          ]}
          sx={{ px: 2 }}
        />
      )}

      {!dialog.value && (
        <CustomTabs
          value={searchParams.tab}
          onChange={(e, value) => {
            const newIndex = TABS.findIndex((tab) => tab.value === value);
            setIsBackClick(currentIndex > newIndex);
            setSearchParams({ tab: value });
          }}
          sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 }, mb: 1, borderRadius: 2 }}
          role="tablist"
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} icon={tab.icon} />
          ))}
        </CustomTabs>
      )}
      <FormSlider
        steps={TABS}
        isBackClick={isBackClick}
        step={currentIndex}
        containerProps={{
          sx: {
            p: 0,
            minHeight: 0,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Box sx={{ height: '100%', flex: 1 }}>
          {currentActiveComponent?.component && (
            <currentActiveComponent.component dialog={dialog} setIsViewMode={setIsViewMode} />
          )}
        </Box>
      </FormSlider>
    </Box>
  );
};

export default NotificationSettingScreen;
