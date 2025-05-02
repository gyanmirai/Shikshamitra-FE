'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useState, useEffect } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Button, Switch } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import initialData from 'src/json/finance/settings/receipt-book/receiptBookData.json';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { ConfirmDialog } from 'src/components/confirm-dialog/confirm-dialog';

import HostelFeeReceiptBook from './hostelFeeReceiptBook';

import type { IHostelReceiptBook } from '../hostelFeeInterface';

const HostelReceiptBookSetting = (props: TabComponentType) => {
  // Dialog state for add/edit modal
  const dialog = useBoolean();

  // State to store selected receipt book entry
  const [selectedEntry, setSelectedEntry] = useState<IHostelReceiptBook>(initialData[0]);

  // Flag to determine if in edit mode
  const [isEdit, setIsEdit] = useState(false);

  // State to store all receipt book data
  const [tableData, setTableData] = useState(initialData);

  // Dialog state for delete confirmation
  const dialogForDeleteConfirmation = useBoolean();

  // Effect to handle changes in selected entry or edit mode
  useEffect(() => {}, [selectedEntry, isEdit]);

  // State to control dialog visibility
  const [open, setOpen] = useState(false);

  // Handler to close dialog and reset states
  const closeHandler = () => {
    setIsEdit(false);
    dialog.onFalse();
    setOpen(false);
  };

  return (
    <>
      <Box gap={3} display="flex" justifyContent="flex-end" alignContent="flex-end" ml="auto">
        <Button
          startIcon={<Iconify icon="ic:outline-plus" />}
          onClick={() => {
            setIsEdit(false);
            dialog.onTrue();
            setOpen(true);
          }}
          variant="contained"
          size="small"
        >
          New Receipt Book
        </Button>
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
            minWidth: 40,
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
                  dialog.onTrue();
                  setSelectedEntry(row);
                  setOpen(true);
                }}
              />
            ),
          },
        ]}
        data={tableData}
      />

      {dialogForDeleteConfirmation.value && (
        <ConfirmDialog
          open={dialogForDeleteConfirmation.value}
          onClose={() => {
            dialogForDeleteConfirmation.onFalse();
          }}
          title="Delete Item"
          content="Are you sure want to delete?"
          action={
            <LoadingButton variant="contained" loading={false} color="error" onClick={() => {}}>
              Delete
            </LoadingButton>
          }
        />
      )}

      <CustomDialog
        open={dialog.value}
        handleClose={() => {
          closeHandler();
        }}
        title={isEdit ? 'Edit Receipt Book' : 'Add Receipt Book'}
      >
        <HostelFeeReceiptBook
          onSave={() => {}}
          // dialogValue={dialog.value}
          onClose={closeHandler}
          data={selectedEntry}
          isEdit={isEdit}
          allData={tableData}
        />
      </CustomDialog>

      <Box pb="20px" />
    </>
  );
};

export default HostelReceiptBookSetting;
