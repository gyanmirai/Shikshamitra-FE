'use client';

import type { Dayjs } from 'dayjs';
import type { DatePickerProps } from '@mui/lab';
import type { TableRowProps } from '@mui/material';

import jsPDF from 'jspdf';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import _, { isNumber } from 'lodash';
import autoTable from 'jspdf-autotable';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import React, { useMemo, useState, Fragment, useEffect, useCallback } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import {
  Clear as ClearIcon,
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';
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
  Popover,
  MenuItem,
  TableRow,
  Checkbox,
  Collapse,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  FormGroup,
  IconButton,
  InputLabel,
  FormControl,
  TableContainer,
  TablePagination,
  FormControlLabel,
} from '@mui/material';

import debounce from 'src/utils/debounce';

import { Iconify } from '../iconify';
import { Scrollbar } from '../scrollbar';
import { EmptyContent } from '../empty-content';
import { ComponentBlock } from '../component-block';

dayjs.extend(isSameOrAfter);

dayjs.extend(isSameOrBefore);

// Add this interface to your existing interfaces
interface ColumnFilterAnchor {
  element: HTMLElement;
  column: Column;
}

export interface Column {
  id: string;
  label: string;
  filterType?: 'string' | 'number' | 'date' | 'enum';
  isFilter?: boolean;
  minWidth?: number | string;
  align?: 'right' | 'left' | 'center';
  render?: (value: any, row: Data) => React.ReactNode;
  renderColumn?: (value: Column) => React.ReactNode;
  children?: (row: Data) => React.ReactNode;
  onSort?: (a: any, b: any) => any[];
  isSort?: boolean;
  sticky?: boolean;
  isDateFilter?: boolean;
  isDateRangeFilter?: boolean;
  enumOptions?: { label: string; value: any }[];
}

interface Data {
  [key: string]: any;
}

interface CustomizableTableProps {
  columns: Column[];
  data: Data[];
  serverSide?: boolean;
  onServerSort?: (
    column: string,
    sortData: Array<{ column: string; direction: 'asc' | 'desc' }>
  ) => void;
  onServerPagination?: (page: number, rowsPerPage: number) => void;
  onServerSearch?: (searchTerm: string) => void;
  totalCount?: number;
  handleRowClick?: (row: Data, index: number) => void;
  isLoading?: boolean;
  isPagination?: boolean;
  isFilter?: boolean;
  isSearch?: boolean;
  isScrollbar?: boolean;
  isShowedDense?: boolean;
  rowProps?: (row: Data, index: number) => TableRowProps;
  startDateProps?: DatePickerProps<Dayjs>;
  endDateProps?: DatePickerProps<Dayjs>;
  dateProps?: DatePickerProps<Dayjs>;
  tableId: string;
}

type IParams = {
  page: number;
  rowsPerPage: number;
  searchTerm: string;
  filterColumn: string;
  filterType: string;
  dense: boolean;
  columnSearchTerm: string;
  filters: Array<{ column: string; type: string; value: string; valueType: string }>;
  sorts: Array<{ column: string; direction: 'asc' | 'desc' }>;
  dateFilter: null | Dayjs;
  dateRangeFilter: { start: null | Dayjs; end: null | Dayjs };
  filterValue: string;
  columnVisibility: Record<string, boolean>;
};

const CustomizableTable: React.FC<CustomizableTableProps> = ({
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

  isShowedDense = true,
  rowProps = () => {},
  tableId,
}) => {
  columns = useMemo(
    () => columns.map((col) => ({ ...col, isFilter: col.isFilter ?? true })),
    [columns]
  );

  console.log('columns----', columns);

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
    columnVisibility: columns.reduce((acc, column) => ({ ...acc, [column.id]: true }), {}),
  });

  useEffect(() => {
    setTableConfig((pre) => ({
      ...pre,
      columnVisibility: columns.reduce((acc, column) => ({ ...acc, [column.id]: true }), {}),
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
  // const [filterColumn, setFilterColumn] = useState('');
  const { filterColumn } = tableConfig;

  // const [filterType, setFilterType] = useState('contains');
  const { filterType } = tableConfig;

  // const [filterValue, setFilterValue] = useState('');
  const { filterValue } = tableConfig;

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

  const [filterAnchorEl, setFilterAnchorEl] = useState<ColumnFilterAnchor | null>(null);

  // const { dateRangeFilter } = tableConfig[paramsKey.current];

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

  // useEffect(
  //   () => () => {
  //     removeParamsByKey(tableId);
  //   },
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [tableId]
  // );

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
    (column: string) => {
      const newSortConfig = [...sorts];
      const configIndex = newSortConfig.findIndex((item) => item.column === column);

      if (configIndex > -1) {
        if (newSortConfig[configIndex].direction === 'asc') {
          newSortConfig[configIndex].direction = 'desc';
        } else {
          newSortConfig.splice(configIndex, 1);
        }
      } else {
        newSortConfig.push({ column, direction: 'asc' });
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
      // setParams({ searchTerm: event.target.value });
      debounce(() => {
        if (serverSide && onServerSearch) {
          onServerSearch(event.target.value);
        }
      });
    },
    [serverSide, onServerSearch]
  );

  const applyFilter = useCallback(
    (row: Data) =>
      filters.every((filter) => {
        const value = _.get(row, filter.column, '');
        const valueAsNumber = !isNumber(Number(value)) ? Number(value) : value;
        const filterValueAsNumber = !isNumber(Number(filter.value))
          ? Number(filter.value)
          : filter.value;
        const isDateType = filter.valueType === 'date';

        console.log(value, 'value', filter);

        if (isDateType) {
          switch (filter.type) {
            case 'equals':
              return dayjs(value, 'DD-MM-YYYY').isSame(dayjs(filter.value, 'DD-MM-YYYY'));

            case 'after':
              return dayjs(value, 'DD-MM-YYYY').isSameOrAfter(dayjs(filter.value, 'DD-MM-YYYY'));
            case 'before':
              return dayjs(value, 'DD-MM-YYYY').isSameOrBefore(dayjs(filter.value, 'DD-MM-YYYY'));
            default:
              return false;
          }
        } else {
          switch (filter.type) {
            case 'contains':
              return value.toString().toLowerCase().includes(filter.value.toLowerCase());
            case 'equals':
              return value.toString().toLowerCase() === filter.value.toString().toLowerCase();
            case 'startsWith':
              return value.toString().toLowerCase().startsWith(filter.value.toLowerCase());
            case 'endsWith':
              return value.toString().toLowerCase().endsWith(filter.value.toLowerCase());
            case 'greaterThan':
              return valueAsNumber > filterValueAsNumber;
            case 'lessThan':
              return valueAsNumber < filterValueAsNumber;
            default:
              return true;
          }
        }
      }),

    [filters]
  );

  const filteredData = useMemo(
    () =>
      serverSide
        ? data
        : data.filter((row) => {
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
          }),
    [serverSide, data, applyFilter, columnVisibility, columns, searchValue]
  );

  const sortedData = useMemo(() => {
    if (serverSide) return filteredData;
    // const column = columns.find((col) => col.id === sortColumn);
    // if (column && column.onSort && column.isSort !== false) {
    //   return column.onSort(filteredData, sorts);
    // }
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
    handelChangeParams({
      filterColumn: '',
      filterType: 'contains',
      filterValue: '',
      page: 0,
    });
    // setFilterColumn('');
    // setFilterType('contains');
    // setFilterValue('');
    // setPage(0);
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
        const columnData = columns.map((column) => ({
          header: column.label,
          dataKey: column.id,
        }));
        // @ts-ignore
        autoTable(doc, { columns: columnData, body: data });
        doc.save(`${data?.[0]?.fileName ?? 'table_data'}.pdf`);
      }
    },
    [data, columns]
  );
  const handleApplyFilter = () => {
    if (filterColumn && filterType && filterValue) {
      handelChangeParams({
        filters: [
          ...filters,
          { column: filterColumn, type: filterType, value: filterValue, valueType: '' },
        ],
        filterColumn: '',
        filterType: 'contains',
        filterValue: '',
      });
      // setFilters([...filters, { column: filterColumn, type: filterType, value: filterValue }]);
      // setFilterColumn('');
      // setFilterType('contains');
      // setFilterValue('');
    }
    handelChangeParams({ page: 0 });
    // setPage(0);
    setAnchorEl(null);
  };
  const handleColumnFilterClick = (event: React.MouseEvent, column: Column) => {
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
    handelChangeParams({
      filters: [...filters, newFilter],
      page: 0,
    });
    setFilterAnchorEl(null);
  };

  console.log(paginatedData, 'paginatedData');
  return (
    <Card sx={{ boxShadow: 'var(--shadows-4)', mt: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', p: 1, gap: 1 }}>
        {isSearch && (
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            value={searchValue}
            onChange={handleSearch}
            InputProps={{
              endAdornment: (
                <>
                  {searchValue ? (
                    <IconButton size="small" onClick={() => setSearchValue('')}>
                      <ClearIcon />
                    </IconButton>
                  ) : (
                    <IconButton size="small">
                      <SearchIcon />
                    </IconButton>
                  )}
                </>
              ),
            }}
          />
        )}

        {isFilter && (
          <Box flexGrow={1} display="flex" justifyContent="flex-end" alignItems="center" gap={1}>
            <Box sx={{ ml: 2 }}>
              <Button
                // variant="outlined"
                size="small"
                startIcon={<RemoveRedEyeIcon />}
                onClick={(event) => setColumnAnchorEl(event.currentTarget)}
              >
                Columns
              </Button>
              <Popover
                open={Boolean(anchorColumnEl)}
                anchorEl={anchorColumnEl}
                onClose={() => setColumnAnchorEl(null)}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
              >
                <Box sx={{ p: 2, width: 250 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search columns"
                    value={columnSearchTerm}
                    onChange={(e) => handelChangeParams({ columnSearchTerm: e.target.value })}
                    sx={{ mb: 2 }}
                  />
                  <FormGroup>
                    {columns
                      .filter((column) =>
                        column.label.toLowerCase().includes(columnSearchTerm.toLowerCase())
                      )
                      .map((column) => (
                        <FormControlLabel
                          key={column.id}
                          control={
                            <Checkbox
                              checked={columnVisibility[column.id]}
                              onChange={(e) => {
                                handelChangeParams({
                                  columnVisibility: {
                                    ...columnVisibility,
                                    [column.id]: e.target.checked,
                                  },
                                });
                                // setColumnVisibility((prev) => ({
                                //   ...prev,
                                //   [column.id]: e.target.checked,
                                // }));
                              }}
                            />
                          }
                          label={column.label}
                        />
                      ))}
                  </FormGroup>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      size="small"
                      onClick={() => {
                        // setColumnVisibility(
                        //   Object.fromEntries(columns.map((column) => [column.id, true]))
                        // );
                        handelChangeParams({
                          columnSearchTerm: '',
                          columnVisibility: Object.fromEntries(
                            columns.map((column) => [column.id, true])
                          ),
                        });
                      }}
                    >
                      Reset
                    </Button>
                  </Box>
                </Box>
              </Popover>{' '}
            </Box>

            <Box>
              <Button
                startIcon={<Iconify icon="solar:export-bold" />}
                size="small"
                onClick={(event) => setExportAnchorEl(event.currentTarget)}
              >
                Export
              </Button>
              <Menu
                anchorEl={exportAnchorEl}
                open={Boolean(exportAnchorEl)}
                onClose={() => setExportAnchorEl(null)}
              >
                <MenuItem onClick={() => handleExport('excel')}>
                  <Iconify icon="solar:document-bold" />
                  &nbsp; Export as Excel
                </MenuItem>

                <MenuItem onClick={() => handleExport('pdf')}>
                  <Iconify icon="solar:document-bold" />
                  &nbsp; Export as PDF
                </MenuItem>
                {/* <MenuItem onClick={() => handleExport('import')}>
                {' '}
                <Iconify icon="solar:import-bold" />
                &nbsp; Import
              </MenuItem>
              <MenuItem onClick={() => handleExport('print')}>
                <Iconify icon="fluent:print-28-filled" />
                &nbsp; Print
              </MenuItem> */}
              </Menu>
            </Box>
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
        <TableContainer component={Scrollbar} sx={{ maxHeight: '440px' }}>
          <Table stickyHeader aria-label="customizable table" size={dense ? 'small' : 'medium'}>
            <TableHead>
              <TableRow>
                {columns.some((column) => column.children) && <TableCell />}
                {columns.map(
                  (column, index) =>
                    columnVisibility[column.id] && (
                      <TableCell
                        key={column.id}
                        align={column.align || 'center'}
                        sx={{
                          fontSize: '14px',
                          width: column.minWidth,
                          position: 'sticky',
                          left: column.sticky ? 0 : 'auto',
                          right: column.sticky && columns.length === index + 1 ? 0 : 'auto',
                          zIndex: column.sticky ? 99 : 10,
                          backgroundColor: column.sticky ? 'background.paper' : 'transparent',
                          boxShadow: column.sticky ? 'var(--shadows-4)' : 'none',

                          ...(column.sticky ? { backgroundImage: 'none' } : {}),
                          '& .column-filter-icon': {
                            opacity: 0,
                            transition: 'opacity 0.3s ease',
                          },
                          '&:hover .column-filter-icon': {
                            opacity: 1,
                          },
                          '&::after': {
                            borderRight: (theme) =>
                              !column.sticky ? `1px solid ${theme.palette.grey[400]}` : 'none',
                            content: '""',
                            position: 'absolute',
                            right: '0',
                            bottom: '0',
                            height: '40%',
                            top: '50%',
                            transform: 'translateY(-50%)',
                          },
                          '&:last-child::after': {
                            borderRight: 'none',
                          },
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            cursor: column.isSort !== false ? 'pointer' : 'default',
                            userSelect: 'none',
                            fontWeight: 'bold',
                            width: 'inherit',
                            gap: 0.5,
                          }}
                          onClick={() => column.isSort !== false && handleSort(column.id)}
                        >
                          <Box
                            fontSize="14px"
                            display="block"
                            textAlign={column.align}
                            gap={1}
                            width="inherit"
                            component="span"
                          >
                            {column.label} {column?.renderColumn?.(column)}
                          </Box>

                          {column.isFilter && (
                            <Iconify
                              icon="lucide:list-filter"
                              sx={{
                                height: '16px',
                                width: '16px',
                                cursor: 'pointer',
                                position: 'absolute',
                                right: '4px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                              }}
                              onClick={(e) => handleColumnFilterClick(e, column)}
                              // className="column-filter-icon"
                            />
                          )}

                          {column.isSort !== false && (
                            <Box
                              width="50px"
                              display="flex"
                              justifyContent="center"
                              alignItems="center"
                              // sx={{
                              //   position: 'absolute',
                              //   left: '10px',
                              //   top: '50%',
                              //   transform: 'translateY(-50%)',
                              //   mr: 0.5,
                              // }}
                            >
                              {sorts.findIndex((sort) => sort.column === column.id) > -1 && (
                                <Box component="span" sx={{ fontSize: '0.75em' }}>
                                  {sorts.findIndex((sort) => sort.column === column.id) + 1}
                                </Box>
                              )}
                              <IconButton
                                size="small"
                                sx={{
                                  opacity: sorts.find((sort) => sort.column === column.id) ? 1 : 0,
                                }}
                              >
                                {sorts.find((sort) => sort.column === column.id)?.direction ===
                                'asc' ? (
                                  <ArrowUpwardIcon fontSize="inherit" />
                                ) : (
                                  <ArrowDownwardIcon fontSize="inherit" />
                                )}
                              </IconButton>
                            </Box>
                          )}
                        </Box>
                        {/* <Divider
                          orientation="vertical"
                          sx={{
                            width: column.sticky ? '0px' : '2px',
                            background: (theme) => theme.palette.divider,
                            height: '20px',
                            margin: '10px 2px',
                          }}
                        /> */}
                      </TableCell>
                    )
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    rowSpan={columns.length + 1}
                    colSpan={columns.length + 1}
                    sx={{ height: '50px' }}
                  >
                    {/* <CircularProgress color="primary" size={24} /> */}
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
                                left: column.sticky ? 0 : 'auto',
                                right: column.sticky && columns.length === ind + 1 ? 0 : 'auto',
                                zIndex: column.sticky ? 99 : 2,
                                backgroundColor: column.sticky ? 'background.paper' : 'transparent',
                                boxShadow: column.sticky ? 'var(--shadows-4)' : 'none',
                              }}
                            >
                              {column.render
                                ? column.render(_.get(row, column.id, ''), row)
                                : _.get(row, column.id, '-')}
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
                  <TableCell colSpan={5}>
                    <EmptyContent />
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
                rowsPerPageOptions={[10, 25, 100, { value: -1, label: 'All' }]}
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
                  '& .MuiToolbar-root': {
                    minHeight: 'unset',
                    height: 'auto',
                  },
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

const FilterChips = ({
  filters,
  removeFilter,
  clearAllFilters,
  columns,
}: {
  filters: IParams['filters'];
  removeFilter: (index: number) => void;
  clearAllFilters: () => void;
  columns: Column[];
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
      const filterValue: string | number =
        findColumn?.filterType === 'enum'
          ? findColumn.enumOptions?.find((i) => i.value === filter.value)?.label
          : filter.value;

      return (
        <Chip
          key={index}
          size="small"
          variant="soft"
          label={`${findColumn?.label} : ${filterValue}`}
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
  anchorEl: ColumnFilterAnchor | null;
  onClose: () => void;
  onApplyFilter: (columnId: string, filterType: string, value: any, valueType: string) => void;
}> = ({ anchorEl, onClose, onApplyFilter }) => {
  const [filterType, setFilterType] = useState('');
  const [filterValue, setFilterValue] = useState<null | string | Dayjs>(null);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);

  const getFilterOptions = () => {
    if (!anchorEl) return [];

    switch (anchorEl.column.filterType) {
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

    let value = filterValue;
    let filterTypeValue = filterType;
    if (anchorEl.column.filterType === 'date') {
      value = (value as Dayjs).format('DD-MM-YYYY');
    }
    if (anchorEl.column.filterType === 'enum') {
      filterTypeValue = 'equals';
    }

    onApplyFilter(anchorEl.column.id, filterTypeValue, value, anchorEl.column.filterType as string);
    setFilterType('');
    setFilterValue(null);
    setDateRange([null, null]);
  };

  return (
    <Menu
      anchorEl={anchorEl?.element}
      open={Boolean(anchorEl)}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: '260px',
          },
        },
      }}
    >
      <Box sx={{ p: 2, maxWidth: 350 }}>
        {anchorEl?.column.filterType !== 'enum' && (
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel>Filter Type</InputLabel>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              label="Filter Type"
            >
              {getFilterOptions().map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {anchorEl?.column.filterType === 'enum' && (
          <FormControl fullWidth size="small">
            <InputLabel>{anchorEl.column.label}</InputLabel>
            <Select
              value={filterValue as string}
              onChange={(e) => setFilterValue(e.target.value)}
              label={anchorEl.column.label}
            >
              {anchorEl.column.enumOptions?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {filterType &&
          (anchorEl?.column.filterType === 'date' ? (
            <DatePicker
              value={filterValue as null | Dayjs}
              onChange={(newValue) => setFilterValue(newValue)}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
              format="DD-MM-YYYY"
            />
          ) : (
            <TextField
              fullWidth
              size="small"
              value={filterValue as string}
              onChange={(e) => setFilterValue(e.target.value as string)}
              type={anchorEl?.column.filterType === 'number' ? 'number' : 'text'}
              label={anchorEl?.column.label}
              placeholder={anchorEl?.column.label}
            />
          ))}

        {/* {filterType === 'range' ? null : anchorEl?.column.filterType === 'date' ? (
          <DatePicker
            value={filterValue as null | Dayjs}
            onChange={(newValue) => setFilterValue(newValue)}
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
            format="DD-MM-YYYY"
          />
        ) : (
          <TextField
            fullWidth
            size="small"
            value={filterValue as string}
            onChange={(e) => setFilterValue(e.target.value as string)}
            type={anchorEl?.column.filterType === 'number' ? 'number' : 'text'}
            label={anchorEl?.column.label}
            placeholder={anchorEl?.column.label}
          />
        )} */}

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button
            size="small"
            onClick={() => {
              setFilterType('');
              setFilterValue(null);
              setDateRange([null, null]);
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button variant="contained" size="small" onClick={handleApply}>
            Apply
          </Button>
        </Box>
      </Box>
    </Menu>
  );
};
