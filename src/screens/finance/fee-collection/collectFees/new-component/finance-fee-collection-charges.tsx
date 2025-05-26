import type { LabelColor } from 'src/components/label';

import React, { useState, useEffect } from 'react';

import { Box, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import studentChargesData from 'src/json/finance/fee-collection/studentChargesData.json';
import {
  FinancePaymentHistoryStatusType,
  FinancePaymentHistoryStatusOptions,
  FinancePaymentHistoryStatusTypeColors,
} from 'src/enums/finance-payment-history';

import { Label } from 'src/components/label';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import ChargesViewDetails from '../../charges/component/charges-view-details';
import FinanceChequeBounceChargeCollectDialog from '../../charges/component/finance-cheque-bounce-charge-collect';

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
          {
            id: 'chargeHead',
            label: 'Charge Head',
          },

          { id: 'description', label: 'Description' },
          {
            id: 'amount',
            label: 'Tota Charges Amount',
            filterType: 'number',
            align: 'right',
            render(value, row) {
              return <Typography fontSize="12px">{row.amount}</Typography>;
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
          {
            id: 'action',
            label: 'Action',
            isFilter: false,
            isSort: false,
            align: 'right',
            sticky: true,
            render(value, row: any) {
              return (
                <ThreeDotsActions
                  showThreeDots={false}
                  showViewIcon
                  handleViewClick={() => {
                    setSelectedEntry(row);
                    dialogForViewCharges.onTrue();
                  }}
                />
              );
            },
          },
        ]}
        data={studentChargesData}
      />
      <Box pb="20px" />

      {dialog.value && (
        <FinanceChequeBounceChargeCollectDialog
          onSave={handleSave}
          dialogValue={dialog.value}
          onClose={closeDialog}
          data={selectedEntry}
        />
      )}
      {dialogForViewCharges.value && (
        <ChargesViewDetails
          dialogValue={dialogForViewCharges.value}
          onClose={() => {
            dialogForViewCharges.onFalse();
          }}
          data={selectedEntry}
        />
      )}
    </>
  );
};

export default FinanceFeeCollectionCharges;
