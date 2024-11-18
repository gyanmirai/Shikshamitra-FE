'use client';

import React, { useState, useEffect } from 'react';

import { Box, MenuItem, MenuList, TextField, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { formatNumber } from 'src/utils/formate_number';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
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
      chargesAmount: "300",
      feeHead: "Library",
      grNumber: 89554,
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
      chargesAmount: "300",
      feeHead: "Library",
      grNumber: 89554,
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
      chargesAmount: "300",
      feeHead: "Library",
      grNumber: 89554,
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
      chargesAmount: "300",
      feeHead: "Library",
      grNumber: 89554,
    },
  ];

  const dialog = useBoolean();
  const [isClearCheck, setIsClearCheck] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>();

  const closeDialog = () => {
    setIsClearCheck(false);
    dialog.onFalse();
  };

  const handleSave = () => { };

  useEffect(() => { }, [selectedEntry, isClearCheck]);

  return (
    <>
      <Box py="15px" display="flex" justifyContent="space-between">
        <Box display="flex" flexDirection="row" gap={3}  >
          <CustomSelect
            label="Class/Grade"
            options={[]}
            value=""
            onChange={() => { }}
            formControlProps={{ sx: { minWidth: 140 } }}
          />
          <CustomSelect
            label="Division"
            options={[]}
            value=""
            onChange={() => { }}
            formControlProps={{ sx: { minWidth: 140 } }}
          />
          <TextField
            label="Search by student name"
            variant="outlined"
            size="small"
            value=""
            onChange={(e: any) => {
              console.log(e);
            }}
          />
        </Box>

      </Box>      <CustomizableTable
        columns={[
          { id: "grNumber", label: "GR No" },
          // { id: 'srNo', label: 'SR No' },
          { id: 'studentName', label: 'Student Name' },
          { id: 'class', label: 'Class' },
          { id: 'chequeNo', label: 'Cheque No' },
          { id: 'bankName', label: 'Bank Name' },
          { id: 'chequeDate', label: 'Cheque Date' },
          {
            id: 'chargesAmount', label: 'Charges',
            render(value, row) {
              return <Typography fontSize="12px">{formatNumber(row.chargesAmount, 'INR')}</Typography>;
            },
          },
          { id: 'feeHead', label: 'Fee Head' },
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
