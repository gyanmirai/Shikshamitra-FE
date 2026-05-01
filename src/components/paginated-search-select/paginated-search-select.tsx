import React from 'react';
import TextField from '@mui/material/TextField';
import { Box, Typography } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';

import { SearchNotFound } from '../search-not-found';
import { usePaginatedSearch } from './use-paginated-search';

import type { PaginatedSearchSelectProps } from './types';

export function PaginatedSearchSelect<
  T,
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined,
>({
  label,
  fetchOptions,
  minChars = 2,
  debounceMs = 400,
  placeholder,
  helperText,
  error,
  isLoading,
  ...props
}: PaginatedSearchSelectProps<T, Multiple, DisableClearable, FreeSolo>) {
  const {
    options,
    loading: internalLoading,
    inputValue,
    handleInputChange,
    loadMore,
  } = usePaginatedSearch<T>({
    fetchOptions,
    minChars,
    debounceMs,
  });

  const loading = internalLoading || isLoading;
  const [open, setOpen] = React.useState(false);

  const handleScroll = (event: React.UIEvent<HTMLUListElement>) => {
    const listboxNode = event.currentTarget;
    const position = listboxNode.scrollTop + listboxNode.offsetHeight;
    // Trigger loadMore when within 20px of the bottom
    if (position + 20 >= listboxNode.scrollHeight) {
      loadMore();
    }
  };

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      openOnFocus
      options={options || []}
      loading={loading}
      // inputValue={inputValue}
      onInputChange={(_, newInputValue, reason) => {
        if (reason === 'input') {
          handleInputChange(newInputValue);
        }
        if (reason === 'clear') {
          handleInputChange('');
        }
      }}
      ListboxProps={{
        onScroll: handleScroll,
        style: { maxHeight: 300 },
      }}
      //   Ensure we don't show "No options" when we are just waiting for the user to type
      noOptionsText={
        props.noOptionsText !== undefined ? (
          props.noOptionsText
        ) : inputValue.length < minChars ? (
          <Box p={2} textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Type at least {minChars} {minChars === 1 ? 'character' : 'characters'} to search...
            </Typography>
          </Box>
        ) : loading ? (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress size={16} />
          </Box>
        ) : options?.length === 0 ? (
          <SearchNotFound query={inputValue} />
        ) : undefined
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={error}
          helperText={helperText}
          onMouseDown={() => setOpen(true)}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={16} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      {...props}
    />
  );
}
