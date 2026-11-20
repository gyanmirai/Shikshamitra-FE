import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { booksApi } from 'src/redux/library/bookList/bookList-api';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';

import type { ReceivingBook } from './receiving-form';

export function ReceivingTitlePicker({
  name,
  value,
  onChange,
  onBlur,
  disabled,
  error,
  academicYearId,
  label = 'Title',
  required = true,
  hint,
}: {
  name: string;
  value: ReceivingBook | null;
  onChange: (book: ReceivingBook | null) => void;
  onBlur: () => void;
  disabled: boolean;
  error?: string;
  academicYearId?: string;
  label?: string;
  required?: boolean;
  hint?: string;
}) {
  const selectedYearId = useSelector(
    (state: RootState) => (state.globalState.currentYear as { id?: string })?.id
  );
  const yearId = academicYearId ?? selectedYearId;
  const [search] = booksApi.useLazyGetAllBooksQuery();
  return (
    <PaginatedSearchSelect<ReceivingBook>
      key={yearId || 'no-year'}
      label={label}
      name={name}
      required={required}
      fullWidth
      size="small"
      value={value}
      disabled={disabled || !yearId}
      minChars={2}
      debounceMs={350}
      filterOptions={(options) => options}
      fetchOptions={async (query, page) => {
        if (!yearId || disabled) return { data: [], hasMore: false };
        const response = await search({
          academicYearId: yearId,
          search: query,
          page,
          pageSize: 20,
        }).unwrap();
        return {
          data: response.items as ReceivingBook[],
          hasMore: page * 20 < response.totalCount,
        };
      }}
      getOptionLabel={(book) => [book.title, book.author, book.isbn].filter(Boolean).join(' · ')}
      isOptionEqualToValue={(option, selected) => option.id === selected.id}
      onInput={(event) => {
        if (event.target instanceof HTMLInputElement) onChange(null);
      }}
      onChange={(_, book) => onChange(book)}
      onBlur={onBlur}
      error={Boolean(error)}
      helperText={
        error ||
        (!yearId
          ? 'Select an academic year in the application header to search school titles.'
          : hint ||
            'Choose an existing school catalogue title. Add a new title through All Books first.')
      }
    />
  );
}
