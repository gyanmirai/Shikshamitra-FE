import React from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, TableRow, TableHead, TableCell, IconButton } from '@mui/material';
import {
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';

import { Iconify } from '../../iconify';

import type { IColumn, IParams } from '../types';

interface TableHeaderProps {
  columns: IColumn[];
  columnVisibility: Record<string, boolean>;
  sorts: IParams['sorts'];
  onSort: (column: string, originalId?: string) => void;
  filters: IParams['filters'];
  onColumnFilterClick: (event: React.MouseEvent, column: IColumn) => void;
  headerRefs: (number | null)[];
  setHeaderRef: React.Dispatch<React.SetStateAction<number[]>>;
  stickyMap: { left: Record<string, number>; right: Record<string, number> };
  getStickyStyle: (col: IColumn, isHeader: boolean) => React.CSSProperties;
}

export const TableHeader = React.memo(
  ({
    columns,
    columnVisibility,
    sorts,
    onSort,
    filters,
    onColumnFilterClick,
    headerRefs,
    setHeaderRef,
    stickyMap,
    getStickyStyle,
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
                  align={column.align || 'center'}
                  ref={(el: HTMLTableCellElement) => {
                    setHeaderRef((pre: number[]) => {
                      pre[index] = el?.getBoundingClientRect?.()?.width ?? null;
                      return pre;
                    });
                  }}
                  sx={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'text.secondary',
                    minWidth: column.minWidth,
                    whiteSpace: 'nowrap',
                    py: 1.5,
                    px: 2,
                    // @ts-ignore
                    left: column.sticky ? stickyMap[column.id] : 'auto',

                    backgroundColor: 'background.neutral',
                    // boxShadow: column.sticky
                    //   ? '0px 0 8px rgba(0,0,0,0.08)'
                    //   : '1px 0 8px rgba(0,0,0,0.08)',
                    borderBottom: `1px solid ${theme.vars.palette.divider}`,

                    ...(column.sticky ? { backgroundImage: 'none' } : {}),
                    '&:not(:last-of-type)::after': {
                      position: 'absolute',
                      content: '""',
                      top: '25%',
                      right: 0,
                      height: '50%',
                      width: '2px',
                      backgroundColor: theme.vars.palette.divider,
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
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      cursor: column.isSort !== false ? 'pointer' : 'default',
                      userSelect: 'none',
                      fontWeight: 'bold',

                      gap: 0.5,
                    }}
                    onClick={() => column.isSort !== false && onSort(column.id, column?.originalId)}
                  >
                    <Box
                      fontSize="14px"
                      display="block"
                      textAlign={column.align}
                      gap={1}
                      width={!column?.renderColumn ? 'auto' : 'inherit'}
                      component="span"
                    >
                      {column.label} {column?.renderColumn?.(column)}
                    </Box>
                    {column.isSort !== false && (
                      <Box
                        width="50px"
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        sx={{ flexGrow: '1', display: 'flex', justifyContent: 'start', pl: 1 }}
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
                          {sorts.find((sort) => sort.column === column.id)?.direction === 'asc' ? (
                            <ArrowUpwardIcon fontSize="inherit" />
                          ) : (
                            <ArrowDownwardIcon fontSize="inherit" />
                          )}
                        </IconButton>
                      </Box>
                    )}
                    {column.isFilter && (
                      <Box position="relative" display="flex" alignItems="center">
                        <Iconify
                          icon="fluent:filter-12-filled"
                          className="column-filter-icon"
                          sx={{
                            height: 16,
                            width: 16,
                            cursor: 'pointer',
                            // ml: 0.5,
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
                </TableCell>
              )
          )}
        </TableRow>
      </TableHead>
    );
  }
);
