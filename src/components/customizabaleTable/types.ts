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
  /** Override filter data for computed cells; null excludes a value from numeric/date predicates. */
  filterValue?: (value: unknown, row: IData) => unknown;
  /** Explicit domain ordering for computed cells, independent of their display/export value. */
  sortValue?: (value: unknown, row: IData) => string | number | null;
  /** Numeric filters accept decimals unless a column explicitly requires an integer or other step. */
  filterStep?: number | 'any';
  isFilter?: boolean;
  width?: number | string;
  minWidth?: number | string;
  maxWidth?: number | string;
  align?: 'right' | 'left' | 'center';
  /** Headings stay left aligned independently of numeric or action cell alignment. */
  headerAlign?: 'right' | 'left' | 'center';
  /** Identify each record with a semantic body-row header, without changing cell styling. */
  rowHeader?: boolean;
  headerSx?: SxProps<Theme>;
  cellSx?: SxProps<Theme>;
  render?: (value: any, row: IData) => React.ReactNode;
  searchValue?: (value: unknown, row: IData) => string;
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
  exportValue?: (value: unknown, row: IData) => string | number | boolean | Date | null;
  valueType?: 'text' | 'number' | 'money' | 'date' | 'datetime' | 'boolean';
  originalId?: string;
}

export interface IData {
  [key: string]: any;
}

export interface TableRowAction {
  label: string;
  onClick: () => void;
  disabled?: boolean;
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
  exportContext?: string[];
  exportScope?: 'all' | 'loaded';
  onExport?: (request: TableExportRequest) => Promise<void>;
  exportFormats?: TableExportFormat[];
  exportBusy?: boolean;
  exportDisabled?: boolean;
  showColumns?: boolean;
  showExport?: boolean;
  showFullScreen?: boolean;
  variant?: 'workspace' | 'embedded';
  paginationMode?: 'known' | 'unknown';
  hasNextPage?: boolean;
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
  /** Reports zero-based pages for URL-backed client pagination. */
  onPaginationChange?: (page: number, rowsPerPage: number) => void;
  /** Reports one-based server pages; the controlled `page` prop is zero-based. */
  onServerPagination?: (page: number, rowsPerPage: number) => void;
  onSearchInputChange?: (searchTerm: string) => void;
  onServerSearch?: (searchTerm: string) => void;
  onServerFilter?: (filters: IParams['filters']) => void;
  onSortChange?: (sorts: IParams['sorts']) => void;
  onFiltersChange?: (filters: IParams['filters']) => void;
  /** Atomically clear search and column filters when the owning server query controls both. */
  onClearCriteria?: () => void;
  totalCount?: number;
  maxServerRowsPerPage?: number;
  handleRowClick?: (row: IData, index: number) => void;
  /** Primary record action, available by clicking the row or pressing Enter/Space. */
  getRowAction?: (row: IData, index: number) => TableRowAction | undefined;
  isLoading?: boolean;
  /** Same-scope refresh: retain safe rows and show a labelled progress indicator. */
  isRefreshing?: boolean;
  isPagination?: boolean;
  isFilter?: boolean;
  isSearch?: boolean;
  isScrollbar?: boolean;
  isShowedDense?: boolean;
  rowProps?: (row: IData, index: number) => CustomizableTableRowProps;
  renderExpandedRow?: (row: IData, index: number) => ReactNode;
  showToolbar?: boolean;
  tableId: string;
  defaultSearchTerm?: string;
  defaultRowsPerPage?: number;
  page?: number;
  rowsPerPage?: number;
  paginationDisabled?: boolean;
  searchTerm?: string;
  filters?: IParams['filters'];
  sorts?: IParams['sorts'];
  rowsPerPageOptions?: TablePaginationProps['rowsPerPageOptions'];
  showCheckbox?: boolean;
  onSendNotification?: (data: any) => void;
  searchFieldProps?: TextFieldProps;
  searchableFields?: string[];
  noDataText?: React.ReactNode;
  errorContent?: ReactNode;
  error?: unknown;
  onRetry?: () => void;
  wrapperProps?: BoxProps;
}

export type TableExportFormat = 'excel' | 'pdf';
export type TableExportRequest = {
  signal?: AbortSignal;
  format: TableExportFormat;
  columns: IColumn[];
  searchTerm: string;
  filters: IParams['filters'];
  sorts: IParams['sorts'];
};

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
