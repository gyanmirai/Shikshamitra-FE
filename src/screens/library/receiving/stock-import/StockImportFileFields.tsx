import { useRef, useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { FormSectionCard } from 'src/components/form-section-card';
import {
  Grid,
  Stack,
  Button,
  Accordion,
  TextField,
  Typography,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material';

import { ReceivingTitlePicker } from '../ReceivingTitlePicker';
import { importColumns, downloadStockImportTemplate } from './stockImportForm';

import type { ReceivingBook } from '../receiving-form';
import type { useStockImportDraft } from './useStockImportDraft';

export function StockImportFileFields({
  draft,
  disabled,
}: {
  draft: ReturnType<typeof useStockImportDraft>;
  disabled: boolean;
}) {
  const picker = useRef<HTMLInputElement>(null);
  const [book, setBook] = useState<ReceivingBook | null>(null);
  const rules = draft.options.isError
    ? undefined
    : draft.options.currentData?.catalogueConfiguration;
  return (
    <FormSectionCard title="Copy rows" icon={GlobalIcons.addIcon}>
      <Stack spacing={1.5}>
        <Typography variant="body2" color="text.secondary">
          Upload a UTF-8 CSV with up to 1,000 rows and 1 MiB. Give each copy a stable school-wide
          source row ID. Enter the existing BookId or repeat the same TitleKey and catalogue details
          for copies of a new title. Leave Accession blank to assign one at import.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Keep source row IDs and accessions as text when editing in a spreadsheet to retain leading
          zeroes. Leave prices blank when unknown. For a known acquisition cost, fill both UnitCost
          and Currency, for example 12.25 and INR.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
          <Button
            size="small"
            color="inherit"
            variant="outlined"
            onClick={() => downloadStockImportTemplate(rules)}
          >
            Download CSV template
          </Button>
          <Button
            size="small"
            color="inherit"
            variant="outlined"
            disabled={disabled}
            onClick={() => picker.current?.click()}
          >
            {draft.fileName ? 'Replace CSV' : 'Choose CSV'}
          </Button>
          <input
            ref={picker}
            type="file"
            hidden
            accept=".csv,text/csv"
            disabled={disabled}
            onChange={(event) => {
              const upload = event.currentTarget.files?.[0] ?? null;
              event.currentTarget.value = '';
              draft.selectFile(upload);
            }}
          />
          {draft.fileName && (
            <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
              {draft.fileName}
            </Typography>
          )}
        </Stack>
        <Accordion
          disableGutters
          elevation={0}
          variant="outlined"
          sx={{ '&::before': { display: 'none' } }}
        >
          <AccordionSummary expandIcon={<Iconify icon="eva:chevron-down-fill" />}>
            <Typography variant="subtitle2">
              Find an existing BookId and check catalogue fields
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1}>
              <ReceivingTitlePicker
                name="importTitleSearch"
                label="Find an existing title"
                required={false}
                academicYearId={draft.yearId}
                value={book}
                onChange={setBook}
                onBlur={() => undefined}
                disabled={disabled}
                hint="Select a title to see its BookId for the spreadsheet."
              />
              {book && (
                <>
                  <TextField
                    label="BookId"
                    value={book.id}
                    size="small"
                    fullWidth
                    slotProps={{ input: { readOnly: true } }}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    color="inherit"
                    sx={{ alignSelf: 'flex-start' }}
                    onClick={() => downloadStockImportTemplate(null, book.id)}
                  >
                    Download template with this title
                  </Button>
                </>
              )}
              {rules && (
                <>
                  <Typography variant="body2">
                    New titles require Title
                    {rules.requiredFields.length ? `, ${rules.requiredFields.join(', ')}` : ''}.
                  </Typography>
                  <Typography variant="body2">
                    <strong>Active language codes</strong>{' '}
                    {rules.languages
                      .filter((option) => option.isActive)
                      .map((option) => `${option.label} (${option.code})`)
                      .join(', ') || 'None'}
                    .
                  </Typography>
                  <Typography variant="body2">
                    <strong>Active material codes</strong>{' '}
                    {rules.materials
                      .filter((option) => option.isActive)
                      .map((option) => `${option.label} (${option.code})`)
                      .join(', ') || 'None'}
                    .
                  </Typography>
                </>
              )}
            </Stack>
          </AccordionDetails>
        </Accordion>
        <Accordion
          disableGutters
          elevation={0}
          variant="outlined"
          sx={{ '&::before': { display: 'none' } }}
        >
          <AccordionSummary expandIcon={<Iconify icon="eva:chevron-down-fill" />}>
            <Typography variant="subtitle2">Map spreadsheet headings</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              Enter your exact spreadsheet heading beside any field that uses a different name.
              Blank mappings use the template headings.
            </Typography>
            <Grid container spacing={1.5}>
              {importColumns.map((column) => (
                <Grid key={column} size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    label={column}
                    size="small"
                    fullWidth
                    disabled={disabled}
                    value={draft.formik.values.columnMap[column] ?? ''}
                    slotProps={{ htmlInput: { maxLength: 256 } }}
                    onChange={(event) =>
                      draft.formik.setFieldValue('columnMap', {
                        ...draft.formik.values.columnMap,
                        [column]: event.target.value,
                      })
                    }
                  />
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Stack>
    </FormSectionCard>
  );
}
