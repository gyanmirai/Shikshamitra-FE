import React from 'react';

import { Box, Typography, DialogActions } from '@mui/material';

import { formatNumber } from 'src/utils/formate_number';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CancelButton from 'src/components/cancel-button';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IFinanceIncomeDetailsDialogProps } from '../interface/income-screen-interface';

const FinanceIncomeDetailsDialog: React.FC<IFinanceIncomeDetailsDialogProps> = ({
  dialogValue,
  data,
  onClose,
}) => {
  console.log('data table', data);
  return (
    <CustomDialog
      maxWidth="md"
      title={
        <Box display="flex" flexDirection="row" gap={1} alignItems="center">
          <Typography variant="h5">Income Details</Typography>
          <CustomTooltip
            arrow
            placement="right"
            sx={{ textAlign: 'justify' }}
            title="View detailed information about income transactions including received date, income name and amount"
          >
            <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
          </CustomTooltip>
        </Box>
      }
      open={dialogValue}
      handleClose={onClose}
    >
      <Scrollbar sx={{ p: 2, height: '100%' }}>
        <CustomizableTable
          tableId="finance-income-details-table"
          isScrollbar={false}
          columns={[
            { id: 'date', label: 'Received Date', filterType: 'date' },
            { id: 'incomeName', label: 'Income Name' },
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
          data={data.incomeList}
        />
      </Scrollbar>
      <DialogActions>
        {/* <SubmitButton onClick={() => { }} /> */}
        <CancelButton onClick={onClose} />
      </DialogActions>
    </CustomDialog>
  );
};

export default FinanceIncomeDetailsDialog;
