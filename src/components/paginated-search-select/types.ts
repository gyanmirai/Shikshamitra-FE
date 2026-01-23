import type { AutocompleteProps } from '@mui/material/Autocomplete';

export interface FetchOptionsResponse<T> {
  data: T[];
  hasMore: boolean;
}

export interface PaginatedSearchSelectProps<T>
  extends Omit<
    AutocompleteProps<T, false, false, false>,
    'options' | 'loading' | 'renderInput' | 'onInputChange'
  > {
  label: string;
  placeholder?: string;
  fetchOptions: (query: string, page: number) => Promise<FetchOptionsResponse<T>>;
  minChars?: number;
  debounceMs?: number;
  helperText?: React.ReactNode;
  error?: boolean;
}
