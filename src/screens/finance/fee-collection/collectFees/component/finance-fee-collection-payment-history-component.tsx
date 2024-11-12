import React from 'react';

import { MenuItem, MenuList, Typography } from '@mui/material';

import { formatNumber } from 'src/utils/formate_number';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const paymentHistoryData = [
  {
    paymentId: 'john233',
    date: '12 June',
    feeHead: 'Tuition',
    dueDate: '15 June',
    amountPaid:5000,
    amountPending:500,
    status: 'Unpaid',
    paymentHistory: [
      {
        paymentMode: "Card",
        amount: "2000",
        paymentId: "54j8",
        paymentStatus: "Success"
      },
      {
        paymentMode: "Cash",
        amount: "2000",
      },
      {
        paymentMode: "Online",
        amount: "1000",
        paymentId: "h8749",
        paymentStatus: "Failed"
      },
      {
        paymentMode: "Online",
        amount: "500",
        paymentId: "h8749",
        paymentStatus: "Success"
      },
      {
        paymentMode: "Check",
        amount: "500",
        paymentId: "h8749",
        paymentStatus: "Bounced",
        bounceCharges:50,
      }
    ]
  },


];
const FinanceFeeCollectionPaymentHistoryComponent = () => {
  const data = [];
  return (
    <CustomizableTable
      columns={[
        {
          id: 'paymentId', label: 'Payment Id', children(row) {
            return (
              <CustomizableTable 
              isFilter={false}
              isScrollbar={false}
              isSearch={false}
              isPagination={false}
              columns={[
                {id:"paymentId", label:"Payment Id / Cheque No"},
                {id:"amount", label:"Amount"},
                {id:"paymentMode", label:"PaymentMode"},
                {id:"paymentStatus", label:"Status"},
                {id:"action", label:"Action", render(value,) {
                  return (
                    <ThreeDotsActions
                    actions={(popover) => (
                      <MenuList>
                        <MenuItem
                          onClick={() => {
                            // popover.onClose();
                          }}
                        >
                          <Iconify icon="lets-icons:refund-back-light" />
                          Refund
                        </MenuItem>
      
                      </MenuList>
                    )}
                  />
                  );
                },},
              ]} data={
                row.paymentHistory
              }/>

            );
          },
        },
        { id: 'date', label: 'Date' },
        { id: 'feeHead', label: 'Fee Head' },
        {id:"amountPaid", label:"Amount", render(value, row:any) {
          return <Typography fontSize="12px">{formatNumber(row.amountPaid,"INR")}</Typography>
        },},
        {id:"amountPending", label:"Amount Pending", render(value, row:any) {
          return <Typography fontSize="12px">{formatNumber(row.amountPending,"INR")}</Typography>
        },},
        { id: 'dueDate', label: 'Due Date' },

        {
          id: 'status',
          label: 'Status',
          render(value, row) {
            return (
              <Label
                variant="soft"
                color={
                  value === 'Overdue'
                    ? 'error'
                    : value === 'Unpaid'
                      ? 'warning'
                      : value === 'Paid'
                        ? 'success'
                        : 'default'
                }
              >
                {value}
              </Label>
            );
          },
        },
        {
          id: 'action',
          label: 'Action',
          render: (row) => (
            <ThreeDotsActions
              actions={() => (
                <MenuList>
                  <MenuItem
                    onClick={() => {
                      // popover.onClose();
                    }}
                  >
                    <Iconify icon="mdi:eye" />
                    View Receipt
                  </MenuItem>

                </MenuList>
              )}
            />
          ),
        },
      ]}
      data={paymentHistoryData}
    />
  );
};

export default FinanceFeeCollectionPaymentHistoryComponent;
