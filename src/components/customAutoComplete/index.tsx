import React, { useEffect } from 'react';

import { Chip, TextField, Autocomplete } from '@mui/material';
import { createFilterOptions } from '@mui/material/Autocomplete';

interface FilmOptionType {
  inputValue?: string;
  name: string;
  year?: number;
}
const filter = createFilterOptions();
interface CreateTableDropdownProps {
  options: FilmOptionType[];
  setOptions?: React.Dispatch<React.SetStateAction<FilmOptionType[]>>;
  value: FilmOptionType | FilmOptionType[] | null;
  setValue: React.Dispatch<React.SetStateAction<FilmOptionType | null>>;
  label: string;
  placeholder: string;
  sx?: any;
  multiple?: boolean;
  creatable?: boolean;
  [key: string]: any;
}

const CreateTableDropdown = ({
  options,
  setOptions,
  value,
  setValue,
  label,
  placeholder,
  sx,
  multiple = false,
  creatable = true,
  helperText,
  error,
  ...other
}: CreateTableDropdownProps) => {
  const [data, setData] = React.useState<FilmOptionType[]>([]);
  useEffect(() => {
    setData(options);
  }, [options]);

  return (
    <Autocomplete
      noOptionsText="No options"
      value={value}
      multiple={multiple}
      onChange={(_event, newValue: any) => {
        if (typeof newValue === 'string') {
          setValue({
            name: newValue,
          });
        } else if (newValue && newValue.inputValue) {
          if (setOptions) {
            setOptions([
              ...options,
              {
                name: newValue.inputValue,
              },
            ]);
          } else {
            setData((pre) => [
              ...pre,
              {
                name: newValue.inputValue,
              },
            ]);
          }

          // Create a new value from the user input
          if (creatable) {
            setValue({
              name: newValue.inputValue,
            });
          }
        } else {
          setValue(newValue);
        }
      }}
      filterOptions={(opt: any, params: any) => {
        const filtered = filter(opt, params);

        const { inputValue } = params;
        // Suggest the creation of a new value
        const isExisting = opt.filter((option: any) => inputValue === option.name).length;
        if (creatable && inputValue !== '' && !isExisting) {
          filtered.push({
            inputValue,
            name: `Add "${inputValue}"`,
          });
        }

        return filtered;
      }}
      selectOnFocus
      clearOnBlur
      autoHighlight
      handleHomeEndKeys
      id="free-solo-with-text-demo"
      options={data?.length ? data : [{}]}
      getOptionLabel={(option: any) => {
        // Value selected with enter, right from the input
        if (typeof option === 'string') {
          return option;
        }
        // Add "xxx" option created dynamically
        if (option.inputValue) {
          return option.inputValue;
        }
        // Regular option
        return option.name;
      }}
      renderOption={(props: any, option: any) => {
        const { key, ...optionProps } = props;
        return option.name ? (
          <li key={key} {...optionProps}>
            {option.name}
          </li>
        ) : null;
      }}
      filterSelectedOptions
      renderTags={(values: any, getTagProps: any) =>
        values.map((option: FilmOptionType, index: number) => {
          const { key, ...tagProps } = getTagProps({ index });
          return option?.inputValue || option?.name ? (
            <Chip
              variant="outlined"
              label={option?.inputValue || option?.name || ''}
              key={key}
              size="small"
              {...tagProps}
            />
          ) : null;
        })
      }
      sx={{ ...sx }}
      freeSolo
      size="small"
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          label={placeholder}
          helperText={helperText}
          error={error}
        />
      )}
      {...other}
    />
  );
};

export default CreateTableDropdown;
