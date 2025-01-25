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

const getExpenseColor = (amount: any) => (amount > 0 ? 'red' : 'green');
const getIncomeColor = (amount: any) => (amount > 0 ? 'green' : 'red');
const FinanceNewBudgetingScreen = () => {
  const budgetDummyData = {
    expenseCategoryId: '345',
    incomeCategoryId: '123',
    incomeCategories: [
      {
        id: 'income_01',
        name: 'Tuition Fees',
        totalAmountExpected: 300000000,
        collectedAmount: 0,
        outstandingAmount: 300000000,
      },
      {
        id: 'income_02',
        name: 'Donations',
        totalAmountExpected: 50000,
        collectedAmount: 0,
        outstandingAmount: 50000,
      },
      {
        id: 'income_03',
        name: 'Government Grants',
        totalAmountExpected: 30000,
        collectedAmount: 0,
        outstandingAmount: 30000,
      },
    ],
    expenseCategories: [
      {
        id: 'expense_01',
        name: 'Salaries',
        allocatedAmount: 10000000,
        spentAmount: 0,
        remainingAmount: 10000000,
      },
      {
        id: 'expense_02',
        name: 'Maintenance',
        allocatedAmount: 40000,
        spentAmount: 0,
        remainingAmount: 40000,
      },
      {
        id: 'expense_03',
        name: 'Educational Supplies',
        allocatedAmount: 20000,
        spentAmount: 0,
        remainingAmount: 20000,
      },
    ],
  };

  const dialog = useBoolean();
  const calculateNetBudget = (data: any) => {
    const totalIncome = data.incomeCategories.reduce(
      (acc: any, curr: any) => acc + curr.totalAmountExpected,
      0
    );
    const totalExpenses = data.expenseCategories.reduce(
      (acc: any, curr: any) => acc + curr.allocatedAmount,
      0
    );
    return totalIncome - totalExpenses;
  };
  const [budgetData, setNewBudgetData] = useState<any>(budgetDummyData);
  const [netBudget, setNetBudget] = useState(calculateNetBudget(budgetDummyData));
  const [isEdit, setIsEdit] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>();

  const closeDialog = () => {
    setIsEdit(false);
    dialog.onFalse();
  };

  const addNewBudgetHandler = (data: any) => {
    console.log('data for adding new budget', data);
    const { categoryType, categoryName, fundAllocation } = data;

    const categoryNameHandler = (type: string, name: string) => {
      const expenseNames: { [key: string]: string } = {
        expense_01: 'Salaries',
        expense_02: 'Maintenance',
        expense_03: 'Educational Supplies',
      };

      const incomeNames: { [key: string]: string } = {
        income_01: 'Tuition Fees',
        income_02: 'Donations',
        income_03: 'Government Grants',
      };

      return type === '345' ? expenseNames[name] : incomeNames[name] || 'Unknown Category';
    };

    // Handling Expense Categories
    if (categoryType === '345') {
      const dataForExpense = {
        id: categoryName,
        name: categoryNameHandler(categoryType, categoryName),
        allocatedAmount: fundAllocation,
        spentAmount: 0,
        remainingAmount: fundAllocation,
      };
      setNewBudgetData((prevBudgetData: any) => {
        const updatedData = {
          ...prevBudgetData,
          expenseCategories: [...prevBudgetData.expenseCategories, dataForExpense],
        };
        setNetBudget(calculateNetBudget(updatedData));
        return updatedData;
      });
      console.log('Expense Data:', dataForExpense);

      // Handling Income Categories
    } else if (categoryType === '123') {
      const dataForIncome = {
        id: categoryName,
        name: categoryNameHandler(categoryType, categoryName),
        totalAmountExpected: fundAllocation,
        collectedAmount: 0,
        outstandingAmount: fundAllocation,
      };
      setNewBudgetData((prevBudgetData: any) => {
        const updatedData = {
          ...prevBudgetData,
          incomeCategories: [...prevBudgetData.incomeCategories, dataForIncome],
        };
        setNetBudget(calculateNetBudget(updatedData));
        return updatedData;
      });

      console.log('Income Data:', dataForIncome);
    }
    closeDialog();
  };
  const TABS = [
    {
      value: 'income',
      label: 'Income',
      // percent: 8.2,
      total: formatNumber(80000),
    },
    {
      value: 'expenses',
      label: 'Expenses',
      // percent: -6.6,
      total: formatNumber(60000),
    },
  ];
  const tabs = useTabs('income');
  const theme = useTheme();

  const [open, setOpen] = useState(false);
  const newEntryHandler = () => {
    setIsEdit(false);
    setOpen(true);
  };

  const closeHandler = () => {
    setIsEdit(false);
    setOpen(false);
  };

  return (
    <>
      {open ? (
        <FinanceNewBudgetCreateDialog
          onSave={addNewBudgetHandler}
          dialogValue={dialog.value}
          onClose={closeHandler}
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
                                ? budgetData.incomeCategories.map((e: any) => e.name).join('\n')
                                : budgetData.expenseCategories.map((e: any) => e.name).join('\n')}
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
          <Box py="15px" gap={3} display="flex" flexDirection="row" justifyContent="flex-end">
            <Button onClick={newEntryHandler} variant="contained" size="small">
              Create New Budget
            </Button>
          </Box>
          <div>
            {/* Income Table */}
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
                            setSelectedEntry(row);
                            setOpen(true);
                            // dialog.onTrue();
                          }}
                        />
                      );
                    },
                  },
                ]}
                data={[
                  {
                    id: 'income_01',
                    name: 'Tuition Fees',
                    totalAmountExpected: 150000000,
                    collectedAmount: 0,
                    outstandingAmount: 150000000,
                    receivedPercantage: '0 %',
                  },
                  {
                    id: 'income_02',
                    name: 'Donations',
                    totalAmountExpected: 50000,
                    collectedAmount: 0,
                    outstandingAmount: 50000,
                    receivedPercantage: '0 %',
                  },
                  {
                    id: 'income_03',
                    name: 'Government Grants',
                    totalAmountExpected: 30000,
                    collectedAmount: 0,
                    outstandingAmount: 30000,
                    receivedPercantage: '0 %',
                  },
                  {
                    id: 'income_03',
                    name: 'Total',
                    totalAmountExpected: 80000,
                    collectedAmount: 0,
                    outstandingAmount: 80000,
                    receivedPercantage: '0 %',
                  },
                ]}
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
                            setSelectedEntry(row);
                            // dialog.onTrue();
                            setOpen(true);
                          }}
                        />
                      );
                    },
                  },
                ]}
                data={[
                  {
                    id: 'expense_01',
                    name: 'Salaries',
                    allocatedAmount: 100000000,
                    spentAmount: 0,
                    remainingAmount: 100000000,
                    expensePercantage: '0 %',
                  },
                  {
                    id: 'expense_02',
                    name: 'Maintenance',
                    allocatedAmount: 40000,
                    spentAmount: 0,
                    remainingAmount: 40000,
                    expensePercantage: '0 %',
                  },
                  {
                    id: 'expense_03',
                    name: 'Educational Supplies',
                    allocatedAmount: 20000,
                    spentAmount: 0,
                    remainingAmount: 20000,
                    expensePercantage: '0 %',
                  },
                  {
                    id: 'expense_03',
                    name: 'Total',
                    allocatedAmount: 60000,
                    spentAmount: 0,
                    remainingAmount: 60000,
                    expensePercantage: '0 %',
                  },
                ]}
              />
            )}

            <Box pb="20px" />
          </div>
        </>
      )}
    </>
  );
};

export default FinanceNewBudgetingScreen;
