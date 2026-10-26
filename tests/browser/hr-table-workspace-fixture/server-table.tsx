import { useEffect, useState } from 'react';
import CustomizableTable from 'src/components/customizabaleTable';
import { useHrTableExport } from 'src/screens/hr/hooks/use-hr-table-export';
import { nameContains, serverColumnFilters } from 'src/screens/hr/utils/server-column-filters';

export function ServerTable() {
  const [query, setQuery] = useState({ page: 1, pageSize: 10, search: '', status: '' });
  const [result, setResult] = useState({ items: [], totalCount: 0 });
  const [loading, setLoading] = useState(true);
  const onExport = useHrTableExport('employee-onboarding-table', query);
  const signature = JSON.stringify(query);
  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/synthetic-hr/list?${new URLSearchParams(JSON.parse(signature))}`)
      .then((response) => response.json())
      .then((data) => {
        if (active) {
          setResult(data);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [signature]);
  return (
    <CustomizableTable
      tableId="synthetic-server-staff"
      tableTitle="Synthetic server staff"
      showExport
      showColumns
      exportScope="all"
      serverSidePagination
      serverSideSearch
      page={query.page - 1}
      rowsPerPage={query.pageSize}
      searchTerm={query.search}
      data={result.items}
      totalCount={result.totalCount}
      isLoading={loading}
      onExport={onExport}
      onServerPagination={(page, pageSize) =>
        setQuery((current) => ({ ...current, page, pageSize }))
      }
      onServerSearch={(search) => setQuery((current) => ({ ...current, search, page: 1 }))}
      {...serverColumnFilters(
        [
          { id: 'candidate', label: 'Candidate' },
          { id: 'status', label: 'Status' },
          { id: 'actions', label: 'Actions', excludeFromExport: true },
        ],
        [
          nameContains('candidate'),
          {
            column: 'status',
            query: 'status',
            emptyValue: '',
            options: [
              { label: 'Pending', value: 0 },
              { label: 'Approved', value: 1 },
            ],
          },
        ],
        query,
        ({ search, status }) =>
          setQuery((current) => ({
            ...current,
            page: 1,
            search: String(search ?? ''),
            status: String(status ?? ''),
          }))
      )}
    />
  );
}
