import type { StockReceipt, ReceivingPreview } from 'src/redux/library/receiving-types';

import { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { formatNumber } from 'src/utils/formate_number';
import { Stack, Button, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import { FormSectionCard } from 'src/components/form-section-card';

import { SavedCopyLabelsDialog } from '../BookManagement/BookFormComponents/SavedCopyLabelsDialog';

export function ReceivingSavedLine({
  line,
  preview,
}: {
  line: StockReceipt['lines'][number];
  preview?: ReceivingPreview['lines'][number];
}) {
  const [labelsOpen, setLabelsOpen] = useState(false);
  const title = line.currentBookTitle || preview?.bookTitle || 'Current title unavailable';
  const sectionName = line.currentSectionName || preview?.sectionName;
  const shelfName = line.currentShelfName || preview?.shelfName;
  const columns = [
    { id: 'accessionNumber', label: 'Accession number' },
    { id: 'copyNumber', label: 'Copy number' },
    { id: 'copyId', label: 'Copy ID' },
  ].map((column) => ({ ...column, isFilter: false, isSort: false }));
  return (
    <>
      <FormSectionCard
        title={title}
        icon={GlobalIcons.issueBook}
        descriptionTooltip="Only copies created by this saved receipt appear here. Location IDs are recorded receipt facts; readable names come from current catalogue setup."
        action={
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            disabled={!line.copies.length}
            onClick={() => setLabelsOpen(true)}
            startIcon={<Iconify icon={GlobalIcons.printer} />}
          >
            Print received labels
          </Button>
        }
      >
        <Stack spacing={1}>
          <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
            Recorded title ID: {line.bookId}
          </Typography>
          <Typography variant="body2">Recorded section ID: {line.sectionId}</Typography>
          <Typography variant="body2">Current section: {sectionName || 'Unavailable'}</Typography>
          <Typography variant="body2">Recorded shelf ID: {line.shelfId}</Typography>
          <Typography variant="body2">Current shelf: {shelfName || 'Unavailable'}</Typography>
          <Typography variant="body2">
            Unit cost:{' '}
            {line.unitCost === null
              ? 'Unknown'
              : `${line.currency} ${formatNumber(line.unitCost, undefined, { fractionDigits: 2 })}`}
          </Typography>
          <CustomizableTable
            tableId={`library-received-copies-${line.id}`}
            columns={columns}
            data={line.copies.map((copy) => ({ ...copy, id: copy.copyId }))}
            isSearch
            isFilter={false}
            showExport={false}
          />
        </Stack>
      </FormSectionCard>
      {labelsOpen && (
        <SavedCopyLabelsDialog
          open
          bookId={line.bookId}
          copyIds={line.copies.map((copy) => copy.copyId)}
          onClose={() => setLabelsOpen(false)}
        />
      )}
    </>
  );
}
