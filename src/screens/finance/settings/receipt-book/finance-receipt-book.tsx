'use client';

import React, { useState, useEffect } from 'react';

import { Box, Button, Switch } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import initialData from 'src/json/finance/settings/receipt-book/receiptBookData.json';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { DeleteConfirmationDialog } from 'src/components/delete-confirmation';

import FinanceSettingReceiptbookDialog from './component/finance-setting-receiptbook-dialog';

import type { IReceiptBook } from './receipt-book-interface';

const FinanceReceiptBookSetting = () => {
  const dialog = useBoolean();
  const [selectedEntry, setSelectedEntry] = useState<IReceiptBook>(initialData[0]);
  const [isEdit, setIsEdit] = useState(false);
  const [tableData, setTableData] = useState(initialData);
  const dialogForDeleteConfirmation = useBoolean();

  const closeDialog = () => {
    setIsEdit(false);

    dialog.onFalse();
  };

  useEffect(() => {}, [selectedEntry, isEdit]);

  const [open, setOpen] = useState(false);

  const closeHandler = () => {
    setIsEdit(false);
    setOpen(false);
  };

  return (
    <>
      {open ? (
        <FinanceSettingReceiptbookDialog
          onSave={() => {}}
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
            noDataText={
              <>
                No Receipt Book Found{' '}
                <Box
                  onClick={() => {
                    setIsEdit(false);
                    setOpen(true);
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
                label: 'InActive/Active',
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
