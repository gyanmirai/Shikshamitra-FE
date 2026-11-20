import type { FormikProps } from 'formik';

import { useRef, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import { useSearchBooksQuery } from 'src/redux/library/LibraryDataSearch';
import { Alert, Stack, TextField, Autocomplete, CircularProgress } from '@mui/material';

import { fetchBookDetails } from './getBookDetails';

import type { BookFormValues } from '../Components/type';

type SearchBook = { key: string; title: string; author_name?: string[] };

export function BookTitleLookup({
  formik,
  disabled,
}: {
  formik: FormikProps<BookFormValues>;
  disabled: boolean;
}) {
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [lookingUp, setLookingUp] = useState(false);
  const request = useRef<AbortController | null>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(search), 400);
    return () => window.clearTimeout(timer);
  }, [search]);
  useEffect(() => () => request.current?.abort(), []);
  const query = useSearchBooksQuery(debounced, { skip: disabled || debounced.trim().length < 2 });
  const books: SearchBook[] = query.currentData?.docs || [];
  const error = Boolean(formik.touched.title && formik.errors.title);

  const choose = async (book: SearchBook) => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    formik.setFieldValue('title', book.title);
    if (!formik.values.author && book.author_name?.length)
      formik.setFieldValue('author', book.author_name.join(', '));
    setLookingUp(true);
    setLookupError('');
    try {
      const details = await fetchBookDetails(
        `https://openlibrary.org${book.key}`,
        controller.signal
      );
      if (controller.signal.aborted) return;
      formik.setValues((current) => ({
        ...current,
        author: current.author || details.author,
        publisher: current.publisher || details.publisher,
        isbn: current.isbn || details.isbn10,
        numberOfPages:
          (!current.numberOfPages || current.numberOfPages === '0') && /^\d+$/.test(details.pages)
            ? details.pages
            : current.numberOfPages,
      }));
    } catch {
      if (!controller.signal.aborted)
        setLookupError(
          'Optional online details could not be loaded. You can enter the book details manually.'
        );
    } finally {
      if (!controller.signal.aborted) setLookingUp(false);
    }
  };

  return (
    <Stack spacing={1}>
      <ShakingTextField error={error}>
        <Autocomplete
          freeSolo
          disabled={disabled}
          options={books}
          value={formik.values.title}
          inputValue={formik.values.title}
          loading={query.isFetching || lookingUp}
          getOptionLabel={(option) => (typeof option === 'string' ? option : option.title)}
          onInputChange={(_, value, reason) => {
            if (reason !== 'input') return;
            request.current?.abort();
            setLookingUp(false);
            setLookupError('');
            formik.setFieldValue('title', value);
            setSearch(value);
          }}
          onChange={(_, value) => {
            if (typeof value === 'string') formik.setFieldValue('title', value);
            else if (value) choose(value);
          }}
          renderInput={(props) => (
            <TextField
              {...props}
              name="title"
              label="Title"
              required
              fullWidth
              size="small"
              onBlur={formik.handleBlur}
              error={error}
              helperText={
                error
                  ? formik.errors.title
                  : 'Enter any title, or choose an optional online suggestion.'
              }
              InputProps={{
                ...props.InputProps,
                endAdornment: (
                  <>
                    {(query.isFetching || lookingUp) && (
                      <CircularProgress size={16} aria-label="Looking up book" />
                    )}
                    {props.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
      </ShakingTextField>
      {(query.isError || lookupError) && (
        <Alert severity="info">
          {lookupError || 'Optional online suggestions are unavailable. Enter the title manually.'}
        </Alert>
      )}
    </Stack>
  );
}
