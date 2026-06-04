import type { Dayjs } from 'dayjs';
import type { ReactNode } from 'react';
import type { Theme, SxProps } from '@mui/material/styles';
import type { BoxProps, TableRowProps, TextFieldProps, TableContainerProps } from '@mui/material';

// Add this interface to your existing interfaces
export interface IColumnFilterAnchor {
  element: HTMLElement;
  column: IColumn;
}

export interface IColumn {
  id: string;
  label: React.ReactNode; // allow rich header content
  tooltip?: React.ReactNode; // custom tooltip content on hover
  filterType?: 'string' | 'number' | 'date' | 'enum' | 'formattedNumber';
  isFilter?: boolean;
  width?: number | string;
  minWidth?: number | string;
  maxWidth?: number | string;
  align?: 'right' | 'left' | 'center';
  headerSx?: SxProps<Theme>;
  cellSx?: SxProps<Theme>;
  render?: (value: any, row: IData) => React.ReactNode;
  renderColumn?: (col: IColumn) => React.ReactNode; // header specific custom render
  children?: (row: IData) => React.ReactNode;
  onSort?: (a: any, b: any) => any[];
  isSort?: boolean;
  sticky?: boolean;
  stickyPosition?: 'left' | 'right';
  isDateFilter?: boolean;
  isDateRangeFilter?: boolean;
  enumOptions?: { label: string; value: any }[];
  defaultHidden?: boolean;
  originalId?: string;
}

export interface IData {
  [key: string]: any;
}

export interface ICustomizableTableProps {
  tableContainerProps?: TableContainerProps;
  columns: IColumn[];
  data: IData[];
  tableTitle?: ReactNode;
  serverSide?: boolean;
  serverSidePagination?: boolean;
  serverSideSearch?: boolean;
  serverSideSort?: boolean;
  serverSideFilter?: boolean;
  onServerSort?: (
    column: string,
    sortData: Array<{ column: string; direction: 'asc' | 'desc'; originalId?: string }>
  ) => void;
  onServerPagination?: (page: number, rowsPerPage: number) => void;
  onServerSearch?: (searchTerm: string) => void;
  onServerFilter?: (filters: IParams['filters']) => void;
  totalCount?: number;
  maxServerRowsPerPage?: number;
  handleRowClick?: (row: IData, index: number) => void;
  isLoading?: boolean;
  isPagination?: boolean;
  isFilter?: boolean;
  isSearch?: boolean;
  isScrollbar?: boolean;
  isShowedDense?: boolean;
  rowProps?: (row: IData, index: number) => TableRowProps;
  tableId: string;
  showCheckbox?: boolean;
  onSendNotification?: (data: any) => void;
  searchFieldProps?: TextFieldProps;
  noDataText?: React.ReactNode;
  wrapperProps?: BoxProps;
}

export type IParams = {
  page: number;
  rowsPerPage: number;
  searchTerm: string;
  filterColumn: string;
  filterType: string;
  dense: boolean;
  columnSearchTerm: string;
  filters: Array<{
    column: string;
    type: string;
    value: string;
    valueType: string;
    label?: ReactNode;
  }>;
  sorts: Array<{ column: string; direction: 'asc' | 'desc'; originalId?: string }>;
  dateFilter: null | Dayjs;
  dateRangeFilter: { start: null | Dayjs; end: null | Dayjs };
  filterValue: string;
  columnVisibility: Record<string, boolean>;
};
