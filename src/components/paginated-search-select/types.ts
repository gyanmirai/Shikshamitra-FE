import type { AutocompleteProps } from '@mui/material/Autocomplete';

export interface FetchOptionsResponse<T> {
  data: T[];
  hasMore: boolean;
}

export type PaginatedSearchSelectProps<
  T,
  Multiple extends boolean | undefined = undefined,
  DisableClearable extends boolean | undefined = undefined,
  FreeSolo extends boolean | undefined = undefined,
> = Omit<
  AutocompleteProps<T, Multiple, DisableClearable, FreeSolo>,
  'options' | 'loading' | 'renderInput' | 'onInputChange'
> & {
  label: string;
  name?: string;
  required?: boolean;
  placeholder?: string;
  fetchOptions: (query: string, page: number) => Promise<FetchOptionsResponse<T>>;
  minChars?: number;
  debounceMs?: number;
  helperText?: React.ReactNode;
  error?: boolean;
  isLoading?: boolean;
  loadingLabel?: string;
};
