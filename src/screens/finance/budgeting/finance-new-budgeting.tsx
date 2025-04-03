'use client';

import React, { useState } from 'react';

import { Box, Tab, Button, Tooltip, useTheme, Typography } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';
import { useBoolean } from 'src/hooks/use-boolean';

import { formatNumber } from 'src/utils/formate_number';

import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import FinanceNewBudgetCreateDialog from './component/finance-new-budget-create-dialog';
import { incomeData, expenseData, budgetDummyData } from './budgeting_data/budgeting_data';

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
  const theme = useTheme();
  const newEntryHandler = () => {
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
      {/* this dialog is for allocating budget for current financial year */}
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
            links={[{ name: 'Finance', href: '/finance/dashboard' }, { name: 'Budgeting' }]}
            sx={{ px: 1, mb: 2 }}
            description="The Budget screen provides an overview of income and expenses based on the selected tab. Easily track financial allocations and monitor spending for better financial planning."
          />

          {/* custome tabs to switching the tab between category and income */}

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
              <Tab
                key={tab.value}
                value={tab.value}
                label={
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
                        color: 'primary.lighter',
                        justifyContent: 'center',
                        bgcolor: 'primary.darker',
                        display: { xs: 'none', md: 'inline-flex' },
                        ...(tab.value === 'expenses' && {
                          color: 'warning.lighter',
                          bgcolor: 'warning.darker',
                        }),
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
                                ? budgetDummyData.incomeCategories
                                    .map((e: any) => e.name)
                                    .join('\n')
                                : budgetDummyData.expenseCategories
                                    .map((e: any) => e.name)
                                    .join('\n')}
                            </Box>
                          }
                          placement="top"
                        >
                          <Iconify
                            width={16}
                            icon="eva:info-outline"
                            sx={{ color: 'text.disabled' }}
                          />
                        </Tooltip>
                      </Box>

                      <Box sx={{ typography: 'h4' }}>₹ {tab.total}</Box>
                    </div>
                  </Box>
                }
              />
            ))}
          </CustomTabs>

          {/* button for allocating budget to new category */}
          <Box py="15px" gap={3} display="flex" flexDirection="row" justifyContent="flex-end">
            <Button onClick={newEntryHandler} variant="contained" size="small">
              Create New Budget
            </Button>
          </Box>

          {/* render table based on user selected type income / expense */}
          <Box>
            {tabs.value === 'income' && (
              <CustomizableTable
                tableId="income-table"
                columns={[
                  { id: 'name', label: 'Income Category' },
                  {
                    id: 'totalAmountExpected',
                    label: 'Total Expected ',
                    render(value) {
                      return <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>;
                    },
                  },
                  {
                    id: 'collectedAmount',
                    label: 'Collected',
                    render(value) {
                      return <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>;
                    },
                  },
                  {
                    id: 'outstandingAmount',
                    label: 'Outstanding',
                    render(value) {
                      return <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>;
                    },
                  },
                  { id: 'receivedPercantage', label: 'Received Percantage' },

                  {
                    id: 'action',
                    label: 'Action',
                    render(value, row) {
                      return (
                        <ThreeDotsActions
                          placement="right-top"
                          showThreeDots={false}
                          showEditIcon
                          handleEditClick={() => {
                            setIsEdit(true);
                            setSelectedEntry(row as IncomeCategory);
                            setOpen(true);
                            // dialog.onTrue();
                          }}
                        />
                      );
                    },
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
                    render(value) {
                      return <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>;
                    },
                  },
                  {
                    id: 'spentAmount',
                    label: 'Spent Amount',
                    render(value) {
                      return <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>;
                    },
                  },
                  {
                    id: 'remainingAmount',
                    label: 'Remaining Amount',
                    render(value) {
                      return <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>;
                    },
                  },
                  { id: 'expensePercantage', label: 'Expense Percantage %' },
                  {
                    id: 'action',
                    label: 'Action',
                    render(value, row) {
                      return (
                        <ThreeDotsActions
                          placement="right-bottom"
                          showThreeDots={false}
                          showEditIcon
                          handleEditClick={() => {
                            setIsEdit(true);
                            setSelectedEntry(row as ExpenseCategory);
                            // dialog.onTrue();
                            setOpen(true);
                          }}
                        />
                      );
                    },
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
