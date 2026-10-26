import { useState } from 'react';
import CustomSelect from 'src/components/custom-select';
import GroupCustomSelect from 'src/components/group-custom-select';
import { ChartSelect } from 'src/components/chart/chart-select';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import { Stack, Button, MenuItem, TextField, Autocomplete } from '@mui/material';

const options = [
  { value: 'aspen', label: 'Aspen' },
  { value: 'maple', label: 'Maple' },
  { value: 'red-oak', label: 'Red Oak' },
];
type Option = (typeof options)[number];

export function DropdownField({ kind }: { kind: string }) {
  const [values, setValues] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const update = (value: string | number | string[] | number[]) =>
    setValues((Array.isArray(value) ? value : [value]).map(String));
  const autocompleteProps = {
    value: options.find((option) => option.value === values[0]) ?? null,
    getOptionLabel: (option: Option) => option.label,
    isOptionEqualToValue: (option: Option, value: Option) => option.value === value.value,
    onChange: (_event: unknown, value: Option | null) => setValues(value ? [value.value] : []),
  };
  let field;
  switch (kind) {
    case 'autocomplete':
    case 'readonly':
      field = (
        <Autocomplete
          {...autocompleteProps}
          options={options}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Choice"
              inputProps={{ ...params.inputProps, readOnly: kind === 'readonly' }}
            />
          )}
        />
      );
      break;
    case 'remote':
      field = (
        <PaginatedSearchSelect<Option>
          {...autocompleteProps}
          label="Choice"
          minChars={0}
          debounceMs={0}
          fetchOptions={async (query) => ({
            data: options.filter((option) =>
              option.label.toLowerCase().includes(query.toLowerCase())
            ),
            hasMore: false,
          })}
        />
      );
      break;
    case 'responsive':
      field = (
        <ResponsiveMultiSelect
          label="Choice"
          options={options}
          value={values}
          onChange={setValues}
          getOptionLabel={(option) => option.label}
          getOptionValue={(option) => option.value}
        />
      );
      break;
    case 'grouped':
      field = (
        <GroupCustomSelect
          label="Choice"
          value={values}
          onChange={update}
          options={[{ label: 'Test group', group: true, items: options }]}
        />
      );
      break;
    case 'chart':
      field = (
        <ChartSelect
          options={options.map((option) => option.label)}
          value={values[0] || 'Choose chart period'}
          onChange={update}
        />
      );
      break;
    case 'textfield':
      field = (
        <TextField
          select
          label="Choice"
          value={values[0] || ''}
          onChange={(event) => update(event.target.value)}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      );
      break;
    default:
      field =
        kind === 'multi' ? (
          <CustomSelect
            label="Choice"
            multiple
            value={values}
            options={options}
            onChange={update}
          />
        ) : (
          <CustomSelect
            label="Choice"
            value={values[0] || ''}
            options={kind === 'empty' ? [] : options}
            isSearch={kind === 'search'}
            disabledValues={kind === 'disabled' ? ['aspen'] : []}
            onChange={update}
          />
        );
  }
  return (
    <Stack
      component="form"
      spacing={2}
      sx={{ p: 2, minWidth: 320 }}
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
    >
      <Button type="button" variant="outlined">
        Previous field
      </Button>
      {field}
      <Button type="button" variant="outlined">
        Next field
      </Button>
      <output data-testid="selection">{values.join(',') || 'none'}</output>
      <output data-testid="submitted">{submitted ? 'yes' : 'no'}</output>
    </Stack>
  );
}
