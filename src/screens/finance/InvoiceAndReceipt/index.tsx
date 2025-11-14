'use client';

import React, { useMemo } from 'react';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import { Tab, Box, Card, Button } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';
import { useSearchParam } from 'src/hooks/use-search-param';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import InvoiceManagement from './Components/InvoiceManagement';
import ReceiptManagement from './Components/ReceiptManagement';

const TABS = [
  {
    value: 'invoice',
    label: 'Invoices',
    icon: <Iconify icon="mdi:file-document-outline" width={20} />,
    component: (props: any) => <InvoiceManagement {...props} />,
  },
  {
    value: 'receipt',
    label: 'Receipts',
    icon: <Iconify icon="mdi:receipt" width={20} />,
    component: (props: any) => <ReceiptManagement {...props} />,
  },
];

const InvoiceAndReceipt = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'invoice' });
  const addInvoiceDialog = useBoolean(false);

  const renderButton = useMemo(
    () => ({
      invoice: (
        <Button
          sx={{ width: '160px' }}
          startIcon={<Add />}
          variant="contained"
          onClick={addInvoiceDialog.onTrue}
          size="small"
        >
          Generate Invoice
        </Button>
      ),
    }),
    [addInvoiceDialog.onTrue]
  );

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Invoice & Receipt"
        description="View and manage all generated student invoices, with options to preview, download, and share with parents."
        links={[{ name: 'Finance', href: '/finance/dashboard' }, { name: 'Invoice & Receipt' }]}
        sx={{ mb: 2 }}
        action={searchParams.tab === 'invoice' && renderButton[searchParams.tab]}
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
          <currentActiveComponent.component addInvoiceDialog={addInvoiceDialog} />
        )}
      </Scrollbar>
    </Box>
  );
};

export default InvoiceAndReceipt;
