'use client';

import type { IParams } from 'src/components/customizabaleTable/types';
import { serializeFinanceTableFilters } from 'src/screens/finance/components/financeTableQuery';

import { useFinanceFormClose } from 'src/hooks/use-finance-form-close';
import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { useMemo, useState, useCallback } from 'react';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Button, IconButton, Typography } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ConfirmDialog } from 'src/components/confirm-dialog/confirm-dialog';
// import initialData from 'src/json/finance/settings/receipt-book/receiptBookData.json';
import {
  receiptBookApi,
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
  // const [tableData] = useState(initialData);

  // Dialog state for delete confirmation
  const deleteDialog = useBoolean();
  const { confirmWithUndo } = useConfirmWithUndo();

  // DELETE mutation
  const [deleteReceiptBook, { isLoading: isDeleting }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteReceiptBookMutation,
  });

  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const [queryParams, setQueryParams] = useState({ page: 1, pageSize: 10, search: '' });
  const [filters, setFilters] = useState<IParams['filters']>([]);

  const handleServerPagination = useCallback((page: number, rowsPerPage: number) => {
    setQueryParams((prev) => ({ ...prev, page, pageSize: rowsPerPage }));
  }, []);

  const handleServerSearch = useCallback((search: string) => {
    setQueryParams((prev) => ({ ...prev, search, page: 1 }));
  }, []);

  // GET receipt book
  const {
    data: receiptBookData,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetReceiptBooksQuery,
    params: {
      academicYearId: currentYear?.id,
      ...queryParams,
      filters: serializeFinanceTableFilters(filters),
    },
  });

  // PATCH mutation for status change
  const [patchReceiptBook, { isLoading: isPatchLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePatchReceiptBookMutation,
  });

  const { handleClose, confirmation: discardConfirmation } = useFinanceFormClose(
    receiptBookDialog.value || activeDialog.value,
    () => {
      activeDialog.onFalse();
      receiptBookDialog.onFalse();
      setSelectedEntry(null);
      setIsEdit(false);
    }
  );

  const { refetch } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetReceiptBooksQuery,
    params: { academicYearId: currentYear?.id, ...queryParams },
  });

  const columns: IColumn[] = useMemo(
    () => [
      {
        stickyPosition: 'left',
        id: 'name',
        isFilter: true,
        label: 'Name',
        filterType: 'string' as const,
        align: 'left',
        sticky: true,
      },
      {
        id: 'prefix',
        isFilter: true,
        label: 'Prefix',
        filterType: 'string' as const,
        align: 'left',
      },
      {
        id: 'suffix',
        isFilter: true,
        label: 'Suffix',
        filterType: 'string' as const,
        align: 'left',
      },
      {
        id: 'board',
        isFilter: true,
        label: 'Board/Medium',
        filterType: 'string' as const,
        align: 'left',
        render: (value, row) => (
          <Typography variant="caption" fontSize="13px">
            {row.boardName}/{row.mediumName}
          </Typography>
        ),
      },
      {
        id: 'mediumStageName',
        isFilter: true,
        label: 'Organization',
        filterType: 'string' as const,
        align: 'left',
      },
      {
        id: 'startingNumber',
        isFilter: true,
        label: 'Starting No.',
        filterType: 'number' as const,
        align: 'left',
        minWidth: 130,
      },
      {
        id: 'endingNumber',
        isFilter: true,
        label: 'Ending No.',
        filterType: 'number' as const,
        align: 'left',
        minWidth: 130,
      },
      {
        id: 'description',
        isFilter: true,
        label: 'Description',
        filterType: 'string' as const,
        align: 'left',
        render: (value) => (
          <CustomTooltip title={value} arrow sx={{ textAlign: 'justify' }}>
            <Typography
              variant="caption"
              noWrap
              sx={{
                maxWidth: 150,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
              }}
            >
              {value}
            </Typography>
          </CustomTooltip>
        ),
      },
      {
        stickyPosition: 'right',
        id: 'isActive',
        label: 'Active',
        filterType: 'enum' as const,
        enumOptions: [
          { label: 'Active', value: 1 },
          { label: 'Inactive', value: 0 },
        ],
        isFilter: true,
        isSort: false,
        sticky: true,
        render(value, row) {
          const statusColor =
            value === true ? theme.vars.palette.success.main : theme.vars.palette.text.secondary;
          return (
            <CustomTooltip
              title={value === true ? 'Active' : 'Deactive'}
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
        stickyPosition: 'right',
        excludeFromExport: true,
        id: 'action',
        label: 'Action',
        isFilter: false,
        isSort: false,
        sticky: true,
        align: 'left',
        minWidth: 40,
        render: (value, row: any) => (
          <AdaptiveThreeDotsActions
            directActionLimit={3}
            actions={[
              {
                id: 'edit',
                label: 'Edit',
                icon: 'solar:pen-bold',
                onClick: () => {
                  setIsEdit(true);
                  setSelectedEntry(row);
                  receiptBookDialog.onTrue();
                },
              },
              {
                id: 'delete',
                label: 'Delete',
                icon: 'solar:trash-bin-trash-bold',
                onClick: () => {
                  setSelectedEntry(row);
                  deleteDialog.onTrue();
                },
                color: 'error.main',
              },
            ]}
          />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {discardConfirmation}
      <CustomBreadcrumbs
        description="Manage your receipt books - create, edit and control active status of receipt books for financial transactions"
        heading="Receipt Book"
        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Fees', href: '/finance/fee-collection' },
          { name: 'Settings' },
          { name: 'Receipt Book' },
        ]}
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
      />

      <CustomizableTable
        isLoading={isLoading || isFetching}
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
        data={receiptBookData?.items || []}
        serverSideFilter
        filters={filters}
        page={queryParams.page - 1}
        rowsPerPage={queryParams.pageSize}
        onServerFilter={(next) => {
          setFilters(next);
          setQueryParams((current) => ({ ...current, page: 1 }));
        }}
        serverSidePagination
        serverSideSearch
        totalCount={receiptBookData?.totalCount}
        onServerPagination={handleServerPagination}
        onServerSearch={handleServerSearch}
      />

      {receiptBookDialog.value && (
        <CustomDialog
          guardUnsavedChanges={false}
          handleClose={() => handleClose()}
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
          maxWidth="sm"
        >
          <FinanceSettingReceiptbookDialog
            onSave={() => {}}
            // dialogValue={dialog.value}
            onClose={handleClose}
            data={selectedEntry}
            isEdit={isEdit}
            allData={receiptBookData?.items || []}
          />
        </CustomDialog>
      )}

      <ConfirmDialog
        open={activeDialog.value}
        onClose={() => handleClose()}
        title={selectedEntry?.isActive === true ? 'Deactive' : 'Active'}
        content={
          selectedEntry && Array.isArray(selectedEntry.name) ? (
            <>
              Are you sure you want move <strong>{selectedEntry.name}</strong> receipt book to{' '}
              <strong>{selectedEntry.isActive === true ? 'Deactive' : 'Active'}</strong> ?
            </>
          ) : (
            <>
              Are you sure you want move <strong>{selectedEntry?.name}</strong> receipt book to{' '}
              <strong>{selectedEntry?.isActive === true ? 'Deactive' : 'Active'}</strong> ?
            </>
          )
        }
        action={
          <LoadingButton
            variant="contained"
            size="small"
            loading={isPatchLoading}
            startIcon={
              <Iconify
                icon={selectedEntry?.isActive === true ? GlobalIcons.cancel : GlobalIcons.tick}
              />
            }
            onClick={async () => {
              try {
                const newStatus = !selectedEntry?.isActive;
                await patchReceiptBook({
                  receiptBookId: selectedEntry?.id,
                  body: { isActive: newStatus },
                }).unwrap();

                const status = newStatus ? 'Active' : 'Deactive';
                shikshaMitraToast.success({
                  message: (
                    <>
                      Receipt Book: <strong>{selectedEntry?.name}</strong> moved to {status}{' '}
                      successfully.
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
            {selectedEntry?.isActive === true ? 'Deactive' : 'Active'}
          </LoadingButton>
        }
      />

      <ConfirmDialog
        open={deleteDialog.value}
        onClose={() => {
          setTimeout(() => {
            setSelectedEntry(null);
          }, 200);
          deleteDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete receipt book <strong>{selectedEntry?.name}</strong>?
          </>
        }
        action={
          <LoadingButton
            startIcon={<Iconify icon="mdi:delete-outline" />}
            variant="contained"
            color="error"
            size="small"
            loading={isDeleting}
            disabled={isDeleting}
            onClick={async () => {
              confirmWithUndo({
                item: selectedEntry,
                onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
                  dispatchFn(
                    receiptBookApi.util.updateQueryData(
                      'getReceiptBooks',
                      { academicYearId: currentYear?.id, ...queryParams },
                      (draft: any) => {
                        const index = draft.items?.findIndex(
                          (b: any) => b.id === (selectedEntry as any)?.id
                        );
                        setDeleteIndex(index);
                        if (index !== -1) {
                          draft.items.splice(index, 1);
                        }
                      }
                    )
                  ),
                onUndoRestore: () => refetch(),
                onCommit: () =>
                  deleteReceiptBook({
                    id: (selectedEntry as any).id,
                  }),
              });
              deleteDialog.onFalse();
              setSelectedEntry(null);
            }}
          >
            Yes
          </LoadingButton>
        }
      />
    </Box>
  );
};

export default FinanceReceiptBookSetting;
