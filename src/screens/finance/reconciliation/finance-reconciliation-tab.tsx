'use client';

import React, { useState, useEffect } from 'react';

import { Box, MenuItem, MenuList, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { formatNumber } from 'src/utils/formate_number';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import FinanceReconciliationClearAndBounceChequeDialog from './component/finance-reconciliation-clear-cheque-dialog';

const FinanceReconciliationTab = () => {
  const reconsiliationData = [
    {
      srNo: 1,
      studentName: 'Aarav Sharma',
      class: '5th',
      chequeNo: '784512',
      bankName: 'State Bank of India',
      chequeDate: '01-11-2024',
      amount: '1500',
      id: 1,
    },
    {
      srNo: 2,
      studentName: 'Diya Mehta',
      class: '6th',
      chequeNo: '234589',
      bankName: 'HDFC Bank',
      chequeDate: '01-11-2024',
      amount: '2000',
      id: 2,
    },
    {
      srNo: 3,
      studentName: 'Rohan Patel',
      class: '7th',
      chequeNo: '985632',
      bankName: 'ICICI Bank',
      chequeDate: '01-08-2024',
      amount: '2500',
      id: 3,
    },
    {
      srNo: 4,
      studentName: 'Ishita Desai',
      class: '8th',
      chequeNo: '567890',
      bankName: 'Axis Bank',
      chequeDate: '05-11-2024',
      amount: '800',
      id: 4,
    },
  ];

  const dialog = useBoolean();
  const [isClearCheck, setIsClearCheck] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>();

  const closeDialog = () => {
    setIsClearCheck(false);
    dialog.onFalse();
  };

  const handleSave = () => {};

  useEffect(() => {}, [selectedEntry, isClearCheck]);

  return (
    <>
      <Box>{/* <Typography variant="h6" gutterBottom >Reconciliation Details </Typography> */}</Box>
      <CustomizableTable
        columns={[
          { id: 'srNo', label: 'SR No' },
          { id: 'studentName', label: 'Student Name' },
          { id: 'class', label: 'Class' },
          { id: 'chequeNo', label: 'Cheque No' },
          { id: 'bankName', label: 'Bank Name' },
          { id: 'chequeDate', label: 'Cheque Date' },
          {
            id: 'amount',
            label: 'Amount',
            render(value, row) {
              return <Typography fontSize="12px">{formatNumber(row.amount, 'INR')}</Typography>;
            },
          },
          {
            id: 'action',
            label: 'Action',
            render(value, row: any) {
              return (
                <ThreeDotsActions
                  actions={({ popover }: any) => (
                    <MenuList>
                      <MenuItem
                        onClick={() => {
                          setIsClearCheck(false);
                          setSelectedEntry(row);

                          dialog.onTrue();
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
        data={reconsiliationData}
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

export default FinanceReconciliationTab;
