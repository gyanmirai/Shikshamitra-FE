import type { StockReceipt, ReceivingPreview } from 'src/redux/library/receiving-types';

import { GlobalIcons } from 'src/utils/icons';
import { formatDateOnly } from 'src/utils/date-only';
import { Stack, Alert, Typography } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

import { ReceivingSavedLine } from './ReceivingSavedLine';
import { receivingSources } from './receiving-field-state';

export function ReceivingReceiptView({
  receipt,
  preview,
}: {
  receipt: StockReceipt;
  preview?: ReceivingPreview | null;
}) {
  return (
    <Stack spacing={2}>
      <Alert severity="success">
        Receipt confirmed. {receipt.copyCount} received copies are recorded.
      </Alert>
      <FormSectionCard
        title="Saved Receipt"
        icon={GlobalIcons.history}
        descriptionTooltip="The immutable receipt preserves its school date, stock source, recorded actor and actual received copy identifiers."
      >
        <Stack spacing={1}>
          <Typography variant="body2">Receipt ID: {receipt.id}</Typography>
          <Typography variant="body2">Received on: {formatDateOnly(receipt.receivedOn)}</Typography>
          <Typography variant="body2">
            Source:{' '}
            {receivingSources.find((source) => source.id === receipt.source)?.name || 'Unavailable'}
          </Typography>
          <Typography variant="body2">
            Supplier or donor: {receipt.sourceName || 'Not recorded'}
          </Typography>
          <Typography variant="body2">
            External reference: {receipt.reference || 'Not recorded'}
          </Typography>
          <Typography variant="body2">
            Recorded at (UTC):{' '}
            {new Date(receipt.recordedAt).toLocaleString(undefined, { timeZone: 'UTC' })}
          </Typography>
          <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
            Recorded by account ID: {receipt.recordedBy}
          </Typography>
        </Stack>
      </FormSectionCard>
      {receipt.lines.map((line) => (
        <ReceivingSavedLine
          key={line.id}
          line={line}
          preview={preview?.lines.find(
            (item) => item.lineIndex === line.lineNumber - 1 && item.bookId === line.bookId
          )}
        />
      ))}
    </Stack>
  );
}
