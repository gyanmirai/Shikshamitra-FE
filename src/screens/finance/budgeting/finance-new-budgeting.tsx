'use client';

import React, { useState } from 'react';

import { Box, Tab, Button, Typography } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';
import { useBoolean } from 'src/hooks/use-boolean';

import { formatNumber } from 'src/utils/formate_number';

import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { incomeData, expenseData } from './budgeting_data/budgeting_data';
import FinanceNewBudgetCreateDialog from './component/finance-new-budget-create-dialog';

import type { IncomeCategory, ExpenseCategory } from './budgeting_data/budgeting_data';

const FinanceNewBudgetingScreen = () => {
  const tabs = useTabs('income');
  const dialog = useBoolean();

  const [isEdit, setIsEdit] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<IncomeCategory | ExpenseCategory | null>(null);
  const [open, setOpen] = useState(false);

  const TABS = [
    { value: 'income', label: 'Income', total: formatNumber(80000) },
    { value: 'expenses', label: 'Expenses', total: formatNumber(60000) },
  ];

  const openNewEntryDialog = () => {
    setIsEdit(false);
    setSelectedEntry(null);
    setOpen(true);
  };

  const openEditDialog = (entry: IncomeCategory | ExpenseCategory) => {
    setIsEdit(true);
    setSelectedEntry(entry);
    setOpen(true);
  };

  return (
    <>
      {open ? (
        <FinanceNewBudgetCreateDialog
          onSave={() => {}}
          dialogValue={dialog.value}
          onClose={() => setOpen(false)}
          data={selectedEntry}
          edit={isEdit}
        />
      ) : (
        <>
          <CustomBreadcrumbs
            heading="Budgeting"
            links={[{ name: 'Finance' }, { name: 'Budgeting' }]}
            sx={{ px: 1, mb: 2 }}
          />

          <CustomTabs
            value={tabs.value}
            onChange={tabs.onChange}
            variant="fullWidth"
            sx={{ my: 3, borderRadius: 2 }}
          >
            {TABS.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Iconify
                      width={24}
                      icon={
                        tab.value === 'expenses'
                          ? 'eva:diagonal-arrow-right-up-fill'
                          : 'eva:diagonal-arrow-left-down-fill'
                      }
                    />
                    <Box>
                      <Typography variant="subtitle2">{tab.label}</Typography>
                      <Typography variant="h4">₹ {tab.total}</Typography>
                    </Box>
                  </Box>
                }
              />
            ))}
          </CustomTabs>

          <Box display="flex" justifyContent="flex-end" py={2}>
            <Button onClick={openNewEntryDialog} variant="contained" size="small">
              Create New Budget
            </Button>
          </Box>

          <Box>
            {tabs.value === 'income' && (
              <CustomizableTable
                tableId="income-table"
                columns={[
                  { id: 'name', label: 'Income Category' },
                  {
                    id: 'totalAmountExpected',
                    label: 'Total Expected',
                    render: (value) => formatNumber(value, 'INR'),
                  },
                  {
                    id: 'collectedAmount',
                    label: 'Collected',
                    render: (value) => formatNumber(value, 'INR'),
                  },
                  {
                    id: 'outstandingAmount',
                    label: 'Outstanding',
                    render: (value) => formatNumber(value, 'INR'),
                  },
                  { id: 'receivedPercentage', label: 'Received Percentage' },
                  {
                    id: 'action',
                    label: 'Action',
                    render: (_, row) => (
                      <ThreeDotsActions
                        showEditIcon
                        handleEditClick={() => openEditDialog(row as IncomeCategory)}
                      />
                    ),
                  },
                ]}
                data={incomeData}
              />
            )}

            {tabs.value === 'expenses' && (
              <CustomizableTable
                tableId="expenses-table"
                columns={[
                  { id: 'name', label: 'Expense Category' },
                  {
                    id: 'allocatedAmount',
                    label: 'Allocated Amount',
                    render: (value) => formatNumber(value, 'INR'),
                  },
                  {
                    id: 'spentAmount',
                    label: 'Spent Amount',
                    render: (value) => formatNumber(value, 'INR'),
                  },
                  {
                    id: 'remainingAmount',
                    label: 'Remaining Amount',
                    render: (value) => formatNumber(value, 'INR'),
                  },
                  { id: 'expensePercentage', label: 'Expense Percentage %' },
                  {
                    id: 'action',
                    label: 'Action',
                    render: (_, row) => (
                      <ThreeDotsActions
                        showEditIcon
                        handleEditClick={() => openEditDialog(row as ExpenseCategory)}
                      />
                    ),
                  },
                ]}
                data={expenseData}
              />
            )}
          </Box>
        </>
      )}
    </>
  );
};

export default FinanceNewBudgetingScreen;
