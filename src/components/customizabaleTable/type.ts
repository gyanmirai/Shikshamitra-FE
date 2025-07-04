import type { Dayjs } from 'dayjs';
import type { DatePickerProps } from '@mui/x-date-pickers';
import type { TableRowProps, TextFieldProps } from '@mui/material';

// Add this interface to your existing interfaces
export interface IColumnFilterAnchor {
  element: HTMLElement;
  column: IColumn;
}

export interface IColumn {
  id: string;
  label: string;
  filterType?: 'string' | 'number' | 'date' | 'enum' | 'formattedNumber';
  isFilter?: boolean;
  minWidth?: number | string;
  align?: 'right' | 'left' | 'center';
  render?: (value: any, row: IData) => React.ReactNode;
  renderColumn?: (value: IColumn) => React.ReactNode;
  children?: (row: IData) => React.ReactNode;
  onSort?: (a: any, b: any) => any[];
  isSort?: boolean;
  sticky?: boolean;
  stickyPosition?: 'left' | 'right';
  isDateFilter?: boolean;
  isDateRangeFilter?: boolean;
  enumOptions?: { label: string; value: any }[];
  defaultHidden?: boolean;
}

export interface IData {
  [key: string]: any;
}

export interface ICustomizableTableProps {
  columns: IColumn[];
  data: IData[];
  serverSide?: boolean;
  onServerSort?: (
    column: string,
    sortData: Array<{ column: string; direction: 'asc' | 'desc' }>
  ) => void;
  onServerPagination?: (page: number, rowsPerPage: number) => void;
  onServerSearch?: (searchTerm: string) => void;
  totalCount?: number;
  handleRowClick?: (row: IData, index: number) => void;
  isLoading?: boolean;
  isPagination?: boolean;
  isFilter?: boolean;
  isSearch?: boolean;
  isScrollbar?: boolean;
  isShowedDense?: boolean;
  rowProps?: (row: IData, index: number) => TableRowProps;
  startDateProps?: DatePickerProps<Dayjs>;
  endDateProps?: DatePickerProps<Dayjs>;
  dateProps?: DatePickerProps<Dayjs>;
  tableId: string;
  showCheckbox?: boolean;
  onSendNotification?: (data: any) => void;
  searchFieldProps?: TextFieldProps;
  noDataText?: React.ReactNode;
}

export type IParams = {
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
