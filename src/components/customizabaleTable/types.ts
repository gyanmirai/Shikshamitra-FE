import type { Dayjs } from 'dayjs';
import type { ReactNode } from 'react';
import type { Theme, SxProps } from '@mui/material/styles';
import type {
  BoxProps,
  TableRowProps,
  TextFieldProps,
  TableContainerProps,
  TablePaginationProps,
} from '@mui/material';

// Add this interface to your existing interfaces
export interface IColumnFilterAnchor {
  element: HTMLElement;
  column: IColumn;
}

export interface IColumn {
  id: string;
  label: React.ReactNode; // allow rich header content
  filterType?: 'string' | 'number' | 'date' | 'dateTime' | 'enum' | 'formattedNumber';
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
  stickyOnMobile?: boolean;
  isDateFilter?: boolean;
  isDateRangeFilter?: boolean;
  enumOptions?: { label: string; value: any }[];
  defaultHidden?: boolean;
  excludeFromExport?: boolean;
  originalId?: string;
}

export interface IData {
  [key: string]: any;
}

export type CustomizableTableRowProps = TableRowProps & {
  [key: `data-${string}`]: string | number | boolean | undefined;
};

export type CustomizableTableContainerProps = TableContainerProps & {
  [key: `data-${string}`]: string | number | boolean | undefined;
};

export interface ICustomizableTableProps {
  tableContainerProps?: CustomizableTableContainerProps;
  columns: IColumn[];
  data: IData[];
  tableTitle?: ReactNode;
  exportLabel?: string;
  serverSide?: boolean;
  serverSidePagination?: boolean;
  serverSideSearch?: boolean;
  serverSideSort?: boolean;
  serverSideSortMode?: 'single' | 'multiple';
  serverSideFilter?: boolean;
  onServerSort?: (
    column: string,
    sortData: Array<{ column: string; direction: 'asc' | 'desc'; originalId?: string }>
  ) => void;
  onServerPagination?: (page: number, rowsPerPage: number) => void;
  onSearchInputChange?: (searchTerm: string) => void;
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
  rowProps?: (row: IData, index: number) => CustomizableTableRowProps;
  tableId: string;
  defaultSearchTerm?: string;
  defaultRowsPerPage?: number;
  page?: number;
  rowsPerPage?: number;
  searchTerm?: string;
  filters?: IParams['filters'];
  sorts?: IParams['sorts'];
  rowsPerPageOptions?: TablePaginationProps['rowsPerPageOptions'];
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
    value: any;
    valueType: string;
    label?: ReactNode;
    displayValue?: ReactNode;
  }>;
  sorts: Array<{ column: string; direction: 'asc' | 'desc'; originalId?: string }>;
  dateFilter: null | Dayjs;
  dateRangeFilter: { start: null | Dayjs; end: null | Dayjs };
  filterValue: string;
  columnVisibility: Record<string, boolean>;
};
