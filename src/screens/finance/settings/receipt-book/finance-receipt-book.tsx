'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Button, IconButton, Typography } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { ConfirmDialog } from 'src/components/confirm-dialog/confirm-dialog';
import initialData from 'src/json/finance/settings/receipt-book/receiptBookData.json';

import FinanceSettingReceiptbookDialog from './component/finance-setting-receiptbook-dialog';

import type { IReceiptBook } from './receipt-book-interface';

const FinanceReceiptBookSetting = () => {
  // Dialog state for general purpose
  const theme = useTheme();

  // Dialog state specifically for receipt book operations
  const receiptBookDialog = useBoolean();

  // Dialog state to handle active/inactive status of receipt books
  const activeDialog = useBoolean();
  // State to store the currently selected receipt book entry
  const [selectedEntry, setSelectedEntry] = useState<IReceiptBook | null>(null);

  // Flag to determine if we're in edit mode
  const [isEdit, setIsEdit] = useState(false);

  // State to store all receipt book entries for the table
  const [tableData, setTableData] = useState(initialData);
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  // Dialog state for delete confirmation
  const dialogForDeleteConfirmation = useBoolean();

  const handleClose = (_e?: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setSelectedEntry(null);
        setIsEdit(false);
        dispatch(setIsChanges(false));
      }, 200); // Adjust delay to match your dialog animation
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      activeDialog.onFalse();
      receiptBookDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      activeDialog.onFalse();
      receiptBookDialog.onFalse();
      resetState();
    }
  };
  return (
    <>
      <>
        <CustomBreadcrumbs
          heading="Receipt Book"
          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            { name: 'Setting', href: '/finance/settings/receipt-book/' },
            { name: 'Receipt Book' },
          ]}
          sx={{ px: 1, mb: 2 }}
          action={
            <Button
              size="small"
              startIcon={<Add />}
              onClick={() => {
                setIsEdit(false);
                receiptBookDialog.onTrue();
              }}
              variant="contained"
            >
              Receipt Book
            </Button>
          }
          description="Manage your receipt books - create, edit and control active status of receipt books for financial transactions"
        />

        <CustomizableTable
          noDataText={
            <>
              No Receipt Book Data Found{' '}
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
          columns={[
            { id: 'receiptBookName', label: 'Receipt Book' },
            { id: 'receiptBookCode', label: 'Receipt Book Code' },
            {
              id: 'toggle',
              label: 'Active',
              isFilter: false,
              isSort: false,
              render(value, row) {
                const statusColor =
                  value === true
                    ? theme.vars.palette.success.main
                    : theme.vars.palette.text.secondary;
                return (
                  <CustomTooltip
                    title={value === true ? 'Active' : 'Inactive'}
                    arrow
                    placement="left"
                    PopperProps={{
                      modifiers: [
                        {
                          name: 'offset',
                          options: {
                            offset: [0, 0], // Try 0 or adjust closer
                          },
                        },
                      ],
                    }}
                  >
                    <IconButton
                      onClick={() => {
                        activeDialog.onTrue();
                        setSelectedEntry(row as IReceiptBook);
                      }}
                      sx={{
                        p: 0.6, // some padding for a more clickable area
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0,0,0,0.06)', // light background to indicate clickability
                        transition: 'transform 0.2s ease-in-out, background-color 0.2s',
                        cursor: 'pointer',
                        '&:hover': { transform: 'scale(1.1)', backgroundColor: 'rgba(0,0,0,0.08)' },
                      }}
                    >
                      <Iconify
                        icon={GlobalIcons.tick}
                        sx={{ width: 20, height: 20, color: statusColor }}
                      />
                    </IconButton>
                  </CustomTooltip>
                );
              },
            },
            {
              id: 'action',
              label: 'Action',
              isFilter: false,
              isSort: false,
              sticky: true,
              align: 'left',
              minWidth: 40,
              render: (value, row: any) => (
                <ThreeDotsActions
                  showThreeDots={false}
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

      {receiptBookDialog.value && (
        <CustomDialog
          handleClose={() => {
            receiptBookDialog.onFalse();
            setTimeout(() => {
              setSelectedEntry(null);
              setIsEdit(false);
            }, 200); // 200ms delay – adjust if needed
          }}
          open={receiptBookDialog.value}
          title={
            <Box display="flex" flexDirection="row" gap={1} alignItems="center">
              <Typography variant="h5">
                {isEdit ? 'Update Receipt Book' : 'Add Receipt Book'}
              </Typography>
              <CustomTooltip
                arrow
                placement="right"
                title={
                  isEdit
                    ? 'Update receipt book details to manage financial records and transactions.'
                    : 'Create new receipt book to organize and track financial transactions.'
                }
              >
                <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
              </CustomTooltip>
            </Box>
          }
        >
          <FinanceSettingReceiptbookDialog
            onSave={() => {}}
            // dialogValue={dialog.value}
            onClose={handleClose}
            data={selectedEntry}
            isEdit={isEdit}
            allData={tableData}
          />
        </CustomDialog>
      )}

      <ConfirmDialog
        open={activeDialog.value}
        onClose={() => {
          setTimeout(() => {
            setSelectedEntry(null);
            setIsEdit(false);
          }, 200); // Adjust delay (in ms) as needed
          activeDialog.onFalse();
        }}
        title={selectedEntry?.toggle === true ? 'InActive' : 'Active'}
        content={
          selectedEntry && Array.isArray(selectedEntry.receiptBookName) ? (
            <>
              Are you sure you want move <strong>{selectedEntry.receiptBookName}</strong> receipt
              book to {selectedEntry.toggle === true ? 'InActive' : 'Active'} ?
            </>
          ) : (
            <>
              Are you sure you want move <strong>{selectedEntry?.receiptBookName}</strong> receipt
              book to {selectedEntry?.toggle === true ? 'InActive' : 'Active'} ?
            </>
          )
        }
        action={
          <Button
            variant="contained"
            size="small"
            startIcon={
              <Iconify
                icon={selectedEntry?.toggle === true ? GlobalIcons.draftIcon : GlobalIcons.publish}
              />
            }
            onClick={() => {
              const status = selectedEntry?.toggle === true ? 'InActive' : 'Active';
              shikshaMitraToast.success({
                message:
                  selectedEntry && Array.isArray(selectedEntry.receiptBookName) ? (
                    <>
                      Receipt Book: <strong>{selectedEntry.receiptBookName}</strong> moved to{' '}
                      {status} successfully.
                    </>
                  ) : (
                    <>
                      Receipt Book: <strong>{selectedEntry?.receiptBookName}</strong> moved to{' '}
                      {status} successfully.
                    </>
                  ),
              });
              setTimeout(() => {
                setSelectedEntry(null);
              }, 200); // Adjust delay (in ms) as needed
              activeDialog.onFalse();
            }}
          >
            {selectedEntry?.toggle === true ? 'InActive' : 'Active'}
          </Button>
        }
      />
      <Box pb="20px" />
    </>
  );
};

export default FinanceReceiptBookSetting;
