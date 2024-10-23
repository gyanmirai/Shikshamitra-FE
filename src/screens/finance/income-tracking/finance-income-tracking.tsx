'use client';

import React, { useState, useEffect } from 'react';

import { Box, Button, MenuItem, MenuList, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import FinanceAddNewIncomeDialog from './component/finance-add-new-income-dialog';

interface Data {
  incomeSource: string;
  incomeAmount: string;
  paymentMethod: string;
  date: string;
  id: number;
  paymentStatus: string;
  action?: string;
}

let data: Data[] = [
  {
    id: 1,
    incomeSource: 'Tuition Fees',
    incomeAmount: '50000',
    paymentMethod: 'Online',
    date: '12-12-2024',
    paymentStatus: 'Paid',
    action: 'View',
  },
  {
    id: 2,
    incomeSource: 'Donation',
    incomeAmount: '500000',
    paymentMethod: 'Online',
    date: '10-10-2024',
    paymentStatus: 'Paid',
    action: 'View',
  },
];

const FinanceIncomeTrackingScreen = () => {
  const dialog = useBoolean();
  const [selectedEntry, setSelectedEntry] = useState(data);
  const [isEdit, setIsEdit] = useState(false);
  const [tableData, setTableData] = useState(data);

  const closeDialog = () => {
    setIsEdit(false);
    dialog.onFalse();
  };

  useEffect(() => {}, [selectedEntry, isEdit]);

  const handleSave = (dataFromDialog: Data) => {
    const { incomeSource, incomeAmount, paymentMethod, date, paymentStatus, id } = dataFromDialog;

    if (dataFromDialog) {
      const existingEntryIndex = data.findIndex((val) => id === val.id);

      const newIncomeEntry = {
        incomeSource,
        incomeAmount,
        paymentMethod,
        date,
        paymentStatus,
        id,
        action: isEdit ? 'edit' : 'add',
      };

      const updatedData = [...data];

      if (isEdit && existingEntryIndex !== -1) {
        updatedData[existingEntryIndex] = newIncomeEntry;
      } else {
        updatedData.push(newIncomeEntry);
      }

      setTableData(updatedData);
    }

    closeDialog();
    console.log('Updated Data:', dataFromDialog);
  };

  const handleDelete = (item: any) => {
    data = data.filter((val) => val.id !== item.id || val.id !== item.id);

    setTableData([...data]);
  };

  return (
    <>
      <Box gap={3} display="flex" flexDirection="row" justifyContent="flex-end">
        <Button onClick={dialog.onTrue} variant="contained" size="small">
          Add New Income
        </Button>
      </Box>
      <Box>
        <Typography component="span" variant="h6" gutterBottom>
          Income OverView
        </Typography>
      </Box>
      <CustomizableTable
        columns={[
          { id: 'incomeSource', label: 'Income Source' },
          { id: 'incomeAmount', label: 'Income Amount' },
          { id: 'paymentMethod', label: 'Payment Method' },
          { id: 'date', label: 'Date' },
          { id: 'paymentStatus', label: 'Payment Status' },
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
                          setIsEdit(true);
                          setSelectedEntry(row);

                          dialog.onTrue();
                        }}
                      >
                        <Iconify icon="solar:pen-bold" />
                        Edit
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          handleDelete(row);
                        }}
                      >
                        <Iconify icon="solar:trash-bin-trash-bold" />
                        Delete
                      </MenuItem>
                    </MenuList>
                  )}
                />
              );
            },
          },
        ]}
        data={tableData}
      />
      <Box>
        {dialog.value && selectedEntry && (
          <FinanceAddNewIncomeDialog
            onSave={handleSave}
            dialogValue={dialog.value}
            onClose={closeDialog}
            data={selectedEntry}
            isEdit={isEdit}
            allData={tableData}
          />
        )}
      </Box>
    </>
  );
};

export default FinanceIncomeTrackingScreen;
