'use client';

import React, { useState, useEffect } from 'react';

import { Box, Button, Switch, MenuItem, MenuList, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import FinanceSettingReceiptbookDialog from './component/finance-setting-receiptbook-dialog';

interface Data {
  id: number;
  receiptBookName: string;
  toggle?: boolean;
  action?: string;
  receiptBookCode: string;
}
let initialData: Data[] = [
  {
    id: 1,
    receiptBookName: 'GSEB',
    receiptBookCode: 'GSE55B',
    toggle: true,
    action: 'view',
  },
  {
    id: 2,
    receiptBookName: 'CBSE',
    receiptBookCode: 'CBS12E',
    toggle: true,
    action: 'view',
  },
  { id: 3, receiptBookName: 'OTHER', receiptBookCode: 'OTH12a', toggle: true, action: 'view' },
];

const FinanceReceiptBookSetting = () => {
  const dialog = useBoolean();
  const [selectedEntry, setSelectedEntry] = useState(initialData);
  const [isEdit, setIsEdit] = useState(false);
  const [tableData, setTableData] = useState(initialData);

  const closeDialog = () => {
    setIsEdit(false);

    dialog.onFalse();
  };

  const handleDelete = (item: any) => {
    initialData = tableData.filter((val) => val.id !== item.id);
    setTableData([...initialData]);
  };
  useEffect(() => {}, [selectedEntry, isEdit]);

  const handleSave = (dataFromDialog: any) => {
    const { id, receiptBookName, receiptBookCode } = dataFromDialog;

    const existingEntryIndex = tableData.findIndex((e) => e.id === id);

    if (isEdit && existingEntryIndex !== -1) {
      const updatedEntry = { ...tableData[existingEntryIndex] };
      updatedEntry.receiptBookName = receiptBookName;
      updatedEntry.receiptBookCode = receiptBookCode;

      const updatedData = [...tableData];
      updatedData[existingEntryIndex] = updatedEntry;

      setTableData(updatedData);
    } else {
      const newReceiptBookName = {
        id,
        receiptBookName,
        receiptBookCode,
      };

      const updatedData = [...tableData, newReceiptBookName];

      setTableData(updatedData);
    }

    closeDialog();
  };

  return (
    <>
      <Box gap={3} display="flex" flexDirection="row" justifyContent="flex-end">
        <Button
          onClick={() => {
            setIsEdit(false);
            dialog.onTrue();
          }}
          variant="contained"
          size="small"
        >
          Add New Receipt Book
        </Button>
      </Box>
      <Box>
        <Typography component="span" variant="h6" gutterBottom>
          Receipt Book Overview
        </Typography>
      </Box>
      <CustomizableTable
        columns={[
          { id: 'receiptBookName', label: 'Receipt Book' },
          { id: 'receiptBookCode', label: 'R-Book Code' },

          {
            id: 'toggle',
            label: 'Status Toggle',
            render() {
              return <Switch />;
            },
          },
          {
            id: 'action',
            label: 'Action',
            render: (value, row: any) => (
              <ThreeDotsActions
                actions={({ popover }: any) => (
                  <MenuList>
                    <MenuItem
                      onClick={() => {
                        setIsEdit(true);

                        setSelectedEntry(row);
                        dialog.onTrue();
                        popover.onClose();
                      }}
                    >
                      <Iconify color="blue" icon="solar:pen-bold" />
                      Edit
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleDelete(row); // Handle delete action
                        popover.onClose(); // Close the popover
                      }}
                    >
                      <Iconify color="red" icon="solar:trash-bin-trash-bold" />
                      Delete
                    </MenuItem>
                  </MenuList>
                )}
              />
            ),
          },
        ]}
        data={tableData}
      />
      {dialog.value && selectedEntry && (
        <FinanceSettingReceiptbookDialog
          onSave={handleSave}
          dialogValue={dialog.value}
          onClose={closeDialog}
          data={selectedEntry}
          isEdit={isEdit}
          allData={tableData}
        />
      )}
      <Box pb="20px" />
    </>
  );
};

export default FinanceReceiptBookSetting;
