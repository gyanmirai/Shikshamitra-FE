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
        },
        {
          dueDate: '01-02-2025',
          chargesPerDay: '5',
          totalCharges: '150',
          status: 'Pending',
        },
        {
          dueDate: '01-03-2025',
          chargesPerDay: '5',
          totalCharges: '150',
          status: 'Pending',
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
        },
        {
          dueDate: '01-05-2025',
          chargesPerDay: '10',
          totalCharges: '300',
          status: 'Pending',
        },
        {
          dueDate: '01-06-2025',
          chargesPerDay: '10',
          totalCharges: '300',
          status: 'Pending',
        },
      ],
    },

    // {
    //   srNo: 2,
    //   chargeId: '674774',
    //   chargeType: 'ID Card Replacement',
    //   appliedDate: '10-07-2024',
    //   overdueDate: '15-07-2024',
    //   amount: '₹ 150',
    //   status: 'Paid',
    //   description: 'Charge for issuing a replacement ID card.',
    //   details: [
    //     {
    //       dueDate: "01-01-2025",

    //       totalCharges: "150",
    //       status: 'Paid',
    //     },

    //   ]
    // },
    // {
    //   srNo: 3,
    //   chargeId: '674775',
    //   chargeType: 'Library Late Return',
    //   appliedDate: '05-09-2024',
    //   overdueDate: '10-09-2024',
    //   amount: '₹ 100',
    //   status: 'Pending',
    //   description: 'Penalty for returning a library book past the due date.'
    // },
    // {
    //   srNo: 4,
    //   chargeId: '674776',
    //   chargeType: 'Damage Charge',
    //   appliedDate: '01-08-2024',
    //   overdueDate: '06-08-2024',
    //   amount: '₹ 500',
    //   status: 'Pending',
    //   description: 'Charge for damage to school property.'
    // },
    // {
    //   srNo: 5,
    //   chargeId: '674777',
    //   chargeType: 'Sports Equipment Fine',
    //   appliedDate: '12-06-2024',
    //   overdueDate: '17-06-2024',
    //   amount: '₹ 200',
    //   status: 'Paid',
    //   description: 'Penalty for damage to sports equipment.'
    // },
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
        isShowedDense={false}
        isFilter={false}
        isSearch={false}
        columns={[
          //  {id:"srNo", label:"SR No"},

          // { id: 'chequeNumber', label: 'Student Id' },
          { id: 'chargeHead', label: 'Charge Head' },

          // { id: 'appliedDate', label: 'Applied Date' },
          {
            id: 'amount',
            label: 'Total Amount',
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
                  // actions={({ popover }: any) => (
                  //   <MenuList>
                  //     {row.status === 'Pending' && (
                  //       <MenuItem
                  //         onClick={() => {
                  //           // setIsClearCheck(false)
                  //           setSelectedEntry(row);

                  //           dialog.onTrue();
                  //         }}
                  //       >
                  //         <Iconify icon="fluent:check-24-regular" />
                  //         Collect Charges
                  //       </MenuItem>
                  //     )}
                  //     {row.status === 'Paid' && (
                  //       <MenuItem
                  //         onClick={() => {
                  //           // setIsClearCheck(true)
                  //           // setSelectedEntry(row);
                  //           // dialog.onTrue();
                  //         }}
                  //       >
                  //         <Iconify icon="circum:receipt" />
                  //         Generate Receipt
                  //       </MenuItem>
                  //     )}
                  //   </MenuList>
                  // )}
                />
              );
            },
          },
        ]}
        data={chargesData}
      />

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
