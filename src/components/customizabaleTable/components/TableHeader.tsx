import React from 'react';
import { keyframes } from '@emotion/react';
import { useTheme } from '@mui/material/styles';
import { Box, TableRow, TableHead, TableCell, IconButton } from '@mui/material';
import {
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';

import { Iconify } from '../../iconify';

import type { IColumn, IParams } from '../types';

const fadeSlideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

interface TableHeaderProps {
  columns: IColumn[];
  columnVisibility: Record<string, boolean>;
  sorts: IParams['sorts'];
  onSort: (column: string, originalId?: string) => void;
  filters: IParams['filters'];
  onColumnFilterClick: (event: React.MouseEvent, column: IColumn) => void;
  stickyMap: { left: Record<string, number>; right: Record<string, number> };
  getStickyStyle: (col: IColumn, isHeader: boolean) => React.CSSProperties;
  columnWidths: Record<string, number>;
  onResizeStart: (
    colId: string,
    event: React.MouseEvent,
    currentWidth: number,
    minWidth: number
  ) => void;
  onResetWidth: (colId: string) => void;
}

export const TableHeader = React.memo(
  ({
    columns,
    columnVisibility,
    sorts,
    onSort,
    filters,
    onColumnFilterClick,
    stickyMap,
    getStickyStyle,
    columnWidths,
    onResizeStart,
    onResetWidth,
  }: TableHeaderProps) => {
    const theme = useTheme();

    return (
      <TableHead>
        <TableRow>
          {columns.some((column) => column.children) && <TableCell />}
          {columns.map(
            (column, index) =>
              columnVisibility[column.id] && (
                <TableCell
                  key={column.id}
                  align={column.align}
                  data-column-id={column.id}
                  sx={{
                    // fontSize: '13px',
                    fontWeight: 600,
                    color: 'text.secondary',
                    // ...getColumnSizeSx(column, columnWidths[column.id]),
                    width: column.width,
                    whiteSpace: 'normal',
                    py: 1.5,
                    px: 2,
                    animation: `${fadeSlideIn} 0.4s ease both`,

                    backgroundColor: theme.vars.palette.background.neutral,
                    // boxShadow: column.sticky
                    //   ? '0px 0 8px rgba(0,0,0,0.08)'
                    //   : '1px 0 8px rgba(0,0,0,0.08)',
                    borderBottom: `1px solid ${theme.vars.palette.divider}`,

                    ...(column.sticky ? { backgroundImage: 'none' } : {}),
                    '&:not(:last-of-type)::after': {
                      display: 'none',
                    },
                    '& .column-filter-icon': {
                      opacity: 1,
                      transition: 'opacity 0.2s',
                      color: `${theme.palette.text.secondary}`,
                    },
                    '&:hover .column-filter-icon': {
                      opacity: 1,
                      color: `${theme.palette.text.secondary}`,
                    },

                    zIndex: 100,
                    ...getStickyStyle(column, true),
                    position: 'sticky',
                    ...column.headerSx,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: 'inherit',
                      cursor: column.isSort !== false ? 'pointer' : 'default',
                      userSelect: 'none',
                      fontWeight: 'bold',
                      minWidth: 0,
                      gap: 0.5,
                    }}
                    onClick={() => column.isSort !== false && onSort(column.id, column?.originalId)}
                  >
                    <Box
                      // fontSize="14px"
                      display="block"
                      textAlign={column.align}
                      gap={1}
                      minWidth={0}
                      overflow="hidden"
                      textOverflow="ellipsis"
                      width={!column?.renderColumn ? 'auto' : 'inherit'}
                      component="span"
                      sx={{ flex: 1, minWidth: 0 }}
                    >
                      {column.label} {column?.renderColumn?.(column)}
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        ml: 'auto',
                        flexShrink: 0,
                        gap: 1,
                      }}
                    >
                      {column.isSort !== false && (
                        <Box
                          width="18px"
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                          sx={{ flexShrink: 0, display: 'flex', justifyContent: 'start' }}
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
                              p: 0.25,
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
                      {column.isFilter && (
                        <Box position="relative" display="flex" alignItems="center" flexShrink={0}>
                          <Iconify
                            icon="fluent:filter-12-filled"
                            className="column-filter-icon"
                            sx={{
                              height: 16,
                              width: 16,
                              cursor: 'pointer',
                              m: 0,
                              color: 'text.disabled',
                            }}
                            onClick={(e) => onColumnFilterClick(e, column)}
                          />
                          {filters.some((f) => f.column === column.id) && (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: 'primary.main',
                                position: 'absolute',
                                top: '-4px',
                                right: '-4px',
                              }}
                            />
                          )}
                        </Box>
                      )}
                    </Box>
                  </Box>
                  <Box
                    className="resize-handle"
                    // onMouseDown={(e) => {
                    //   const th = (e.currentTarget as HTMLElement).closest('th') as HTMLElement;
                    //   const currentWidth = th?.getBoundingClientRect().width ?? 100;
                    //   const min = typeof column.minWidth === 'number' ? column.minWidth : 50;
                    //   onResizeStart(column.id, e, currentWidth, min);
                    // }}
                    // onDoubleClick={(e) => {
                    //   e.stopPropagation();
                    //   onResetWidth(column.id);
                    // }}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '2px',
                      height: '100%',
                      cursor: 'col-resize',
                      zIndex: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      '&::after': {
                        content: '""',
                        display: 'block',
                        width: '2px',
                        height: '50%',
                        borderRadius: '2px',
                        backgroundColor: theme.vars.palette.divider,
                        transition: 'background-color 0.15s, height 0.15s',
                      },
                      '&:hover::after': {
                        backgroundColor: theme.vars.palette.primary.main,
                        height: '80%',
                      },
                    }}
                  />
                </TableCell>
              )
          )}
        </TableRow>
      </TableHead>
    );
  }
);
