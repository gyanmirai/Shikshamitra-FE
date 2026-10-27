'use client';

import type { ReactNode } from 'react';
import type { IColumn, IParams } from 'src/components/customizabaleTable/types';
import type { AdmissionOfferingListItem } from 'src/redux/student/admissions/admission-offerings-api';

import { Box, Button } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import CustomizableTable from 'src/components/customizabaleTable';

import { buildAdmissionOfferingColumns } from './admission-offering-columns';

import type { OfferingColumnOptions } from './admission-offering-columns';
import type { AdmissionOfferingActionProps } from './admission-offering-row-actions';

type Props = AdmissionOfferingActionProps & {
  rows: AdmissionOfferingListItem[];
  loading: boolean;
  refreshing?: boolean;
  errorContent?: ReactNode;
  columnOptions?: OfferingColumnOptions;
  filters?: IParams['filters'];
  sorting?: string;
  onFilters?: (filters: IParams['filters']) => void;
  totalCount: number;
  page: number;
  rowsPerPage: number;
  search: string;
  filteredEmpty?: boolean;
  prerequisite?: string;
  onClearFilters?: () => void;
  onSearch: (value: string) => void;
  onSort: (value: string) => void;
  onPagination: (page: number, rowsPerPage: number) => void;
  selection?: {
    selectedIds: string[];
    eligibleIds: string[];
    disabled: boolean;
    onToggle: (row: AdmissionOfferingListItem, checked: boolean) => void;
    onToggleAll: (checked: boolean) => void;
  };
};

export function AdmissionOfferingTable(props: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const {
    rows,
    loading,
    totalCount,
    page,
    rowsPerPage,
    search,
    filteredEmpty = false,
    onClearFilters,
    onSearch,
    onSort,
    onPagination,
    onView,
    selection,
    refreshing,
    errorContent,
    columnOptions,
    filters,
    sorting,
    onFilters,
    prerequisite,
  } = props;
  const columns = buildAdmissionOfferingColumns(props, columnOptions);
  // The mobile cell summarizes two independent statuses; its combined heading is read-only.
  if (isMobile) {
    const configuration = columns.find((column) => column.id === 'configurationStatus');
    if (configuration) {
      configuration.isFilter = false;
      configuration.label = 'Statuses';
    }
  }
  if (selection) {
    const selectedCount = selection.eligibleIds.filter((id) =>
      selection.selectedIds.includes(id)
    ).length;
    const selectionColumn: IColumn = {
      id: 'offering-selection',
      label: '',
      width: 64,
      minWidth: 64,
      headerSx: { px: 1 },
      cellSx: { px: 1 },
      align: 'center',
      sticky: true,
      stickyPosition: 'left',
      isSort: false,
      isFilter: false,
      excludeFromExport: true,
      renderColumn: () => (
        <Checkbox
          size="small"
          sx={{ width: 44, height: 44 }}
          checked={selectedCount > 0 && selectedCount === selection.eligibleIds.length}
          indeterminate={selectedCount > 0 && selectedCount < selection.eligibleIds.length}
          disabled={selection.disabled || selection.eligibleIds.length === 0}
          inputProps={{ 'aria-label': 'Select all eligible offerings on this page' }}
          onChange={(_, checked) => selection.onToggleAll(checked)}
          onClick={(event) => event.stopPropagation()}
        />
      ),
      render: (_, row) => (
        <Checkbox
          size="small"
          sx={{ width: 44, height: 44 }}
          checked={selection.selectedIds.includes(row.id)}
          disabled={selection.disabled || !selection.eligibleIds.includes(row.id)}
          inputProps={{ 'aria-label': `Select ${row.name || row.code} for activation` }}
          onChange={(_event, checked) =>
            selection.onToggle(row as AdmissionOfferingListItem, checked)
          }
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        />
      ),
    };
    // Keep selection, offering identity, and row actions readable on narrow screens.
    // Statuses remain available in the table's horizontal scroll region on mobile.
    columns.forEach((column) => {
      if (column.id === 'name') {
        column.headerSx = { width: { xs: 140, sm: 210 }, minWidth: { xs: 140, sm: 210 } };
        column.cellSx = { width: { xs: 140, sm: 210 }, minWidth: { xs: 140, sm: 210 } };
      }
      if (column.id === 'configurationStatus') column.stickyOnMobile = false;
    });
    columns.unshift(selectionColumn);
  }
  return (
    <CustomizableTable
      tableId="admission-offerings"
      tableTitle="Admission offerings"
      columns={columns}
      data={rows}
      handleRowClick={(row) => onView(row as AdmissionOfferingListItem)}
      rowProps={(row) => ({
        tabIndex: 0,
        sx: { cursor: 'pointer' },
        onKeyDown: (event) => {
          if (
            event.target === event.currentTarget &&
            (event.key === 'Enter' || event.key === ' ')
          ) {
            event.preventDefault();
            onView(row as AdmissionOfferingListItem);
          }
        },
      })}
      isLoading={loading}
      isRefreshing={refreshing}
      errorContent={errorContent}
      isPagination
      isSearch
      serverSide
      serverSidePagination
      serverSideSearch
      serverSideSort
      serverSideFilter
      isFilter
      filters={filters}
      sorts={
        sorting
          ? [
              {
                column: sorting.split(' ')[0],
                direction: sorting.endsWith('desc') ? 'desc' : 'asc',
              },
            ]
          : []
      }
      onServerFilter={onFilters}
      onClearCriteria={onClearFilters}
      maxServerRowsPerPage={100}
      totalCount={totalCount}
      page={page}
      rowsPerPage={rowsPerPage}
      searchTerm={search}
      onServerSearch={onSearch}
      onServerSort={(_, sorts) =>
        onSort(sorts[0] ? `${sorts[0].column} ${sorts[0].direction}` : '')
      }
      onServerPagination={onPagination}
      wrapperProps={{ sx: { height: 1, minHeight: 0, minWidth: 0 } }}
      tableContainerProps={{ sx: { height: 1, minWidth: 0 } }}
      noDataText={
        <Box
          component="span"
          sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}
        >
          <Box component="span" sx={{ typography: 'body2', color: 'text.secondary' }}>
            {prerequisite ||
              (filteredEmpty
                ? 'No admission offerings match the selected filters.'
                : 'No admission offering has been configured.')}
          </Box>
          {!prerequisite && filteredEmpty && onClearFilters && (
            <Button size="small" color="inherit" onClick={onClearFilters}>
              Clear filters
            </Button>
          )}
        </Box>
      }
    />
  );
}
