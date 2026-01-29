'use client';

import { Box, Tab } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { CustomTabs } from 'src/components/custom-tabs';
import { Iconify } from 'src/components/iconify/iconify';
import { useSearchParam } from 'src/hooks/use-search-param';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { FormSlider } from 'src/screens/student/enrollment/register/register-form';

import BookNotificationManagement from './Components/BookNotification';
import MemberNotificationManagement from './Components/MemberNotification';
import TransactionNotificationManagement from './Components/TransactionNotification';

const TABS = [
  {
    value: 'bookManagement',
    label: 'Book Management',
    icon: <Iconify icon="mdi:book-outline" width={20} />,
    component: (props: any) => <BookNotificationManagement {...props} />,
  },
  {
    value: 'memberManagement',
    label: 'Member Management',
    icon: <Iconify icon="mdi:account-outline" width={20} />,
    component: (props: any) => <MemberNotificationManagement {...props} />,
  },
  {
    value: 'transactions',
    label: 'Transactions',
    icon: <Iconify icon="mdi:swap-horizontal" width={20} />,
    component: (props: any) => <TransactionNotificationManagement {...props} />,
  },
];

const LibraryNotificationScreen = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'bookManagement' });
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
      {dialog.value ? (
        <CustomBreadcrumbs
          heading={isViewMode ? 'View Notification' : 'Edit Notification'}
          description="Configure notifications for library book, member, and transaction management."
          links={[
            { name: 'Library', href: '/library/dashboard' },
            {
              name: 'Notification',
              href: '/library/notification',
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
          description="Configure notifications for library book, member, and transaction management."
          links={[
            { name: 'Library', href: '/library/dashboard' },
            { name: 'Notification', href: '/library/notification' },
          ]}
          sx={{ px: 1 }}
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
          sx={{
            '& .MuiTabs-flexContainer': { gap: 1.5 },
            mb: 1,
            p: 0,
          }}
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

export default LibraryNotificationScreen;
