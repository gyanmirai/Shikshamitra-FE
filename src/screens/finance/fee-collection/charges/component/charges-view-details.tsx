import type { LabelColor } from 'src/components/label';

import React from 'react';

import { Typography } from '@mui/material';

import capitalizeWords from 'src/utils/capitalizeText';
import { formatNumber } from 'src/utils/formate_number';

import {
  FinancePaymentHistoryStatusType,
  FinancePaymentHistoryStatusOptions,
  FinancePaymentHistoryStatusTypeColors,
} from 'src/enums/finance-payment-history';

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
    maxWidth="lg"
    title={capitalizeWords(data.description)}
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
                { id: 'dueDate', label: 'Due Date', filterType: 'date' },
                {
                  id: 'chargesPerDay',
                  label: 'ChargesPerDay',
                  filterType: 'number',
                  render(value, row) {
                    return <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>;
                  },
                },
                {
                  id: 'noOfDay',
                  label: 'No Of Day',
                  filterType: 'number',
                  render(value, row) {
                    return <Typography fontSize="12px">{value}</Typography>;
                  },
                },
                {
                  id: 'totalCharges',
                  label: 'Total Charges',
                  filterType: 'formattedNumber',
                  render(value, row) {
                    return <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>;
                  },
                },
                {
                  id: 'status',
                  label: 'Status',
                  filterType: 'enum',
                  enumOptions: FinancePaymentHistoryStatusOptions,
                  minWidth: '180px',
                  align: 'left',
                  isSort: false,
                  render(value, row) {
                    const color = FinancePaymentHistoryStatusTypeColors[
                      value as FinancePaymentHistoryStatusType
                    ] as LabelColor;

                    return (
                      <Label color={color}>
                        {FinancePaymentHistoryStatusType[value as FinancePaymentHistoryStatusType]}
                      </Label>
                    );
                  },
                },
              ]
            : [
                { id: 'feeHead', label: 'Fee Head' },
                { id: 'checkDate', label: 'Date on Check', filterType: 'date' },
                { id: 'receivedCheckDate', label: 'Received Check Date', filterType: 'date' },
                { id: 'chequeAmount', label: 'Cheque Amount', filterType: 'formattedNumber' },
                { id: 'charges', label: 'Charges', filterType: 'formattedNumber' },
                { id: 'bankName', label: 'Bank Name' },
                {
                  id: 'status',
                  label: 'Status',
                  filterType: 'enum',
                  enumOptions: FinancePaymentHistoryStatusOptions,
                  minWidth: '180px',
                  align: 'left',
                  isSort: false,
                  render(value, row) {
                    const color = FinancePaymentHistoryStatusTypeColors[
                      value as FinancePaymentHistoryStatusType
                    ] as LabelColor;

                    return (
                      <Label color={color}>
                        {FinancePaymentHistoryStatusType[value as FinancePaymentHistoryStatusType]}
                      </Label>
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
