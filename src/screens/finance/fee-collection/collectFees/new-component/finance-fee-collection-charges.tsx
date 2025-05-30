import type { LabelColor } from 'src/components/label';

import React, { useState, useEffect } from 'react';

import { Box, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { formatNumber } from 'src/utils/formate_number';

import studentChargesData from 'src/json/finance/fee-collection/studentChargesData.json';
import {
  FinancePaymentHistoryStatusType,
  FinancePaymentHistoryStatusOptions,
  FinancePaymentHistoryStatusTypeColors,
} from 'src/enums/finance-payment-history';

import { Label } from 'src/components/label';
import CustomizableTable from 'src/components/customizabaleTable';

const FinanceFeeCollectionCharges = () => {
  // Dialog state for charge collection modal
  const dialog = useBoolean();
  // Dialog state for viewing charge details
  const dialogForViewCharges = useBoolean();

  // State to store the currently selected charge entry
  const [selectedEntry, setSelectedEntry] = useState<any>();

  // Handler to close the charge collection dialog
  const closeDialog = () => {
    dialog.onFalse();
  };

  // Handler for saving charge collection data
  const handleSave = () => {};

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
        searchFieldProps={{
          placeholder: 'Search by Status, Fee Head...',
          label: 'Search by Status, Fee Head...',
          sx: {
            maxWidth: '400px',
            width: '100%',
          },
        }}
        columns={[
          { id: 'dueDate', label: 'Due Date', filterType: 'date' },
          { id: 'chargeType', label: 'Charge Type' }, // was incorrectly 'Due Date'
          {
            id: 'feeHead',
            label: 'Charge Head',
          },
          {
            id: 'dayOverView',
            label: 'Days Overview', // changed to meaningful label
            filterType: 'number',
            align: 'right',
            render(value, row) {
              return <Typography fontSize="12px">{value}</Typography>; // fixed to render value
            },
          },
          {
            id: 'chargesPerDay',
            label: 'Charges Per Day', // fixed label
            filterType: 'formattedNumber',
            align: 'right',
            render(value, row) {
              return <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>; // fixed to render value
            },
          },
          {
            id: 'totalCharges',
            label: 'Total Charges Amount', // fixed label
            filterType: 'formattedNumber',
            align: 'right',
            render(value, row) {
              return <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>; // fixed to render value
            },
          },

          {
            id: 'status',
            label: 'Status',
            filterType: 'enum',
            enumOptions: FinancePaymentHistoryStatusOptions,
            minWidth: '100px',
            align: 'left',
            isSort: false,
            sticky: true,
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
        ]}
        data={studentChargesData}
      />
      <Box pb="20px" />
    </>
  );
};

export default FinanceFeeCollectionCharges;
