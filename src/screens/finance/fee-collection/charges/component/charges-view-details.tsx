import React from 'react';

import { Box, Typography } from '@mui/material';

import { formatNumber } from 'src/utils/formate_number';

import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable';

interface ChargesViewDetailsProps {
  dialogValue: boolean;
  onClose: () => void;
  data: any;
}

const ChargesViewDetails: React.FC<ChargesViewDetailsProps> = ({ dialogValue, onClose, data }) => (
  <CustomDialog
    maxWidth={data.chargeHead === 'Late Fee' ? 'md' : 'lg'}
    title={data.description}
    open={dialogValue}
    handleClose={onClose}
  >
    <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '500px' }}>
      <CustomizableTable
        tableId="chargesViewDetails"
        isShowedDense={false}
        isFilter={false}
        isSearch={false}
        columns={
          data.chargeHead === 'Late Fee'
            ? [
                { id: 'dueDate', label: 'Due Date' },
                {
                  id: 'chargesPerDay',
                  label: 'ChargesPerDay',
                  render(value, row) {
                    return <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>;
                  },
                },
                {
                  id: 'noOfDay',
                  label: 'No Of Day',
                  render(value, row) {
                    return <Typography fontSize="12px">{value}</Typography>;
                  },
                },
                {
                  id: 'totalCharges',
                  label: 'Total Charges',
                  render(value, row) {
                    return <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>;
                  },
                },
                {
                  id: 'status',
                  label: 'Status',
                  render(value, row) {
                    return value !== '' ? (
                      <Label
                        variant="soft"
                        color={
                          value === 'Overdue'
                            ? 'error'
                            : value === 'Pending'
                              ? 'warning'
                              : value === 'Paid'
                                ? 'success'
                                : 'default'
                        }
                      >
                        {value}
                      </Label>
                    ) : (
                      <Box />
                    );
                  },
                },
              ]
            : [
                { id: 'feeHead', label: 'Fee Head' },
                { id: 'checkDate', label: 'Date on Check' },
                { id: 'receivedCheckDate', label: 'Received Check Date' },
                { id: 'chequeAmount', label: 'Cheque Amount' },
                { id: 'charges', label: 'Charges' },
                { id: 'bankName', label: 'Bank Name' },
                {
                  id: 'status',
                  label: 'Status',
                  render(value, row) {
                    return value !== '' ? (
                      <Label
                        variant="soft"
                        color={
                          value === 'Overdue'
                            ? 'error'
                            : value === 'Pending'
                              ? 'warning'
                              : value === 'Paid'
                                ? 'success'
                                : 'default'
                        }
                      >
                        {value}
                      </Label>
                    ) : (
                      <Box />
                    );
                  },
                },
              ]
        }
        data={data.details}
      />
    </Scrollbar>
  </CustomDialog>
);

export default ChargesViewDetails;
