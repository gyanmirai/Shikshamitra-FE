import React from 'react'

import { Typography } from '@mui/material';

import { formatNumber } from 'src/utils/formate_number';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable';

interface FinanceExpenseDetailsDialogProps {
    dialogValue: boolean;
    data: any; 
   
    onClose: () => void;


}
const FinanceExpenseDetailsDialog: React.FC<FinanceExpenseDetailsDialogProps> = ({ dialogValue,
    data,
    onClose,
     }) => {
        console.log("data table", data);
  return (
    <CustomDialog maxWidth="md" title="Income Details" open={dialogValue} handleClose={onClose}>
       <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '350px' }}>
      <CustomizableTable
        isFilter={false}
        isScrollbar={false}
        isSearch={false}
        isPagination={false}
        isShowedDense={false}
        columns={[
            { id: "expenseName", label: "Expense Name" },
            {
              id: "amount",
              label: "Amount",
              render(value) {

                return (
                  <Typography fontSize="12px">
                    {formatNumber(value, "INR")}
                  </Typography>
                );
              },
            },
            { id: "date", label: "Received Date" },
       
        ]}
        data={data.expenseList} 
      />
      </Scrollbar>
    </CustomDialog>
  )
}

export default FinanceExpenseDetailsDialog