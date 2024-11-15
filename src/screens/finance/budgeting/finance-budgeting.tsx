// 'use client';

// import * as yup from 'yup';
// import React, { useState } from 'react';

// import { DatePicker } from '@mui/x-date-pickers';
// import { Box, Button, MenuItem, MenuList, TextField } from '@mui/material';

// import { useBoolean } from 'src/hooks/use-boolean';

// import { Iconify } from 'src/components/iconify';
// import CustomDialog from 'src/components/customDialog';
// import CustomSelect from 'src/components/custom-select';
// import ThreeDotsActions from 'src/components/three-dots-actions';
// import CustomizableTable from 'src/components/customizabaleTable';
// import { CustomStepperWithFormik } from 'src/components/custom-stepper';

// import FinanceBudgetAllocationDialog from './component/finance-budget-allocation-dialog';
// import FinanceBudgetEditBudgetDialog from './component/finance-budget-edit-budget-dialog';

// interface Data {
//   budgetTitle: string;
//   totalAmountAllocated: string;
//   spent: string;
//   remainingBudget: string;
//   startDate: string;
//   endDate: string;
//   departmentBreaked: string;
//   id: number;
//   action?: string;
// }

// let data: Data[] = [
//   {
//     id: 1,
//     budgetTitle: 'Salaries',
//     totalAmountAllocated: '500000',
//     spent: 'Online',
//     remainingBudget: '12000',
//     startDate: '12-03-2024',
//     endDate: '12-06-2025',
//     departmentBreaked: 'Teacher',
//     action: 'edit',
//   },
// ];
// const FinanceBudgetingScreen = () => {
//   const dialog = useBoolean();
//   const dialogAllocated = useBoolean();
//   const dialogEdit = useBoolean();
//   const [selectedEntry, setSelectedEntry] = useState(data);
//   const [isEdit, setIsEdit] = useState(false);
//   const [tableData, setTableData] = useState(data);

//   const closeDialogAllocated = () => {
//     // setIsEdit(false);
//     dialogAllocated.onFalse();
//   };

//   const closeDialogEdit = () => {
//     setIsEdit(false);
//     dialogEdit.onFalse();
//   };

//   const handleDelete = (item: any) => {
//     data = data.filter((val) => val.id !== item.id || val.id !== item.id);

//     setTableData([...data]);
//   };

//   const handleSave = (item: any) => {
//     // expenseData = expenseData.filter(val =>
//     //     (val.id) !== (item.id)
//     // );
//     // setTableData([...expenseData]);
//   };

//   return (
//     <>
//       <Box gap={3} display="flex" flexDirection="row" justifyContent="flex-end">
//         <Button onClick={dialog.onTrue} variant="contained" size="small">
//           Create New Budget
//         </Button>
//       </Box>
//       {/* <Box>
//                 <Typography component="span" variant="h6" gutterBottom>
//                     Income OverView
//                 </Typography>
//             </Box> */}

//       <CustomizableTable
//         columns={[
//           { id: 'budgetTitle', label: 'Budget Title' },
//           { id: 'totalAmountAllocated', label: 'Total Amount Allocated' },
//           { id: 'spent', label: 'Spent' },
//           { id: 'remainingBudget', label: 'Remaining Budget' },
//           { id: 'startDate', label: 'Start Date' },
//           { id: 'endDate', label: 'End Date' },
//           { id: 'departmentBreaked', label: 'Department Breaked' },
//           {
//             id: 'action',
//             label: 'Action',
//             render(value, row: any) {
//               return (
//                 <ThreeDotsActions
//                   actions={({ popover }: any) => (
//                     <MenuList>
//                       <MenuItem
//                         onClick={() => {
//                           setIsEdit(true);
//                           setSelectedEntry(row);

//                           dialogEdit.onTrue();
//                         }}
//                       >
//                         <Iconify icon="solar:pen-bold" />
//                         Edit
//                       </MenuItem>
//                       <MenuItem
//                         onClick={() => {
//                           dialogAllocated.onTrue();
//                         }}
//                       >
//                         <Iconify icon="solar:pen-bold" />
//                         AllocatedToBudget
//                       </MenuItem>
//                     </MenuList>
//                   )}
//                 />
//               );
//             },
//           },
//         ]}
//         data={tableData}
//       />
//       <CustomDialog
//         maxWidth="sm"
//         open={dialog.value}
//         handleClose={dialog.onFalse}
//         title="New Budget"
//       >
//         <TimetableForm />
//       </CustomDialog>

//       <Box>
//         {dialogAllocated.value && selectedEntry && (
//           <FinanceBudgetAllocationDialog
//             onSave={handleSave}
//             dialogValue={dialogAllocated.value}
//             onClose={closeDialogAllocated}
//             data={selectedEntry}
//             isEdit={isEdit}
//             allData={tableData}
//           />
//         )}
//         {dialogEdit.value && selectedEntry && (
//           <FinanceBudgetEditBudgetDialog
//             onSave={handleSave}
//             dialogValue={dialogEdit.value}
//             onClose={closeDialogEdit}
//             data={selectedEntry}
//             isEdit={isEdit}
//             allData={tableData}
//           />
//         )}
//       </Box>
//     </>
//   );
// };

// export default FinanceBudgetingScreen;

// const BudgetTitleAndTimePeriod = () => (
//   <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
//     <TextField
//       name="Budgettitle"
//       label="Budget Title"
//       value=""
//       onChange={() => {}}
//       size="small"

//       // error={formik.touched.paymentAmount && Boolean(formik.errors.paymentAmount)}
//       // helperText={formik.touched.paymentAmount && formik.errors.paymentAmount}
//     />

//     <DatePicker label="Start Date" slotProps={{ textField: { size: 'small' } }} />
//     <DatePicker label="End Date" slotProps={{ textField: { size: 'small' } }} />
//   </Box>
// );

// const DepartmentAllocation = () => (
//   <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
//     <CustomSelect
//       options={[]}
//       label="Select departments"
//       name="selectDepartments"
//       value=""
//       onChange={() => {}}
//       formControlProps={{ sx: { maxWidth: 300, width: '100%' } }}
//     />
//     <TextField
//       name="fundallocation"
//       label="Fund allocation"
//       value=""
//       onChange={() => {}}
//       size="small"

//       // error={formik.touched.paymentAmount && Boolean(formik.errors.paymentAmount)}
//       // helperText={formik.touched.paymentAmount && formik.errors.paymentAmount}
//     />
//   </Box>
// );

// const CategoryAllocation = () => (
//   <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
//     <CustomSelect
//       options={[]}
//       label="Categories within departments"
//       name="categoriesWithinDepartments"
//       value=""
//       onChange={() => {}}
//       formControlProps={{ sx: { maxWidth: 300, width: '100%' } }}
//     />
//     <TextField
//       name="fundallocation"
//       label="Fund allocation"
//       value=""
//       onChange={() => {}}
//       size="small"

//       // error={formik.touched.paymentAmount && Boolean(formik.errors.paymentAmount)}
//       // helperText={formik.touched.paymentAmount && formik.errors.paymentAmount}
//     />
//   </Box>
// );

// const TotalBudget = () => (
//   <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
//     <TextField
//       name="totalBudget"
//       label="Total Budget"
//       value=""
//       onChange={() => {}}
//       size="small"

//       // error={formik.touched.paymentAmount && Boolean(formik.errors.paymentAmount)}
//       // helperText={formik.touched.paymentAmount && formik.errors.paymentAmount}
//     />
//     <TextField
//       name="fundallocation"
//       label="Fund allocation"
//       value=""
//       onChange={() => {}}
//       size="small"

//       // error={formik.touched.paymentAmount && Boolean(formik.errors.paymentAmount)}
//       // helperText={formik.touched.paymentAmount && formik.errors.paymentAmount}
//     />
//   </Box>
// );
// const allTimetableSteps = [
//   BudgetTitleAndTimePeriod,
//   DepartmentAllocation,
//   CategoryAllocation,
//   TotalBudget,
// ];

// const TimetableForm = () => {
//   const [activeStep, setActiveStep] = useState(0);
//   return (
//     <CustomStepperWithFormik
//       initialValues={{}}
//       steps={[
//         'Budget Title & Time Period',
//         'Department Allocation',
//         'Category Allocation',
//         'Total Budget',
//       ]}
//       activeStep={activeStep}
//       handleBack={() => {
//         setActiveStep(activeStep - 1);
//       }}
//       // validationSchema={validationSchema[activeStep as keyof typeof validationSchema]}
//       validationSchema={yup.object().shape({})}
//       handleNext={(isLastStep, _values) => {
//         if (isLastStep) return;
//         setActiveStep(activeStep + 1);
//       }}
//       renderItem={({ formik, activeStep: step }: any) => {
//         const StepComponent = allTimetableSteps[step];
//         return (
//           <Box p={2}>
//             <StepComponent />
//           </Box>
//         );
//       }}
//     />
//   );
// };
import React from 'react';

import {
  Table,
  Paper,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  TableContainer,
} from '@mui/material';

// Function to get the color based on amount
const getExpenseColor = (amount: any) => (amount > 0 ? 'red' : 'green'); // Red for spent > 0, Green for remaining
const getIncomeColor = (amount: any) => (amount > 0 ? 'green' : 'red'); // Green for collected > 0, Red for outstanding
const formatNumber = (num: any) => new Intl.NumberFormat().format(num);

const FinanceBudgetingScreen = () => {
  const budgetData = {
    incomeCategories: [
      {
        id: 'income_01',
        name: 'Tuition Fees',
        totalAmountExpected: 150000,
        collectedAmount: 0,
        outstandingAmount: 150000,
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
        allocatedAmount: 100000,
        spentAmount: 0,
        remainingAmount: 100000,
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
  const totalIncome = budgetData.incomeCategories.reduce(
    (acc, curr) => acc + curr.totalAmountExpected,
    0
  );
  const totalExpenses = budgetData.expenseCategories.reduce(
    (acc, curr) => acc + curr.allocatedAmount,
    0
  );
  const netBudget = totalIncome - totalExpenses;
  return (
    <>
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
      <div>
        {/* Income Table */}
        <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
          <Table sx={{ minWidth: 650 }} aria-label="income table">
            <TableHead>
              <TableRow>
                <TableCell align="center">IncomeCategory</TableCell>
                <TableCell align="right">Total Expected</TableCell>
                <TableCell align="right">Collected</TableCell>
                <TableCell align="right">Outstanding</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {budgetData.incomeCategories.map((income) => (
                <TableRow key={income.id}>
                  <TableCell align="center">{income.name}</TableCell>
                  <TableCell align="right">{formatNumber(income.totalAmountExpected)}</TableCell>
                  <TableCell
                    align="right"
                    style={{ color: getIncomeColor(income.collectedAmount) }}
                  >
                    {formatNumber(income.collectedAmount)}
                  </TableCell>
                  <TableCell
                    align="right"
                    style={{ color: getIncomeColor(income.outstandingAmount) }}
                  >
                    {formatNumber(income.outstandingAmount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Expense Table */}
        <TableContainer component={Paper} sx={{ marginBottom: 2 }}>
          <Table sx={{ minWidth: 650 }} aria-label="expense table">
            <TableHead>
              <TableRow>
                <TableCell align="center">Expense Category</TableCell>
                <TableCell align="right">Total Allocated</TableCell>
                <TableCell align="right">Spent</TableCell>
                <TableCell align="right">Remaining</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {budgetData.expenseCategories.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell align="center">{expense.name}</TableCell>
                  <TableCell align="right">{formatNumber(expense.allocatedAmount)}</TableCell>
                  <TableCell align="right" style={{ color: getExpenseColor(expense.spentAmount) }}>
                    {formatNumber(expense.spentAmount)}
                  </TableCell>
                  <TableCell
                    align="right"
                    style={{ color: getExpenseColor(expense.remainingAmount) }}
                  >
                    {formatNumber(expense.remainingAmount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Net Budgeted Balance */}
        <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
          Net Budgeted Balance: {formatNumber(netBudget)}
        </Typography>
      </div>
    </>
  );
};

export default FinanceBudgetingScreen;
