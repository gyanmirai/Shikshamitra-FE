import type { IColumn } from 'src/components/customizabaleTable/types';
import type { StockImportPreview } from 'src/redux/library/stock-import-api';

import { formatDateOnly } from 'src/utils/date-only';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Alert, Stack, Button, Typography } from '@mui/material';

import { downloadImportCsv } from './stockImportForm';

const errorColumns: IColumn[] = [
  { id: 'rowNumber', label: 'CSV line', render: (value: number | null) => value ?? 'Batch' },
  { id: 'field', label: 'Field' },
  { id: 'message', label: 'Correction needed', minWidth: 300 },
];

const previewColumns: IColumn[] = [
  { id: 'rowNumber', label: 'CSV line' },
  { id: 'sourceRowId', label: 'Source row ID', rowHeader: true },
  { id: 'title', label: 'Title', minWidth: 180 },
  {
    id: 'titleKey',
    label: 'Catalogue action',
    render: (key: string | null) => (key ? `Create · ${key}` : 'Use existing title'),
  },
  {
    id: 'accession',
    label: 'Accession',
    render: (value: string | null) => value ?? 'Assign on import',
  },
  {
    id: 'cataloguePrice',
    label: 'Catalogue price',
    render: (value: string | null, row) =>
      row.bookId ? 'Use existing price' : (value ?? 'Unknown'),
  },
  {
    id: 'unitCost',
    label: 'Acquisition unit cost',
    render: (value: string | null, row) =>
      value === null ? 'Unknown' : `${row.currency} ${value}`,
  },
  { id: 'receivedOn', label: 'Received on', render: (value: string) => formatDateOnly(value) },
];

export function StockImportReview({ review }: { review: StockImportPreview }) {
  if (review.errors.length) {
    return (
      <Stack spacing={1}>
        <Alert severity="warning">
          Correct {review.errors.length} {review.errors.length === 1 ? 'issue' : 'issues'} before
          importing this batch.
        </Alert>
        <Button
          variant="outlined"
          size="small"
          color="inherit"
          sx={{ alignSelf: 'flex-start' }}
          onClick={() =>
            downloadImportCsv('library-stock-import-errors.csv', [
              ['CSV line', 'Field', 'Code', 'Correction needed'],
              ...review.errors.map((row) => [
                row.rowNumber ?? 'Batch',
                row.field,
                row.code,
                row.message,
              ]),
            ])
          }
        >
          Download corrections
        </Button>
        <Box sx={{ height: 375, minWidth: 0 }}>
          <CustomizableTable
            tableId="library-stock-import-errors"
            data={review.errors}
            columns={errorColumns}
            isFilter={false}
            showExport={false}
            wrapperProps={{ sx: { height: 1 } }}
            tableContainerProps={{ sx: { height: 1 } }}
          />
        </Box>
      </Stack>
    );
  }
  return (
    <Stack spacing={1}>
      <Typography variant="subtitle1">Review {review.rows.length} copies</Typography>
      <Typography variant="body2" color="text.secondary">
        The batch will create {review.newTitleCount} new{' '}
        {review.newTitleCount === 1 ? 'title' : 'titles'}. Confirm the reviewed batch to add all
        copies together.
      </Typography>
      <Box sx={{ height: 430, minWidth: 0 }}>
        <CustomizableTable
          tableId="library-stock-import-preview"
          data={review.rows}
          columns={previewColumns}
          isFilter={false}
          showExport={false}
          wrapperProps={{ sx: { height: 1 } }}
          tableContainerProps={{ sx: { height: 1 } }}
        />
      </Box>
    </Stack>
  );
}
