import type { PaperProps } from '@mui/material/Paper';

import React from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import { Box, Paper, Button, Typography } from '@mui/material';

import { SearchNotFound } from '../search-not-found';
import { usePaginatedSearch } from './use-paginated-search';

import type { PaginatedSearchSelectProps } from './types';

type SearchResultsPaperProps = PaperProps & {
  searchError?: string | null;
  retry?: () => void;
  retryDisabled?: boolean;
};

function SearchResultsPaper({
  children,
  searchError,
  retry,
  retryDisabled,
  ...props
}: SearchResultsPaperProps) {
  return (
    <Paper {...props}>
      {children}
      {searchError && (
        <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider' }}>
          <Button
            size="small"
            disabled={retryDisabled}
            onMouseDown={(event) => event.preventDefault()}
            onKeyDown={(event) => event.stopPropagation()}
            onClick={retry}
          >
            Retry results
          </Button>
        </Box>
      )}
    </Paper>
  );
}

export function PaginatedSearchSelect<
  T,
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined,
>({
  label,
  name,
  required,
  fetchOptions,
  minChars = 2,
  debounceMs = 400,
  placeholder,
  helperText,
  noOptionsText,
  error,
  isLoading,
  loadingLabel = 'Loading options',
  getOptionLabel,
  getOptionKey,
  renderOption,
  ...props
}: PaginatedSearchSelectProps<T, Multiple, DisableClearable, FreeSolo>) {
  const {
    options,
    loading: internalLoading,
    inputValue,
    handleInputChange,
    loadMore,
    error: searchError,
    retry,
  } = usePaginatedSearch<T>({
    fetchOptions,
    minChars,
    debounceMs,
  });

  const loading = internalLoading || isLoading;
  const [open, setOpen] = React.useState(false);

  const getOptionText = React.useCallback(
    (option: T | string) => {
      if (getOptionLabel) {
        return getOptionLabel(option as T);
      }

      if (typeof option === 'string') {
        return option;
      }

      const optionRecord = option as Record<string, unknown> | null;
      return String(optionRecord?.label ?? optionRecord?.name ?? optionRecord?.title ?? '');
    },
    [getOptionLabel]
  );

  const getStableOptionKey = React.useCallback(
    (option: T | string) => {
      if (getOptionKey) {
        return getOptionKey(option as T);
      }

      if (typeof option === 'string') {
        return option;
      }

      const optionRecord = option as Record<string, unknown> | null;
      const explicitKey =
        optionRecord?.id ?? optionRecord?.value ?? optionRecord?.key ?? optionRecord?.code;

      if (explicitKey !== undefined && explicitKey !== null) {
        return String(explicitKey);
      }

      return getOptionText(option);
    },
    [getOptionKey, getOptionText]
  );

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
      slots={{ paper: SearchResultsPaper }}
      slotProps={{
        paper: { searchError, retry, retryDisabled: Boolean(loading) } as SearchResultsPaperProps,
      }}
      inputValue={inputValue}
      getOptionLabel={getOptionText}
      getOptionKey={getStableOptionKey}
      renderOption={(optionProps, option, state, ownerState) => {
        const { key: optionKey, ...restOptionProps } = optionProps;
        const stableKey = getStableOptionKey(option) ?? optionKey;

        if (renderOption) {
          return renderOption({ ...restOptionProps, key: stableKey }, option, state, ownerState);
        }

        return (
          <li key={stableKey} {...restOptionProps}>
            {getOptionText(option)}
          </li>
        );
      }}
      onInputChange={(_, newInputValue, reason) => {
        if (reason === 'input' || reason === 'reset') {
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
        searchError ? (
          <Typography variant="body2" color="error.main" sx={{ p: 2 }}>
            Results are unavailable. Retry below.
          </Typography>
        ) : noOptionsText !== undefined ? (
          noOptionsText
        ) : inputValue.length < minChars ? (
          <Box p={2} textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Type at least {minChars} {minChars === 1 ? 'character' : 'characters'} to search...
            </Typography>
          </Box>
        ) : loading ? (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress size={16} aria-label={loadingLabel} />
          </Box>
        ) : options?.length === 0 ? (
          <SearchNotFound query={inputValue} />
        ) : undefined
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          name={name}
          required={required}
          placeholder={placeholder}
          error={error || Boolean(searchError)}
          helperText={
            searchError ? (
              <Box
                component="span"
                role="alert"
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <span>{searchError}</span>
                {!open && (
                  <Button
                    size="small"
                    disabled={loading}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={retry}
                  >
                    Retry results
                  </Button>
                )}
              </Box>
            ) : (
              helperText
            )
          }
          onMouseDown={() => setOpen(true)}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress color="inherit" size={16} aria-label={loadingLabel} />
                ) : null}
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
