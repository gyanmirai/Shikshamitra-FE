'use client';

import type { ReactNode } from 'react';

import _ from 'lodash';
import { useTheme } from '@mui/material/styles';
import { useBoolean } from 'src/hooks/use-boolean';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import React, { useRef, useMemo, useState, useEffect, useContext, useCallback } from 'react';
import {
  Box,
  Card,
  Alert,
  Paper,
  Table,
  Button,
  Switch,
  TableContainer,
  TablePagination,
  FormControlLabel,
} from '@mui/material';

import { Scrollbar } from '../scrollbar';
import CustomDialog from '../customDialog';
import { exportTable } from './table-export';
import { shikshaMitraToast } from '../toast';
import { getExportableColumns } from './utils';
import { TableBody } from './components/TableBody';
import { ComponentBlock } from '../component-block';
import { useTableData } from './hooks/useTableData';
import { TableExportContext } from './export-context';
import { TableHeader } from './components/TableHeader';
import { FilterChips } from './components/FilterChips';
import { TableToolbar } from './components/TableToolbar';
import { useStickyColumns } from './hooks/useStickyColumns';
import { ColumnFilterMenu } from './components/ColumnFilterMenu';
import {
  useTableConfig,
  getNextTableSorts,
  getNextSingleTableSort,
  reconcileColumnVisibility,
} from './hooks/useTableConfig';

import type { IParams, IColumnFilterAnchor, ICustomizableTableProps } from './types';

const CustomizableTable: React.FC<ICustomizableTableProps> = ({
  columns,
  data,
  tableTitle = 'Table View',
  exportLabel = 'Export',
  exportContext: tableExportContext = [],
  exportScope = 'loaded',
  onExport,
  exportFormats = ['excel', 'pdf'],
  exportBusy = false,
  exportDisabled = false,
  showColumns,
  showExport,
  showFullScreen,
  variant = 'workspace',
  paginationMode = 'known',
  hasNextPage = false,
  serverSide = false,
  serverSidePagination = false,
  serverSideSearch = false,
  serverSideSort = false,
  serverSideSortMode = 'multiple',
  serverSideFilter = false,
  onServerSort,
  onServerPagination,
  onPaginationChange,
  onSearchInputChange,
  onServerSearch,
  onServerFilter,
  onSortChange,
  onFiltersChange,
  onClearCriteria,
  totalCount,
  maxServerRowsPerPage,
  handleRowClick = () => {},
  isLoading = false,
  isPagination = true,
  isFilter = true,
  isSearch = true,
  tableContainerProps = {},
  isShowedDense = true,
  rowProps = () => ({}),
  renderExpandedRow,
  showToolbar = true,
  tableId,
  defaultSearchTerm = '',
  defaultRowsPerPage = 10,
  page: controlledPage,
  rowsPerPage: controlledRowsPerPage,
  paginationDisabled = false,
  searchTerm: controlledSearchTerm,
  filters: controlledFilters,
  sorts: controlledSorts,
  rowsPerPageOptions: configuredRowsPerPageOptions,
  showCheckbox = false,
  onSendNotification = () => {},
  searchFieldProps = {},
  searchableFields,
  noDataText = <>No data available</>,
  errorContent: customErrorContent,
  error: queryError,
  onRetry,
  wrapperProps = {},
}) => {
  const { sx, ...other } = tableContainerProps;
  const { sx: boxSx, ...boxOther } = wrapperProps;
  const tableUniqId = `customizable-table-card-${tableId}`; // Unique ID for this table instance, used for localStorage keys
  const [preparingExport, setPreparingExport] = useState(false);
  const [exportError, setExportError] = useState('');
  const exportLock = useRef(false);
  const exportController = useRef<AbortController | null>(null);
  useEffect(() => () => exportController.current?.abort(), []);
  const exportContext = useContext(TableExportContext);
  const errorContent = useMemo(
    () =>
      customErrorContent ||
      (queryError ? (
        <Alert
          severity="error"
          action={
            onRetry ? (
              <Button size="small" color="inherit" onClick={onRetry}>
                Retry
              </Button>
            ) : undefined
          }
        >
          {parseApiProblemDetail(queryError).detail || 'The table could not be loaded.'}
        </Alert>
      ) : undefined),
    [customErrorContent, queryError, onRetry]
  );
  const incompleteExport = exportScope === 'all' && serverSidePagination && !onExport;
  const canUseColumnFilters = !serverSidePagination || Boolean(onServerFilter || onFiltersChange);
  const shouldUseServerFilter = serverSideFilter || Boolean(onServerFilter);

  // Memoize columns to ensure stability (especially if not memoized by parent)
  const memoizedColumns = useMemo(
    () =>
      columns.map((col) => ({
        ...col,
        isSort: serverSidePagination && !onServerSort && !onSortChange ? false : col.isSort,
        isFilter: canUseColumnFilters ? (col.isFilter ?? true) : false,
      })),
    [canUseColumnFilters, columns, serverSidePagination, onServerSort, onSortChange]
  );

  const { tableConfig, setTableConfig, handleChangeParams } = useTableConfig({
    columns: memoizedColumns,
    defaultSearchTerm,
    defaultRowsPerPage,
  });

  const { page, rowsPerPage, searchTerm, filters, sorts, columnVisibility, dense } = tableConfig;
  const onServerSearchRef = useRef(onServerSearch);

  useEffect(() => {
    onServerSearchRef.current = onServerSearch;
  }, [onServerSearch]);

  const { filteredData, sortedData, paginatedData } = useTableData({
    data,
    config: tableConfig,
    columns: memoizedColumns,
    serverSideFilter: shouldUseServerFilter,
    serverSideSearch,
    serverSideSort,
    serverSidePagination: serverSidePagination || !isPagination,
    searchableFields,
  });

  const rowsPerPageOptions = useMemo(() => {
    if (configuredRowsPerPageOptions) {
      return configuredRowsPerPageOptions;
    }

    const maximum = serverSidePagination ? maxServerRowsPerPage : undefined;
    const baseOptions = [...new Set([10, 25, 50, 100, rowsPerPage])]
      .filter((value) => value > 0 && (!maximum || value <= maximum))
      .sort((a, b) => a - b);
    if (!baseOptions.length && maximum) baseOptions.push(maximum);
    const rowCount = serverSidePagination ? totalCount || 0 : filteredData.length;

    if (rowCount <= 0 || paginationMode === 'unknown') {
      return baseOptions;
    }

    if (serverSidePagination && maxServerRowsPerPage && rowCount > maxServerRowsPerPage) {
      return baseOptions;
    }

    return baseOptions.includes(rowCount)
      ? baseOptions
      : [...baseOptions, { value: rowCount, label: 'All' }];
  }, [
    configuredRowsPerPageOptions,
    filteredData.length,
    maxServerRowsPerPage,
    serverSidePagination,
    totalCount,
    rowsPerPage,
    paginationMode,
  ]);

  useEffect(() => {
    setTableConfig((current) => {
      const changes: Partial<IParams> = {};

      if (controlledSearchTerm !== undefined && controlledSearchTerm !== current.searchTerm) {
        changes.searchTerm = controlledSearchTerm;
        if (controlledPage === undefined) changes.page = 0;
      }

      if (
        controlledFilters &&
        JSON.stringify(controlledFilters) !== JSON.stringify(current.filters)
      ) {
        changes.filters = controlledFilters;
        if (controlledPage === undefined) changes.page = 0;
      }

      if (controlledSorts && !_.isEqual(controlledSorts, current.sorts)) {
        changes.sorts = controlledSorts;
        if (controlledPage === undefined) changes.page = 0;
      }

      if (controlledRowsPerPage !== undefined && controlledRowsPerPage !== current.rowsPerPage) {
        changes.rowsPerPage = controlledRowsPerPage;
      }

      // Apply an explicitly controlled page last so a deep-linked search or
      // filter never resets the visible paginator while the parent still owns
      // the server request offset.
      if (controlledPage !== undefined && controlledPage !== current.page) {
        changes.page = controlledPage;
      }

      return Object.keys(changes).length ? { ...current, ...changes } : current;
    });
  }, [
    controlledFilters,
    controlledPage,
    controlledRowsPerPage,
    controlledSearchTerm,
    controlledSorts,
    setTableConfig,
  ]);

  const [headerRefs, setHeaderRefs] = useState<number[]>([]);
  const [tableRef, setTableRef] = useState<number>(0);

  // For empty content width
  const fullScreenDialog = useBoolean();
  const wasFullScreen = useRef(false);
  useEffect(() => {
    if (wasFullScreen.current && !fullScreenDialog.value)
      document
        .getElementById(tableUniqId)
        ?.querySelector<HTMLButtonElement>('[aria-label="Full screen"]')
        ?.focus();
    wasFullScreen.current = fullScreenDialog.value;
  }, [fullScreenDialog.value, tableUniqId]);

  const { getStickyStyle } = useStickyColumns({
    columns: memoizedColumns,
    columnVisibility,
    headerRefs,
    paginatedData,
    isLoading,
    tableUniqId,
  });

  useEffect(() => {
    const tableElement = document.getElementById(tableUniqId);

    if (!tableElement) return;

    const observer = new ResizeObserver(() => {
      setTableRef(tableElement?.getBoundingClientRect?.()?.width);
    });

    observer.observe(tableElement);

    // eslint-disable-next-line consistent-return
    return () => observer.disconnect();
  }, [tableUniqId]);

  const [filterAnchorEl, setFilterAnchorEl] = useState<IColumnFilterAnchor | null>(null);
  const [expandedRows, setExpandedRows] = useState<{ [key: number]: boolean }>({});

  const handleExpandRow = useCallback((index: number) => {
    setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }));
  }, []);

  const handlePageChange = useCallback(
    (event: unknown, newPage: number) => {
      handleChangeParams({ page: newPage });
      onPaginationChange?.(newPage, rowsPerPage);
      if (serverSidePagination && onServerPagination) {
        onServerPagination(newPage + 1, rowsPerPage);
      }
    },
    [handleChangeParams, serverSidePagination, onServerPagination, onPaginationChange, rowsPerPage]
  );

  const handleRowsPerPageChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newRowsPerPage = +event.target.value;
      handleChangeParams({ rowsPerPage: newRowsPerPage, page: 0 });
      onPaginationChange?.(0, newRowsPerPage);
      if (serverSidePagination && onServerPagination) {
        onServerPagination(1, newRowsPerPage);
      }
    },
    [handleChangeParams, serverSidePagination, onServerPagination, onPaginationChange]
  );

  const handleTableSort = useCallback(
    (column: string, originalId?: string) => {
      const nextSorts =
        serverSideSort && serverSideSortMode === 'single'
          ? getNextSingleTableSort(sorts, column, originalId)
          : getNextTableSorts(sorts, column, originalId);
      handleChangeParams({ sorts: nextSorts, page: 0 });
      onSortChange?.(nextSorts);
      if (serverSideSort) onServerSort?.(column, nextSorts);
    },
    [handleChangeParams, onServerSort, onSortChange, serverSideSort, serverSideSortMode, sorts]
  );

  const handleSearch = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newSearchTerm = event.target.value.trim() ? event.target.value : '';
      handleChangeParams({ searchTerm: newSearchTerm, page: 0 });
      onSearchInputChange?.(newSearchTerm);
      if (serverSideSearch && onServerSearch) {
        // Debounce managed by effect
      }
    },
    [handleChangeParams, onSearchInputChange, serverSideSearch, onServerSearch]
  );

  const handleClearSearch = useCallback(() => {
    handleChangeParams({ searchTerm: '', page: 0 });
    onSearchInputChange?.('');
  }, [handleChangeParams, onSearchInputChange]);

  // Re-implement debounce effect for server search
  useEffect(() => {
    if (serverSideSearch && onServerSearchRef.current) {
      const handler = setTimeout(() => {
        onServerSearchRef.current?.(searchTerm);
      }, 500);
      return () => clearTimeout(handler);
    }
    return () => {};
  }, [searchTerm, serverSideSearch]);

  const handleColumnVisibilityChange = useCallback(
    (columnId: string, isVisible: boolean) => {
      handleChangeParams({
        columnVisibility: { ...columnVisibility, [columnId]: isVisible },
      });
    },
    [columnVisibility, handleChangeParams]
  );

  const handleResetColumns = useCallback(() => {
    handleChangeParams({
      columnVisibility: memoizedColumns.reduce((acc, col) => ({ ...acc, [col.id]: true }), {}),
    });
  }, [handleChangeParams, memoizedColumns]);

  const handleRemoveFilter = useCallback(
    (index: number) => {
      const nextFilters = filters.filter((filterItem, i) => i !== index);
      handleChangeParams({ filters: nextFilters });
      onFiltersChange?.(nextFilters);
      onServerFilter?.(nextFilters);
    },
    [filters, handleChangeParams, onServerFilter, onFiltersChange]
  );

  const handleClearAllFilters = useCallback(() => {
    handleChangeParams({ filters: [] });
    onFiltersChange?.([]);
    onServerFilter?.([]);
  }, [handleChangeParams, onServerFilter, onFiltersChange]);

  const handleApplyColumnFilter = useCallback(
    (
      columnId: string,
      filterType: string,
      value: any,
      valueType: string,
      label?: ReactNode,
      displayValue?: ReactNode
    ) => {
      const newFilter = {
        column: columnId,
        type: filterType,
        value,
        valueType,
        label,
        displayValue,
      };
      const nextFilters = [...filters, newFilter];
      handleChangeParams({ filters: nextFilters, page: 0 });
      onFiltersChange?.(nextFilters);
      onServerFilter?.(nextFilters);
      setFilterAnchorEl(null);
    },
    [filters, handleChangeParams, onServerFilter, onFiltersChange]
  );

  useEffect(() => {
    setTableConfig((current) => {
      const nextColumnVisibility = reconcileColumnVisibility(
        memoizedColumns,
        current.columnVisibility
      );

      return _.isEqual(nextColumnVisibility, current.columnVisibility)
        ? current
        : { ...current, columnVisibility: nextColumnVisibility };
    });
  }, [memoizedColumns, setTableConfig]);

  const theme = useTheme();

  const tableContent = useMemo(
    () => (
      <Box
        sx={{
          // pt: 1,
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          ...boxSx,
        }}
        {...boxOther}
      >
        <Card
          ref={(el) => setTableRef(el?.getBoundingClientRect()?.width || 0)}
          id={tableUniqId}
          data-testid={tableId}
          sx={{
            // boxShadow: theme.customShadows?.z20 || '0px 4px 20px rgba(0, 0, 0, 0.05)',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          {showToolbar && (
            <TableToolbar
              exportLabel={exportLabel}
              isSearch={isSearch}
              showColumns={showColumns ?? isFilter}
              showExport={showExport ?? isFilter}
              showFullScreen={showFullScreen ?? isFilter}
              exportFormats={exportFormats}
              exportBusy={exportBusy || preparingExport}
              onCancelExport={
                preparingExport && onExport ? () => exportController.current?.abort() : undefined
              }
              exportDisabled={
                exportDisabled || incompleteExport || isLoading || Boolean(errorContent)
              }
              exportDisabledReason={
                incompleteExport ? 'Complete export requires a server export source.' : undefined
              }
              searchValue={searchTerm}
              onSearch={handleSearch}
              onClearSearch={handleClearSearch}
              columns={memoizedColumns}
              columnVisibility={columnVisibility}
              onColumnVisibilityChange={handleColumnVisibilityChange}
              onResetColumns={handleResetColumns}
              onExport={async (format) => {
                if (exportLock.current || exportBusy || incompleteExport || exportDisabled) return;
                exportLock.current = true;
                const controller = new AbortController();
                exportController.current = controller;
                setPreparingExport(true);
                setExportError('');
                try {
                  if (onExport)
                    await onExport({
                      signal: controller.signal,
                      format,
                      columns: getExportableColumns(memoizedColumns, columnVisibility),
                      searchTerm,
                      filters,
                      sorts,
                    });
                  else
                    await exportTable({
                      format,
                      columns: memoizedColumns,
                      columnVisibility,
                      rows: sortedData,
                      tableTitle,
                      context: [
                        ...tableExportContext,
                        ...exportContext,
                        searchTerm ? `Search: ${searchTerm}` : '',
                        ...filters.map(
                          (filter) => `${filter.column}: ${filter.type} ${filter.value ?? ''}`
                        ),
                        ...sorts.map((sort) => `${sort.column}: ${sort.direction}`),
                      ].filter(Boolean),
                    });
                } catch (error) {
                  if (controller.signal.aborted) return;
                  setExportError(
                    parseApiProblemDetail(error).detail ||
                      'The table could not be exported. Please try again.'
                  );
                  shikshaMitraToast.error({
                    message: 'The table could not be exported. Please try again.',
                  });
                } finally {
                  exportController.current = null;
                  exportLock.current = false;
                  setPreparingExport(false);
                }
              }}
              searchFieldProps={searchFieldProps}
              isFullScreen={fullScreenDialog.value}
              onToggleFullScreen={fullScreenDialog.onToggle}
            />
          )}
          {exportError && (
            <Alert severity="error" onClose={() => setExportError('')}>
              {exportError}
            </Alert>
          )}

          <FilterChips
            filters={filters}
            onRemoveFilter={handleRemoveFilter}
            onClearAll={handleClearAllFilters}
          />

          <ColumnFilterMenu
            anchorEl={filterAnchorEl}
            onClose={() => setFilterAnchorEl(null)}
            onApplyFilter={handleApplyColumnFilter}
          />

          <ComponentBlock
            sx={{
              px: 0,
              py: 0,
              boxShadow: 'none',
              gap: 0.5,
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              minHeight: 0,
            }}
          >
            <TableContainer
              component={Scrollbar}
              sx={{
                flex: 1,
                minHeight: 0,
                height: '100%',
                '&:focus-visible': {
                  outline: '2px solid',
                  outlineColor: 'primary.main',
                  outlineOffset: -2,
                },
                '& .simplebar-content-wrapper:focus-visible,td:focus-visible': {
                  outline: '2px solid',
                  outlineColor: 'primary.main',
                  outlineOffset: -2,
                },
                ...sx,
              }}
              {...other}
            >
              <Table
                stickyHeader
                aria-label={`${tableTitle} table`}
                size={dense ? 'small' : 'medium'}
                sx={{
                  height: !errorContent && (data.length > 0 || isLoading) ? 'auto' : '100%',
                  '&:focus-visible': {
                    outline: '2px solid',
                    outlineColor: 'primary.main',
                    outlineOffset: -2,
                  },
                }}
              >
                <TableHeader
                  columns={memoizedColumns}
                  columnVisibility={columnVisibility}
                  sorts={sorts}
                  onSort={handleTableSort}
                  filters={filters}
                  onColumnFilterClick={(e, col) => {
                    e.stopPropagation();
                    setFilterAnchorEl({ element: e.currentTarget as HTMLElement, column: col });
                  }}
                  headerRefs={headerRefs}
                  setHeaderRef={setHeaderRefs}
                  getStickyStyle={getStickyStyle}
                  tableUniqId={tableUniqId}
                />
                <TableBody
                  isLoading={isLoading}
                  data={paginatedData}
                  columns={memoizedColumns}
                  columnVisibility={columnVisibility}
                  getStickyStyle={getStickyStyle}
                  dense={dense}
                  onRowClick={handleRowClick}
                  rowProps={rowProps}
                  renderExpandedRow={renderExpandedRow}
                  expandedRows={expandedRows}
                  onExpandRow={handleExpandRow}
                  noDataText={noDataText}
                  errorContent={errorContent}
                  tableRef={tableRef}
                  rowsPerPage={rowsPerPage}
                  searchTerm={searchTerm}
                  hasActiveFilters={filters.length > 0}
                  onClearCriteria={() => {
                    if (onClearCriteria) {
                      handleChangeParams({ searchTerm: '', filters: [], page: 0 });
                      onClearCriteria();
                    } else {
                      handleClearSearch();
                      handleClearAllFilters();
                    }
                  }}
                />
              </Table>
            </TableContainer>
            {(isShowedDense || isPagination) && (
              <Paper
                elevation={0}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: variant === 'embedded' ? 1 : 2,
                  flexWrap: 'wrap',
                  gap: 1,
                  flexShrink: 0,
                  width: '100%',
                  borderTop: `1px dashed ${theme.vars.palette.divider}`,
                }}
              >
                {isShowedDense && (
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={dense}
                        onChange={(e) => handleChangeParams({ dense: e.target.checked })}
                      />
                    }
                    label="Dense"
                    sx={{
                      ml: 0,
                      mr: 0,
                      minHeight: 40,
                      '& .MuiTypography-root': { fontSize: '13px', fontWeight: 500 },
                    }}
                  />
                )}
                {isPagination && (
                  <TablePagination
                    disabled={paginationDisabled}
                    rowsPerPageOptions={rowsPerPageOptions}
                    component="div"
                    count={
                      paginationMode === 'unknown'
                        ? -1
                        : serverSidePagination
                          ? totalCount || 0
                          : filteredData.length
                    }
                    labelDisplayedRows={
                      paginationMode === 'unknown' ? () => `Page ${page + 1}` : undefined
                    }
                    slotProps={
                      paginationMode === 'unknown'
                        ? {
                            actions: {
                              nextButton: { disabled: paginationDisabled || !hasNextPage },
                            },
                          }
                        : undefined
                    }
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                    sx={{
                      width: { xs: '100%', sm: 'auto' },
                      maxWidth: '100%',
                      ml: 'auto',
                      flex: '0 1 auto',
                      '& .MuiTablePagination-toolbar': {
                        height: 'auto',
                        minHeight: 40,
                        flexWrap: 'wrap',
                        justifyContent: 'flex-end',
                        rowGap: 1,
                        pl: 0,
                        pr: 0,
                      },
                      '& .MuiTablePagination-spacer': { display: 'none' },
                      '& .MuiTablePagination-actions': { ml: 1 },
                      '& .MuiTablePagination-selectLabel': { fontSize: '13px' },
                      '& .MuiTablePagination-input': { fontSize: '13px' },
                      '& .MuiTablePagination-displayedRows': { fontSize: '13px' },
                    }}
                  />
                )}
              </Paper>
            )}
          </ComponentBlock>
        </Card>
      </Box>
    ),
    [
      boxSx,
      boxOther,
      tableUniqId,
      theme.palette.divider,
      theme.vars.palette.divider,
      isSearch,
      isFilter,
      exportLabel,
      searchTerm,
      handleSearch,
      handleClearSearch,
      memoizedColumns,
      columnVisibility,
      handleColumnVisibilityChange,
      handleResetColumns,
      searchFieldProps,
      fullScreenDialog.value,
      fullScreenDialog.onToggle,
      filters,
      handleRemoveFilter,
      handleClearAllFilters,
      onClearCriteria,
      filterAnchorEl,
      handleApplyColumnFilter,
      sx,
      other,
      dense,
      sorts,
      handleTableSort,
      headerRefs,
      getStickyStyle,
      isLoading,
      paginatedData,
      handleRowClick,
      rowProps,
      renderExpandedRow,
      showToolbar,
      expandedRows,
      handleExpandRow,
      noDataText,
      errorContent,
      tableRef,
      rowsPerPage,
      isShowedDense,
      isPagination,
      serverSidePagination,
      totalCount,
      rowsPerPageOptions,
      filteredData.length,
      page,
      handlePageChange,
      handleRowsPerPageChange,
      handleChangeParams,
      tableTitle,
      tableId,
      sortedData,
      data.length,
      exportContext,
      tableExportContext,
      onExport,
      exportFormats,
      exportBusy,
      exportDisabled,
      preparingExport,
      incompleteExport,
      exportError,
      showColumns,
      showExport,
      showFullScreen,
      variant,
      paginationMode,
      hasNextPage,
      paginationDisabled,
    ]
  );

  const handleCloseFullScreen = useCallback(() => {
    fullScreenDialog.onFalse();
  }, [fullScreenDialog]);

  return fullScreenDialog.value ? (
    <CustomDialog
      open
      fullScreen
      hasForm={false}
      guardUnsavedChanges={false}
      title={tableTitle}
      handleClose={handleCloseFullScreen}
    >
      {tableContent}
    </CustomDialog>
  ) : (
    tableContent
  );
};

export default CustomizableTable;
