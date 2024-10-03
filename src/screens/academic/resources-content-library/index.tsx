'use client';

import React from 'react';

import { Box, Tab, Card } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import Setting from './setting';
import Favorite from './favorite';
import Dashboard from './dashboard';
import Categories from './categories';
import AllResources from './all-resources';
import SharedWithMe from './shared-with-me';
import UploadContent from './upload-content';

const TABS = [
  {
    value: 'dashboard',
    label: 'Dashboard',
    component: () => <Dashboard />,
  },
  {
    value: 'allResources',
    label: 'All Resources',
    component: () => <AllResources />,
  },
  {
    value: 'categories',
    label: 'Categories',
    component: () => <Categories />,
  },

  {
    value: 'uploadContent',
    label: 'Upload Content',
    component: () => <UploadContent />,
  },
  {
    value: 'sharedWithMe',
    label: 'Shared with Me',
    component: () => <SharedWithMe />,
  },
  {
    value: 'favorites',
    label: 'Favorites',
    component: () => <Favorite />,
  },

  { value: 'settings', label: 'Settings', component: () => <Setting /> },
];

const ResourceContentLibraryScreen = () => {
  const tabs = useTabs('dashboard');

  const CurrentComponent = TABS.find((tab) => tab.value === tabs.value)?.component;

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Resources and Content Library"
        links={[{ name: 'Academic And Assessment' }, { name: 'Resources and Content Library' }]}
        sx={{ px: 1, mb: 2 }}
      />

      <Card
        sx={{
          '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
        }}
      >
        <CustomTabs
          value={tabs.value}
          onChange={tabs.onChange}
          variant="fullWidth"
          slotProps={{ tab: { px: 0 } }}
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </CustomTabs>
      </Card>
      <Box px={1} pt={2}>
        {CurrentComponent?.()}
      </Box>
    </Box>
  );
};

export default ResourceContentLibraryScreen;
