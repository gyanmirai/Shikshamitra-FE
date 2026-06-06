'use client';

import type { ReactNode } from 'react';

import _ from 'lodash';
import { useTheme } from '@mui/material/styles';
import { useBoolean } from 'src/hooks/use-boolean';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
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
import { useColumnResize } from './hooks/useColumnResize';
import { useStickyColumns } from './hooks/useStickyColumns';
import { ColumnFilterMenu } from './components/ColumnFilterMenu';

import type { IColumnFilterAnchor, ICustomizableTableProps } from './types';

const CustomizableTable: React.FC<ICustomizableTableProps> = ({
  columns,
  data,
  tableTitle = 'Table View',
  serverSide = false,
  serverSidePagination = false,
  serverSideSearch = false,
  serverSideSort = false,
  serverSideFilter = false,
  onServerSort,
  onServerPagination,
  onServerSearch,
  onServerFilter,
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
  tableId,
  showCheckbox = false,
  onSendNotification = () => {},
  searchFieldProps = {},
  noDataText = <>No data available</>,
  wrapperProps = {},
}) => {
  const { sx, ...other } = tableContainerProps;
  const { sx: boxSx, ...boxOther } = wrapperProps;
  const tableUniqId = `customizable-table-card-${tableId}`; // Unique ID for this table instance, used for localStorage keys
  const canUseColumnFilters = !serverSidePagination || Boolean(onServerFilter);
  const shouldUseServerFilter = serverSideFilter || Boolean(onServerFilter);

  // Memoize columns to ensure stability (especially if not memoized by parent)
  const memoizedColumns = useMemo(
    () =>
      columns.map((col) => ({
        ...col,
        isFilter: canUseColumnFilters ? (col.isFilter ?? true) : false,
      })),
    [canUseColumnFilters, columns]
  );

  const { tableConfig, handleChangeParams, handleSort } = useTableConfig({
    columns: memoizedColumns,
  });

  const { page, rowsPerPage, searchTerm, filters, sorts, columnVisibility, dense } = tableConfig;

  const { filteredData, sortedData, paginatedData } = useTableData({
    data,
    config: tableConfig,
    columns: memoizedColumns,
    serverSideFilter: shouldUseServerFilter,
    serverSideSort,
    serverSidePagination,
  });

  const rowsPerPageOptions = useMemo(() => {
    const baseOptions = [10, 25, 100];
    const rowCount = serverSidePagination ? totalCount || 0 : filteredData.length;

    if (rowCount <= 0) {
      return baseOptions;
    }

    if (serverSidePagination && maxServerRowsPerPage && rowCount > maxServerRowsPerPage) {
      return baseOptions.includes(maxServerRowsPerPage)
        ? baseOptions
        : [...baseOptions, maxServerRowsPerPage];
    }

    return [...baseOptions, { value: rowCount, label: 'All' }];
  }, [filteredData.length, maxServerRowsPerPage, serverSidePagination, totalCount]);

  const [headerRefs, setHeaderRefs] = useState<number[]>([]);
  const [tableRef, setTableRef] = useState<number>(0);

  // For empty content width
  const fullScreenDialog = useBoolean();

  const { columnWidths, handleResizeStart, handleResetWidth } = useColumnResize();
  const { stickyMap, getStickyStyle } = useStickyColumns({
    columns: memoizedColumns,
    columnVisibility,
    headerRefs,
    paginatedData,
    columnWidths,
    isLoading,
    tableUniqId,
  });

  const effectiveColumnWidths = useMemo(() => {
    if (Object.keys(columnWidths).length === 0) return {} as Record<string, number>;
    const widths: Record<string, number> = {};
    memoizedColumns.forEach((col, index) => {
      const configuredWidth = typeof col.width === 'number' ? col.width : undefined;
      widths[col.id] = columnWidths[col.id] ?? configuredWidth ?? headerRefs[index] ?? 100;
    });
    return widths;
  }, [columnWidths, headerRefs, memoizedColumns]);

  // Changes whenever search/filter/sort/page changes → triggers row re-animation
  const animationKey = useMemo(
    () => `${searchTerm}||${JSON.stringify(filters)}||${JSON.stringify(sorts)}||${page}`,
    [searchTerm, filters, sorts, page]
  );

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
      const nextFilters = filters.filter((filterItem, i) => i !== index);
      handleChangeParams({ filters: nextFilters });
      onServerFilter?.(nextFilters);
    },
    [filters, handleChangeParams, onServerFilter]
  );

  const handleClearAllFilters = useCallback(() => {
    handleChangeParams({ filters: [] });
    onServerFilter?.([]);
  }, [handleChangeParams, onServerFilter]);

  const handleApplyColumnFilter = useCallback(
    (columnId: string, filterType: string, value: any, valueType: string, label?: ReactNode) => {
      const newFilter = { column: columnId, type: filterType, value, valueType, label };
      const nextFilters = [...filters, newFilter];
      handleChangeParams({ filters: nextFilters, page: 0 });
      onServerFilter?.(nextFilters);
      setFilterAnchorEl(null);
    },
    [filters, handleChangeParams, onServerFilter]
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
                return;
              }

              // Exclude action columns and hidden columns
              const exportCols = memoizedColumns.filter(
                (col) => columnVisibility[col.id] && col.id !== 'action' && col.id !== 'actions'
              );

              const title = typeof tableTitle === 'string' ? tableTitle : 'Table_Export';

              // Helper: format a raw cell value for display
              const formatCellValue = (val: any): string => {
                if (val === null || val === undefined) return '-';
                const str = String(val);
                // Detect ISO datetime strings and format them nicely
                if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(str)) {
                  try {
                    const date = new Date(str);
                    return date.toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    });
                  } catch {
                    return str;
                  }
                }
                // Detect plain date strings (YYYY-MM-DD)
                if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
                  try {
                    const date = new Date(`${str}T00:00:00`);
                    return date.toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    });
                  } catch {
                    return str;
                  }
                }
                return str || '-';
              };

              if (format === 'excel') {
                import('xlsx').then((XLSX) => {
                  const dataObjects = sortedData.map((row) => {
                    const obj: Record<string, any> = {};
                    exportCols.forEach((col) => {
                      const rawVal = _.get(row, col.id);
                      const label = typeof col.label === 'string' ? col.label : col.id;
                      obj[label] = formatCellValue(rawVal);
                    });
                    return obj;
                  });
                  const worksheet = XLSX.utils.json_to_sheet(dataObjects);
                  const workbook = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
                  XLSX.writeFile(workbook, `${title}.xlsx`);
                });
              } else if (format === 'pdf') {
                Promise.all([import('jspdf'), import('jspdf-autotable')]).then(
                  ([jsPDFModule, autoTableModule]) => {
                    const JsPDF = jsPDFModule.default;
                    const autoTable = autoTableModule.default;
                    // Use landscape for wide tables, giving each column more space
                    const doc = new JsPDF({ orientation: 'landscape' });

                    // Build flat header string array
                    const pdfHead = exportCols.map((col) =>
                      typeof col.label === 'string' ? col.label : col.id
                    );

                    // Build 2D body array — values are resolved directly, no key mapping
                    const pdfBody = sortedData.map((row) =>
                      exportCols.map((col) => formatCellValue(_.get(row, col.id)))
                    );

                    autoTable(
                      doc as any,
                      {
                        head: [pdfHead],
                        body: pdfBody,
                        styles: {
                          fontSize: 8,
                          cellPadding: 2,
                          overflow: 'linebreak',
                        },
                        headStyles: {
                          fillColor: [22, 119, 255],
                          textColor: 255,
                          fontStyle: 'bold',
                          halign: 'left',
                        },
                        tableWidth: 'auto',
                        margin: { top: 10, left: 10, right: 10 },
                      } as any
                    );
                    doc.save(`${title}.pdf`);
                  }
                );
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
                '&:focus-visible': {
                  outline: 'none',
                },
                '& .simplebar-content-wrapper:focus-visible,td:focus-visible': {
                  outline: 'none',
                },
                ...sx,
              }}
              {...other}
            >
              <Table
                stickyHeader
                aria-label="customizable table"
                size={dense ? 'small' : 'medium'}
                sx={{
                  // height: '100%',
                  '&:focus-visible': {
                    outline: 'none',
                  },
                  ...(Object.keys(effectiveColumnWidths).length > 0
                    ? { tableLayout: 'fixed' }
                    : {}),
                }}
              >
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
                  setHeaderRef={setHeaderRefs}
                  stickyMap={stickyMap}
                  getStickyStyle={getStickyStyle}
                  columnWidths={effectiveColumnWidths}
                  onResizeStart={handleResizeStart}
                  onResetWidth={handleResetWidth}
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
                  expandedRows={expandedRows}
                  onExpandRow={handleExpandRow}
                  noDataText={noDataText}
                  tableRef={tableRef}
                  rowsPerPage={rowsPerPage}
                  columnWidths={effectiveColumnWidths}
                  animationKey={animationKey}
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
                    rowsPerPageOptions={rowsPerPageOptions}
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
      boxSx,
      boxOther,
      tableUniqId,
      theme.palette.divider,
      theme.vars.palette.divider,
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
      headerRefs,
      stickyMap,
      getStickyStyle,
      isLoading,
      paginatedData,
      handleRowClick,
      rowProps,
      expandedRows,
      handleExpandRow,
      noDataText,
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
      effectiveColumnWidths,
      animationKey,
      handleResizeStart,
      handleResetWidth,
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
        title={tableTitle}
        handleClose={handleCloseFullScreen}
      >
        {tableContent}
      </CustomDialog>
    </>
  );
};

export default CustomizableTable;
