import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import React, { useMemo, useState } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Chip, Stack, Switch, TextField, Typography } from '@mui/material';
import {
  feeCategoryApi,
  useGetFeeCategoriesQuery,
  useDeleteFeeCategoryMutation,
  usePatchFeeCategoryStatusMutation,
} from 'src/redux/feeCategory/feeCategoryApi';

import type { IFeeCategory, IFeeCategoryTableProps } from './type';

const FeeCategoryTable: React.FC<IFeeCategoryTableProps> = ({
  onAddFeeCategory,
  setOpenDialog,
  setEditData,
  totalCount,
  isLoading,
  onServerPagination,
  onServerSearch,
}) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const [queryParams, setQueryParams] = React.useState({ page: 1, pageSize: 10, search: '' });

  // Custom hook to fetch fee category data
  const {
    data: feeCategoryData,
    refetch,
    isLoading: isFeeCategoryLoading,
    isFetching: isFeeCategoryFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFeeCategoriesQuery,
    params: { academicYearId: currentYear?.id, ...queryParams },
  });

  const [deleteFeeCategory, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteFeeCategoryMutation,
  });

  const [patchFeeCategoryStatus, { isLoading: isStatusLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePatchFeeCategoryStatusMutation,
  });

  const deleteFeeCategoryDialog = useBoolean();
  const statusConfirm = useBoolean();
  const [selectedFeeCategory, setSelectedFeeCategory] = React.useState<IFeeCategory | null>(null);
  const [statusData, setStatusData] = useState<null | IFeeCategory>(null);
  const [deactivationReason, setDeactivationReason] = useState('');
  const { confirmWithUndo } = useConfirmWithUndo();

  const handleOpenStatusConfirm = (row: IFeeCategory) => {
    setStatusData(row);
    setDeactivationReason('');
    statusConfirm.onTrue();
  };

  const nextStatus = statusData ? !statusData.isActive : false;

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'name',
        label: 'Name',
        align: 'left',
        sticky: true,
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value}
          </Typography>
        ),
      },
      {
        id: 'description',
        label: 'Description',
        align: 'left',
        render: (value) => (
          <Typography
            variant="caption"
            fontSize="13px"
            sx={{
              maxWidth: 300,
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
            }}
          >
            {value || '-'}
          </Typography>
        ),
      },
      {
        id: 'isActive',
        label: 'Status',
        minWidth: 140,
        sticky: true,
        render(value, row) {
          const category = row as IFeeCategory;
          return (
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                size="small"
                label={category.isActive ? 'Active' : 'Inactive'}
                color={category.isActive ? 'success' : 'default'}
                variant="soft"
              />
              <Switch
                size="small"
                checked={category.isActive || false}
                onClick={(event) => event.stopPropagation()}
                onChange={() => handleOpenStatusConfirm(category)}
              />
            </Stack>
          );
        },
      },
      {
        id: 'action',
        label: 'Actions',
        minWidth: 50,
        align: 'left',
        isSort: false,
        sticky: true,
        isFilter: false,
        render(value, row) {
          return (
            <ThreeDotsActions
              showThreeDots={false}
              placement="right-top"
              showDeleteIcon
              showEditIcon
              handleDeleteClick={() => {
                setSelectedFeeCategory(row as IFeeCategory);
                deleteFeeCategoryDialog.onTrue();
              }}
              disableDeleteIcon={row?.isUsedInDownstream}
              handleEditClick={() => {
                setEditData(row as IFeeCategory);
                onAddFeeCategory.onTrue();
              }}
            />
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <>
      <CustomizableTable
        tableId="fee-category-data-table"
        isLoading={isFeeCategoryLoading || isFeeCategoryFetching}
        noDataText={
          <>
            Fee Category Data Not Found{' '}
            <Box
              onClick={() => {
                onAddFeeCategory.onTrue();
                setOpenDialog(true);
                setEditData(null);
              }}
              color="primary.main"
              fontWeight={600}
              sx={{
                '&:hover': {
                  cursor: 'pointer',
                  textDecoration: 'underline',
                },
              }}
            >
              Add Fee Category
            </Box>
          </>
        }
        columns={columns}
        data={feeCategoryData?.items || []}
        serverSidePagination
        serverSideSearch
        totalCount={feeCategoryData?.totalCount}
        onServerPagination={(page, rowsPerPage) => {
          setQueryParams((prev) => ({ ...prev, page, pageSize: rowsPerPage }));
          onServerPagination?.(page, rowsPerPage);
        }}
        onServerSearch={(search) => {
          setQueryParams((prev) => ({ ...prev, search, page: 1 }));
          onServerSearch?.(search);
        }}
      />
      <ConfirmDialog
        open={deleteFeeCategoryDialog.value}
        onClose={() => {
          setSelectedFeeCategory(null);
          deleteFeeCategoryDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete fee category{' '}
            <strong>{selectedFeeCategory?.name}</strong>?
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            color="error"
            size="small"
            loading={isDeleteLoading}
            onClick={async () => {
              confirmWithUndo({
                item: selectedFeeCategory,
                onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
                  dispatchFn(
                    feeCategoryApi.util.updateQueryData(
                      'getFeeCategories',
                      { academicYearId: currentYear?.id, ...queryParams },
                      (draft: any) => {
                        const index = draft.items?.findIndex(
                          (b: any) => b.id === (selectedFeeCategory as any)?.id
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
                  deleteFeeCategory({
                    id: (selectedFeeCategory as any).id,
                  }),
              });
              deleteFeeCategoryDialog.onFalse();
              setSelectedFeeCategory(null);
            }}
          >
            Yes
          </LoadingButton>
        }
      />
      <ConfirmDialog
        open={statusConfirm.value}
        onClose={() => {
          statusConfirm.onFalse();
          setStatusData(null);
          setDeactivationReason('');
        }}
        title={nextStatus ? 'Activate Fee Category' : 'Deactivate Fee Category'}
        content={
          <Stack spacing={2}>
            <Typography variant="body2">
              {nextStatus ? 'Activate' : 'Deactivate'}{' '}
              <Box component="span" fontWeight="bold" color="text.primary">
                {statusData?.name}
              </Box>
              ?
            </Typography>
            {!nextStatus && (
              <TextField
                fullWidth
                multiline
                minRows={2}
                size="small"
                label="Deactivation reason"
                value={deactivationReason}
                onChange={(event) => setDeactivationReason(event.target.value)}
              />
            )}
          </Stack>
        }
        action={
          <LoadingButton
            loading={isStatusLoading}
            variant="contained"
            color={nextStatus ? 'primary' : 'warning'}
            size="small"
            onClick={async () => {
              if (!statusData) return;
              try {
                await patchFeeCategoryStatus({
                  id: statusData.id,
                  body: {
                    isActive: nextStatus,
                    deactivationReason: nextStatus ? null : deactivationReason || null,
                  },
                }).unwrap();
                shikshaMitraToast.success({
                  message: `Fee Category ${nextStatus ? 'activated' : 'deactivated'} successfully`,
                });
                statusConfirm.onFalse();
                setStatusData(null);
                setDeactivationReason('');
              } catch {
                // Keep dialog open on error
              }
            }}
          >
            {nextStatus ? 'Activate' : 'Deactivate'}
          </LoadingButton>
        }
      />
    </>
  );
};

export default FeeCategoryTable;
