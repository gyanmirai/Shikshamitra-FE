import React, { useState, useEffect } from 'react';

import { Box, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import ChargesViewDetails from './component/charges-view-details';
import FinanceChequeBounceChargeCollectDialog from './component/finance-cheque-bounce-charge-collect';

const FinanceFeeCollectionCharges = () => {
  const chargesData = [
    {
      srNo: 1,
      chargeHead: 'Late Fee',
      chargeId: '674773',
      chargeType: 'Late Fee',
      appliedDate: '15-08-2024',
      overdueDate: '20-08-2024',
      amount: '₹ 300',
      status: 'Pending',
      description: 'Late fee for overdue payment of Tuition Fee.',
      details: [
        {
          dueDate: '01-01-2025',
          chargesPerDay: '5',
          totalCharges: '150',
          status: 'Paid',
          noOfDay: 30,
        },
        {
          dueDate: '01-02-2025',
          chargesPerDay: '5',
          totalCharges: '150',
          status: 'Pending',
          noOfDay: 60,
        },
        {
          dueDate: '01-03-2025',
          chargesPerDay: '5',
          totalCharges: '150',
          status: 'Pending',
          noOfDay: 120,
        },
      ],
    },
    {
      srNo: 2,
      chargeHead: 'Late Fee',
      chargeId: '874912',
      chargeType: 'Sports Fee',
      appliedDate: '10-09-2024',
      overdueDate: '15-09-2024',
      amount: '₹ 500',
      status: 'Pending',
      description: 'Late fee for overdue payment of Sports Fee.',
      details: [
        {
          dueDate: '01-04-2025',
          chargesPerDay: '10',
          totalCharges: '300',
          status: 'Paid',
          noOfDay: 60,
        },
        {
          dueDate: '01-05-2025',
          chargesPerDay: '10',
          totalCharges: '300',
          status: 'Pending',
          noOfDay: 60,
        },
        {
          dueDate: '01-06-2025',
          chargesPerDay: '10',
          totalCharges: '300',
          status: 'Pending',
          noOfDay: 60,
        },
      ],
    },

    {
      srNo: 3,
      chargeHead: 'Check Bounce',
      chargeId: '874912',
      chargeType: 'bounceCheck',
      appliedDate: '10-09-2024',
      overdueDate: '15-09-2024',
      amount: '₹ 500',
      status: 'Pending',
      description: 'Bounce check for the payment of the sports fee of ₹ 5,000.',
      details: [
        {
          feeHead: 'Tuition',
          checkDate: '15-10-2024',
          receivedCheckDate: '15-10-2024',
          chequeAmount: 5000,
          charges: '₹ 500 ',
          bankName: 'Sbi',

          status: 'Pending',
        },
      ],
    },
  ];
  const dialog = useBoolean();
  const dialogForViewCharges = useBoolean();

  const [selectedEntry, setSelectedEntry] = useState<any>();

  const closeDialog = () => {
    dialog.onFalse();
  };

  const handleSave = () => {};

  useEffect(() => {}, [selectedEntry]);

  return (
    <>
      <Box>{/* <Typography variant="h6" gutterBottom >Charges </Typography> */}</Box>
      <CustomizableTable
        // isShowedDense={false}
        // isFilter={false}
        // isSearch={false}
        columns={[
          {
            id: 'chargeHead',
            label: 'Charge Head',
          },
          {
            id: 'amount',
            label: 'Tota Charges Amount',
            render(value, row) {
              return <Typography fontSize="12px">{row.amount}</Typography>;
            },
          },
          { id: 'description', label: 'Description' },

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
          {
            id: 'action',
            label: 'Action',
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
        data={chargesData}
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
