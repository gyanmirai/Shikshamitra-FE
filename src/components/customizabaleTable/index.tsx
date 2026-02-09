'use client';

import type { ReactNode } from 'react';

import { useTheme } from '@mui/material/styles';
import { useBoolean } from 'src/hooks/use-boolean';
import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  Paper,
  Table,
  Switch,
  TableContainer,
  TablePagination,
  FormControlLabel,
} from '@mui/material';

import { Scrollbar } from '../scrollbar';
import CustomDialog from '../customDialog';
import { TableBody } from './components/TableBody';
import { ComponentBlock } from '../component-block';
import { useTableData } from './hooks/useTableData';
import { TableHeader } from './components/TableHeader';
import { FilterChips } from './components/FilterChips';
import { useTableConfig } from './hooks/useTableConfig';
import { TableToolbar } from './components/TableToolbar';
import { useStickyColumns } from './hooks/useStickyColumns';
import { ColumnFilterMenu } from './components/ColumnFilterMenu';

import type { IColumnFilterAnchor, ICustomizableTableProps } from './types';

const CustomizableTable: React.FC<ICustomizableTableProps> = ({
  columns,
  data,
  serverSide = false,
  serverSidePagination = false,
  serverSideSearch = false,
  serverSideSort = false,
  serverSideFilter = false,
  onServerSort,
  onServerPagination,
  onServerSearch,
  totalCount,
  handleRowClick = () => {},
  isLoading = false,
  isPagination = true,
  isFilter = true,
  isSearch = true,
  tableContainerProps = {},
  isShowedDense = true,
  rowProps = () => ({}),
  tableId,
  showCheckbox = false,
  onSendNotification = () => {},
  searchFieldProps = {},
  noDataText = <>No data available</>,
  wrapperProps = {},
}) => {
  const { sx, ...other } = tableContainerProps;
  const { sx: boxSx, ...boxOther } = wrapperProps;

  // Memoize columns to ensure stability (especially if not memoized by parent)
  const memoizedColumns = useMemo(
    () => columns.map((col) => ({ ...col, isFilter: col.isFilter ?? true })),
    [columns]
  );

  const { tableConfig, handleChangeParams, handleSort } = useTableConfig({
    columns: memoizedColumns,
  });

  const { page, rowsPerPage, searchTerm, filters, sorts, columnVisibility, dense } = tableConfig;

  const { filteredData, sortedData, paginatedData } = useTableData({
    data,
    config: tableConfig,
    columns: memoizedColumns,
    serverSideFilter,
    serverSideSort,
    serverSidePagination,
  });

  const headerRefs = useRef<(HTMLTableCellElement | null)[]>([]);
  const tableRef = useRef<HTMLDivElement>(null); // For empty content width
  const fullScreenDialog = useBoolean();

  const { stickyMap, getStickyStyle } = useStickyColumns({
    columns: memoizedColumns,
    columnVisibility,
    headerRefs,
  });

  const [filterAnchorEl, setFilterAnchorEl] = useState<IColumnFilterAnchor | null>(null);
  const [expandedRows, setExpandedRows] = useState<{ [key: number]: boolean }>({});

  const handleExpandRow = useCallback((index: number) => {
    setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }));
  }, []);

  const handlePageChange = useCallback(
    (event: unknown, newPage: number) => {
      handleChangeParams({ page: newPage });
      if (serverSidePagination && onServerPagination) {
        onServerPagination(newPage + 1, rowsPerPage);
      }
    },
    [handleChangeParams, serverSidePagination, onServerPagination, rowsPerPage]
  );

  const handleRowsPerPageChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newRowsPerPage = +event.target.value;
      handleChangeParams({ rowsPerPage: newRowsPerPage, page: 0 });
      if (serverSidePagination && onServerPagination) {
        onServerPagination(1, newRowsPerPage);
      }
    },
    [handleChangeParams, serverSidePagination, onServerPagination]
  );

  const handleSearch = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newSearchTerm = event.target.value;
      handleChangeParams({ searchTerm: newSearchTerm, page: 0 });
      if (serverSideSearch && onServerSearch) {
        // Debounce managed by effect
      }
    },
    [handleChangeParams, serverSideSearch, onServerSearch]
  );

  // Re-implement debounce effect for server search
  useEffect(() => {
    if (serverSideSearch && onServerSearch) {
      const handler = setTimeout(() => {
        onServerSearch(searchTerm);
      }, 500);
      return () => clearTimeout(handler);
    }
    return () => {};
  }, [searchTerm, serverSideSearch, onServerSearch]);

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
      handleChangeParams({ filters: filters.filter((_, i) => i !== index) });
    },
    [filters, handleChangeParams]
  );

  const handleClearAllFilters = useCallback(() => {
    handleChangeParams({ filters: [] });
  }, [handleChangeParams]);

  const handleApplyColumnFilter = useCallback(
    (columnId: string, filterType: string, value: any, valueType: string, label?: ReactNode) => {
      const newFilter = { column: columnId, type: filterType, value, valueType, label };
      handleChangeParams({ filters: [...filters, newFilter], page: 0 });
      setFilterAnchorEl(null);
    },
    [filters, handleChangeParams]
  );

  useEffect(() => {
    handleChangeParams({
      columnVisibility: memoizedColumns.reduce(
        (acc, column) => ({ ...acc, [column.id]: !column.defaultHidden }),
        {}
      ),
    });
  }, [memoizedColumns, handleChangeParams]);

  const theme = useTheme();

  const tableContent = useMemo(
    () => (
      <Box
        sx={{
          pt: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 0,
          ...boxSx,
        }}
        {...boxOther}
      >
        <Card
          ref={tableRef}
          sx={{
            // boxShadow: theme.customShadows?.z20 || '0px 4px 20px rgba(0, 0, 0, 0.05)',
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: 0,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <TableToolbar
            isSearch={isSearch}
            isFilter={isFilter}
            searchValue={searchTerm}
            onSearch={handleSearch}
            onClearSearch={() => handleChangeParams({ searchTerm: '', page: 0 })}
            columns={memoizedColumns}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={handleColumnVisibilityChange}
            onResetColumns={handleResetColumns}
            onExport={(format) => {
              if (format === 'print') {
                window.print();
              }
            }}
            searchFieldProps={searchFieldProps}
            isFullScreen={fullScreenDialog.value}
            onToggleFullScreen={fullScreenDialog.onToggle}
          />

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
                ...sx,
              }}
              {...other}
            >
              <Table stickyHeader aria-label="customizable table" size={dense ? 'small' : 'medium'}>
                <TableHeader
                  columns={memoizedColumns}
                  columnVisibility={columnVisibility}
                  sorts={sorts}
                  onSort={handleSort}
                  filters={filters}
                  onColumnFilterClick={(e, col) => {
                    e.stopPropagation();
                    setFilterAnchorEl({ element: e.currentTarget as HTMLElement, column: col });
                  }}
                  headerRefs={headerRefs}
                  stickyMap={stickyMap}
                  getStickyStyle={getStickyStyle}
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
                  expandedRows={expandedRows}
                  onExpandRow={handleExpandRow}
                  noDataText={noDataText}
                  tableRef={tableRef.current}
                  rowsPerPage={rowsPerPage}
                />
              </Table>
            </TableContainer>
            {isShowedDense && (
              <Paper
                elevation={0}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2,
                  width: '100%',
                  borderTop: `1px dashed ${theme.vars.palette.divider}`,
                }}
              >
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
                    ml: 1,
                    '& .MuiTypography-root': { fontSize: '13px', fontWeight: 500 },
                  }}
                />
                {isPagination && (
                  <TablePagination
                    rowsPerPageOptions={[
                      10,
                      25,
                      100,
                      {
                        value: serverSidePagination ? totalCount || 0 : filteredData.length,
                        label: 'All',
                      },
                    ]}
                    component="div"
                    count={serverSidePagination ? totalCount || 0 : filteredData.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handlePageChange}
                    onRowsPerPageChange={handleRowsPerPageChange}
                    sx={{
                      '& .MuiTablePagination-toolbar': { height: 40, minHeight: 40 },
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
      theme.palette.divider,
      theme.vars.palette.divider,
      boxSx,
      boxOther,
      isSearch,
      isFilter,
      searchTerm,
      handleSearch,
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
      filterAnchorEl,
      handleApplyColumnFilter,
      sx,
      other,
      dense,
      sorts,
      handleSort,
      stickyMap,
      getStickyStyle,
      isLoading,
      paginatedData,
      handleRowClick,
      rowProps,
      expandedRows,
      handleExpandRow,
      noDataText,
      rowsPerPage,
      isShowedDense,
      isPagination,
      serverSidePagination,
      totalCount,
      filteredData.length,
      page,
      handlePageChange,
      handleRowsPerPageChange,
      handleChangeParams,
    ]
  );

  const handleCloseFullScreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    fullScreenDialog.onFalse();
  }, [fullScreenDialog]);

  return (
    <>
      {tableContent}

      <CustomDialog
        open={fullScreenDialog.value}
        fullScreen
        title="Table View"
        handleClose={handleCloseFullScreen}
      >
        {tableContent}
      </CustomDialog>
    </>
  );
};

export default CustomizableTable;
