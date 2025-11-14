'use client';

import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { formatNumber } from 'src/utils/formate_number';
import { MenuItem, MenuList, Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import chequeTransectionData from 'src/json/finance/reconicilation/chequeTransectionData.json';

import FinanceReconciliationClearAndBounceChequeDialog from './component/finance-reconciliation-clear-cheque-dialog';

import type { ReconciliationItem } from './data/cheque-list-data';

const FinanceChequeTransectionScreen = () => {
  // Dialog state to control the visibility of the dialog
  const dialog = useBoolean();

  // State to track whether the cheque is being cleared (true) or bounced (false)
  const [isClearCheck, setIsClearCheck] = useState<boolean>(false);

  // State to store the currently selected reconciliation entry
  const [selectedEntry, setSelectedEntry] = useState<ReconciliationItem>();

  // Function to reset states and close the dialog
  const closeDialog = () => {
    setIsClearCheck(false);
    dialog.onFalse();
  };

  // Function to handle save operation when clearing or bouncing a cheque
  const handleSave = () => {};

  // Effect to handle changes when selected entry or clear check status changes
  useEffect(() => {}, [selectedEntry, isClearCheck]);

  return (
    <>
      <CustomBreadcrumbs
        heading="Cheque Transactions"
        description="The Cheque transection screen displays all payments made by cheque. You can also move cheques to Cleared or Bounced by clicking the action button"
        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Reconciliation', href: '/finance/reconciliation/payment-by-cheque/' },
          { name: 'Cheque Transactions' },
        ]}
        sx={{ mb: 2 }}
      />

      <CustomizableTable
        noDataText={
          <>
            There are no cheque payments recorded for the selected class and division at this time.
          </>
        }
        tableId="reconciliationTable"
        columns={[
          { id: 'grNumber', label: 'GR No', filterType: 'number', sticky: true, align: 'left' },
          { id: 'studentName', label: 'Student Name', align: 'left' },
          { id: 'class', label: 'Class', align: 'left' },
          { id: 'division', label: 'Division', align: 'left' },
          { id: 'chequeNo', label: 'Cheque No', align: 'left' },
          { id: 'bankName', label: 'Bank Name', align: 'left' },
          { id: 'chequeDate', label: 'Cheque Date', filterType: 'date', align: 'left' },
          {
            id: 'receivedChequeDate',
            label: 'Received Cheque Date',
            filterType: 'date',
            align: 'left',
          },

          { id: 'feeHead', label: 'Fee Head', align: 'left' },
          {
            id: 'amount',
            label: 'Amount',
            filterType: 'formattedNumber',
            align: 'left',
            render(value, row) {
              return <Typography fontSize="12px">{formatNumber(row.amount, 'INR')}</Typography>;
            },
          },
          {
            id: 'action',
            label: 'Actions',
            isSort: false,
            isFilter: false,
            sticky: true,
            align: 'left',
            render(value, row: any) {
              return (
                <ThreeDotsActions
                  placement="right-top"
                  actions={({ popover }: any) => (
                    <MenuList>
                      <MenuItem
                        onClick={() => {
                          setIsClearCheck(false);
                          setSelectedEntry(row);

                          dialog.onTrue();
                          popover.onClose();
                        }}
                      >
                        <Iconify icon="fluent:check-24-regular" />
                        Bounce
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          setIsClearCheck(true);
                          setSelectedEntry(row);

                          dialog.onTrue();
                          popover.onClose();
                        }}
                      >
                        <Iconify icon="material-symbols-light:check" />
                        Clear
                      </MenuItem>
                    </MenuList>
                  )}
                />
              );
            },
          },
        ]}
        data={chequeTransectionData}
      />
      {dialog.value && selectedEntry && (
        <FinanceReconciliationClearAndBounceChequeDialog
          onSave={handleSave}
          dialogValue={dialog.value}
          onClose={closeDialog}
          data={selectedEntry}
          fromClearCheck={isClearCheck}
        />
      )}
    </>
  );
};

export default FinanceChequeTransectionScreen;
