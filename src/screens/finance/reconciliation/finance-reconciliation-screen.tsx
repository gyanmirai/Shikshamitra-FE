'use client';

import React, { useMemo } from 'react';

import { Box, Tab, Card } from '@mui/material';

import { useSearchParam } from 'src/hooks/use-search-param';

import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import FinanceBounceTab from './finance-bounce-checklist-tab';
import FinanceReconciliationTab from './finance-reconciliation-tab';

const TABS = [
  {
    value: 'reconciliation-list',
    label: 'Reconciliation',
    icon: <Iconify icon="stash:feed-duotone" width={20} />,
    component: () => <FinanceReconciliationTab />,
  },
  {
    value: 'bounce-cheque-list',
    label: 'Bounce Cheque Details',
    icon: <Iconify icon="fluent:check-24-filled" width={20} />,
    component: () => <FinanceBounceTab />,
  },
];

const FinanceReconciliationScreen = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'reconciliation-list' });

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Reconciliation"
        links={[
          { name: 'Finance' },
          { name: 'Reconciliation' },
          {
            name:
              searchParams.tab === 'reconciliation-list'
                ? 'Reconciliation'
                : 'Bounce Cheque Details',
          },
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

export default FinanceReconciliationScreen;
