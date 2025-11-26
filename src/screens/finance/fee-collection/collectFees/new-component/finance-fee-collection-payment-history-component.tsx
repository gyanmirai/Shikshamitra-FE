import type { LabelColor } from 'src/components/label';

import React, { useState } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { formatNumber } from 'src/utils/formate_number';
import { MenuItem, MenuList, Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import studentPaymentHistoryData from 'src/json/finance/fee-collection/studentPaymentHistoryData.json';
import {
  FinancePaymentHistoryStatusType,
  FinancePaymentHistoryStatusOptions,
  FinancePaymentHistoryStatusTypeColors,
} from 'src/enums/finance-payment-history';

import FinanceStudentPaymentHistoryDialog from '../component/finance-student-payment-history-dialog';

const FinanceFeeCollectionPaymentHistoryComponent = () => {
  // Dialog state to control visibility of payment history dialog
  const dialog = useBoolean();

  // State to store the selected payment history entry
  const [selectedEntry, setSelectedEntry] = useState<any>(null);

  // Handler to close the payment history dialog
  const closeDialog = () => {
    dialog.onFalse();
  };

  // Handler for saving changes (currently not implemented)
  const handleSave = () => {};
  return (
    <>
      <CustomizableTable
        noDataText={
          <>
            No payment history found. It looks like no payments have been made yet. Please ensure
            you have completed a payment to see the history here.
          </>
        }
        tableId="finance-fee-collection-payment-history"
        columns={[
          { id: 'date', label: 'Paid Date', filterType: 'date' },

          {
            id: 'amountPaid',
            label: 'Amount',
            filterType: 'formattedNumber',
            align: 'right',
            render(value, row: any) {
              return <Typography fontSize="12px">{formatNumber(row.amountPaid, 'INR')}</Typography>;
            },
          },
          {
            id: 'amountPending',
            label: 'Amount Pending',
            filterType: 'formattedNumber',
            align: 'right',
            render(value, row: any) {
              return (
                <Typography fontSize="12px">{formatNumber(row.amountPending, 'INR')}</Typography>
              );
            },
          },

          {
            id: 'status',
            label: 'Status',
            filterType: 'enum',
            enumOptions: FinancePaymentHistoryStatusOptions,

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
            align: 'left',
            sticky: true,
            minWidth: 50,
            render: (value, row) => (
              <ThreeDotsActions
                placement="right-top"
                showViewIcon
                handleViewClick={() => {
                  dialog.onTrue();
                  setSelectedEntry(row);
                }}
                actions={(popover) => (
                  <MenuList>
                    <MenuItem
                      onClick={() => {
                        // popover.onClose();
                      }}
                    >
                      <Iconify icon="tabler:receipt" />
                      View Receipt
                    </MenuItem>
                    {/* <MenuItem
                      onClick={() => {
                        

                      }}
                    >
                      <Iconify icon="mdi:eye" />
                      View Details
                    </MenuItem> */}
                  </MenuList>
                )}
              />
            ),
          },
        ]}
        data={studentPaymentHistoryData}
      />

      {dialog.value && (
        <FinanceStudentPaymentHistoryDialog
          onSave={handleSave}
          dialogValue={dialog.value}
          onClose={closeDialog}
          data={selectedEntry}
        />
      )}
    </>
  );
};

export default FinanceFeeCollectionPaymentHistoryComponent;
