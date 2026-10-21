import { Box, Stack, Button } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { useUrlFilterValue } from 'src/hooks/use-url-filter-value';

import { documentCategories } from '../types';
import { documentTableColumns } from './document-table-columns';

import type { DocumentWorkspace } from '../hooks/use-document-workspace';

export function DocumentTable({ workspace }: { workspace: DocumentWorkspace }) {
  const { query, permissions, page, size, search, category, changeCriteria } = workspace;
  const columns = documentTableColumns(workspace);
  const [searchInput, setSearchInput] = useUrlFilterValue(search);
  const clearCriteria = () => {
    setSearchInput('');
    changeCriteria({ search: undefined, category: undefined, page: undefined });
  };
  return (
    <Stack spacing={1} sx={{ minWidth: 0, flex: 1 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
        <Box sx={{ width: { xs: '100%', sm: 250 } }}>
          <CustomSelect
            label="Category"
            value={category ?? 'all'}
            options={[{ value: 'all', label: 'All categories' }, ...documentCategories]}
            onChange={(value) =>
              changeCriteria({
                category: value === 'all' ? undefined : String(value),
                page: undefined,
              })
            }
          />
        </Box>
        {(search || category !== undefined) && (
          <Button size="small" onClick={clearCriteria}>
            Clear Filters
          </Button>
        )}
      </Stack>
      <CustomizableTable
        tableId="school-documents"
        tableTitle="School Documents"
        columns={columns}
        data={query.currentData?.items ?? []}
        totalCount={query.currentData?.totalCount ?? 0}
        isLoading={query.isFetching}
        isFilter={false}
        showExport={false}
        serverSidePagination
        serverSideSearch
        serverSideSort
        serverSideSortMode="single"
        page={page}
        rowsPerPage={size}
        searchTerm={searchInput}
        onSearchInputChange={setSearchInput}
        onClearCriteria={clearCriteria}
        sorts={[
          {
            column: workspace.sorting.split(' ')[0],
            direction: workspace.sorting.endsWith('asc') ? 'asc' : 'desc',
          },
        ]}
        onServerSort={(_column, sorts) =>
          changeCriteria({
            sort: sorts[0] ? `${sorts[0].column} ${sorts[0].direction}` : undefined,
            page: undefined,
          })
        }
        rowsPerPageOptions={[10, 25, 50]}
        paginationDisabled={query.isFetching}
        searchFieldProps={{
          placeholder: 'Search documents...',
          inputProps: { 'aria-label': 'Search documents', maxLength: 200 },
        }}
        onServerSearch={(value) => {
          if (value !== search) changeCriteria({ search: value, page: undefined });
        }}
        onServerPagination={(value, rows) =>
          changeCriteria({ page: String(value - 1), size: String(rows) })
        }
        isSearch
        noDataText={
          search || category !== undefined ? (
            'No documents match your filters.'
          ) : (
            <Stack alignItems="center" spacing={1}>
              <span>No school documents added yet.</span>
              {permissions.canAdd && (
                <Button size="small" onClick={() => workspace.setAdding(true)}>
                  Add Document
                </Button>
              )}
            </Stack>
          )
        }
      />
    </Stack>
  );
}
