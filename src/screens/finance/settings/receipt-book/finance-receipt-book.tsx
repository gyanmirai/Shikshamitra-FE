'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/type';

import { Add } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import React, { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Button, IconButton, Typography } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { ConfirmDialog } from 'src/components/confirm-dialog/confirm-dialog';
import initialData from 'src/json/finance/settings/receipt-book/receiptBookData.json';
import {
  useGetReceiptBooksQuery,
  usePatchReceiptBookMutation,
  useDeleteReceiptBookMutation,
} from 'src/redux/finance/receiptBookApi';

// eslint-disable-next-line import/no-named-as-default
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
  const [tableData] = useState(initialData);
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  // Dialog state for delete confirmation
  const dialogForDeleteConfirmation = useBoolean();

  // DELETE mutation
  const { deleteReceiptBook } = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteReceiptBookMutation,
  });

  // GET receipt book
  const academicYearId = useSelector((state: RootState) => state.academicYearId);
  const { getReceiptBooks, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetReceiptBooksQuery,
    params: { academicYearId },
  });

  // PATCH mutation for status change
  const { patchReceiptBook } = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePatchReceiptBookMutation,
  });

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

  const columns: IColumn[] = useMemo(
    () => [
      { id: 'receiptBookName', label: 'Name', align: 'left', sticky: true },
      { id: 'prefix', label: 'Prefix', align: 'left' },
      { id: 'suffix', label: 'Suffix', align: 'left' },
      {
        id: 'board',
        label: 'Board/Medium',
        align: 'left',
        render: (value, row) => (
          <Typography variant="caption" fontSize="13px">
            {value}/{row.medium}
          </Typography>
        ),
      },
      { id: 'organization', label: 'Organization', align: 'left' },
      { id: 'startingNumber', label: 'Starting No.', align: 'left', minWidth: 130 },
      { id: 'endingNumber', label: 'Ending No.', align: 'left', minWidth: 130 },
      { id: 'description', label: 'Description', align: 'left' },
      {
        id: 'toggle',
        label: 'Active',
        isFilter: false,
        isSort: false,
        sticky: true,
        render(value, row) {
          const statusColor =
            value === true ? theme.vars.palette.success.main : theme.vars.palette.text.secondary;
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
            showDeleteIcon
            handleDeleteClick={() => {
              dialogForDeleteConfirmation.onTrue();
              setSelectedEntry(row);
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
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CustomBreadcrumbs
        heading="Receipt Book"
        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Setting', href: '/finance/settings/receipt-book/' },
          { name: 'Receipt Book' },
        ]}
        sx={{ mb: 1 }}
        action={
          <Button
            size="small"
            startIcon={<Add />}
            onClick={() => {
              setIsEdit(false);
              receiptBookDialog.onTrue();
            }}
            variant="contained"
            sx={{ px: '32px' }}
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
        columns={columns}
        data={tableData}
      />

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
                    ? 'Update the board, medium, organization, prefix, suffix, or number range to keep your receipt sequence accurate. Example: Existing State-GUJ-Org2-RB200, updated range to 500 → continues as State-GUJ-Org2-RB401…RB500'
                    : 'Create a new receipt book by selecting the Board, Medium, and Organization, and defining the prefix, suffix, and number range. Example: CBSE-ENG-Org1-GR0012025, CBSE-ENG-Org1-GR0022025… (Board + Medium + Organization + Prefix + Number + Suffix)'
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
        title={selectedEntry?.toggle === true ? 'Inactive' : 'Active'}
        content={
          selectedEntry && Array.isArray(selectedEntry.receiptBookName) ? (
            <>
              Are you sure you want move <strong>{selectedEntry.receiptBookName}</strong> receipt
              book to {selectedEntry.toggle === true ? 'Inactive' : 'Active'} ?
            </>
          ) : (
            <>
              Are you sure you want move <strong>{selectedEntry?.receiptBookName}</strong> receipt
              book to {selectedEntry?.toggle === true ? 'Inactive' : 'Active'} ?
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
            onClick={async () => {
              try {
                const newStatus = !selectedEntry?.toggle;
                await patchReceiptBook({
                  receiptBookId: selectedEntry?.id,
                  body: { isActive: newStatus },
                }).unwrap();

                const status = newStatus ? 'Active' : 'Inactive';
                shikshaMitraToast.success({
                  message: (
                    <>
                      Receipt Book: <strong>{selectedEntry?.receiptBookName}</strong> moved to{' '}
                      {status} successfully.
                    </>
                  ),
                });
                activeDialog.onFalse();
                setTimeout(() => {
                  setSelectedEntry(null);
                }, 200);
              } catch (error) {
                console.error('Failed to update receipt book status:', error);
                shikshaMitraToast.error({
                  message: 'Failed to update receipt book status',
                });
              }
            }}
          >
            {selectedEntry?.toggle === true ? 'Inactive' : 'Active'}
          </Button>
        }
      />

      <ConfirmDialog
        open={dialogForDeleteConfirmation.value}
        onClose={() => {
          dialogForDeleteConfirmation.onFalse();
          setTimeout(() => {
            setSelectedEntry(null);
          }, 200);
        }}
        title="Delete Receipt Book"
        content={
          <>
            Are you sure you want to delete <strong>{selectedEntry?.receiptBookName}</strong>{' '}
            receipt book? This action cannot be undone.
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            startIcon={<Iconify icon={GlobalIcons.delete} />}
            onClick={async () => {
              try {
                await deleteReceiptBook(selectedEntry?.id).unwrap();

                shikshaMitraToast.success({
                  message: (
                    <>
                      Receipt Book: <strong>{selectedEntry?.receiptBookName}</strong> deleted
                      successfully.
                    </>
                  ),
                });
                dialogForDeleteConfirmation.onFalse();
                setTimeout(() => {
                  setSelectedEntry(null);
                }, 200);
              } catch (error) {
                console.error('Failed to delete receipt book:', error);
                shikshaMitraToast.error({
                  message: 'Failed to delete receipt book',
                });
              }
            }}
          >
            Delete
          </Button>
        }
      />
    </Box>
  );
};

export default FinanceReceiptBookSetting;
