import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

const monthlyFeeCollectedData = [
  { fileName: 'monthlyFeeCollectionData' },
  { date: '01-01-2024', totalFees: '2500', collectedFees: '2000', pendingFees: '500' },
  { date: '01-02-2024', totalFees: '2600', collectedFees: '2100', pendingFees: '500' },
  { date: '01-03-2024', totalFees: '2400', collectedFees: '1800', pendingFees: '600' },
  { date: '01-04-2024', totalFees: '2700', collectedFees: '2200', pendingFees: '500' },
  { date: '01-05-2024', totalFees: '2800', collectedFees: '2300', pendingFees: '500' },
  { date: '01-06-2024', totalFees: '3000', collectedFees: '2700', pendingFees: '300' },
];

const columns: any = [
  { id: 'date', label: 'Date/Month' },
  { id: 'totalFees', label: 'Total Fees' },
  { id: 'collectedFees', label: 'Collected Fees' },
  { id: 'pendingFees', label: 'Pending Fees' },
];
const gradeWiseFeeCollectedData = [
  { grade: 1, totalFees: '250000', collectedFees: '200000.00', pendingFees: '50000.00' },
  { grade: 2, totalFees: '500000', collectedFees: '400000.00', pendingFees: '100000.00' },
  { grade: 3, totalFees: '500000', collectedFees: '400000.00', pendingFees: '100000.00' },
  { grade: 4, totalFees: '550000', collectedFees: '440000.00', pendingFees: '110000.00' },
  { grade: 5, totalFees: '350000', collectedFees: '280000.00', pendingFees: '70000.00' },
];

const gradeWiseFeeCollectionColumns: any = [
  { id: 'grade', label: 'Grade' },
  { id: 'totalFees', label: 'Total Fees' },
  { id: 'collectedFees', label: 'Collected Fees' },
  { id: 'pendingFees', label: 'Pending Fees' },
];

const pendingFeeData = [
  {
    grade: 1,
    studentName: 'Aarav',
    feeType: 'Tuition Fees',
    amount: '5000',
    dueDate: '20-11-2024',
  },
  {
    grade: 1,
    studentName: 'Vanya',
    feeType: 'Tuition Fees',
    amount: '4500',
    dueDate: '15-11-2024',
  },
  {
    grade: 1,
    studentName: 'Reyansh',
    feeType: 'Tuition Fees',
    amount: '7000',
    dueDate: '10-11-2024',
  },
  { grade: 1, studentName: 'Ira', feeType: 'Sports Fees', amount: '6000', dueDate: '25-11-2024' },
  { grade: 1, studentName: 'Vihaan', feeType: 'Art Fees', amount: '6500', dueDate: '30-11-2024' },
];

const pendingFeeColumns: any = [
  { id: 'studentName', label: 'Student Name' },
  { id: 'grade', label: 'Grade' },
  { id: 'feeType', label: 'Fee Type' },
  { id: 'amount', label: 'Amount' },
  { id: 'dueDate', label: 'Due Date' },
];

const overduePaymentsData = [
  {
    grade: 1,
    studentName: 'Aarav',
    feeType: 'Tuition Fees',
    overDueAmount: '5000',
    daysOverDue: '10 days',
    dueDate: '05-10-2024',
  },
  {
    grade: 1,
    studentName: 'Vanya',
    feeType: 'Activity Fees',
    overDueAmount: '4500',
    daysOverDue: '15 days',
    dueDate: '30-09-2024',
  },
  {
    grade: 1,
    studentName: 'Reyansh',
    feeType: 'Sports Fees',
    overDueAmount: '7000',
    daysOverDue: '5 days',
    dueDate: '15-10-2024',
  },
  {
    grade: 1,
    studentName: 'Ira',
    feeType: 'Tuition Fees',
    overDueAmount: '6000',
    daysOverDue: '20 days',
    dueDate: '25-09-2024',
  },
  {
    grade: 1,
    studentName: 'Vihaan',
    feeType: 'Art Fees',
    overDueAmount: '6500',
    daysOverDue: '12 days',
    dueDate: '28-09-2024',
  },
];

const overduePaymentsColumns: any = [
  { id: 'studentName', label: 'Student Name' },
  { id: 'grade', label: 'Grade' },
  { id: 'feeType', label: 'Fee Type' },
  { id: 'overDueAmount', label: 'Overdue Amount' },
  { id: 'dueDate', label: 'Due Date' },
  { id: 'daysOverDue', label: 'Days Overdue' },
];
const FinancialReportsScreen = () => {
  const [reportType, setReportType] = useState('monthlyFeesCollected');

  return (
    <>
      <Box display="flex" flexDirection="row" gap={1} justifyItems="center" alignItems="center">
        <CustomSelect
          label="Report Type"
          options={[
            { value: 'monthlyFeesCollected', label: 'Monthly Fees Collected' },
            { value: 'gradeWiseFeeCollection', label: 'Grade-Wise Fee Collection' },
            { value: 'pendingFees', label: 'Pending Fees' },
            { value: 'overduePayments', label: 'Overdue Payments' },
          ]}
          value={reportType}
          onChange={(e: any) => {
            setReportType(e);
          }}
          formControlProps={{ sx: { minWidth: 150 } }}
        />
        <DatePicker
          label="Start Date"
          slotProps={{
            textField: {
              sx: { width: '100%', maxWidth: '200px' },
              size: 'small',
            },
          }}
        />
        <DatePicker
          label="End Date"
          slotProps={{
            textField: {
              sx: { width: '100%', maxWidth: '200px' },
              size: 'small',
            },
          }}
        />
        {/* <CustomSelect
                    label="Grade/Class"
                    options={[]}
                    value=""
                    onChange={() => { }}
                    formControlProps={{ sx: { minWidth: 120 } }}
                />
                <CustomSelect
                    label="Division"
                    options={[]}
                    value=""
                    onChange={() => { }}
                    formControlProps={{ sx: { minWidth: 120 } }}
                />
                <CustomSelect
                    label="Payment Status"
                    options={[]}
                    value=""
                    onChange={() => { }}
                    formControlProps={{ sx: { minWidth: 140 } }}
                /> */}
      </Box>
      {reportType === 'monthlyFeesCollected' && (
        <>
          {' '}
          <Typography variant="h6" sx={{ pt: '15px' }}>
            Monthly Fees Collected
          </Typography>
          <CustomizableTable
            columns={columns}
            data={monthlyFeeCollectedData}
            tableId="monthly-fee-collected"
          />
          <Box py="15px" display="flex" justifyContent="flex-end">
            {/* <Button variant="contained" size="small">
                    Export
                </Button> */}
          </Box>
        </>
      )}

      {reportType === 'gradeWiseFeeCollection' && (
        <>
          {' '}
          <Typography variant="h6" sx={{ pt: '15px' }}>
            Grade-Wise Fee Collection
          </Typography>
          <CustomizableTable
            columns={gradeWiseFeeCollectionColumns}
            data={gradeWiseFeeCollectedData}
            tableId="grade-wise-fee-collection"
          />
          <Box py="15px" display="flex" justifyContent="flex-end">
            {/* <Button variant="contained" size="small">
                    Export
                </Button> */}
          </Box>
        </>
      )}
      {reportType === 'pendingFees' && (
        <>
          <Typography variant="h6" sx={{ pt: '15px' }}>
            Pending Fees
          </Typography>
          <CustomizableTable
            columns={pendingFeeColumns}
            data={pendingFeeData}
            tableId="pending-fee"
          />
          <Box pt="15px" pb="15px" display="flex" justifyContent="flex-end">
            {/* <Button variant="contained" size="small">
                    Export
                </Button> */}
          </Box>
        </>
      )}
      {reportType === 'overduePayments' && (
        <>
          <Typography variant="h6" sx={{ pt: '15px' }}>
            Overdue Payments
          </Typography>
          <CustomizableTable
            columns={overduePaymentsColumns}
            data={overduePaymentsData}
            tableId="overdue-payments"
          />
          <Box pt="15px" pb="15px" display="flex" justifyContent="flex-end">
            {/* <Button variant="contained" size="small">
                    Export
                </Button> */}
          </Box>
        </>
      )}
    </>
  );
};

export default FinancialReportsScreen;
