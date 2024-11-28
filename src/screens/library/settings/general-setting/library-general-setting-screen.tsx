'use client'

import React, { useMemo } from 'react';

import { Box, Tab, Card } from '@mui/material';

import { useSearchParam } from 'src/hooks/use-search-param';

import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import LibraryLoanSetting from './component/library-loan-setting';
import LibraryTimingSetting from './component/library-timing-setting';
import LibraryBookAndTagsSetting from './component/library-book-and-tags-setting';

const TABS = [
  {
    value: 'library-timings',
    label: 'Library Timings',
    icon: <Iconify icon="stash:feed-duotone" width={20} />,
    component: () => <LibraryTimingSetting />,
  },
  {
    value: 'loan-policies',
    label: 'Loan Policies',
    icon: <Iconify icon="fluent-mdl2:account-management" width={20} />,
    component: () => <LibraryLoanSetting />,
  },
  {
    value: 'book-categories-and-tags',
    label: 'Book Categories and Tags',
    icon: <Iconify icon="fluent-mdl2:account-management" width={20} />,
    component: () => <LibraryBookAndTagsSetting />,
  },
];

const LibraryGeneralSettingScreen = () => {


  const [searchParams, setSearchParams] = useSearchParam({ tab: 'library-timings' });

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );

  return (
    <Box>
      <CustomBreadcrumbs
        heading="General Setting"
        links={[
          { name: 'Library' },
          { name: 'General Setting' },
          // {
          //   name:
          //     searchParams.tab !== 'Fee-structure-overview'
          //       ? 'Student Fee Management'
          //       : 'Fee-Structure-Overview',
          // },
        ]}
        sx={{ px: 1, mb: 2 }}
      />
      <Card>
        <CustomTabs
          value={searchParams.tab}
          onChange={(e, value) => setSearchParams({ tab: value })}
          sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 } }}
          role="tablist"
        >
          {TABS.map((tab) => (
            <Tab
              sx={{ fontSize: '12px' }}
              icon={tab.icon}
              key={tab.value}
              value={tab.value}
              label={tab.label}
            />
          ))}
        </CustomTabs>
      </Card>
      <Box px={1} pt={2}>
        {currentActiveComponent?.component && (
          <currentActiveComponent.component
          // searchParams={searchParams}
          // setSearchParams={setSearchParams}
          />
        )}
      </Box>
    </Box>
  );
};

export default LibraryGeneralSettingScreen;
