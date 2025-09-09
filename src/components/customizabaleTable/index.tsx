'use client';

import type { Dayjs } from 'dayjs';

import jsPDF from 'jspdf';
import dayjs from 'dayjs';
import * as yup from 'yup';
import * as XLSX from 'xlsx';
import { useFormik } from 'formik';
import _, { isNumber } from 'lodash';
import autoTable from 'jspdf-autotable';
import debounce from 'src/utils/debounce';
import { useTheme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { formatNumber } from 'src/utils/formate_number';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import React, { useRef, useMemo, useState, useEffect, useCallback, useLayoutEffect } from 'react';
import { ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material';
import {
  Box,
  Menu,
  Chip,
  Card,
  Paper,
  Table,
  Select,
  Button,
  Switch,
  MenuItem,
  TableRow,
  Collapse,
  TableBody,
  TableCell,
  TextField,
  IconButton,
  InputLabel,
  FormControl,
  TableContainer,
  FormHelperText,
  TablePagination,
  FormControlLabel,
} from '@mui/material';

import { Iconify } from '../iconify';
import { Scrollbar } from '../scrollbar';
import { parseFormattedNumber } from './utlis';
import { EmptyContent } from '../empty-content';
import { ComponentBlock } from '../component-block';
import { TableSearch } from './components/TableSearch';
import { TableExport } from './components/TableExport';
import { TableHeader } from './components/TableHeader';
import { ColumnVisibility } from './components/ColumnVisibility';

import type { IData, IColumn, IParams, IColumnFilterAnchor, ICustomizableTableProps } from './type';

dayjs.extend(isSameOrAfter);

dayjs.extend(isSameOrBefore);

const CustomizableTable: React.FC<ICustomizableTableProps> = ({
  columns,
  data,
  serverSide = false,
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
  rowProps = () => {},
  tableId,
  showCheckbox = false,
  onSendNotification = () => {},
  searchFieldProps = {},
  noDataText = <>No data available</>,
}) => {
  const { sx, ...other } = tableContainerProps;
  columns = useMemo(
    () => columns.map((col) => ({ ...col, isFilter: col.isFilter ?? true })),
    [columns]
  );
  const [tableRef, setTableRef] = useState<any>(null);
  const theme = useTheme();

  const [stickyMap, setStickyMap] = useState<{
    left: Record<string, number>;
    right: Record<string, number>;
  }>({ left: {}, right: {} });
  const headerRefs = useRef<(HTMLTableCellElement | null)[]>([]);

  const [tableConfig, setTableConfig] = useState<IParams>({
    page: 0,
    rowsPerPage: 10, // Changed from 10 to -1
    searchTerm: '',
    filterColumn: '',
    filterType: 'contains',
    dense: true,
    columnSearchTerm: '',
    filters: [],
    sorts: [],
    dateFilter: null,
    dateRangeFilter: { start: null, end: null },
    filterValue: '',
    columnVisibility: columns.reduce(
      (acc, column) => ({ ...acc, [column.id]: !column.defaultHidden }),
      {}
    ),
  });

  useEffect(() => {
    setTableConfig((pre) => ({
      ...pre,
      columnVisibility: columns.reduce(
        (acc, column) => ({ ...acc, [column.id]: !column.defaultHidden }),
        {}
      ),
    }));
  }, [columns]);

  const handelChangeParams = useCallback(
    (param: Partial<IParams>) => {
      setTableConfig((pre) => ({ ...pre, ...param }));
    },
    [setTableConfig]
  );

  // const [page, setPage] = useState(0);
  const { page } = tableConfig;
  // const [rowsPerPage, setRowsPerPage] = useState(10);
  const { rowsPerPage } = tableConfig;
  // const [searchTerm, setSearchTerm] = useState('');
  const { searchTerm } = tableConfig;

  // const [columnVisibility, setColumnVisibility] = useState<{ [key: string]: boolean }>(
  //   columns.reduce((acc, column) => ({ ...acc, [column.id]: true }), {})
  // );
  const { columnVisibility } = tableConfig;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [anchorColumnEl, setColumnAnchorEl] = useState<null | HTMLElement>(null);

  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);

  // const [dense, setDense] = useState(true);
  const { dense } = tableConfig;

  const [expandedRows, setExpandedRows] = useState<{ [key: number]: boolean }>({});
  const [searchValue, setSearchValue] = useState(searchTerm);

  // const [columnSearchTerm, setColumnSearchTerm] = useState<string>('');
  const { columnSearchTerm } = tableConfig;

  // const [filters, setFilters] = useState<Array<{ column: string; type: string; value: string }>>(
  //   []
  // );
  const { filters } = tableConfig;

  // const [sorts, setSorts] = useState<Array<{ column: string; direction: 'asc' | 'desc' }>>([]);
  const { sorts } = tableConfig;

  const [filterAnchorEl, setFilterAnchorEl] = useState<IColumnFilterAnchor | null>(null);

  // const { dateRangeFilter } = tableConfig[paramsKey.current];

  useLayoutEffect(() => {
    const leftSticky: { col: IColumn; idx: number }[] = [];
    const rightSticky: { col: IColumn; idx: number }[] = [];

    // Divide sticky columns into left and right halves
    const stickyCols = columns.filter((col) => col.sticky);
    const half = Math.ceil(stickyCols.length / 2);
    console.log(columnVisibility, 'columnVisibility');
    columns.forEach((col, idx) => {
      if (col.sticky && columnVisibility[col.id]) {
        if (idx < half) {
          leftSticky.push({ col, idx });
        } else {
          rightSticky.push({ col, idx });
        }
      }
    });

    const leftOffsets: Record<string, number> = {};
    let left = 0;
    leftSticky.forEach(({ col, idx }) => {
      const width = headerRefs.current[idx]?.offsetWidth ?? 100;
      leftOffsets[col.id as string] = left;
      left += width - 1;
    });

    const rightOffsets: Record<string, number> = {};
    let right = 0;
    [...rightSticky].reverse().forEach(({ col, idx }) => {
      const width = headerRefs.current[idx]?.offsetWidth ?? 100;
      rightOffsets[col.id as string] = right;
      right += width - 1;
    });

    setStickyMap({ left: leftOffsets, right: rightOffsets });
  }, [columnVisibility, columns]);

  const getStickyStyle = (col: IColumn): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: col.sticky ? 'sticky' : 'static',
      // background: col.sticky ? theme.vars.palette.background.paper : undefined,
    };

    const colId = col.id as string;
    if (stickyMap.left[colId] !== undefined) {
      return { ...base, left: stickyMap.left[colId] };
    }
    if (stickyMap.right[colId] !== undefined) {
      return { ...base, right: stickyMap.right[colId] };
    }

    return base;
  };

  const handleChangePage = useCallback(
    (event: unknown, newPage: number) => {
      handelChangeParams({ page: newPage });
      // setPage(newPage);
      if (serverSide && onServerPagination) {
        onServerPagination(newPage, rowsPerPage);
      }
    },
    [handelChangeParams, serverSide, onServerPagination, rowsPerPage]
  );
  const removeFilter = (index: number) => {
    handelChangeParams({ filters: filters.filter((_a, i) => i !== index) });
    // setFilters(filters.filter((_a, i) => i !== index));
  };

  const clearAllFilters = () => {
    // setFilters([]);
    handelChangeParams({ filters: [] });
  };

  useEffect(() => {
    debounce(() => {
      handelChangeParams({ searchTerm: searchValue });
    }, 500);
  }, [handelChangeParams, searchValue]);

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      // setRowsPerPage(+event.target.value);
      // setPage(0);
      handelChangeParams({ rowsPerPage: +event.target.value, page: 0 });

      if (serverSide && onServerPagination) {
        onServerPagination(0, +event.target.value);
      }
    },
    [handelChangeParams, serverSide, onServerPagination]
  );

  const handleSort = useCallback(
    (column: string, originalId?: string) => {
      const newSortConfig = [...sorts];
      const configIndex = newSortConfig.findIndex((item) => item.column === column);

      if (configIndex > -1) {
        if (newSortConfig[configIndex].direction === 'asc') {
          newSortConfig[configIndex].direction = 'desc';
          newSortConfig[configIndex].originalId = originalId;
        } else {
          newSortConfig.splice(configIndex, 1);
        }
      } else {
        newSortConfig.push({ column, direction: 'asc', originalId });
      }
      handelChangeParams({ sorts: newSortConfig });
      // setSorts(newSortConfig);
      if (serverSide && onServerSort) {
        onServerSort(column, newSortConfig);
      }
    },
    [sorts, handelChangeParams, serverSide, onServerSort]
  );

  const handleSearch = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchValue(event.target.value);
      // Reset to first page when searching
      handelChangeParams({ page: 0 });

      debounce(() => {
        if (serverSide && onServerSearch) {
          onServerSearch(event.target.value);
        }
      });
    },
    [serverSide, onServerSearch, handelChangeParams]
  );

  const applyFilter = useCallback(
    (row: IData) =>
      filters.every((filter) => {
        const value = _.get(row, filter.column, '');
        const valueAsNumber = !isNumber(Number(value)) ? Number(value) : value;
        const filterValueAsNumber = !isNumber(Number(filter.value))
          ? Number(filter.value)
          : filter.value;
        const isDateType = filter.valueType === 'date';
        const isFormattedNumber = filter.valueType === 'formattedNumber';

        if (isDateType) {
          switch (filter.type) {
            case 'equals':
              return dayjs(value, 'DD-MM-YYYY').isSame(dayjs(filter.value, 'DD-MM-YYYY'));

            case 'after':
              return dayjs(value, 'DD-MM-YYYY').isSameOrAfter(
                dayjs(filter.value as string, 'DD-MM-YYYY')
              );
            case 'before':
              return dayjs(value, 'DD-MM-YYYY').isSameOrBefore(dayjs(filter.value, 'DD-MM-YYYY'));
            default:
              return false;
          }
        }
        if (isFormattedNumber) {
          const parsedValue = parseFormattedNumber(value);
          const parsedFilterValue = parseFormattedNumber(filter.value as string);

          switch (filter.type) {
            case 'equals':
              return parsedValue === parsedFilterValue;
            case 'greaterThan':
              return parsedValue > parsedFilterValue;
            case 'lessThan':
              return parsedValue < parsedFilterValue;
            default:
              return false;
          }
        } else {
          switch (filter.type) {
            case 'contains':
              return value.toString().toLowerCase().includes(filter.value.toString().toLowerCase());
            case 'equals':
              return value.toString().toLowerCase() === filter.value.toString().toLowerCase();
            case 'startsWith':
              return value
                .toString()
                .toLowerCase()
                .startsWith(filter.value.toString().toLowerCase());
            case 'endsWith':
              return value.toString().toLowerCase().endsWith(filter.value.toString().toLowerCase());
            case 'greaterThan':
              return valueAsNumber > filterValueAsNumber;
            case 'lessThan':
              return valueAsNumber < filterValueAsNumber;
            case 'between':
              return (
                valueAsNumber >= (filter?.value as any)?.min &&
                valueAsNumber <= (filter?.value as any)?.max
              );
            default:
              return true;
          }
        }
      }),

    [filters]
  );

  const filteredData = useMemo(() => {
    if (serverSide) {
      return data;
    }
    return data.filter((row) => {
      const searchMatch = Object.entries(row).some(
        ([key, value]) =>
          columnVisibility[key] &&
          _.get(row, columns.find((col) => col.id === key)?.id || '') &&
          _.get(row, columns.find((col) => col.id === key)?.id || '')
            .toString()
            .toLowerCase()
            .includes(searchValue.toLowerCase())
      );

      return searchMatch && applyFilter(row);
    });
  }, [serverSide, data, applyFilter, columnVisibility, columns, searchValue]);

  const sortedData = useMemo(() => {
    if (serverSide) return filteredData;
    return _.orderBy(
      filteredData,
      sorts.map((i) => i.column),
      sorts.map((i) => i.direction)
    );
  }, [serverSide, filteredData, sorts]);

  const paginatedData = useMemo(
    () =>
      serverSide
        ? sortedData
        : sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [serverSide, sortedData, page, rowsPerPage]
  );

  const handleChangeDense = (event: React.ChangeEvent<HTMLInputElement>) => {
    handelChangeParams({ dense: event.target.checked });
  };

  const clearFilter = () => {
    handelChangeParams({ filterColumn: '', filterType: 'contains', filterValue: '', page: 0 });
    setAnchorEl(null);
  };

  const handleExpandRow = (index: number) => {
    setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleExport = useCallback(
    (format: string) => {
      if (format === 'excel') {
        // Export to Excel
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        XLSX.writeFile(workbook, `${data[0].fileName ?? 'table_data'}.xlsx`);
      } else if (format === 'print') {
        // Print the table
        window.print();
      } else if (format === 'pdf') {
        // Export to PDF
        const pageWidth = columns.length * 50 + 20; // Adding 20 for padding
        const pageHeight = 297;
        // eslint-disable-next-line new-cap
        const doc = new jsPDF({
          orientation: 'landscape', // Optional: For a horizontal layout
          unit: 'mm', // Units: 'pt', 'mm', 'cm', or 'in'
          format: [pageWidth, pageHeight], // Custom page size
        });
        const columnData = columns.map((column) => ({ header: column.label, dataKey: column.id }));
        // @ts-ignore
        autoTable(doc, { columns: columnData, body: data });
        doc.save(`${data?.[0]?.fileName ?? 'table_data'}.pdf`);
      }
    },
    [data, columns]
  );

  const handleColumnFilterClick = (event: React.MouseEvent, column: IColumn) => {
    event.stopPropagation(); // Prevent sort trigger
    setFilterAnchorEl({ element: event.currentTarget as HTMLElement, column });
  };

  const handleApplyColumnFilter = (
    columnId: string,
    filterTypes: string,
    value: any,
    valueType: string
  ) => {
    const newFilter = { column: columnId, type: filterTypes, value, valueType };

    handelChangeParams({ filters: [...filters, newFilter], page: 0 });
    setFilterAnchorEl(null);
  };

  return (
    <Card sx={{ boxShadow: 'var(--shadows-4)', mt: 1 }} ref={setTableRef}>
      <Box sx={{ display: 'flex', alignItems: 'center', p: isSearch ? 1 : 0, gap: 1 }}>
        {isSearch && (
          <TableSearch
            searchValue={searchValue}
            onSearch={handleSearch}
            onClear={() => setSearchValue('')}
            searchFieldProps={searchFieldProps}
          />
        )}

        {isFilter && (
          <Box flexGrow={1} display="flex" justifyContent="flex-end" alignItems="center" gap={1}>
            <ColumnVisibility
              columns={columns}
              columnVisibility={columnVisibility}
              columnSearchTerm={columnSearchTerm}
              onColumnSearchChange={(value) => handelChangeParams({ columnSearchTerm: value })}
              onColumnVisibilityChange={(columnId, visible) =>
                handelChangeParams({
                  columnVisibility: { ...columnVisibility, [columnId]: visible },
                })
              }
              onReset={() =>
                handelChangeParams({
                  columnSearchTerm: '',
                  columnVisibility: Object.fromEntries(columns.map((column) => [column.id, true])),
                })
              }
            />
            <TableExport onExport={handleExport} />
          </Box>
        )}
      </Box>
      {filters.length > 0 && (
        <FilterChips
          filters={filters}
          removeFilter={removeFilter}
          columns={columns}
          clearAllFilters={clearAllFilters}
        />
      )}

      <ColumnFilterMenu
        anchorEl={filterAnchorEl}
        onClose={() => setFilterAnchorEl(null)}
        onApplyFilter={handleApplyColumnFilter}
      />
      <ComponentBlock sx={{ px: 0, py: 0, boxShadow: 'none', gap: 0.5 }}>
        <TableContainer component={Scrollbar} sx={{ maxHeight: '440px', ...sx }} {...other}>
          <Table stickyHeader aria-label="customizable table" size={dense ? 'small' : 'medium'}>
            <TableHeader
              columns={columns}
              columnVisibility={columnVisibility}
              sorts={sorts}
              onSort={handleSort}
              getStickyStyle={getStickyStyle}
              showCheckbox={showCheckbox}
              // headerRefs={headerRefs}
              // stickyMap={stickyMap}
              // theme={theme}
              // handleColumnFilterClick={handleColumnFilterClick}
            />
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    rowSpan={columns.length + 1}
                    colSpan={columns.length + 1}
                    sx={{ height: '50px' }}
                  >
                    <Box className="loader" height={24} />
                  </TableCell>
                </TableRow>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((row, index) => (
                  <React.Fragment key={index}>
                    <TableRow
                      hover
                      tabIndex={-1}
                      onClick={() => handleRowClick(row, index)}
                      {...rowProps(row, index)}
                    >
                      {columns.some((column) => column.children) && (
                        <TableCell sx={{ fontSize: '13px' }}>
                          <IconButton size="small" onClick={() => handleExpandRow(index)}>
                            {expandedRows[index] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </TableCell>
                      )}
                      {columns.map(
                        (column, ind) =>
                          columnVisibility[column.id] && (
                            <TableCell
                              key={column.id}
                              align={column.align}
                              sx={{
                                alignItems: 'center',
                                fontSize: '13px',
                                position: column.sticky ? 'sticky' : 'static',
                                // @ts-ignore
                                left: column.sticky ? stickyMap[column.id] : 'auto',
                                right: column.sticky && columns.length === ind + 1 ? 0 : 'auto',
                                zIndex: column.sticky ? 10 : 2,
                                backgroundColor: column.sticky ? 'background.paper' : 'transparent',
                                boxShadow: column.sticky ? 'var(--shadows-4)' : 'none',
                                ...getStickyStyle(column),
                              }}
                            >
                              {column.render
                                ? column.render(_.get(row, column.id, '-') ?? '-', row)
                                : (_.get(row, column.id, '-') ?? '-')}
                            </TableCell>
                          )
                      )}
                    </TableRow>
                    {columns.some((column) => column.children) && (
                      <TableRow>
                        <TableCell
                          style={{ paddingBottom: 0, paddingTop: 0 }}
                          colSpan={columns.length + 1}
                        >
                          <Collapse in={expandedRows[index]} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 1 }}>
                              {columns.map((column) => column.children && column.children(row))}
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} sx={{ p: 0 }}>
                    <EmptyContent
                      title={noDataText}
                      sx={{
                        width: tableRef?.getBoundingClientRect?.()?.width,
                        position: 'sticky',
                        left: '0',
                        padding: '0',
                      }}
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {isShowedDense && (
          <Paper
            elevation={0}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 1,
              width: '100%',
            }}
          >
            {isShowedDense && (
              <FormControlLabel
                control={<Switch size="small" checked={dense} onChange={handleChangeDense} />}
                label="Dense"
              />
            )}
            {isPagination && (
              <TablePagination
                rowsPerPageOptions={[10, 25, 100, { value: filteredData.length, label: 'All' }]}
                component={Scrollbar}
                count={serverSide ? totalCount || 0 : filteredData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                size="small"
                sx={{
                  '& *': { fontSize: '14px !important' },
                  '& svg': { fontSize: '18px !important' },
                  '& .MuiToolbar-root': { minHeight: 'unset', height: 'auto' },
                }}
              />
            )}
          </Paper>
        )}
      </ComponentBlock>
    </Card>
  );
};

export default CustomizableTable;

/**
 * FilterChips Component
 * Displays active filters as chips with the ability to remove individual filters or clear all filters
 * @param {Object} props - Component props
 * @param {Array} props.filters - Array of active filters
 * @param {Function} props.removeFilter - Function to remove a specific filter
 * @param {Function} props.clearAllFilters - Function to clear all active filters
 * @param {Array} props.columns - Array of table columns configuration
 */
const FilterChips = ({
  filters,
  removeFilter,
  clearAllFilters,
  columns,
}: {
  filters: IParams['filters'];
  removeFilter: (index: number) => void;
  clearAllFilters: () => void;
  columns: IColumn[];
}) => (
  <Box
    sx={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: 1,
      mb: 1,
      p: 1,
      alignItems: 'center',
      border: (theme) => (filters.length ? `dashed 1px ${theme.vars.palette.divider}` : 'none'),
      borderRadius: 1,
    }}
  >
    {filters.map((filter: any, index: number) => {
      const findColumn = columns.find((column: any) => column.id === filter.column);
      const filterValue: any =
        findColumn?.filterType === 'enum'
          ? findColumn.enumOptions?.find((i) => i.value === filter.value)?.label
          : (filter.value as string);

      let label = '';
      if (findColumn?.filterType === 'formattedNumber') {
        label = formatNumber(filterValue, 'INR');
      } else if (findColumn?.filterType === 'number' && filter.type === 'between') {
        label = `Between ${filter?.value?.min} to ${filter?.value?.max}`;
      } else {
        label = String(filterValue);
      }

      return (
        <Chip
          key={index}
          size="small"
          variant="soft"
          label={`${findColumn?.label} :  ${label}`}
          onDelete={() => removeFilter(index)}
        />
      );
    })}
    {filters.length > 0 && (
      <Button
        size="small"
        color="error"
        startIcon={
          <Iconify icon="solar:trash-bin-trash-bold" sx={{ width: '20px', height: '20px' }} />
        }
        onClick={clearAllFilters}
      >
        Clear ({filters.length})
      </Button>
    )}
  </Box>
);
const ColumnFilterMenu: React.FC<{
  anchorEl: IColumnFilterAnchor | null;
  onClose: () => void;
  onApplyFilter: (columnId: string, filterType: string, value: any, valueType: string) => void;
}> = ({ anchorEl, onClose, onApplyFilter }) => {
  const formik = useFormik<{
    min: number | null;
    max: number | null;
    filterValue: null | string | Dayjs | number | { min: number; max: number };
    filterType: string;
  }>({
    initialValues: { min: null, max: null, filterValue: null, filterType: '' },
    validationSchema: yup.object({
      filterType: yup.string().test('filterType', 'Filter type is required', (value) => {
        if (anchorEl?.column.filterType === 'enum') {
          return true;
        }
        return !!value;
      }),
      min: yup.number().when('filterType', {
        is: 'between',
        then: (schema) => schema.required('Min value is required'),
        otherwise: (schema) => schema.nullable(),
      }),
      max: yup.number().when('filterType', {
        is: 'between',
        then: (schema) => schema.required('Max value is required'),
        otherwise: (schema) => schema.nullable(),
      }),
      filterValue: yup.string().when('filterType', {
        is: 'between',
        then: (schema) => schema.nullable(),
        otherwise: (schema) => schema.required('value is required'),
      }),
    }),
    onSubmit: (values) => {
      handleApply();
    },
  });

  const getFilterOptions = () => {
    if (!anchorEl) return [];

    switch (anchorEl.column.filterType) {
      case 'formattedNumber':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'greaterThan', label: 'Greater Than' },
          { value: 'lessThan', label: 'Less Than' },
        ];

      case 'string':
        return [
          { value: 'contains', label: 'Contains' },
          { value: 'equals', label: 'Equals' },
          { value: 'startsWith', label: 'Starts With' },
          { value: 'endsWith', label: 'Ends With' },
        ];
      case 'number':
        return [
          { value: 'equals', label: 'Equals' },
          { value: 'greaterThan', label: 'Greater Than' },
          { value: 'lessThan', label: 'Less Than' },
          { value: 'between', label: 'Between' },
        ];
      case 'date':
        return [
          { value: 'equals', label: 'Equals' },
          // { value: 'range', label: 'Date Range' },
          { value: 'after', label: 'After' },
          { value: 'before', label: 'Before' },
        ];
      case 'enum':
        return [{ value: 'equals', label: 'Equals' }];
      default:
        return [
          { value: 'contains', label: 'Contains' },
          { value: 'equals', label: 'Equals' },
          { value: 'startsWith', label: 'Starts With' },
          { value: 'endsWith', label: 'Ends With' },
        ];
    }
  };

  const handleApply = () => {
    if (!anchorEl) return;

    let value: any = formik.values.filterValue;
    let filterTypeValue = formik.values.filterType;
    if (anchorEl.column.filterType === 'date') {
      value = (value as Dayjs).format('DD-MM-YYYY');
    }
    if (anchorEl.column.filterType === 'enum') {
      filterTypeValue = 'equals';
    }
    if (anchorEl.column.filterType === 'formattedNumber') {
      value = parseFormattedNumber(value);
    }
    if (formik.values.filterType === 'between') {
      value = { min: formik.values.min, max: formik.values.max };
    }

    onApplyFilter(anchorEl.column.id, filterTypeValue, value, anchorEl.column.filterType as string);
    formik.setFieldValue('filterValue', null);
    formik.setFieldValue('filterType', '');
    formik.setFieldValue('min', null);
    formik.setFieldValue('max', null);
    formik.resetForm();
    onClose();
  };

  return (
    <Menu
      anchorEl={anchorEl?.element}
      open={Boolean(anchorEl)}
      onClose={() => {
        formik.setFieldValue('filterValue', null);
        formik.setFieldValue('filterType', '');
        formik.setFieldValue('min', null);
        formik.setFieldValue('max', null);
        formik.resetForm();
        onClose();
      }}
      slotProps={{ paper: { sx: { width: '260px' } } }}
    >
      <Box component="form" sx={{ p: 2, maxWidth: 350 }} onSubmit={formik.handleSubmit}>
        {anchorEl?.column.filterType !== 'enum' && (
          <FormControl
            fullWidth
            size="small"
            sx={{ mb: 2 }}
            error={formik.touched.filterType && !!formik.errors.filterType}
          >
            <InputLabel>Filter Type *</InputLabel>
            <Select
              value={formik.values.filterType}
              onChange={(e) => formik.setFieldValue('filterType', e.target.value)}
              label="Filter Type *"
            >
              {getFilterOptions().map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.filterType && formik.errors.filterType && (
              <FormHelperText error>{formik.errors.filterType}</FormHelperText>
            )}
          </FormControl>
        )}

        {anchorEl?.column.filterType === 'enum' && (
          <FormControl
            fullWidth
            size="small"
            error={formik.touched.filterValue && !!formik.errors.filterValue}
          >
            <InputLabel>{anchorEl.column.label} *</InputLabel>
            <Select
              value={formik.values.filterValue}
              onChange={(e) => formik.setFieldValue('filterValue', e.target.value)}
              label={`${anchorEl.column.label} *`}
            >
              {anchorEl.column.enumOptions?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.filterValue && formik.errors.filterValue && (
              <FormHelperText error>{formik.errors.filterValue}</FormHelperText>
            )}
          </FormControl>
        )}

        {formik.values.filterType &&
          (anchorEl?.column.filterType === 'date' ? (
            <DatePicker
              value={formik.values.filterValue as null | Dayjs}
              onChange={(newValue) => formik.setFieldValue('filterValue', newValue)}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  label: `${anchorEl?.column.label} *`,
                  error: formik.touched.filterValue && Boolean(formik.errors.filterValue),
                  helperText: formik.touched.filterValue && formik.errors.filterValue,
                },
              }}
              format="DD-MM-YYYY"
            />
          ) : formik.values.filterType === 'between' ? (
            <>
              <TextField
                fullWidth
                size="small"
                value={formik.values.min}
                onChange={(e) => formik.setFieldValue('min', e.target.value)}
                type="number"
                label={`${anchorEl?.column.label} Min *`}
                sx={{ mb: 2 }}
                error={formik.touched.min && Boolean(formik.errors.min)}
                helperText={formik.touched.min && formik.errors.min}
              />

              <TextField
                fullWidth
                size="small"
                value={formik.values.max}
                onChange={(e) => formik.setFieldValue('max', e.target.value)}
                type="number"
                label={`${anchorEl?.column.label} Max *`}
                error={formik.touched.max && Boolean(formik.errors.max)}
                helperText={formik.touched.max && formik.errors.max}
              />
            </>
          ) : (
            <TextField
              fullWidth
              size="small"
              value={formik.values.filterValue as string}
              onChange={(e) => {
                // Remove special characters using regex
                const sanitizedValue = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
                formik.setFieldValue('filterValue', sanitizedValue);
              }}
              type={anchorEl?.column.filterType === 'number' ? 'number' : 'text'}
              label={`${anchorEl?.column.label} *`}
              error={formik.touched.filterValue && Boolean(formik.errors.filterValue)}
              helperText={formik.touched.filterValue && formik.errors.filterValue}
              // placeholder={anchorEl?.column.label}
            />
          ))}

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button
            size="small"
            onClick={() => {
              formik.setFieldValue('filterValue', null);
              formik.setFieldValue('filterType', '');
              formik.setFieldValue('min', null);
              formik.setFieldValue('max', null);
              formik.resetForm();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button variant="contained" size="small" type="submit">
            Apply
          </Button>
        </Box>
      </Box>
    </Menu>
  );
};
