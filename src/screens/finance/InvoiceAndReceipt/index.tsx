'use client';

import { Add } from '@mui/icons-material';
import React, { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Tab, Box, Card, Button } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';
import { useCustomSearchParams } from 'src/hooks/use-search-param';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { FormSlider } from 'src/screens/student/enrollment/register/register-form';

import ReceiptManagement from './Components/ReceiptManagement';

const TABS = [
  {
    value: 'receipt',
    label: 'Receipts',
    icon: <Iconify icon="mdi:receipt" width={20} />,
    component: (props: any) => <ReceiptManagement {...props} />,
  },
  // {
  //   value: 'invoice',
  //   label: 'Invoices',
  //   icon: <Iconify icon="mdi:file-document-outline" width={20} />,
  //   component: (props: any) => <InvoiceManagement {...props} />,
  // }
];

const InvoiceAndReceipt = () => {
  const { getParam, setParam } = useCustomSearchParams();
  const activeTab = getParam('tab') || 'receipt';
  const addInvoiceDialog = useBoolean(false);
  const [isBackClick, setIsBackClick] = useState(false);

  const currentIndex = useMemo(() => TABS.findIndex((tab) => tab.value === activeTab), [activeTab]);

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
    () => TABS.find((tab) => tab.value === activeTab),
    [activeTab]
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Invoice & Receipt"
        description="View and manage all generated student invoices, with options to preview, download, and share with parents."
        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Fees', href: '/finance/invoice-receipt' },
          { name: 'Invoice & Receipts' },
        ]}
        action={activeTab === 'invoice' && renderButton.invoice}
      />
      <Card
        sx={{
          pb: 1,
          '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
        }}
      >
        <CustomTabs
          value={activeTab}
          onChange={(e, value) => {
            const newIndex = TABS.findIndex((tab) => tab.value === value);
            setIsBackClick(currentIndex > newIndex);
            setParam('tab', String(value));
          }}
          sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 } }}
          role="tablist"
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} icon={tab.icon} />
          ))}
        </CustomTabs>
      </Card>
      <FormSlider
        steps={TABS}
        isBackClick={isBackClick}
        step={currentIndex}
        containerProps={{
          sx: { p: 0, minHeight: 0, display: 'flex', flexDirection: 'column', flexGrow: 1 },
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {currentActiveComponent?.component && (
            <currentActiveComponent.component addInvoiceDialog={addInvoiceDialog} />
          )}
        </Box>
      </FormSlider>
    </Box>
  );
};

export default InvoiceAndReceipt;
