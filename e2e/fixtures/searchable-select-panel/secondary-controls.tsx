import { useState } from 'react';
import { Stack, Typography } from '@mui/material';
import CustomSelect from 'src/components/custom-select';

const options = [
  {
    value: 'alpha',
    label:
      'Alpha synthetic option with a deliberately long label to check wrapping inside a narrow field',
  },
  {
    value: 'beta',
    label:
      'Beta synthetic option with another deliberately long label for stable filtered popup width',
  },
  { value: 'gamma', label: 'Gamma synthetic option' },
];

export function SecondaryControls() {
  const [value, setValue] = useState<string | number>('');
  const [multiple, setMultiple] = useState<string[] | number[]>(['alpha']);

  return (
    <Stack spacing={2} sx={{ width: 240, maxWidth: '100%' }}>
      <Typography variant="subtitle2">Boundary cases</Typography>
      <CustomSelect
        label="Long options"
        name="long-options"
        multiple={false}
        SelectDisplayProps={{ 'aria-label': 'Long options', 'aria-labelledby': undefined }}
        value={value}
        onChange={setValue}
        options={options}
        isSearch
        MenuProps={{
          disableScrollLock: true,
          PaperProps: { elevation: 4, sx: { border: 1, borderColor: 'divider' } },
          slotProps: {
            paper: () => ({ elevation: 5 }),
            list: { 'aria-label': 'Long options results' },
          },
        }}
      />
      <Typography variant="caption" data-testid="long-value">
        Long value: {value || 'none'}
      </Typography>
      <CustomSelect
        label="Multiple options"
        name="multiple-options"
        SelectDisplayProps={{ 'aria-label': 'Multiple options', 'aria-labelledby': undefined }}
        value={multiple}
        onChange={setMultiple}
        options={options}
        multiple
        isSearch
      />
      <Typography variant="caption" data-testid="multiple-value">
        Multiple value: {multiple.join(',') || 'none'}
      </Typography>
      <CustomSelect
        label="Empty source"
        name="empty-source"
        multiple={false}
        SelectDisplayProps={{ 'aria-label': 'Empty source', 'aria-labelledby': undefined }}
        value=""
        onChange={() => undefined}
        options={[]}
        isSearch
      />
    </Stack>
  );
}
