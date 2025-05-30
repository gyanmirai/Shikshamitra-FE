'use client';

import React, { useState, useEffect } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Button, Switch } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import initialData from 'src/json/finance/settings/receipt-book/receiptBookData.json';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { ConfirmDialog } from 'src/components/confirm-dialog/confirm-dialog';

import FinanceSettingReceiptbookDialog from './component/finance-setting-receiptbook-dialog';

import type { IReceiptBook } from './receipt-book-interface';

const FinanceReceiptBookSetting = () => {
  // Dialog state for general purpose
  const dialog = useBoolean();

  // Dialog state specifically for receipt book operations
  const receiptBookDialog = useBoolean();

  // State to store the currently selected receipt book entry
  const [selectedEntry, setSelectedEntry] = useState<IReceiptBook>(initialData[0]);

  // Flag to determine if we're in edit mode
  const [isEdit, setIsEdit] = useState(false);

  // State to store all receipt book entries for the table
  const [tableData, setTableData] = useState(initialData);

  // Dialog state for delete confirmation
  const dialogForDeleteConfirmation = useBoolean();

  // Function to close the general dialog and reset edit mode
  const closeDialog = () => {
    setIsEdit(false);
    dialog.onFalse();
  };

  // Effect to handle changes in selected entry or edit mode
  useEffect(() => {}, [selectedEntry, isEdit]);

  // Deprecated: Legacy open state for dialog - consider removing
  const [open, setOpen] = useState(false);

  // Deprecated: Legacy close handler - consider removing
  const closeHandler = () => {
    setIsEdit(false);
    setOpen(false);
  };
  return (
    <>
      <>
        <CustomBreadcrumbs
          heading="Receipt Book"
          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            { name: 'Settings', href: '/finance/settings/receipt-book/' },
            { name: 'Receipt Book' },
          ]}
          sx={{ px: 1, mb: 2 }}
          action={
            <Button
              startIcon={<Iconify icon="ic:outline-plus" />}
              onClick={() => {
                setIsEdit(false);
                // setOpen(true);
                receiptBookDialog.onTrue();
              }}
              variant="contained"
            >
              New Receipt Book
            </Button>
          }
        />

        <CustomizableTable
          noDataText={
            <>
              No Receipt Book Found{' '}
              <Box
                onClick={() => {
                  setIsEdit(false);
                  // setOpen(true);
                  receiptBookDialog.onTrue();
                }}
                color="primary.main"
                fontWeight={600}
                sx={{
                  '&:hover': {
                    cursor: 'pointer',
                    color: 'primary.main',
                    textDecoration: 'underline',
                  },
                }}
              >
                Add Receipt Book
              </Box>
            </>
          }
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
              label: 'Active',
              isFilter: false,
              isSort: false,
              render() {
                return <Switch />;
              },
            },
            {
              id: 'action',
              label: 'Action',
              isFilter: false,
              isSort: false,
              sticky: true,
              align: 'right',
              minWidth: 100,
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
                    receiptBookDialog.onTrue();
                  }}
                />
              ),
            },
          ]}
          data={tableData}
        />
      </>

      {dialogForDeleteConfirmation.value && (
        <ConfirmDialog
          open={dialogForDeleteConfirmation.value}
          onClose={() => {
            dialogForDeleteConfirmation.onFalse();
          }}
          title="Delete Item"
          content="Are you sure you want to delete?"
          action={
            <LoadingButton variant="contained" loading={false} color="error" onClick={() => {}}>
              Yes
            </LoadingButton>
          }
        />
      )}

      {receiptBookDialog.value && (
        <CustomDialog
          maxWidth="sm"
          handleClose={() => {
            receiptBookDialog.onFalse();
          }}
          open={receiptBookDialog.value}
          title={isEdit ? 'Edit Receipt Book' : 'Add Receipt Book'}
        >
          <FinanceSettingReceiptbookDialog
            onSave={() => {}}
            // dialogValue={dialog.value}
            onClose={() => {
              receiptBookDialog.onFalse();
            }}
            data={selectedEntry}
            isEdit={isEdit}
            allData={tableData}
          />
        </CustomDialog>
      )}

      <Box pb="20px" />
    </>
  );
};

export default FinanceReceiptBookSetting;
