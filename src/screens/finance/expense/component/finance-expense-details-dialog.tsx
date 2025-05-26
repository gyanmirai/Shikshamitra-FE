import React from 'react';

import { Typography } from '@mui/material';

import { formatNumber } from 'src/utils/formate_number';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IFinanceExpenseDetailsDialogProps } from '../expense-interface';

const FinanceExpenseDetailsDialog: React.FC<IFinanceExpenseDetailsDialogProps> = ({
  dialogValue,
  data,
  onClose,
}) => (
  <CustomDialog maxWidth="md" title="Expense Details" open={dialogValue} handleClose={onClose}>
    <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '350px' }}>
      <CustomizableTable
        tableId="expenseDetails"
        isFilter={false}
        isScrollbar={false}
        isSearch={false}
        isPagination={false}
        isShowedDense={false}
        columns={[
          { id: 'date', label: 'Received Date', filterType: 'date' },
          { id: 'expenseName', label: 'Expense Name' },
          {
            id: 'amount',
            label: 'Amount',
            filterType: 'formattedNumber',
            align: 'right',
            render(value) {
              return <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>;
            },
          },
        ]}
        data={data.expenseList}
      />
    </Scrollbar>
  </CustomDialog>
);

export default FinanceExpenseDetailsDialog;
