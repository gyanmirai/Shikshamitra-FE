import type { LabelColor } from 'src/components/label';

import React, { useState } from 'react';

import { MenuItem, MenuList, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { formatNumber } from 'src/utils/formate_number';

import studentPaymentHistoryData from 'src/json/finance/fee-collection/studentPaymentHistoryData.json';
import {
  FinancePaymentHistoryStatusType,
  FinancePaymentHistoryStatusOptions,
  FinancePaymentHistoryStatusTypeColors,
} from 'src/enums/finance-payment-history';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import FinanceStudentPaymentHistoryDialog from '../component/finance-student-payment-history-dialog';

const FinanceFeeCollectionPaymentHistoryComponent = () => {
  const dialog = useBoolean();

  const [selectedEntry, setSelectedEntry] = useState<any>(null);

  const closeDialog = () => {
    dialog.onFalse();
  };

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
        searchFieldProps={{
          placeholder: 'Search by Status, Date...',
          label: 'Search by Status, Date...',
          sx: {
            maxWidth: '400px',
            width: '100%',
          },
        }}
        columns={[
          { id: 'date', label: 'Paid Date', filterType: 'date' },

          {
            id: 'amountPaid',
            label: 'Amount',
            filterType: 'formattedNumber',
            render(value, row: any) {
              return <Typography fontSize="12px">{formatNumber(row.amountPaid, 'INR')}</Typography>;
            },
          },
          {
            id: 'amountPending',
            label: 'Amount Pending',
            filterType: 'formattedNumber',
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
                        console.log('data row', row);

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
