import React, { useState } from 'react';

// import { visuallyHidden } from '@mui/utils';
import {
  Box,
  Table,
  Paper,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TextField,
  TableContainer,
  TableSortLabel,
  TablePagination,
  CircularProgress,
} from '@mui/material';

interface Column<T> {
  key: keyof T;
  label: string;
  numeric?: boolean;
  width?: string;
  render?: (row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  totalItems?: number;
  page?: number;
  rowsPerPage?: number;
  sortBy?: keyof T | null;
  handleSort?: (value: Record<string, string | number | keyof T>) => void;
  handlePageChange?: (value: Record<string, string | number | keyof T | null>) => void;
  handleChangeRowsPerPage?: (value: Record<string, string | number | keyof T | null>) => void;
  handleSearch?: (value: Record<string, string | number | keyof T | null>) => void;
  isSearchable?: boolean;
  isLoading?: boolean;
}

interface TableState<T> {
  totalItems: number;
  page: number;
  rowsPerPage: number;
  sortBy: keyof T | null;
  sortDirection: 'asc' | 'desc';
  searchQuery: string;
}

function DataTable<T>({
  columns,
  data,
  totalItems = data.length,
  page = 0,
  rowsPerPage = 10,
  sortBy = null,
  handleSort,
  handlePageChange,
  handleChangeRowsPerPage,
  handleSearch,
  isSearchable = false,
  isLoading = false,
}: TableProps<T>) {
  const [state, setState] = useState<TableState<T>>({
    totalItems,
    page,
    rowsPerPage,
    sortBy,
    sortDirection: 'asc',
    searchQuery: '',
  });

  const onSort = (column: keyof T) => {
    setState((prevState) => ({
      ...prevState,
      sortBy: column,
      sortDirection:
        prevState.sortBy === column && prevState.sortDirection === 'asc' ? 'desc' : 'asc',
      page: 0,
    }));
    handleSort?.({
      ...state,
      sortBy: column,
      sortDirection: state.sortBy === column && state.sortDirection === 'asc' ? 'desc' : 'asc',
      page: 0,
    });
  };

  const onChangePage = (event: unknown, newPage: number) => {
    setState((prevState) => ({ ...prevState, page: newPage }));
    handlePageChange?.({ ...state, page: newPage });
  };

  const onChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState((prevState) => ({
      ...prevState,
      rowsPerPage: parseInt(event.target.value, 10),
      page: 0,
    }));
    handleChangeRowsPerPage?.({
      ...state,
      rowsPerPage: parseInt(event.target.value, 10),
      page: 0,
    });
  };

  const onSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState((prevState) => ({
      ...prevState,
      searchQuery: event.target.value,
      page: 0,
    }));
    handleSearch?.({
      ...state,
      searchQuery: event.target.value,
      page: 0,
    });
  };

  return (
    <Paper elevation={3} sx={{ p: 1 }}>
      {isSearchable && (
        <Box sx={{ py: 2 }}>
          <TextField
            label="Search"
            variant="outlined"
            value={state.searchQuery}
            onChange={onSearch}
            size="small"
            //   fullWidth
          />
        </Box>
      )}
      <TableContainer>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  sx={{ fontSize: '12px' }}
                  key={String(column.key)}
                  align="left"
                  style={{ width: column.width }}
                >
                  <TableSortLabel
                    active={state.sortBy === column.key}
                    direction={state.sortBy === column.key ? state.sortDirection : 'asc'}
                    onClick={() => onSort(column.key)}
                  >
                    {column.label}
                    {state.sortBy === column.key ? (
                      <Box component="span" sx={{ display: 'none' }}>
                        {state.sortDirection === 'desc' ? 'sorted descending' : 'sorted ascending'}
                      </Box>
                    ) : null}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {!isLoading ? (
              data.map((row, index) => (
                <TableRow hover key={index}>
                  {columns.map((column) => (
                    <TableCell
                      scope="row"
                      // padding="none"
                      key={String(column.key)}
                      align={column.numeric ? 'right' : 'left'}
                      sx={{ fontSize: '12px' }}
                    >
                      {column?.render ? column.render({ ...row, index }) : String(row[column.key])}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} align="left">
                  <CircularProgress size={20} />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={state.totalItems}
        rowsPerPage={state.rowsPerPage}
        page={state.page}
        onPageChange={onChangePage}
        onRowsPerPageChange={onChangeRowsPerPage}
        sx={{
          '& *': { fontSize: '12px !important' },
          '& svg': { fontSize: '18px !important' },
          '& .MuiToolbar-root': {
            minHeight: 'unset',
            height: 'auto',
          },
        }}
      />
    </Paper>
  );
}

export default DataTable;
