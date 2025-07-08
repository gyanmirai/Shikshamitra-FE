'use client';

import React, { useState } from 'react';

import { Add } from '@mui/icons-material';
import { Box, Tab, Button, Tooltip, useTheme, Typography } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';
import { useBoolean } from 'src/hooks/use-boolean';

import { formatNumber } from 'src/utils/formate_number';

import budgetData from 'src/json/finance/budget/budgetData.json';
import budgetExpenseData from 'src/json/finance/budget/budgetIncomeData.json';
import budgetIncomeData from 'src/json/finance/budget/budgetExpenseData.json';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import { CustomTabs } from 'src/components/custom-tabs';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import FinanceNewBudgetCreateDialog from './component/finance-new-budget-create-dialog';

import type { IIncomeCategory, IExpenseCategory } from './interface/budgeting_interface';

const TABS = [
  { value: 'income', label: 'Income', total: formatNumber(80000) },
  { value: 'expenses', label: 'Expenses', total: formatNumber(60000) },
];

const FinanceNewBudgetingScreen = () => {
  const theme = useTheme();
  const tabs = useTabs('income');
  const budgetDialog = useBoolean();

  const [isEdit, setIsEdit] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<IIncomeCategory | IExpenseCategory | null>(
    null
  );

  const handleNewEntry = () => {
    setIsEdit(false);
    setSelectedEntry(null);
    budgetDialog.onTrue();
  };

  const handleEditEntry = (entry: IIncomeCategory | IExpenseCategory) => {
    setIsEdit(true);
    setSelectedEntry(entry);
    budgetDialog.onTrue();
  };

  const renderTabLabel = (tab: (typeof TABS)[0]) => (
    <Box
      sx={{
        width: 1,
        display: 'flex',
        gap: { xs: 1, md: 2.5 },
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'center', md: 'flex-start' },
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          flexShrink: 0,
          borderRadius: '50%',
          alignItems: 'center',
          color: tab.value === 'expenses' ? 'warning.lighter' : 'primary.lighter',
          bgcolor: tab.value === 'expenses' ? 'warning.darker' : 'primary.darker',
          justifyContent: 'center',
          display: { xs: 'none', md: 'inline-flex' },
        }}
      >
        <Iconify
          width={24}
          icon={
            tab.value === 'expenses'
              ? 'eva:diagonal-arrow-right-up-fill'
              : 'eva:diagonal-arrow-left-down-fill'
          }
        />
      </Box>

      <div>
        <Box
          sx={{
            mb: 1,
            gap: 0.5,
            display: 'flex',
            alignItems: 'center',
            typography: 'subtitle2',
          }}
        >
          {tab.label}
          <Tooltip
            title={
              <Box sx={{ whiteSpace: 'pre-line' }}>
                {tab.value === 'income'
                  ? budgetData.incomeCategories.map((e: any) => e.name).join('\n')
                  : budgetData.expenseCategories.map((e: any) => e.name).join('\n')}
              </Box>
            }
            placement="top"
          >
            <Iconify width={16} icon="eva:info-outline" sx={{ color: 'text.disabled' }} />
          </Tooltip>
        </Box>
        <Box sx={{ typography: 'h4' }}>₹ {tab.total}</Box>
      </div>
    </Box>
  );

  const renderTableColumns = (type: 'income' | 'expenses') => {
    const commonColumns = {
      name: { id: 'name', label: type === 'income' ? 'Income Category' : 'Expense Category' },
      action: {
        id: 'action',
        label: 'Action',
        isFilter: false,
        isSort: false,
        align: 'right' as const,
        sticky: true,
        render: (_: any, row: any) => (
          <ThreeDotsActions
            showThreeDots={false}
            showEditIcon
            handleEditClick={() => handleEditEntry(row)}
          />
        ),
      },
    };

    const formatColumn = (id: string, label: string) => ({
      id,
      label,
      filterType: 'formattedNumber',
      render: (value: number) => (
        <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>
      ),
    });

    return type === 'income'
      ? [
          commonColumns.name,
          formatColumn('totalAmountExpected', 'Total Expected'),
          formatColumn('collectedAmount', 'Collected'),
          formatColumn('outstandingAmount', 'Outstanding'),
          { id: 'receivedPercantage', label: 'Received Percantage' },
          commonColumns.action,
        ]
      : [
          commonColumns.name,
          formatColumn('allocatedAmount', 'Allocated Amount'),
          formatColumn('spentAmount', 'Spent Amount'),
          formatColumn('remainingAmount', 'Remaining Amount'),
          { id: 'expensePercantage', label: 'Expense Percantage %' },
          commonColumns.action,
        ];
  };

  return (
    <>
      <CustomBreadcrumbs
        heading="Budgeting"
        links={[{ name: 'Finance', href: '/finance/dashboard' }, { name: 'Budgeting' }]}
        sx={{ px: 1, mb: 2 }}
        description="The Budget screen provides an overview of income and expenses based on the selected tab. Easily track financial allocations and monitor spending for better financial planning."
      />

      <CustomTabs
        value={tabs.value}
        onChange={tabs.onChange}
        variant="fullWidth"
        sx={{ my: 3, borderRadius: 2 }}
        slotProps={{
          indicator: { borderRadius: 1.5, boxShadow: theme.customShadows.z4 },
          tab: { p: 3 },
        }}
      >
        {TABS.map((tab) => (
          <Tab key={tab.value} value={tab.value} label={renderTabLabel(tab)} />
        ))}
      </CustomTabs>

      <Box py="15px" gap={3} display="flex" flexDirection="row" justifyContent="flex-end">
        <Button startIcon={<Add />} onClick={handleNewEntry} variant="contained" size="small">
          Budget
        </Button>
      </Box>

      <Box>
        <CustomizableTable
          noDataText={
            <>
              No budget has been created yet for {tabs.value} categories. Please set up a budget to
              track expected vs. actual collections.
              <Box
                color="primary.main"
                fontWeight={600}
                onClick={() => setOpen(true)}
                sx={{
                  textDecoration: 'none',
                  '&:hover': {
                    cursor: 'pointer',
                    color: 'primary.main',
                    textDecoration: 'underline',
                  },
                }}
              >
                Create Budget
              </Box>
            </>
          }
          tableId={`${tabs.value}-table`}
          columns={renderTableColumns(tabs.value as 'income' | 'expenses')}
          data={tabs.value === 'income' ? budgetIncomeData : budgetExpenseData}
        />
      </Box>

      {budgetDialog.value && (
        <CustomDialog
          handleClose={budgetDialog.onFalse}
          open={budgetDialog.value}
          title={isEdit ? 'Edit Budget' : 'Create Budget'}
          maxWidth="md"
        >
          <FinanceNewBudgetCreateDialog
            onSave={() => {}}
            dialogValue={open}
            onClose={() => setOpen(false)}
            data={selectedEntry}
            edit={isEdit}
            activeTab={tabs.value as string}
          />
        </CustomDialog>
      )}
    </>
  );
};

export default FinanceNewBudgetingScreen;
