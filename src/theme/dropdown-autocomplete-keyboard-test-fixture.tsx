import { useState } from 'react';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { extendTheme, ThemeProvider } from '@mui/material/styles';

import { autocomplete } from './core/components/autocomplete';

const options = ['Aspen', 'Maple', 'Red Oak'];
const theme = extendTheme({
  components: {
    MuiAutocomplete: { defaultProps: autocomplete.MuiAutocomplete?.defaultProps },
  },
});

export function DropdownFixture({
  multiple = false,
  autoHighlight = false,
  disabledFirst = false,
  readOnlyInput = false,
}: {
  multiple?: boolean;
  autoHighlight?: boolean;
  disabledFirst?: boolean;
  readOnlyInput?: boolean;
}) {
  const [value, setValue] = useState<string | string[] | null>(multiple ? [] : null);
  const [submitted, setSubmitted] = useState(false);

  return (
    <ThemeProvider theme={theme}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(true);
        }}
      >
        <button type="button">Previous field</button>
        <Autocomplete
          multiple={multiple}
          disableCloseOnSelect={multiple}
          autoHighlight={autoHighlight}
          disabledItemsFocusable={disabledFirst}
          getOptionDisabled={(option) => disabledFirst && option === 'Aspen'}
          options={options}
          value={value}
          onChange={(_event, nextValue) => setValue(nextValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Tree"
              inputProps={{ ...params.inputProps, readOnly: readOnlyInput }}
            />
          )}
          renderOption={(props, option, state) => {
            const { key, ...optionProps } = props;
            return (
              <li key={key} {...optionProps}>
                {multiple && <Checkbox tabIndex={-1} checked={state.selected} />}
                {option}
              </li>
            );
          }}
        />
        <button type="button">Next field</button>
        <output aria-label="Selected tree">
          {Array.isArray(value) ? value.join(', ') : value || 'No selection'}
        </output>
        <output aria-label="Submitted">{submitted ? 'yes' : 'no'}</output>
      </form>
    </ThemeProvider>
  );
}
