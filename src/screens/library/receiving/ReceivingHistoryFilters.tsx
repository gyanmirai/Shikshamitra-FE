import type { LibraryStockSource, ReceivingHistoryParams } from 'src/redux/library/receiving-types';

import { Stack, Button } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { toDateOnly, parseDateOnly } from 'src/utils/date-only';
import { CustomDateRangePicker } from 'src/components/custom-date-range-picker';

import { receivingSources } from './receiving-field-state';

export function ReceivingHistoryFilters({
  criteria,
  update,
}: {
  criteria: ReceivingHistoryParams;
  update: (changes: Partial<ReceivingHistoryParams>) => void;
}) {
  return (
    <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }} sx={{ px: 1, py: 1 }}>
      <CustomSelect
        label="Stock source"
        size="small"
        fullWidth
        value={criteria.source ?? 'all'}
        options={[{ id: 'all', name: 'All sources' }, ...receivingSources]}
        labelKey="name"
        valueKey="id"
        onChange={(value) =>
          update({ source: value === 'all' ? undefined : (Number(value) as LibraryStockSource) })
        }
      />
      <CustomDateRangePicker
        label="Receipt dates"
        name="receiptDateRange"
        showShortcuts={false}
        value={[parseDateOnly(criteria.receivedFrom), parseDateOnly(criteria.receivedTo)]}
        onChange={([from, to]) =>
          update({
            receivedFrom: from ? toDateOnly(from) : undefined,
            receivedTo: to ? toDateOnly(to) : undefined,
          })
        }
        slotProps={{ field: { size: 'small', fullWidth: true } }}
      />
      <Button
        size="small"
        variant="outlined"
        color="inherit"
        startIcon={<Iconify icon={GlobalIcons.resetFilter} />}
        disabled={
          criteria.source === undefined &&
          !criteria.receivedFrom &&
          !criteria.receivedTo &&
          !criteria.search
        }
        onClick={() =>
          update({
            source: undefined,
            receivedFrom: undefined,
            receivedTo: undefined,
            search: undefined,
          })
        }
      >
        Reset filters
      </Button>
    </Stack>
  );
}
