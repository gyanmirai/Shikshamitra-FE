'use client';

import React, { useState } from 'react';

import { Box, Button, TextField } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import CustomSelect from 'src/components/custom-select';

import FinanceNewCollectFeeDialog from './component/finance-new-fee-collect-dialog';
import FinanceCollectFeeStudentCardComponent from './component/finance-collect-fee-student-card-component';
import FinanceFeeCollectionPaymentHistoryComponent from './component/finance-fee-collection-payment-history-component';

import type { IUserCard } from './component/finance-collect-fee-student-card-component';

const dummyUser: IUserCard = {
  id: '12345',
  name: 'John Doe',
  role: 'Content Creator',
  coverUrl: 'https://example.com/cover.jpg',
  avatarUrl: 'https://example.com/avatar.jpg',
  totalPosts: 120,
  totalFollowers: 4500,
  totalFollowing: 300,
};

const students = [
  { 
   studentId:123,
   name: "John Doe",
   grade: 10,
   paymentTerm: "Monthly",
   totalPending:38000,
   totalPaid:40000,
   discountAmount:0,
   fixedReduction:0,
   overAllDueDate:"20-04-2025",
   totalFees:78000,
   totalDueAfterDiscount:0,
   fees: [
     {
       feeHeadId:198,
       feeHead: "Tuition",
       totalFees:60000,
       amount: 5000,
       paymentDates: [
         { month:"June-2024",  date: "15-01-2024", status: "Paid" },
         {month:"July-2024" ,  date: "15-02-2024", status: "Paid" },
         { month:"Aug-2024",   date: "15-03-2024", status: "Paid" },
         { month:"Sep-2024",   date: "15-03-2024", status: "Paid" },
         { month:"Oct-2024",   date: "15-03-2024", status: "Paid" },
         { month:"Nov-2024",   date: "15-03-2024", status: "Paid" },
         { month:"Dec-2024",   date: "15-03-2024", status: "Paid" },
         { month:"Jan-2025",   date: "15-03-2024", status: "Paid" },
         { month:"Feb-2025",   date: "15-03-2024", status: "Unpaid" },
         { month:"April-2025", date: "15-03-2024", status: "Unpaid" },
         { month:"May-2025",   date: "15-03-2024", status: "Unpaid" },
       ],
     },
     {
       feeHeadId:230,
       feeHead: "Library",
       totalFees:18000,
       amount: 1500,
       paymentDates: [
         { month:"June-2024",date: "15-01-2024", status: "Paid" },
         {month:"July-2024" ,date: "15-02-2024", status: "Paid" },
         { month:"Aug-2024",date: "15-03-2024", status: "Paid" },
         { month:"Sep-2024",date: "15-03-2024", status: "Paid" },
         { month:"Oct-2024",date: "15-03-2024", status: "Paid" },
         { month:"Nov-2024",date: "15-03-2024", status: "Paid" },
         { month:"Dec-2024",date: "15-03-2024", status: "Paid" },
         { month:"Jan-2025",date: "15-03-2024", status: "Paid" },
         { month:"Feb-2025",date: "15-03-2024", status: "Unpaid" },
         { month:"April-2025",date: "15-03-2024", status: "Unpaid" },
         { month:"May-2025",date: "15-03-2024", status: "Unpaid" },
       ],
     },
    
   ],}
 ];
 
const FinanceFeeCollectionTab = () => {
  const dialog = useBoolean();

  const [selectedEntry, setSelectedEntry] = useState(dummyUser);
  const [isEdit, setIsEdit] = useState(false);
  const [tableData, setTableData] = useState(dummyUser);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const closeDialog = () => {
    dialog.onFalse();
  };

  const handleSave = () => {};

  return (
    <>
      <Box py="15px" display="flex" flexDirection="row" gap={3}>
        <CustomSelect
          label="Class/Grade"
          options={[]}
          value=""
          onChange={() => {}}
          formControlProps={{ sx: { minWidth: 140 } }}
        />
        <CustomSelect
          label="Division"
          options={[]}
          value=""
          onChange={() => {}}
          formControlProps={{ sx: { minWidth: 140 } }}
        />
        <TextField
          label="Search by student name"
          variant="outlined"
          size="small"
          value=""
          onChange={(e) => {
            console.log(e);
          }}
        />
      </Box>
      <Box pl="20px" pb="15px" display="flex" justifyContent="flex-end" alignItems="flex-end">
        <Button
          variant="contained"
          // sx={{
          //   '&:hover': {
          //     backgroundColor: 'inherit',
          //     boxShadow: 'none',
          //   },
          //   backgroundColor: 'skyblue',
          //   color: 'darkblue',
          // }}
          onClick={() => {
            setSelectedStudent(students[0])
            setIsEdit(true);
            dialog.onTrue();
          }}
        >
          Collect Fees
        </Button>
      </Box>

      <FinanceCollectFeeStudentCardComponent user={dummyUser} />
      <FinanceFeeCollectionPaymentHistoryComponent />
      {/* {dialog.value && selectedEntry && (
        <FinanceCollectFeeDialog
          onSave={handleSave}
          dialogValue={dialog.value}
          onClose={closeDialog}
          data={selectedStudent}
          isEdit={false}
          allData={tableData}
        />
      )} */}
       {dialog.value && selectedEntry && (
        <FinanceNewCollectFeeDialog
          onSave={handleSave}
          dialogValue={dialog.value}
          onClose={closeDialog}
          data={selectedStudent}
          isEdit={false}
          allData={tableData}
        />
      )}
     
    </>
  );
};

export default FinanceFeeCollectionTab;
