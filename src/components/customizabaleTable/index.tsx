import _ from 'lodash';
import React, { useMemo, useState, useCallback } from 'react';

import FilterAltIcon from '@mui/icons-material/FilterAlt';
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
  Table,
  Paper,
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
  TablePagination,
  FormControlLabel,
} from '@mui/material';

import { Iconify } from '../iconify';
import { ComponentBlock } from '../component-block';

interface Column {
  id: string;
  label: string;
  minWidth?: number | string;
  align?: 'right' | 'left' | 'center';
  render?: (value: any, row: Data) => React.ReactNode;
  children?: (row: Data) => React.ReactNode;
  onSort?: (a: any, b: any) => any[];
  isSort?: boolean;
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
}

const CustomizableTable: React.FC<CustomizableTableProps> = ({
  columns,
  data,
  serverSide = false,
  onServerSort,
  onServerPagination,
  onServerSearch,
  totalCount,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortColumn, setSortColumn] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [columnVisibility, setColumnVisibility] = useState<{ [key: string]: boolean }>(
    columns.reduce((acc, column) => ({ ...acc, [column.id]: true }), {})
  );
  const [filterColumn, setFilterColumn] = useState('');
  const [filterType, setFilterType] = useState('contains');
  const [filterValue, setFilterValue] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [anchorColumnEl, setColumnAnchorEl] = useState<null | HTMLElement>(null);
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);

  const [dense, setDense] = useState(true);
  const [expandedRows, setExpandedRows] = useState<{ [key: number]: boolean }>({});
  const [columnSearchTerm, setColumnSearchTerm] = useState<string>('');
  const [filters, setFilters] = useState<Array<{ column: string; type: string; value: string }>>(
    []
  );
  const [sorts, setSorts] = useState<Array<{ column: string; direction: 'asc' | 'desc' }>>([]);
  const handleChangePage = useCallback(
    (event: unknown, newPage: number) => {
      setPage(newPage);
      if (serverSide && onServerPagination) {
        onServerPagination(newPage, rowsPerPage);
      }
    },
    [serverSide, onServerPagination, rowsPerPage]
  );
  const removeFilter = (index: number) => {
    setFilters(filters.filter((_a, i) => i !== index));
  };

  const clearAllFilters = () => {
    setFilters([]);
  };

  const handleChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(+event.target.value);
      setPage(0);
      if (serverSide && onServerPagination) {
        onServerPagination(0, +event.target.value);
      }
    },
    [serverSide, onServerPagination]
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
      setSorts(newSortConfig);
      if (serverSide && onServerSort) {
        onServerSort(column, newSortConfig);
      }

      // const columnDef = columns.find((col) => col.id === column);
      // if (columnDef && columnDef.isSort !== false) {
      //   const isAsc = sortColumn === column && sortDirection === 'asc';
      //   setSortDirection(isAsc ? 'desc' : 'asc');
      //   setSortColumn(column);
      //   if (serverSide && onServerSort) {
      //     onServerSort(column, isAsc ? 'desc' : 'asc');
      //   }
      // }
    },
    [sorts, serverSide, onServerSort]
  );

  const handleSearch = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value);
      if (serverSide && onServerSearch) {
        onServerSearch(event.target.value);
      }
    },
    [serverSide, onServerSearch]
  );

  const applyFilter = useCallback(
    (row: Data) =>
      filters.every((filter) => {
        const value = row[filter.column];
        switch (filter.type) {
          case 'contains':
            return value.toString().toLowerCase().includes(filter.value.toLowerCase());
          case 'equals':
            return value.toString().toLowerCase() === filter.value.toLowerCase();
          case 'startsWith':
            return value.toString().toLowerCase().startsWith(filter.value.toLowerCase());
          case 'endsWith':
            return value.toString().toLowerCase().endsWith(filter.value.toLowerCase());
          default:
            return true;
        }
      }),
    [filters]
  );

  const filteredData = useMemo(
    () =>
      serverSide
        ? data
        : data.filter(
            (row) =>
              Object.entries(row).some(
                ([key, value]) =>
                  columnVisibility[key] &&
                  _.get(row, columns.find((col) => col.id === key)?.id || '') &&
                  _.get(row, columns.find((col) => col.id === key)?.id || '')
                    .toString()
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
              ) && applyFilter(row)
          ),
    [serverSide, data, columnVisibility, columns, searchTerm, applyFilter]
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
    setDense(event.target.checked);
  };

  const clearFilter = () => {
    setFilterColumn('');
    setFilterType('contains');
    setFilterValue('');
    setPage(0);
    setAnchorEl(null);
  };

  const handleExpandRow = (index: number) => {
    setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleExport = useCallback((format: string) => {}, []);
  const handleApplyFilter = () => {
    if (filterColumn && filterType && filterValue) {
      setFilters([...filters, { column: filterColumn, type: filterType, value: filterValue }]);
      setFilterColumn('');
      setFilterType('contains');
      setFilterValue('');
    }
    setPage(0);
    setAnchorEl(null);
  };
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            endAdornment: (
              <>
                {searchTerm ? (
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
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
        <Box flexGrow={1} display="flex" justifyContent="flex-end" alignItems="center">
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
                  onChange={(e) => setColumnSearchTerm(e.target.value)}
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
                              setColumnVisibility((prev) => ({
                                ...prev,
                                [column.id]: e.target.checked,
                              }));
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
                      setColumnVisibility(
                        Object.fromEntries(columns.map((column) => [column.id, true]))
                      );
                      setColumnSearchTerm('');
                    }}
                  >
                    Reset
                  </Button>
                </Box>
              </Box>
            </Popover>{' '}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
            <Button
              size="small"
              startIcon={<FilterAltIcon />}
              onClick={(event) => setAnchorEl(event.currentTarget)}
            >
              Filters
            </Button>
            <Popover
              open={Boolean(anchorEl)}
              anchorEl={anchorEl}
              onClose={() => setAnchorEl(null)}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
            >
              <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Column</InputLabel>
                  <Select
                    value={filterColumn}
                    onChange={(e) => setFilterColumn(e.target.value as string)}
                    label="Column"
                  >
                    {columns.map((column) => (
                      <MenuItem key={column.id} value={column.id}>
                        {column.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Filter Type</InputLabel>
                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as string)}
                    label="Filter Type"
                  >
                    <MenuItem value="contains">Contains</MenuItem>
                    <MenuItem value="equals">Equals</MenuItem>
                    <MenuItem value="startsWith">Starts With</MenuItem>
                    <MenuItem value="endsWith">Ends With</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Filter Value"
                  variant="outlined"
                  size="small"
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => {
                      handleApplyFilter();
                    }}
                  >
                    Apply
                  </Button>
                  <Button size="small" variant="outlined" onClick={clearFilter}>
                    Clear
                  </Button>
                </Box>
              </Box>
            </Popover>
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
              <MenuItem onClick={() => handleExport('export')}>
                <Iconify icon="solar:export-bold" />
                &nbsp; Export
              </MenuItem>
              <MenuItem onClick={() => handleExport('import')}>
                {' '}
                <Iconify icon="solar:import-bold" />
                &nbsp; Import
              </MenuItem>
              <MenuItem onClick={() => handleExport('print')}>
                <Iconify icon="fluent:print-28-filled" />
                &nbsp; Print
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Box>
      {filters.length > 0 && (
        <FilterChips
          filters={filters}
          removeFilter={removeFilter}
          clearAllFilters={clearAllFilters}
        />
      )}
      <Box px="2px">
        <ComponentBlock>
          <Table stickyHeader aria-label="customizable table" size={dense ? 'small' : 'medium'}>
            <TableHead>
              <TableRow>
                {columns.some((column) => column.children) && <TableCell />}
                {columns.map(
                  (column) =>
                    columnVisibility[column.id] && (
                      <TableCell
                        key={column.id}
                        align={column.align || 'center'}
                        sx={{ fontSize: '14px', minWidth: column.minWidth }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            cursor: column.isSort !== false ? 'pointer' : 'default',
                            userSelect: 'none',
                            fontWeight: 'bold',
                          }}
                          onClick={() => column.isSort !== false && handleSort(column.id)}
                        >
                          {column.label}
                          {column.isSort !== false && (
                            <>
                              {sorts.findIndex((sort) => sort.column === column.id) > -1 && (
                                <Box component="span" sx={{ ml: 0.5, fontSize: '0.75em' }}>
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
                            </>
                          )}
                          {/* {column.isSort !== false && (
                            <IconButton
                              size="small"
                              sx={{ opacity: sortColumn === column.id ? 1 : 0 }}
                            >
                              {sortDirection === 'asc' ? (
                                <ArrowUpwardIcon fontSize="inherit" />
                              ) : (
                                <ArrowDownwardIcon fontSize="inherit" />
                              )}
                            </IconButton>
                          )} */}
                        </Box>
                      </TableCell>
                    )
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((row, index) => (
                <React.Fragment key={index}>
                  <TableRow hover tabIndex={-1}>
                    {columns.some((column) => column.children) && (
                      <TableCell sx={{ fontSize: '12px' }}>
                        <IconButton size="small" onClick={() => handleExpandRow(index)}>
                          {expandedRows[index] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </TableCell>
                    )}
                    {columns.map(
                      (column) =>
                        columnVisibility[column.id] && (
                          <TableCell key={column.id} align={column.align} sx={{ fontSize: '12px' }}>
                            {column.render
                              ? column.render(row[column.id], row)
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
              ))}
            </TableBody>
          </Table>
          <Paper
            elevation={1}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 1,
              width: '100%',
            }}
          >
            <FormControlLabel
              control={<Switch size="small" checked={dense} onChange={handleChangeDense} />}
              label="Dense"
            />
            <TablePagination
              rowsPerPageOptions={[10, 25, 100]}
              component="div"
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
          </Paper>
        </ComponentBlock>
      </Box>
    </Box>
  );
};

export default CustomizableTable;

const FilterChips = ({ filters, removeFilter, clearAllFilters }: any) => (
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
    {filters.map((filter: any, index: number) => (
      <Chip
        key={index}
        size="small"
        variant="soft"
        label={`${filter.column} : ${filter.value}`}
        onDelete={() => removeFilter(index)}
      />
    ))}
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
