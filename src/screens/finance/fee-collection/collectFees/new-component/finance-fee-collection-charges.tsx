import type { LabelColor } from 'src/components/label';

import { Label } from 'src/components/label';
import { Box, Typography } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { formatNumber } from 'src/utils/formate_number';
import CustomizableTable from 'src/components/customizabaleTable';
import studentChargesData from 'src/json/finance/fee-collection/studentChargesData.json';
import {
  FinancePaymentHistoryStatusType,
  FinancePaymentHistoryStatusOptions,
  FinancePaymentHistoryStatusTypeColors,
} from 'src/enums/finance-payment-history';

const FinanceFeeCollectionCharges = () => {
  // Dialog state for charge collection modal
  // Dialog state for viewing charge details

  // State to store the currently selected charge entry
  const [selectedEntry] = useState<any>();

  // Handler to close the charge collection dialog

  // Handler for saving charge collection data

  // Effect to handle changes when selected entry updates
  useEffect(() => {}, [selectedEntry]);

  return (
    <>
      <Box>{/* <Typography variant="h6" gutterBottom >Charges </Typography> */}</Box>
      <CustomizableTable
        noDataText={
          <>
            No charges found. There are currently no late fees, penalties, or bounced cheque charges
            associated with this account.
          </>
        }
        tableId="finance-fee-collection-charges"
        columns={[
          { id: 'dueDate', label: 'Due Date', filterType: 'date', align: 'left' },
          { id: 'chargeType', label: 'Charge Type', align: 'left' }, // was incorrectly 'Due Date'
          {
            id: 'feeHead',
            label: 'Charge Head',
            align: 'left',
          },
          {
            id: 'dayOverView',
            label: 'Days Overview', // changed to meaningful label
            filterType: 'number',
            align: 'left',
            render(value) {
              return <Typography fontSize="12px">{value}</Typography>; // fixed to render value
            },
          },
          {
            id: 'chargesPerDay',
            label: 'Charges Per Day', // fixed label
            filterType: 'formattedNumber',
            align: 'left',
            render(value) {
              return <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>; // fixed to render value
            },
          },
          {
            id: 'totalCharges',
            label: 'Total Charges Amount', // fixed label
            filterType: 'formattedNumber',
            align: 'left',
            render(value) {
              return <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>; // fixed to render value
            },
          },
          {
            id: 'status',
            label: 'Status',
            filterType: 'enum',
            enumOptions: FinancePaymentHistoryStatusOptions,
            minWidth: '90px',
            align: 'left',
            isSort: false,
            sticky: true,
            render(value) {
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
        ]}
        data={studentChargesData}
      />
      <Box pb="20px" />
    </>
  );
};

export default FinanceFeeCollectionCharges;
