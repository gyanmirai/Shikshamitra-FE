import { useState } from 'react';
import { Stack, Button } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import { useHrTableQuery } from 'src/screens/hr/hooks/use-hr-table-query';
import { useHrTableExport } from 'src/screens/hr/hooks/use-hr-table-export';

import { useSyntheticRead } from './operational-api';

export function OperationalTable() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [fixtureState, setState] = useState('normal');
  const query = { fixtureState };
  const view = useHrTableQuery(
    { table: 'hr-pf-rules', query, page, size, resetPage: () => setPage(0) },
    useSyntheticRead('typed-list', { query, offset: page * size, size })
  );
  const exportAll = useHrTableExport('hr-pf-rules', query);
  return (
    <>
      <Stack direction="row" flexWrap="wrap" gap={1}>
        {['normal', 'empty', 'loading', 'error'].map((value) => (
          <Button key={value} onClick={() => setState(value)}>
            Operational {value}
          </Button>
        ))}
      </Stack>
      <CustomizableTable
        tableId="synthetic-operational-pf"
        tableTitle="Synthetic PF rules"
        columns={[
          { id: 'name', label: 'Name' },
          {
            id: 'wageCeiling',
            label: 'Wage ceiling',
            render: (_, row) => (row.wageCeiling == null ? 'No ceiling' : String(row.wageCeiling)),
          },
          { id: 'effectiveFrom', label: 'Effective from' },
          { id: 'actions', label: 'Actions', excludeFromExport: true, render: () => 'View' },
        ]}
        data={view.currentData?.items || []}
        totalCount={view.currentData?.totalCount || 0}
        serverSidePagination
        page={page}
        rowsPerPage={size}
        onServerPagination={(next, count) => {
          setPage(next - 1);
          setSize(count);
        }}
        isLoading={view.isFetching}
        error={view.error}
        onRetry={() => setState('normal')}
        onExport={exportAll}
        exportScope="all"
        showColumns
        showExport
        showFullScreen
        wrapperProps={{ sx: { flex: 1, minHeight: 0 } }}
        {...view.tableProps}
      />
    </>
  );
}
