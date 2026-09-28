'use client';

import type { AdmissionOfferingListItem } from 'src/redux/student/admissions/admission-offerings-api';

import Box from '@mui/material/Box';
import CustomizableTable from 'src/components/customizabaleTable';

import { buildAdmissionOfferingColumns } from './admission-offering-columns';

import type { AdmissionOfferingActionProps } from './admission-offering-row-actions';

type Props = AdmissionOfferingActionProps & {
  rows: AdmissionOfferingListItem[];
  loading: boolean;
  totalCount: number;
  page: number;
  rowsPerPage: number;
  search: string;
  onSearch: (value: string) => void;
  onSort: (value: string) => void;
  onPagination: (page: number, rowsPerPage: number) => void;
};

export function AdmissionOfferingTable(props: Props) {
  const { rows, loading, totalCount, page, rowsPerPage, search, onSearch, onSort, onPagination, onView } =
    props;
  return (
    <CustomizableTable
      tableId="admission-offerings"
      tableTitle="Class admission setup"
      columns={buildAdmissionOfferingColumns(props)}
      data={rows}
      handleRowClick={(row) => onView(row as AdmissionOfferingListItem)}
      rowProps={(row) => ({
        tabIndex: 0,
        sx: { cursor: 'pointer' },
        onKeyDown: (event) => {
          if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            onView(row as AdmissionOfferingListItem);
          }
        },
      })}
      isLoading={loading}
      isPagination
      isSearch
      serverSide
      serverSidePagination
      serverSideSearch
      serverSideSort
      totalCount={totalCount}
      page={page}
      rowsPerPage={rowsPerPage}
      searchTerm={search}
      onServerSearch={onSearch}
      onServerSort={(_, sorts) =>
        onSort(sorts[0] ? `${sorts[0].column} ${sorts[0].direction}` : '')
      }
      onServerPagination={onPagination}
      wrapperProps={{ sx: { height: 1 } }}
      tableContainerProps={{ sx: { height: 1 } }}
      noDataText={
        <Box component="span" sx={{ color: 'text.secondary' }}>
          No class admission setup has been configured. Create one to define which classes accept
          applications.
        </Box>
      }
    />
  );
}
