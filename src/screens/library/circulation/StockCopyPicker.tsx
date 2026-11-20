import type { CustodyCopy } from 'src/redux/library/custody-api';

import { GlobalIcons } from 'src/utils/icons';
import { Chip, Stack, Typography } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';

export function StockCopyPicker({
  title,
  search,
  value,
  onChange,
  disabled,
  error,
}: {
  title: string;
  search: (term: string) => Promise<CustodyCopy[]>;
  value: CustodyCopy[];
  onChange: (copies: CustodyCopy[]) => void;
  disabled: boolean;
  error?: string;
}) {
  return (
    <FormSectionCard title={title} icon={GlobalIcons.issueBook}>
      <Stack spacing={1.5}>
        <PaginatedSearchSelect<CustodyCopy>
          name="stockCopySearch"
          label="Search title or accession"
          fullWidth
          size="small"
          value={null}
          disabled={disabled || value.length >= 100}
          minChars={1}
          debounceMs={300}
          filterOptions={(items) => items}
          fetchOptions={async (term) => ({
            data: (await search(term)).filter(
              (copy) => !value.some((selected) => selected.copyId === copy.copyId)
            ),
            hasMore: false,
          })}
          getOptionLabel={(copy) => `${copy.accessionNumber} · ${copy.title}`}
          isOptionEqualToValue={(option, selected) => option.copyId === selected.copyId}
          onChange={(_, copy) => {
            if (copy && !value.some((selected) => selected.copyId === copy.copyId))
              onChange([...value, copy]);
          }}
          error={Boolean(error)}
          helperText={error || 'Select each physical copy by its accession.'}
        />
        <Typography variant="body2">{value.length} of 100 copies selected</Typography>
        <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
          {value.map((copy) => (
            <Chip
              key={copy.copyId}
              label={`${copy.accessionNumber} · ${copy.title}`}
              size="small"
              disabled={disabled}
              onDelete={() => onChange(value.filter((item) => item.copyId !== copy.copyId))}
            />
          ))}
        </Stack>
      </Stack>
    </FormSectionCard>
  );
}
