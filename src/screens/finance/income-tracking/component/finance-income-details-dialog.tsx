import React from 'react';

import { Typography } from '@mui/material';

import { formatNumber } from 'src/utils/formate_number';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IFinanceIncomeDetailsDialogProps } from '../interface/income-screen-interface';

const FinanceIncomeDetailsDialog: React.FC<IFinanceIncomeDetailsDialogProps> = ({
  dialogValue,
  data,
  onClose,
}) => {
  console.log('data table', data);
  return (
    <CustomDialog maxWidth="md" title="Income Details" open={dialogValue} handleClose={onClose}>
      <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '350px' }}>
        <CustomizableTable
          tableId="finance-income-details-table"
          isFilter={false}
          isScrollbar={false}
          isSearch={false}
          isPagination={false}
          isShowedDense={false}
          columns={[
            { id: 'incomeName', label: 'Income Name' },
            {
              id: 'amount',
              label: 'Amount',
              filterType: 'formattedNumber',
              render(value) {
                return <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>;
              },
            },
            { id: 'date', label: 'Received Date', filterType: 'date' },
          ]}
          data={data.incomeList}
        />
      </Scrollbar>
    </CustomDialog>
  );
};

export default FinanceIncomeDetailsDialog;
