'use client';

import React, { useState } from 'react';

import { Box, Tab, Button, Tooltip, useTheme, MenuList, MenuItem, Typography } from '@mui/material';

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

  return (
    <>
      <CustomBreadcrumbs
        heading="Budgeting"
        links={[{ name: 'Finance' }, { name: 'Budgeting' }]}
        sx={{ px: 1, mb: 2 }}
      />
      {/* <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="center">Category Type</TableCell>
            <TableCell align="center">Category</TableCell>
            <TableCell align="center">Total Amount</TableCell>
            <TableCell align="center">Collected/Spent</TableCell>
            <TableCell align="center">Outstanding/Remaining</TableCell>
          </TableRow>
        </TableHead>
        <TableBody> */}
      {/* Income Categories */}
      {/* {budgetData.incomeCategories.map((income) => (
            <TableRow key={income.id}>
              <TableCell align="center">Income</TableCell>
              <TableCell align="center">{income.name}</TableCell>
              <TableCell align="center">${income.totalAmountExpected}</TableCell>
              <TableCell align="center" style={{ color: getIncomeColor(income.collectedAmount) }}>
                ${income.collectedAmount}
              </TableCell>
              <TableCell align="center" style={{ color: getIncomeColor(income.outstandingAmount) }}>
                ${income.outstandingAmount}
              </TableCell>
            </TableRow>
          ))} */}

      {/* Expense Categories */}
      {/* {budgetData.expenseCategories.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell align="center">Expense</TableCell>
              <TableCell align="center">{expense.name}</TableCell>
              <TableCell align="center">${expense.allocatedAmount}</TableCell>
              <TableCell align="center" style={{ color: getExpenseColor(expense.spentAmount) }}>
                ${expense.spentAmount}
              </TableCell>
              <TableCell align="center" style={{ color: getExpenseColor(expense.remainingAmount) }}>
                ${expense.remainingAmount}
              </TableCell>
            </TableRow>
          ))} */}

      {/* Net Budget Summary (Surplus/Deficit) */}
      {/* <TableRow>
            <TableCell colSpan={2} align="center"><strong>Net Budgeted Balance</strong></TableCell>
            <TableCell align="center" colSpan={3}>
              <strong>
                ${budgetData.incomeCategories.reduce((acc, curr) => acc + curr.totalAmountExpected, 0) - 
                budgetData.expenseCategories.reduce((acc, curr) => acc + curr.allocatedAmount, 0)}
              </strong>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer> */}
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
                      <Iconify width={16} icon="eva:info-outline" sx={{ color: 'text.disabled' }} />
                    </Tooltip>
                  </Box>

                  <Box sx={{ typography: 'h4' }}>₹ {tab.total}</Box>
                </div>

                {/* <Label
                color={tab.percent < 0 ? 'error' : 'success'}
                startIcon={
                  <Iconify
                    width={24}
                    icon={
                      tab.percent < 0
                        ? 'solar:double-alt-arrow-down-bold-duotone'
                        : 'solar:double-alt-arrow-up-bold-duotone'
                    }
                  />
                }
                sx={{ top: 8, right: 8, position: { md: 'absolute' } }}
              >
                {tab.percent > 0 && '+'}
                {tab.percent}
              </Label> */}
              </Box>
            }
          />
        ))}
      </CustomTabs>
      <Box py="15px" gap={3} display="flex" flexDirection="row" justifyContent="flex-end">
        <Button onClick={dialog.onTrue} variant="contained" size="small">
          Create New Budget
        </Button>
      </Box>
      <div>
        {/* Income Table */}
        {tabs.value === 'income' && (
          <CustomizableTable
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
                      actions={({ popover }: any) => (
                        <MenuList>
                          <MenuItem
                            onClick={() => {
                              setIsEdit(true);
                              setSelectedEntry(row);
                              dialog.onTrue();
                              popover.onClose();
                              console.log('income', row);
                            }}
                          >
                            <Iconify icon="solar:pen-bold" />
                            Edit
                          </MenuItem>
                        </MenuList>
                      )}
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
                      actions={({ popover }: any) => (
                        <MenuList>
                          <MenuItem
                            onClick={() => {
                              setIsEdit(true);
                              setSelectedEntry(row);
                              dialog.onTrue();
                              popover.onClose();
                              console.log('income', row);
                            }}
                          >
                            <Iconify icon="solar:pen-bold" />
                            Edit
                          </MenuItem>
                        </MenuList>
                      )}
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

        {/* Net Budgeted Balance */}
        {/* <Typography variant="h6" sx={{ textAlign: 'end' }}>
          Net Budgeted Balance : 
          <span
            style={{
              color: netBudget > 0 ? 'black' : netBudget < 0 ? 'black' : 'black',
            paddingLeft: '5px',
            }}
          >
             {formatNumber(netBudget)}
          </span>
        </Typography> */}

        <Box pb="20px" />
      </div>
      {dialog.value && (
        <FinanceNewBudgetCreateDialog
          onSave={addNewBudgetHandler}
          dialogValue={dialog.value}
          onClose={closeDialog}
          data={selectedEntry}
          edit={isEdit}
        />
      )}
    </>
  );
};

export default FinanceNewBudgetingScreen;

/* <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
          <Table sx={{ minWidth: 650 }} aria-label="income table">
            <TableHead>
              <TableRow>
                <TableCell align="center">Income Category</TableCell>
                <TableCell align="right">Total Expected</TableCell>
                <TableCell align="right">Collected</TableCell>
                <TableCell align="right">Outstanding</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              budgetData.incomeCategories.map((income: any) => (
                <TableRow key={income.id}>
                  <TableCell align="center">{income.name}</TableCell>
                  <TableCell align="right">{formatNumber(income.totalAmountExpected)}</TableCell>
                  <TableCell align="right" style={{ color: getIncomeColor(income.collectedAmount) }}>
                    {formatNumber(income.collectedAmount)}
                  </TableCell>
                  <TableCell align="right" style={{ color: getIncomeColor(income.outstandingAmount) }}>
                    {formatNumber(income.outstandingAmount)}
                  </TableCell>
                  <TableCell align="right"> <ThreeDotsActions
                    actions={({ popover, }: any) => (
                      <MenuList>
                        <MenuItem
                          onClick={() => {
                            setIsEdit(true);
                            setSelectedEntry(income)
                            dialog.onTrue();
                            popover.onClose();
                            console.log("income", income)
                          }}
                        >
                          <Iconify icon="solar:pen-bold" />
                          Edit
                        </MenuItem>

                      </MenuList>
                    )}
                  /></TableCell>
                </TableRow>
              ))
            </TableBody>
          </Table>
        </TableContainer> */

// <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
//   <Table sx={{ minWidth: 650 }} aria-label="expense table">
//     <TableHead>
//       <TableRow>
//         <TableCell align="center">Expense Category</TableCell>
//         <TableCell align="right">Total Allocated</TableCell>
//         <TableCell align="right">Spent</TableCell>
//         <TableCell align="right">Remaining</TableCell>
//         <TableCell align="right">Action</TableCell>
//       </TableRow>
//     </TableHead>
//     <TableBody>
//       {budgetData.expenseCategories.map((expense: any) => (
//         <TableRow key={expense.id}>
//           <TableCell align="center">{expense.name}</TableCell>
//           <TableCell align="right">{formatNumber(expense.allocatedAmount)}</TableCell>
//           <TableCell align="right" style={{ color: getExpenseColor(expense.spentAmount) }}>
//             {formatNumber(expense.spentAmount)}
//           </TableCell>
//           <TableCell align="right" style={{ color: getExpenseColor(expense.remainingAmount) }}>
//             {formatNumber(expense.remainingAmount)}
//           </TableCell>
//           <TableCell align="right"> <ThreeDotsActions
//             actions={({ popover, }: any) => (
//               <MenuList>
//                 <MenuItem
//                   onClick={() => {
//                     setIsEdit(true);
//                     setSelectedEntry(expense)
//                     dialog.onTrue();
//                     popover.onClose();
//                     console.log("expense", expense)
//                   }}
//                 >
//                   <Iconify icon="solar:pen-bold" />
//                   Edit
//                 </MenuItem>

//               </MenuList>
//             )}
//           /></TableCell>
//         </TableRow>
//       ))}
//     </TableBody>
//   </Table>
// </TableContainer> */}
