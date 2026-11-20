import type { ReceivingPreview as ReceiptPreview } from 'src/redux/library/receiving-types';

import { GlobalIcons } from 'src/utils/icons';
import { formatNumber } from 'src/utils/formate_number';
import { Alert, Stack, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import { FormSectionCard } from 'src/components/form-section-card';

export function ReceivingPreview({ preview }: { preview: ReceiptPreview }) {
  const columns = [
    { id: 'title', label: 'Title' },
    { id: 'location', label: 'Location' },
    { id: 'quantity', label: 'Quantity' },
    { id: 'unitCost', label: 'Unit cost' },
    { id: 'currency', label: 'Currency' },
  ].map((column) => ({ ...column, isSort: false, isFilter: false }));
  return (
    <FormSectionCard
      title="Receipt Preview"
      icon={GlobalIcons.eye}
      descriptionTooltip="Review the server-validated titles, quantities, locations and evidenced costs before receiving stock."
    >
      <Stack spacing={1.5}>
        {preview.errors.map((error, index) => (
          <Alert key={`${error.code}-${index}`} severity="error">
            {error.lineIndex === null ? '' : `Title ${error.lineIndex + 1}: `}
            {error.message || error.code}
          </Alert>
        ))}
        <Typography variant="body2">
          Known-cost copies: {preview.knownCostCopyCount} · Unknown-cost copies:{' '}
          {preview.unknownCostCopyCount}
        </Typography>
        {preview.knownTotals.map((total) => (
          <Typography key={total.currency} variant="body2">
            Known total ({total.currency}):{' '}
            {formatNumber(total.amount, undefined, { fractionDigits: 2 })}
          </Typography>
        ))}
        <CustomizableTable
          tableId="library-receiving-preview"
          columns={columns}
          data={preview.lines.map((line) => ({
            id: String(line.lineIndex),
            title: line.bookTitle,
            location: `${line.sectionName} / ${line.shelfName}`,
            quantity: line.quantity,
            unitCost:
              line.unitCost === null
                ? 'Unknown'
                : formatNumber(line.unitCost, undefined, { fractionDigits: 2 }),
            currency: line.currency || 'Unknown',
          }))}
          isSearch={false}
          isFilter={false}
          isPagination={false}
          showExport={false}
        />
      </Stack>
    </FormSectionCard>
  );
}
