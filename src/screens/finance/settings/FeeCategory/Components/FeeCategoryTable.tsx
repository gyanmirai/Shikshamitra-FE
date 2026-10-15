import type { RootState } from 'src/redux/store';
import type { IColumn, IParams } from 'src/components/customizabaleTable/types';

import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { financePermissions } from 'src/constants/finance-menu';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import { DrawerHeader } from 'src/screens/hr/policies/components/HRPolicySharedUI';
import { usePatchFeeHeadMutation } from 'src/redux/feeHeadManage/feeHeadManageApi';
import {
  Box,
  Chip,
  Stack,
  Alert,
  Button,
  Drawer,
  Switch,
  Divider,
  TextField,
  Typography,
  LinearProgress,
} from '@mui/material';
import {
  feeCategoryApi,
  useGetFeeCategoriesQuery,
  useGetFeeCategoryByIdQuery,
  useDeleteFeeCategoryMutation,
  usePatchFeeCategoryStatusMutation,
} from 'src/redux/feeCategory/feeCategoryApi';

import type { IFeeCategory, IFeeCategoryTableProps } from './type';

const FeeCategoryTable: React.FC<IFeeCategoryTableProps> = ({
  archived,
  onAddFeeCategory,
  setEditData,
  onView,
}) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canView = hasGrantedPermission(
    permissions,
    financePermissions.fees.settings.feeCategoryActions.view
  );
  const canAdd = hasGrantedPermission(
    permissions,
    financePermissions.fees.settings.feeCategoryActions.add
  );
  const canDelete = hasGrantedPermission(
    permissions,
    financePermissions.fees.settings.feeCategoryActions.delete
  );

  const [queryParams, setQueryParams] = React.useState({ page: 1, pageSize: 10, search: '' });
  const [filters, setFilters] = React.useState<IParams['filters']>([]);
  const [sorts, setSorts] = React.useState<IParams['sorts']>([]);
  const tableFilters = filters.length
    ? JSON.stringify(
        filters.map(({ column, type, value }) => ({
          column,
          type,
          value:
            column === 'totalFeeHeads'
              ? type === 'between'
                ? { min: Number(value.min), max: Number(value.max) }
                : Number(value)
              : value,
        }))
      )
    : undefined;
  const categoryQueryArgs = {
    academicYearId: currentYear?.id,
    ...queryParams,
    isActive: !archived,
    filters: tableFilters,
    sortBy: sorts[0]?.column,
    sortDirection: sorts[0]?.direction,
  };

  // Custom hook to fetch fee category data
  const {
    currentData: feeCategoryData,
    refetch,
    isLoading: isFeeCategoryLoading,
    isFetching: isFeeCategoryFetching,
    isError: isFeeCategoryError,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFeeCategoriesQuery,
    params: categoryQueryArgs,
    options: { skip: !currentYear?.id },
    popupConfig: { error: false },
  });

  React.useEffect(() => {
    if (!feeCategoryData) return;
    const lastPage = Math.max(1, Math.ceil(feeCategoryData.totalCount / queryParams.pageSize));
    if (queryParams.page > lastPage) {
      setQueryParams((previous) => ({ ...previous, page: lastPage }));
    }
  }, [feeCategoryData, queryParams.page, queryParams.pageSize]);

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
  const [feeHeadsCategoryId, setFeeHeadsCategoryId] = useState<string | null>(null);
  const [statusData, setStatusData] = useState<null | IFeeCategory>(null);
  const [deactivationReason, setDeactivationReason] = useState('');
  const { confirmWithUndo } = useConfirmWithUndo();

  const feeHeadStatusConfirm = useBoolean();
  const [feeHeadStatusData, setFeeHeadStatusData] = useState<any | null>(null);
  const [feeHeadDeactivationReason, setFeeHeadDeactivationReason] = useState('');
  const {
    currentData: feeHeadsCategory,
    isFetching: isFeeHeadsLoading,
    isError: isFeeHeadsError,
    refetch: refetchFeeHeads,
  } = useGetFeeCategoryByIdQuery(feeHeadsCategoryId ?? '', { skip: !feeHeadsCategoryId });

  const handleOpenStatusConfirm = (row: IFeeCategory) => {
    setStatusData(row);
    setDeactivationReason('');
    statusConfirm.onTrue();
  };

  const nextStatus = statusData ? !statusData.isActive : false;

  const handleOpenFeeHeadStatusConfirm = (row: any) => {
    if (archived || !feeHeadsCategory?.isActive) return;
    setFeeHeadStatusData(row);
    setFeeHeadDeactivationReason('');
    feeHeadStatusConfirm.onTrue();
  };

  const nextFeeHeadStatus = feeHeadStatusData ? !feeHeadStatusData.isActive : false;
  const hasCriteria = Boolean(queryParams.search.trim() || filters.length);
  const hasNoMatches = !isFeeCategoryFetching && feeCategoryData?.totalCount === 0 && hasCriteria;

  const renderFeeHeadsTable = (category: IFeeCategory) => {
    const heads = category.feeHeads || [];

    const feeHeadColumns: IColumn[] = [
      {
        id: 'name',
        label: 'Fee head',
        align: 'left',
        minWidth: 180,
        filterType: 'string',
        render: (value, row: any) => (
          <Typography variant="body2" fontWeight={600} sx={{ overflowWrap: 'anywhere' }}>
            {row.name || '—'}
          </Typography>
        ),
      },
      {
        id: 'description',
        label: 'Description',
        align: 'left',
        minWidth: 150,
        filterType: 'string',
        render: (value) => (
          <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
            {value || '—'}
          </Typography>
        ),
      },
      {
        id: 'incomeCategoryName',
        label: 'Income category',
        align: 'left',
        minWidth: 180,
        filterType: 'string',
        render: (value) => (
          <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
            {value || '—'}
          </Typography>
        ),
      },
      {
        id: 'isConcessionApplied',
        label: 'Concessions',
        align: 'left',
        minWidth: 110,
        filterType: 'enum',
        enumOptions: [
          { label: 'Yes', value: 'true' },
          { label: 'No', value: 'false' },
        ],
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
        minWidth: 100,
        sticky: true,
        stickyPosition: 'right',
        filterType: 'enum',
        enumOptions: [
          { label: 'Active', value: 'true' },
          { label: 'Inactive', value: 'false' },
        ],
        render: (value, row: any) => (
          <Chip
            size="small"
            label={row.isActive ? 'Active' : 'Inactive'}
            color={row.isActive ? 'success' : 'default'}
            variant="soft"
          />
        ),
      },
    ];

    if (canAdd)
      feeHeadColumns.push({
        id: 'action',
        label: 'Change status',
        align: 'right',
        minWidth: 120,
        sticky: true,
        stickyPosition: 'right',
        isSort: false,
        isFilter: false,
        render: (value, row: any) => (
          <CustomTooltip
            title={
              archived || !category.isActive ? 'Restore the category to change fee head status' : ''
            }
          >
            <span>
              <Switch
                size="small"
                checked={row.isActive || false}
                disabled={archived || !category.isActive}
                slotProps={{
                  input: {
                    'aria-label': `${row.isActive ? 'Deactivate' : 'Activate'} ${row.name}`,
                  },
                }}
                onClick={(event) => event.stopPropagation()}
                onChange={() => handleOpenFeeHeadStatusConfirm(row)}
              />
            </span>
          </CustomTooltip>
        ),
      });

    return (
      <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            Mapped fee heads
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {heads.length} {heads.length === 1 ? 'head' : 'heads'}
          </Typography>
        </Stack>
        <CustomizableTable
          tableId={`fee-category-heads-table-${category.id}`}
          tableTitle={`Fee heads mapped to ${category.name}`}
          exportLabel="Export fee heads"
          columns={feeHeadColumns}
          data={heads}
          isLoading={false}
          searchFieldProps={{ placeholder: 'Search fee heads...' }}
          noDataText="No fee heads are mapped to this category."
          tableContainerProps={{
            sx: {
              maxHeight: 'none',
              overflow: 'visible',
            },
          }}
        />
      </Box>
    );
  };

  const columns: IColumn[] = [
    {
      id: 'name',
      label: 'Category name',
      align: 'left',
      minWidth: 240,
      filterType: 'string',
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
      width: 200,
      minWidth: 180,
      maxWidth: 200,
      filterType: 'string',
      render: (value) => (
        <CustomTooltip title={value || ''}>
          <Typography
            variant="caption"
            fontSize="13px"
            sx={{
              display: 'block',
              maxWidth: '100%',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
            }}
          >
            {value || '—'}
          </Typography>
        </CustomTooltip>
      ),
    },
    {
      id: 'totalFeeHeads',
      label: 'Mapped fee heads',
      align: 'right',
      filterType: 'number',
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
      stickyPosition: 'right',
      filterType: 'enum',
      enumOptions: [
        { label: 'Active', value: 'true' },
        { label: 'Archived', value: 'false' },
      ],
      isSort: false,
      render(value, row) {
        const category = row as IFeeCategory;
        return (
          <Chip
            size="small"
            label={category.isActive ? 'Active' : 'Archived'}
            color={category.isActive ? 'success' : 'default'}
            variant="soft"
          />
        );
      },
    },
    {
      id: 'action',
      label: 'Actions',
      minWidth: 50,
      align: 'right',
      isSort: false,
      sticky: true,
      stickyPosition: 'right',
      isFilter: false,
      render(value, row) {
        return (
          <AdaptiveThreeDotsActions
            placement="right-top"
            directActionLimit={2}
            moreLabel={`More actions for ${(row as IFeeCategory).name}`}
            actions={[
              ...(canAdd && !archived
                ? [
                    {
                      id: 'edit',
                      label: 'Edit',
                      icon: 'solar:pen-bold',
                      onClick: () => {
                        setEditData(row as IFeeCategory);
                        onAddFeeCategory.onTrue();
                      },
                    },
                  ]
                : []),
              ...(canView
                ? [
                    {
                      id: 'fee-heads',
                      label: 'View fee heads',
                      icon: 'solar:list-bold-duotone',
                      onClick: () => setFeeHeadsCategoryId((row as IFeeCategory).id),
                    },
                  ]
                : []),
              ...(canDelete && !archived
                ? [
                    {
                      id: 'delete',
                      label: 'Delete',
                      icon: 'solar:trash-bin-trash-bold',
                      color: 'error.main',
                      disabled: row?.isUsedInDownstream,
                      tooltip: row?.isUsedInDownstream
                        ? 'This category is used elsewhere and cannot be deleted.'
                        : undefined,
                      onClick: () => {
                        setSelectedFeeCategory(row as IFeeCategory);
                        deleteFeeCategoryDialog.onTrue();
                      },
                    },
                  ]
                : []),
              ...(canAdd
                ? [
                    {
                      id: 'status',
                      label: archived ? 'Restore' : 'Archive',
                      icon: archived ? 'mdi:archive-arrow-up-outline' : 'mdi:archive-outline',
                      disabled: !archived && Boolean(row?.isUsedInDownstream),
                      tooltip:
                        !archived && row?.isUsedInDownstream
                          ? 'This category is used elsewhere and cannot be archived.'
                          : undefined,
                      onClick: () => handleOpenStatusConfirm(row as IFeeCategory),
                    },
                  ]
                : []),
            ]}
          />
        );
      },
    },
  ];

  return (
    <>
      {isFeeCategoryFetching && feeCategoryData && (
        <LinearProgress aria-label="Updating fee categories" />
      )}
      <CustomizableTable
        tableId="fee-category-data-table"
        tableTitle="Fee categories"
        exportLabel="Export current page"
        isLoading={isFeeCategoryLoading || (isFeeCategoryFetching && !feeCategoryData)}
        errorContent={
          isFeeCategoryError ? (
            <Alert severity="error" action={<Button onClick={() => refetch()}>Retry</Button>}>
              Fee categories could not be loaded.
            </Alert>
          ) : hasNoMatches ? (
            <Stack alignItems="center" spacing={1.5}>
              <Typography variant="subtitle2">
                No {archived ? 'archived ' : ''}fee categories match{' '}
                {queryParams.search.trim() && filters.length
                  ? 'the search and selected filters'
                  : queryParams.search.trim()
                    ? `“${queryParams.search.trim()}”`
                    : 'the selected filters'}
                .
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => {
                  setFilters([]);
                  setQueryParams((prev) => ({ ...prev, search: '', page: 1 }));
                }}
              >
                {queryParams.search.trim() && filters.length
                  ? 'Clear search and filters'
                  : queryParams.search.trim()
                    ? 'Clear search'
                    : 'Clear filters'}
              </Button>
            </Stack>
          ) : undefined
        }
        noDataText={
          !currentYear?.id ? (
            'Select an academic year to view fee categories.'
          ) : archived ? (
            'No archived fee categories.'
          ) : (
            <Stack alignItems="center" spacing={1.5}>
              <span>No fee categories have been added yet.</span>
              {canAdd && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Add />}
                  aria-label="Add Fee Category"
                  onClick={() => {
                    setEditData(null);
                    onAddFeeCategory.onTrue();
                  }}
                >
                  Fee Category
                </Button>
              )}
            </Stack>
          )
        }
        columns={columns}
        data={feeCategoryData?.items || []}
        handleRowClick={canView ? (row) => onView?.(row as IFeeCategory) : undefined}
        rowProps={(row) =>
          canView
            ? {
                tabIndex: 0,
                'aria-label': `View fee category ${row.name}`,
                onKeyDown: (event) => {
                  if (
                    event.target === event.currentTarget &&
                    (event.key === 'Enter' || event.key === ' ')
                  ) {
                    event.preventDefault();
                    onView?.(row as IFeeCategory);
                  }
                },
                sx: {
                  cursor: 'pointer',
                  '&:focus-visible': {
                    outline: '2px solid',
                    outlineColor: 'primary.main',
                    outlineOffset: -2,
                  },
                },
              }
            : {}
        }
        serverSidePagination
        maxServerRowsPerPage={100}
        serverSideSearch
        serverSideFilter
        serverSideSort
        serverSideSortMode="single"
        page={queryParams.page - 1}
        rowsPerPage={queryParams.pageSize}
        searchTerm={queryParams.search}
        filters={filters}
        sorts={sorts}
        searchFieldProps={{ placeholder: 'Search category names...' }}
        totalCount={feeCategoryData?.totalCount}
        onServerPagination={(page, rowsPerPage) => {
          setQueryParams((prev) => ({ ...prev, page, pageSize: rowsPerPage }));
        }}
        onServerSearch={(search) => {
          setQueryParams((prev) => ({ ...prev, search, page: 1 }));
        }}
        onServerFilter={(nextFilters) => {
          setFilters(nextFilters);
          setQueryParams((prev) => ({ ...prev, page: 1 }));
        }}
        onServerSort={(_, nextSorts) => {
          setSorts(nextSorts);
          setQueryParams((prev) => ({ ...prev, page: 1 }));
        }}
      />

      <Drawer
        anchor="right"
        open={Boolean(feeHeadsCategoryId)}
        onClose={() => setFeeHeadsCategoryId(null)}
        PaperProps={{ sx: { width: { xs: '100%', md: 980 }, maxWidth: '100%' } }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <DrawerHeader
            title={feeHeadsCategory?.name ?? 'Fee heads'}
            helpText="Fee heads mapped to this category, including their income category, concession setting, and status."
            onClose={() => setFeeHeadsCategoryId(null)}
          />
          <Divider />
          <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
            {isFeeHeadsError ? (
              <Alert
                severity="error"
                action={<Button onClick={() => refetchFeeHeads()}>Retry</Button>}
              >
                Fee heads could not be loaded.
              </Alert>
            ) : isFeeHeadsLoading && !feeHeadsCategory ? (
              <LinearProgress aria-label="Loading fee heads" />
            ) : feeHeadsCategory ? (
              renderFeeHeadsTable(feeHeadsCategory)
            ) : null}
          </Scrollbar>
        </Box>
      </Drawer>

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
            startIcon={<Iconify icon="mdi:delete-outline" />}
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
                      categoryQueryArgs,
                      (draft: any) => {
                        const index = draft.items?.findIndex(
                          (b: any) => b.id === (selectedFeeCategory as any)?.id
                        );
                        setDeleteIndex(index);
                        if (index !== -1) {
                          draft.items.splice(index, 1);
                          draft.totalCount = Math.max(0, (draft.totalCount ?? 0) - 1);
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
        title={nextStatus ? 'Restore Fee Category' : 'Archive Fee Category'}
        content={
          <Stack spacing={2}>
            <Typography variant="body2">
              {nextStatus ? 'Restore' : 'Archive'}{' '}
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
                label="Archive reason"
                required
                error={!!deactivationReason && !deactivationReason.trim()}
                helperText={
                  deactivationReason && !deactivationReason.trim()
                    ? 'Enter a reason containing text.'
                    : undefined
                }
                value={deactivationReason}
                onChange={(event) => setDeactivationReason(event.target.value)}
              />
            )}
          </Stack>
        }
        action={
          <LoadingButton
            startIcon={<Iconify icon={nextStatus ? 'mdi:restore' : 'mdi:archive-outline'} />}
            loading={isStatusLoading}
            variant="contained"
            color={nextStatus ? 'primary' : 'warning'}
            size="small"
            disabled={!nextStatus && !deactivationReason.trim()}
            onClick={async () => {
              if (!statusData) return;
              try {
                await patchFeeCategoryStatus({
                  id: statusData.id,
                  body: {
                    isActive: nextStatus,
                    deactivationReason: nextStatus ? null : deactivationReason.trim(),
                  },
                }).unwrap();
                shikshaMitraToast.success({
                  message: `Fee Category ${nextStatus ? 'restored' : 'archived'} successfully`,
                });
                statusConfirm.onFalse();
                setStatusData(null);
                setDeactivationReason('');
              } catch {
                // Keep dialog open on error
              }
            }}
          >
            {nextStatus ? 'Restore' : 'Archive'}
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
                required
                error={!!feeHeadDeactivationReason && !feeHeadDeactivationReason.trim()}
                helperText={
                  feeHeadDeactivationReason && !feeHeadDeactivationReason.trim()
                    ? 'Enter a reason containing text.'
                    : undefined
                }
                value={feeHeadDeactivationReason}
                onChange={(event) => setFeeHeadDeactivationReason(event.target.value)}
              />
            )}
          </Stack>
        }
        action={
          <LoadingButton
            startIcon={
              <Iconify icon={nextFeeHeadStatus ? 'mdi:check-circle-outline' : 'mdi:cancel'} />
            }
            loading={isFeeHeadStatusLoading}
            variant="contained"
            color={nextFeeHeadStatus ? 'primary' : 'warning'}
            size="small"
            disabled={!nextFeeHeadStatus && !feeHeadDeactivationReason.trim()}
            onClick={async () => {
              if (!feeHeadStatusData || archived || !feeHeadsCategory?.isActive) return;
              try {
                await patchFeeHeadStatus({
                  feeHeadId: feeHeadStatusData.id,
                  body: {
                    isActive: nextFeeHeadStatus,
                    deactivationReason: nextFeeHeadStatus ? null : feeHeadDeactivationReason.trim(),
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
