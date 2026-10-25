import type { RootState, AppDispatch } from 'src/redux/store';
import type { IColumn, IParams } from 'src/components/customizabaleTable/types';

import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import { useDispatch, useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { financePermissions } from 'src/constants/finance-menu';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { exportTable } from 'src/components/customizabaleTable/table-export';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import { DrawerHeader } from 'src/screens/hr/policies/components/HRPolicySharedUI';
import { usePatchFeeHeadMutation } from 'src/redux/feeHeadManage/feeHeadManageApi';
import { TableExportContext } from 'src/components/customizabaleTable/export-context';
import {
  Box,
  Chip,
  Stack,
  Alert,
  Button,
  Drawer,
  Switch,
  Divider,
  Skeleton,
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

import FeeHeadDependencies from '../../components/FeeHeadDependencies';

import { collectFeeCategoryExportRows } from './fee-category-export';

import type { IFeeCategory, IFeeCategoryTableProps } from './type';

const FeeCategoryTable: React.FC<IFeeCategoryTableProps> = ({
  archived,
  onAddFeeCategory,
  setEditData,
  onView,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const exportContext = React.useContext(TableExportContext);
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
  const categoryDependencyCheck = useGetFeeCategoryByIdQuery(statusData?.id ?? '', {
    skip: !statusConfirm.value || !statusData?.isActive,
    refetchOnMountOrArgChange: true,
  });
  const blockedCategoryHeads =
    categoryDependencyCheck.currentData?.feeHeads.filter(
      (head) => head.isUsedInDownstream || head.dependencies?.isBlocked
    ) ?? [];
  const headDependencyCheck = useGetFeeCategoryByIdQuery(feeHeadsCategoryId ?? '', {
    skip: !feeHeadStatusConfirm.value || !feeHeadStatusData?.isActive,
    refetchOnMountOrArgChange: true,
  });
  const currentHead = headDependencyCheck.currentData?.feeHeads.find(
    (head) => head.id === feeHeadStatusData?.id
  );
  const headBlocked = currentHead?.isUsedInDownstream || currentHead?.dependencies?.isBlocked;
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
            color={value ? 'success' : 'default'}
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
        excludeFromExport: true,
        id: 'action',
        label: 'Change status',
        align: 'left',
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
        <CustomizableTable
          tableId={`fee-category-heads-table-${category.id}`}
          tableTitle={`Fee heads mapped to ${category.name}`}
          exportLabel="Export fee heads"
          variant="embedded"
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
      sticky: true,
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
      cellSx: { textAlign: 'left' as const },
      id: 'totalFeeHeads',
      label: 'Mapped fee heads',
      align: 'left',
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
      align: 'left',
      stickyPosition: 'right',
      excludeFromExport: true,
      id: 'action',
      label: 'Actions',
      minWidth: 176,
      isSort: false,
      sticky: true,
      isFilter: false,
      render(value, row) {
        return (
          <AdaptiveThreeDotsActions
            placement="right-top"
            sx={{ justifyContent: 'flex-start' }}
            directActionLimit={3}
            moreLabel={`More actions for ${(row as IFeeCategory).name}`}
            actions={[
              ...(canAdd && !archived
                ? [
                    {
                      id: 'edit',
                      label: 'Edit',
                      icon: GlobalIcons.edit,
                      onClick: () => {
                        setEditData(row as IFeeCategory);
                        onAddFeeCategory.onTrue();
                      },
                    },
                  ]
                : []),
              ...(canDelete && !archived
                ? [
                    {
                      id: 'delete',
                      label: 'Delete',
                      icon: GlobalIcons.delete,
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
    <Box sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      {isFeeCategoryFetching && feeCategoryData && (
        <LinearProgress aria-label="Updating fee categories" />
      )}
      <CustomizableTable
        tableId="fee-category-data-table"
        tableTitle="Fee categories"
        exportLabel="Export"
        exportScope="all"
        onExport={async ({
          signal = new AbortController().signal,
          format,
          columns: exportColumns,
        }) => {
          const rows = await collectFeeCategoryExportRows(async (page) => {
            const request = dispatch(
              feeCategoryApi.endpoints.getFeeCategories.initiate(
                { ...categoryQueryArgs, page, pageSize: 100 },
                { subscribe: false, forceRefetch: true }
              )
            );
            const abortRequest = () => request.abort();
            signal.addEventListener('abort', abortRequest, { once: true });
            try {
              return await request.unwrap();
            } finally {
              signal.removeEventListener('abort', abortRequest);
              request.unsubscribe();
            }
          }, signal);
          signal.throwIfAborted();
          await exportTable({
            format,
            columns: exportColumns,
            columnVisibility: Object.fromEntries(exportColumns.map((column) => [column.id, true])),
            rows,
            tableTitle: 'Fee categories',
            context: [
              ...exportContext,
              `Status: ${archived ? 'Archived' : 'Current'}`,
              queryParams.search ? `Search: ${queryParams.search}` : '',
              ...filters.map(
                (filter) => `${filter.column}: ${filter.type} ${JSON.stringify(filter.value)}`
              ),
              ...sorts.map((sort) => `${sort.column}: ${sort.direction}`),
            ].filter(Boolean),
          });
        }}
        wrapperProps={{ sx: { flex: 1, minHeight: 0 } }}
        tableContainerProps={{ sx: { height: 1 } }}
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
        handleRowClick={
          canView
            ? (row) => (onView ? onView(row as IFeeCategory) : setFeeHeadsCategoryId(row.id))
            : undefined
        }
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
                    if (onView) onView(row as IFeeCategory);
                    else setFeeHeadsCategoryId(row.id);
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
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflowWrap: 'anywhere',
          }}
        >
          <DrawerHeader
            helpText="Fee heads mapped to this category, including their income category, concession setting, and status."
            title={feeHeadsCategory?.name ?? 'Fee heads'}

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
              <Stack spacing={1.5} sx={{ p: 2 }} role="status" aria-label="Loading fee heads">
                {Array.from({ length: 5 }, (_, index) => (
                  <Skeleton key={index} variant="rounded" height={48} />
                ))}
              </Stack>
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
        disableCancel={isStatusLoading}
        disableEscapeKeyDown={isStatusLoading}
        disableBackdropClick={isStatusLoading}
        onClose={() => {
          if (isStatusLoading) return;
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
            {!nextStatus && categoryDependencyCheck.isFetching && (
              <Typography role="status">Checking fee category dependencies…</Typography>
            )}
            {!nextStatus && categoryDependencyCheck.isError && (
              <Alert
                severity="error"
                action={
                  <Button size="small" onClick={() => categoryDependencyCheck.refetch()}>
                    Retry
                  </Button>
                }
              >
                Could not verify dependencies. Retry before archiving.
              </Alert>
            )}
            {!nextStatus &&
              blockedCategoryHeads.map((head) => (
                <FeeHeadDependencies
                  key={head.id}
                  name={head.name}
                  showName
                  feeHeadId={head.id}
                  dependencies={head.dependencies}
                />
              ))}
            {!nextStatus && blockedCategoryHeads.length === 0 && (
              <TextField
                fullWidth
                multiline
                minRows={2}
                size="small"
                label="Archive reason"
                required
                error={!!deactivationReason && !deactivationReason.trim()}
                helperText={
                  (deactivationReason && !deactivationReason.trim()
                    ? 'Enter a reason containing text.'
                    : undefined) || undefined
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
            disabled={
              !nextStatus &&
              (!deactivationReason.trim() ||
                categoryDependencyCheck.isFetching ||
                categoryDependencyCheck.isError ||
                !categoryDependencyCheck.currentData ||
                blockedCategoryHeads.length > 0)
            }
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
        disableCancel={isFeeHeadStatusLoading}
        disableEscapeKeyDown={isFeeHeadStatusLoading}
        disableBackdropClick={isFeeHeadStatusLoading}
        onClose={() => {
          if (isFeeHeadStatusLoading) return;
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
            {!nextFeeHeadStatus && headDependencyCheck.isFetching && (
              <Typography role="status">Checking fee head dependencies…</Typography>
            )}
            {!nextFeeHeadStatus && headDependencyCheck.isError && (
              <Alert
                severity="error"
                action={
                  <Button size="small" onClick={() => headDependencyCheck.refetch()}>
                    Retry
                  </Button>
                }
              >
                Could not verify dependencies. Retry before deactivating.
              </Alert>
            )}
            {!nextFeeHeadStatus && headBlocked && (
              <FeeHeadDependencies
                name={currentHead?.name ?? feeHeadStatusData?.name ?? 'Fee head'}
                feeHeadId={currentHead?.id}
                dependencies={currentHead?.dependencies}
              />
            )}
            {!nextFeeHeadStatus && !headBlocked && (
              <TextField
                fullWidth
                multiline
                minRows={2}
                size="small"
                label="Deactivation reason"
                required
                error={!!feeHeadDeactivationReason && !feeHeadDeactivationReason.trim()}
                helperText={
                  (feeHeadDeactivationReason && !feeHeadDeactivationReason.trim()
                    ? 'Enter a reason containing text.'
                    : undefined) || undefined
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
            disabled={
              !nextFeeHeadStatus &&
              (!feeHeadDeactivationReason.trim() ||
                headDependencyCheck.isFetching ||
                headDependencyCheck.isError ||
                !currentHead ||
                Boolean(headBlocked))
            }
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
    </Box>
  );
};

export default FeeCategoryTable;
