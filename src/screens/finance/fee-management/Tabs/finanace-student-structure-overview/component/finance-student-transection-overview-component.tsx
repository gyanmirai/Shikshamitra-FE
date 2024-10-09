import { Box , MenuItem, MenuList, TextField, Typography} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import React, {useState, useEffect} from 'react'
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { useBoolean } from 'src/hooks/use-boolean';
import FinanceStudentUpdatePaymentDialog from './finance-student-update-payment-dialog';
import studentFeePaymentStatusUpdated from '../data/student-fee-payment-status-updated';

const data =   [
  {
   
    date: '10-10-2024',
    amountDue: '600',
    amountPaid: '1000',
    totalAmount: '1600',
    status:"Unpaid",
    action: 'View',
  },
  {
   
    date: '10-10-2024',
    amountDue: '600',
    amountPaid: '1000',
    totalAmount: '1600',
    status:"Unpaid",
    action: 'View',
  },
  {
   
    date: '10-10-2024',
    amountDue: '600',
    amountPaid: '1000',
    totalAmount: '1600',
    status:"Unpaid",
    action: 'View',
  },
];

const FinanceStudentTransectionOverviewComponent = () => {
  return (
    <Box pt="10px" pb="20px">
      <Typography component="span" variant="h6" >Transaction Overview</Typography>

       <CustomizableTable
        columns={[
          { id: 'date', label: 'Date' },
          { id: 'amountDue', label: 'Amount Due' },
          { id: 'amountPaid', label: 'Amount Paid' },
          { id: 'totalAmount', label: 'Total Amount' },
          { id: 'status', label: 'Status' },
          {
            id: 'action',
            label: 'Action',
            render(value, row) {
              return (
                <ThreeDotsActions
                  actions={({ popover }: any) => (
                    <MenuList>
                      <MenuItem
                        onClick={() => {
                          
                        //   modal.onTrue();
                        //   popover.onClose();
                        }}
                      >
                        {/* <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} /> */}
                      Set Reminder
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          
                         
                        }}
                      >
                        {/* <Iconify icon="solar:upload-bold" sx={{ height: '16px', width: '16px' }} /> */}
                       Update Payment Status
                      </MenuItem>
                     
                    </MenuList>
                  )}
                />
              );
            },
          },
        ]}
        data={data}
      />
       </Box>
  )
}

export default FinanceStudentTransectionOverviewComponent