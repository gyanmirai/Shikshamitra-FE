// Add MenuItem import
import React from 'react';

import { Typography } from '@mui/material';

import CustomDialog from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable'; // Make sure Iconify is correctly imported
import { formatNumber } from 'src/utils/formate_number';

import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';


interface FinanceStudentPaymentHistoryDialogProps {
  dialogValue: boolean;
  data: any; // Assuming 'data' contains the relevant row data including payment history
  onSave: (values: any) => void;
  onClose: () => void;

  
}

const FinanceStudentPaymentHistoryDialog: React.FC<FinanceStudentPaymentHistoryDialogProps> = ({
  dialogValue,
  data,
  onClose,
  onSave,


}) => { 
    
    console.log("data table", data);
    return(
    
    <CustomDialog maxWidth="md" title="Payment History" open={dialogValue} handleClose={onClose}>
       <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '350px' }}>
      <CustomizableTable
        isFilter={false}
        isScrollbar={false}
        isSearch={false}
        isPagination={false}
        isShowedDense={false}
        columns={[
          { id: "paymentId", label: "Payment Id / Cheque No" },
          { id: "amount", label: "Amount", render(value, row) {
              return <Typography fontSize="12px">{formatNumber(row.amount, "INR")}</Typography>
          }, },
          { id: "paymentMode", label: "Payment Mode" },
          { id: "paymentStatus", label: "Status", render(value, row) {
            return (
              <Label
                variant="soft"
                color={
                  value === 'Failed'
                    ? 'error'
                    : value === 'Pending'
                      ? 'warning'
                      : value === 'Success'
                        ? 'success'
                        : 'default'
                }
              >
                {value}
              </Label>
            );
          }, },
       
        ]}
        data={data.paymentHistory} 
      />
      </Scrollbar>
    </CustomDialog>
    
  )};

export default FinanceStudentPaymentHistoryDialog;
