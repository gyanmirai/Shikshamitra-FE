import type { IParams } from 'src/components/customizabaleTable/types';

import { Stack, Button } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import { useUrlFilterValue } from 'src/hooks/use-url-filter-value';

import { documentCategories } from '../types';
import { DocumentFilterPanel } from './document-filter-panel';
import { documentTableColumns } from './document-table-columns';

import type { DocumentWorkspace } from '../hooks/use-document-workspace';

export function DocumentTable({ workspace }: { workspace: DocumentWorkspace }) {
  const { query, permissions, page, size, search, category, changeCriteria } = workspace;
  const columns = documentTableColumns(workspace);
  const filters: IParams['filters'] =
    category === undefined
      ? []
      : [
          {
            column: 'category',
            type: 'equals',
            value: category,
            valueType: 'enum',
            label: 'Category',
            displayValue: documentCategories.find((item) => item.value === category)?.label,
          },
        ];
  const [searchInput, setSearchInput] = useUrlFilterValue(search);
  const clearCriteria = () => {
    setSearchInput('');
    changeCriteria({ search: undefined, category: undefined, page: undefined });
  };
  return (
    <Stack sx={{ minHeight: 0, minWidth: 0, flex: 1, overflow: 'hidden' }}>
      <DocumentFilterPanel
        category={category}
        hasCriteria={Boolean(search || category !== undefined)}
        onCategoryChange={(value) =>
          changeCriteria({
            category: value === undefined ? undefined : String(value),
            page: undefined,
          })
        }
        onClear={clearCriteria}
      />
      <CustomizableTable
        tableId="school-documents"
        tableTitle="School Documents"
        columns={columns}
        data={query.currentData?.items ?? []}
        totalCount={query.currentData?.totalCount ?? 0}
        isLoading={query.isFetching}
        showColumns
        showFullScreen
        showExport={false}
        wrapperProps={{ sx: { flex: 1, minHeight: 0, minWidth: 0, overflow: 'hidden' } }}
        tableContainerProps={{ sx: { height: 1 } }}
        error={query.isError ? query.error : undefined}
        onRetry={() => {
          query.refetch();
        }}
        serverSidePagination
        serverSideSearch
        serverSideSort
        serverSideFilter
        filters={filters}
        onServerFilter={(nextFilters) => {
          const nextCategory = nextFilters
            .filter((filter) => filter.column === 'category')
            .at(-1)?.value;
          changeCriteria({
            category: nextCategory === undefined ? undefined : String(nextCategory),
            page: undefined,
          });
        }}
        serverSideSortMode="single"
        page={page}
        rowsPerPage={size}
        searchTerm={searchInput}
        onSearchInputChange={setSearchInput}
        onClearCriteria={clearCriteria}
        sorts={
          workspace.sorting
            ? [
                {
                  column: workspace.sorting.split(' ')[0],
                  direction: workspace.sorting.endsWith('asc') ? 'asc' : 'desc',
                },
              ]
            : []
        }
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
