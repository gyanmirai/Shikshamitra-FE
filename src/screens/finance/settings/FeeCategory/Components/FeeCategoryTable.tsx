import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import React, { useMemo, useState } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Chip, Stack, Switch, TextField, Typography } from '@mui/material';
import { usePatchFeeHeadMutation } from 'src/redux/feeHeadManage/feeHeadManageApi';
import { getFeeHeadModuleDisplayName } from 'src/redux/feeHeadModule/feeHeadModuleApi';
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
  onView,
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

  const [patchFeeHeadStatus, { isLoading: isFeeHeadStatusLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePatchFeeHeadMutation,
  });

  const deleteFeeCategoryDialog = useBoolean();
  const statusConfirm = useBoolean();
  const [selectedFeeCategory, setSelectedFeeCategory] = React.useState<IFeeCategory | null>(null);
  const [statusData, setStatusData] = useState<null | IFeeCategory>(null);
  const [deactivationReason, setDeactivationReason] = useState('');
  const { confirmWithUndo } = useConfirmWithUndo();

  const feeHeadStatusConfirm = useBoolean();
  const [feeHeadStatusData, setFeeHeadStatusData] = useState<any | null>(null);
  const [feeHeadDeactivationReason, setFeeHeadDeactivationReason] = useState('');

  const handleOpenStatusConfirm = (row: IFeeCategory) => {
    setStatusData(row);
    setDeactivationReason('');
    statusConfirm.onTrue();
  };

  const nextStatus = statusData ? !statusData.isActive : false;

  const handleOpenFeeHeadStatusConfirm = (row: any) => {
    setFeeHeadStatusData(row);
    setFeeHeadDeactivationReason('');
    feeHeadStatusConfirm.onTrue();
  };

  const nextFeeHeadStatus = feeHeadStatusData ? !feeHeadStatusData.isActive : false;

  const renderFeeHeadsTable = (category: IFeeCategory) => {
    const heads = category.feeHeads || [];

    const feeHeadColumns: IColumn[] = [
      {
        id: 'feeHeadName',
        label: 'Fee Head Name',
        align: 'left',
        render: (value, row: any) => (
          <Typography variant="caption" fontSize="13px">
            {row.name || ''}
          </Typography>
        ),
      },
      {
        id: 'description',
        label: 'Description',
        align: 'left',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {value || '-'}
          </Typography>
        ),
      },
      {
        id: 'module',
        label: 'Module',
        align: 'left',
        render: (value) => (
          <Typography variant="caption" fontSize="13px">
            {getFeeHeadModuleDisplayName(value)}
          </Typography>
        ),
      },
      {
        id: 'isConcessionApplied',
        label: 'Concession Applicable',
        align: 'left',
        render: (value) => (
          <Chip
            size="small"
            label={value ? 'Yes' : 'No'}
            color={value ? 'primary' : 'default'}
            variant="soft"
          />
        ),
      },
      {
        id: 'isActive',
        label: 'Status',
        align: 'left',
        render: (value, row: any) => (
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              size="small"
              label={row.isActive ? 'Active' : 'Inactive'}
              color={row.isActive ? 'success' : 'default'}
              variant="soft"
            />
            <Switch
              size="small"
              checked={row.isActive || false}
              onClick={(event) => event.stopPropagation()}
              onChange={() => handleOpenFeeHeadStatusConfirm(row)}
            />
          </Stack>
        ),
      },
    ];

    return (
      <Box sx={{ p: 2, bgcolor: 'background.neutral' }}>
        <Typography variant="subtitle2" fontWeight={600} mb={1.5}>
          Mapped Fee Heads
        </Typography>
        {heads.length === 0 ? (
          <Typography variant="caption" color="text.secondary">
            No Fee Heads mapped to this category.
          </Typography>
        ) : (
          <CustomizableTable
            tableId={`fee-category-heads-table-${category.id}`}
            columns={feeHeadColumns}
            data={heads}
            isLoading={false}
            isSearch={false}
            isFilter={false}
            tableContainerProps={{
              sx: {
                maxHeight: 'none',
                overflow: 'visible',
              },
            }}
          />
        )}
      </Box>
    );
  };

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
        children: (row: any) => renderFeeHeadsTable(row as IFeeCategory),
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
        id: 'feeHeads',
        label: 'Fee Heads',
        align: 'left',
        render(value, row) {
          const category = row as IFeeCategory;
          const heads = category.feeHeads || [];
          if (heads.length === 0) return '-';
          const displayedHeads = heads
            .slice(0, 3)
            .map((h) => h.name || '')
            .filter(Boolean);
          const displayString = displayedHeads.join(', ');
          const moreCount = heads.length - displayedHeads.length;
          const tooltipTitle = heads
            .map((h) => h.name || '')
            .filter(Boolean)
            .join(', ');

          return (
            <CustomTooltip title={tooltipTitle} arrow sx={{ textAlign: 'justify' }}>
              <Typography variant="caption" fontSize="13px">
                {displayString}
                {moreCount > 0 ? ` +${moreCount} More` : ''}
              </Typography>
            </CustomTooltip>
          );
        },
      },
      {
        id: 'totalFeeHeads',
        label: 'Total Fee Heads',
        align: 'left',
        render(value, row) {
          const category = row as IFeeCategory;
          return (
            <Typography variant="caption" fontSize="13px">
              {category.totalFeeHeads ?? category.feeHeads?.length ?? 0}
            </Typography>
          );
        },
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
              showViewIcon
              handleDeleteClick={() => {
                setSelectedFeeCategory(row as IFeeCategory);
                deleteFeeCategoryDialog.onTrue();
              }}
              disableDeleteIcon={row?.isUsedInDownstream}
              handleEditClick={() => {
                setEditData(row as IFeeCategory);
                onAddFeeCategory.onTrue();
              }}
              handleViewClick={() => {
                onView?.(row as IFeeCategory);
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
      <ConfirmDialog
        open={feeHeadStatusConfirm.value}
        onClose={() => {
          feeHeadStatusConfirm.onFalse();
          setFeeHeadStatusData(null);
          setFeeHeadDeactivationReason('');
        }}
        title={nextFeeHeadStatus ? 'Activate Fee Head' : 'Deactivate Fee Head'}
        content={
          <Stack spacing={2}>
            <Typography variant="body2">
              Are you sure you want to {nextFeeHeadStatus ? 'activate' : 'deactivate'}{' '}
              <Box component="span" fontWeight="bold" color="text.primary">
                {feeHeadStatusData?.name}
              </Box>
              ?
            </Typography>
            {!nextFeeHeadStatus && (
              <TextField
                fullWidth
                multiline
                minRows={2}
                size="small"
                label="Deactivation reason"
                value={feeHeadDeactivationReason}
                onChange={(event) => setFeeHeadDeactivationReason(event.target.value)}
              />
            )}
          </Stack>
        }
        action={
          <LoadingButton
            loading={isFeeHeadStatusLoading}
            variant="contained"
            color={nextFeeHeadStatus ? 'primary' : 'warning'}
            size="small"
            onClick={async () => {
              if (!feeHeadStatusData) return;
              try {
                await patchFeeHeadStatus({
                  feeHeadId: feeHeadStatusData.id,
                  body: {
                    isActive: nextFeeHeadStatus,
                    deactivationReason: nextFeeHeadStatus
                      ? null
                      : feeHeadDeactivationReason || null,
                  },
                }).unwrap();
                shikshaMitraToast.success({
                  message: `Fee Head ${nextFeeHeadStatus ? 'activated' : 'deactivated'} successfully`,
                });
                refetch();
                feeHeadStatusConfirm.onFalse();
                setFeeHeadStatusData(null);
                setFeeHeadDeactivationReason('');
              } catch {
                // Keep dialog open on error
              }
            }}
          >
            {nextFeeHeadStatus ? 'Activate' : 'Deactivate'}
          </LoadingButton>
        }
      />
    </>
  );
};

export default FeeCategoryTable;
