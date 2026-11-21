import type { IColumn } from 'src/components/customizabaleTable/types';
import type { StockImportBatch } from 'src/redux/library/stock-import-api';

import { RouterLink } from 'src/routes/components';
import { libraryPaths } from 'src/constants/library-menus';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Link, Stack, Alert, Typography } from '@mui/material';

import { receivingSources } from '../receiving-field-state';

const columns: IColumn[] = [
  { id: 'rowNumber', label: 'CSV line' },
  { id: 'sourceRowId', label: 'Source row ID', rowHeader: true },
  { id: 'title', label: 'Title', minWidth: 160 },
  {
    id: 'isNewTitle',
    label: 'Catalogue action',
    render: (value: boolean) => (value ? 'Created title' : 'Used existing title'),
  },
  { id: 'accessionNumber', label: 'Accession' },
  {
    id: 'receiptId',
    label: 'Receiving receipt',
    render: (id: string) => (
      <Link component={RouterLink} href={`${libraryPaths.receiving}/${encodeURIComponent(id)}`}>
        View receipt
      </Link>
    ),
  },
];

export function StockImportBatchView({ result }: { result: StockImportBatch }) {
  const { batch } = result;
  const source = receivingSources.find((option) => option.id === batch.source)?.name;
  return (
    <Stack spacing={1.5}>
      <Alert severity="success">
        {batch.rowCount} copies imported. {batch.newTitleCount} new catalogue titles created.
      </Alert>
      <Typography variant="body2">
        {[
          source,
          batch.sourceName,
          `${new Date(batch.importedAt).toLocaleString(undefined, { timeZone: 'UTC' })} UTC`,
        ]
          .filter(Boolean)
          .join(' · ')}
      </Typography>
      <Box sx={{ height: 430, minWidth: 0 }}>
        <CustomizableTable
          tableId="library-stock-import-batch"
          data={result.rows}
          columns={columns}
          isFilter={false}
          showExport={false}
          wrapperProps={{ sx: { height: 1 } }}
          tableContainerProps={{ sx: { height: 1 } }}
        />
      </Box>
    </Stack>
  );
}
