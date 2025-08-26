'use client';

import React, { useMemo } from 'react';

import { Add } from '@mui/icons-material';
import { Tab, Box, Card, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSearchParam } from 'src/hooks/use-search-param';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import ChargesManage from './Components/ChargesManage';
import ApproveManage from './Components/ApprovalManage';

const TABS = [
  {
    value: 'charge',
    label: 'Fee Charges',
    icon: <Iconify icon="mdi:cash" width={20} />,
    component: (props: any) => <ChargesManage {...props} />,
  },
  {
    value: 'other',
    label: 'Other Charges',
    icon: <Iconify icon="mdi:cash-multiple" width={20} />,
    component: (props: any) => <ApproveManage {...props} />,
  },
];

const ChargesManagement = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'charge' });
  const addChargeDialog = useBoolean(false);

  const renderButton = useMemo(
    () => ({
      charge: (
        <Button
          sx={{ width: '160px' }}
          startIcon={<Add />}
          variant="contained"
          onClick={addChargeDialog.onTrue}
          size="small"
        >
          Charge
        </Button>
      ),
    }),
    [addChargeDialog.onTrue]
  );

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Charges Management"
        description="This screen shows a list of all existing charges with an option to create a new one. charges including tuition fees, exam fees, and other miscellaneous charges."
        links={[{ name: 'Finance', href: '/finance/dashboard' }, { name: 'Charges Management' }]}
        sx={{ px: 1, mb: 2 }}
        action={searchParams.tab === 'charge' && renderButton[searchParams.tab]}
      />
      <Card
        sx={{
          '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
        }}
      >
        <CustomTabs
          value={searchParams.tab}
          onChange={(e, value) => setSearchParams({ tab: value })}
          sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 } }}
          role="tablist"
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} icon={tab.icon} />
          ))}
        </CustomTabs>
      </Card>
      <Scrollbar sx={{ p: 1 }}>
        {currentActiveComponent?.component && (
          <currentActiveComponent.component addChargeDialog={addChargeDialog} />
        )}
      </Scrollbar>
    </Box>
  );
};

export default ChargesManagement;
