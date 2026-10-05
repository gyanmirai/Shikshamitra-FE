import _ from 'lodash';
import React from 'react';
import { useTheme } from '@mui/material/styles';
import { ExpandLess as ExpandLessIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import {
  Box,
  TableRow,
  Collapse,
  TableCell,
  IconButton,
  TableBody as MuiTableBody,
} from '@mui/material';

import TableEmptyState from './TableEmptyState';
import { getColumnSizeSx } from '../utils/columnSizing';
import TableBodyLoadingRows from './TableBodyLoadingRows';

import type { IData, IColumn } from '../types';

interface TableBodyProps {
  isLoading: boolean;
  data: IData[];
  columns: IColumn[];
  columnVisibility: Record<string, boolean>;
  getStickyStyle: (col: IColumn) => React.CSSProperties;
  dense: boolean;
  onRowClick: (row: IData, index: number) => void;
  rowProps: (row: IData, index: number) => any;
  expandedRows: Record<number, boolean>;
  onExpandRow: (index: number) => void;
  noDataText?: React.ReactNode;
  errorContent?: React.ReactNode;
  tableRef: number;
  rowsPerPage?: number;
  searchTerm?: string;
  hasActiveFilters?: boolean;
  onClearCriteria?: () => void;
}

export const TableBody = ({
  isLoading,
  data,
  columns,
  columnVisibility,
  getStickyStyle,
  dense,
  onRowClick,
  rowProps,
  expandedRows,
  onExpandRow,
  noDataText = 'No data available',
  errorContent,
  tableRef,
  rowsPerPage = 10,
  searchTerm = '',
  hasActiveFilters = false,
  onClearCriteria,
}: TableBodyProps) => {
  const theme = useTheme();

  if (errorContent) {
    return (
      <MuiTableBody>
        <TableRow>
          <TableCell colSpan={columns.length} sx={{ p: 0 }}>
            <Box
              sx={{
                width: tableRef || '100%',
                position: 'sticky',
                left: 0,
                height: '100%',
                minHeight: 240,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
              }}
            >
              {errorContent}
            </Box>
          </TableCell>
        </TableRow>
      </MuiTableBody>
    );
  }

  if (isLoading) {
    return (
      <TableBodyLoadingRows
        columns={columns}
        columnVisibility={columnVisibility}
        dense={dense}
        rowsPerPage={rowsPerPage}
      />
    );
  }

  if (data.length === 0) {
    return (
      <MuiTableBody>
        <TableRow>
          <TableCell colSpan={columns.length} sx={{ p: 0 }}>
            <TableEmptyState
              noDataText={noDataText}
              tableWidth={tableRef}
              searchTerm={searchTerm}
              hasActiveFilters={hasActiveFilters}
              onClearCriteria={onClearCriteria}
            />
          </TableCell>
        </TableRow>
      </MuiTableBody>
    );
  }

  return (
    <MuiTableBody>
      {data.map((row, index) => (
        <React.Fragment key={row.id ?? index}>
          <TableRow
            hover
            tabIndex={-1}
            data-row-id={typeof row?.id === 'string' ? row.id : undefined}
            onClick={() => onRowClick(row, index)}
            {...rowProps(row, index)}
            sx={{
              ...rowProps(row, index)?.sx,
            }}
          >
            {columns.some((column) => column.children) && (
              <TableCell>
                <IconButton
                  size="small"
                  aria-label={`${expandedRows[index] ? 'Collapse' : 'Expand'} row ${index + 1}`}
                  aria-expanded={Boolean(expandedRows[index])}
                  onClick={(e) => {
                    e.stopPropagation();
                    onExpandRow(index);
                  }}
                >
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
                    onClick={
                      column.id === 'action' || column.id === 'actions'
                        ? (event) => event.stopPropagation()
                        : undefined
                    }
                    sx={{
                      verticalAlign: 'middle',
                      // fontSize: '14px',
                      py: dense ? 1.5 : 2,
                      px: 2,
                      color: 'text.primary',
                      borderBottom: `1px dashed ${theme.vars.palette.divider}`,
                      position: column.sticky ? 'sticky' : 'static',
                      zIndex: column.sticky ? 10 : 2,
                      backgroundColor: column.sticky ? 'background.paper' : 'transparent',
                      boxShadow: column.sticky ? '0px 0 4px rgba(0,0,0,0.08)' : 'none',
                      ...getColumnSizeSx(column),
                      ...getStickyStyle(column),
                      ...column.cellSx,
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
              <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={columns.length + 1}>
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
    </MuiTableBody>
  );
};
