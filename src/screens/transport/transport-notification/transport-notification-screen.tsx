'use client';

import { Box, Tab } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import { FormSlider } from 'src/components/form-slider';
import { Iconify } from 'src/components/iconify/iconify';
import { useSearchParam } from 'src/hooks/use-search-param';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import TransportRouteNotificationManagementScreen from './component/transport-route-notification-management-screen';
import TransportVehicleNotificationManagementScreen from './component/transport-vehicle-notification-management-screen';

const TABS = [
  {
    label: 'Route and Schedule',
    value: 'routeAndSchedule',
    icon: <Iconify icon="la:route" width={20} />,
    component: (props: any) => <TransportRouteNotificationManagementScreen {...props} />,
  },
  {
    label: 'Vehicle',
    value: 'vehicle',
    icon: <Iconify icon="tdesign:vehicle" width={20} />,
    component: (props: any) => <TransportVehicleNotificationManagementScreen {...props} />,
  },
];

const TransportNotificationScreen = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'routeAndSchedule' });
  const dialog = useBoolean(false);
  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams?.tab]
  );
  const currentIndex = useMemo(
    () => TABS.findIndex((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );
  const [isViewMode, setIsViewMode] = useState(false);
  const [isBackClick, setIsBackClick] = useState(false);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {dialog?.value ? (
        <CustomBreadcrumbs
          heading={isViewMode ? 'View Notification' : 'Edit Notification'}
          description="Configure notifications for transport routes, schedules, and vehicles."
          links={[
            { name: 'Transport', href: '/transport/dashboard' },
            {
              name: 'Notification',
              href: '/transport/notification',
              onClick(e) {
                dialog.onFalse();
              },
            },
            isViewMode ? { name: 'View Notification' } : { name: 'Edit Notification' },
          ]}
          isBack
          onBack={() => {
            dialog.onFalse();
          }}
          sx={{ px: 1 }}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Notification"
          description="Configure notifications for transport routes, schedules, and vehicles."
          links={[
            { name: 'Transport', href: '/transport/dashboard' },
            { name: 'Notification', href: '/transport/notification' },
          ]}
          sx={{ px: 1 }}
        />
      )}

      {!dialog?.value && (
        <CustomTabs
          value={searchParams.tab}
          onChange={(e, value) => {
            const newIndex = TABS.findIndex((tab) => tab.value === value);
            if (currentIndex > newIndex) {
              setIsBackClick(true);
            } else {
              setIsBackClick(false);
            }
            setSearchParams({ tab: value });
          }}
          sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 } }}
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
          },
        }}
      >
        <Scrollbar sx={{ p: 1 }}>
          {currentActiveComponent?.component && (
            <currentActiveComponent.component dialog={dialog} setIsViewMode={setIsViewMode} />
          )}
        </Scrollbar>
      </FormSlider>
    </Box>
  );
};

export default TransportNotificationScreen;
