'use client';

import React, { useState, useEffect } from 'react';

import { Box, Button, Switch } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { DeleteConfirmationDialog } from 'src/components/delete-confirmation';

import FinanceSettingReceiptbookDialog from './component/finance-setting-receiptbook-dialog';

import type { ReceiptBook } from './component/finance-setting-receiptbook-dialog';

let initialData: ReceiptBook[] = [
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
  const [selectedEntry, setSelectedEntry] = useState<ReceiptBook>(initialData[0]);
  const [isEdit, setIsEdit] = useState(false);
  const [tableData, setTableData] = useState(initialData);
  const dialogForDeleteConfirmation = useBoolean();

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

  const [open, setOpen] = useState(false);

  const closeHandler = () => {
    setIsEdit(false);
    setOpen(false);
  };

  return (
    <>
      {open ? (
        <FinanceSettingReceiptbookDialog
          onSave={handleSave}
          // dialogValue={dialog.value}
          onClose={closeHandler}
          data={selectedEntry}
          isEdit={isEdit}
          allData={tableData}
        />
      ) : (
        <>
          <Box
            pb="20px"
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <CustomBreadcrumbs
              heading="Receipt Book"
              links={[
                { name: 'Finance', href: '/finance/dashboard' },
                { name: 'Settings' },
                { name: 'Receipt Book' },
              ]}
              sx={{ px: 1, mb: 2 }}
            />
            <Box gap={3} display="flex" flexDirection="row" justifyContent="flex-end">
              <Button
                startIcon={<Iconify icon="ic:outline-plus" />}
                onClick={() => {
                  setIsEdit(false);
                  setOpen(true);
                }}
                variant="contained"
                size="small"
              >
                New Receipt Book
              </Button>
            </Box>
          </Box>

          <CustomizableTable
            tableId="finance-receipt-book-setting-table"
            isShowedDense={false}
            isPagination={false}
            isFilter={false}
            isSearch={false}
            columns={[
              { id: 'receiptBookName', label: 'Receipt Book' },
              { id: 'receiptBookCode', label: 'R-Book Code' },

              {
                id: 'toggle',
                label: 'InActive/Active',
                render() {
                  return <Switch />;
                },
              },
              {
                id: 'action',
                label: 'Action',
                render: (value, row: any) => (
                  <ThreeDotsActions
                    showThreeDots={false}
                    showDeleteIcon
                    handleDeleteClick={() => {
                      dialogForDeleteConfirmation.onTrue();
                      // handleDelete(row);
                    }}
                    showEditIcon
                    handleEditClick={() => {
                      setIsEdit(true);

                      setSelectedEntry(row);
                      setOpen(true);
                    }}
                  />
                ),
              },
            ]}
            data={tableData}
          />
        </>
      )}

      {dialogForDeleteConfirmation.value && (
        <DeleteConfirmationDialog
          open={dialogForDeleteConfirmation.value}
          onClose={() => {
            dialogForDeleteConfirmation.onFalse();
          }}
          onConfirm={() => {}}
          title="Delete Item"
          description="Are you sure you want to delete this item? This action cannot be undone."
        />
      )}

      <Box pb="20px" />
    </>
  );
};

export default FinanceReceiptBookSetting;
