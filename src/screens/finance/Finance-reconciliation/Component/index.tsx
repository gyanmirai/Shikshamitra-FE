'use client';

import React, { useMemo, useState } from 'react';

import { Box, Tab, Card, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSearchParam } from 'src/hooks/use-search-param';

import { FormSlider } from 'src/screens/student/enrollment/register/register-form';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import Overview from './Overview';
import Discrepancy from './Discrepancy';
import BankStatements from './BankStatements';
import BankStatementUploadDialog from './BankStatementUploadDialog';

const TABS = [
  {
    icon: <Iconify icon="material-symbols:overview" width={20} />,
    value: 'overviewCreation',
    label: 'Overview',
    component: (props: any) => <Overview {...props} />,
  },
  {
    icon: <Iconify icon="hugeicons:git-compare" width={20} />,
    value: 'discrepancyCreation',
    label: 'Discrepancy',

    component: (props: any) => <Discrepancy {...props} />,
  },
  {
    icon: <Iconify icon="guidance:bank" width={20} />,
    value: 'bankStatements',
    label: 'Bank Statements',
    component: (props: any) => <BankStatements {...props} />,
  },
];

const FinanceReconciliation = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'overviewCreation' });

  const addOverviewDialog = useBoolean(false);
  const addDiscrepancyDialog = useBoolean(false);
  const addBankStatementsDialog = useBoolean(false);
  const uploadBankStatementDialog = useBoolean(false);

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams.tab),
    [searchParams.tab]
  );

  const currentIndex = useMemo(
    () => TABS.findIndex((tab) => tab.value === searchParams.tab),
    [searchParams.tab]
  );
  const [isBack, setIsBack] = useState(false);

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Reconciliation"
        description="This section helps you compare recorded transactions with bank statements to ensure financial records match, quickly identify matched, unmatched, and discrepant transactions."
        links={[
          { name: 'Finance', href: '/finance' },
          { name: 'Reconciliation', href: '/finance/reconciliation' },
        ]}
        action={
          searchParams.tab === 'overviewCreation' ? (
            <Button
              variant="contained"
              startIcon={<Iconify icon="material-symbols:upload" />}
              onClick={uploadBankStatementDialog.onTrue}
              sx={{
                backgroundColor: 'black',
                color: 'white',
                fontSize: '14px',
                fontWeight: 500,
                px: 3,
                py: 1,
                borderRadius: 1,
              }}
              size="small"
            >
              Upload Bank Statement
            </Button>
          ) : null
        }
      />
      <Card
        sx={{
          '& *': {
            fontSize: '13px !important',
            '& svg': {
              fontSize: '18px !important',
            },
          },
          marginTop: 2,
        }}
      >
        <CustomTabs
          value={searchParams.tab}
          onChange={(e, value) => {
            const newIndex = TABS.findIndex((tab) => tab.value === value);
            if (currentIndex > newIndex) {
              setIsBack(true);
            } else {
              setIsBack(false);
            }
            setSearchParams({ tab: value });
          }}
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} icon={tab.icon} />
          ))}
        </CustomTabs>
      </Card>
      <FormSlider steps={TABS} isBackClick={isBack} step={currentIndex}>
        <Scrollbar sx={{ p: 1, marginLeft: -3 }}>
          {currentActiveComponent?.component && (
            <currentActiveComponent.component
              addOverviewDialog={addOverviewDialog}
              addDiscrepancyDialog={addDiscrepancyDialog}
              addBankStatementsDialog={addBankStatementsDialog}
            />
          )}
        </Scrollbar>
      </FormSlider>

      <BankStatementUploadDialog
        open={uploadBankStatementDialog.value}
        onClose={uploadBankStatementDialog.onFalse}
      />
    </Box>
  );
};

export default FinanceReconciliation;
