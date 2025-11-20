import type { FormikProps } from 'formik';
import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';
import type { FileWithPreview } from 'src/components/custom-upload/custom-upload';

import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomUpload from 'src/components/custom-upload/custom-upload';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { useSearchBooksQuery } from 'src/redux/library/LibraryDataSearch';
import { Box, Grid, TextField, Autocomplete, CircularProgress } from '@mui/material';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import { fetchBookDetails } from './getBookDetails';
import { getInitialBookData } from '../Components/BookManageInitialValues';

import type { IBookPayload } from '../Components/type';

interface BookGeneralStepProps {
  formik: FormikProps<IBookPayload>;
}

const BookGeneralStep = ({ formik }: BookGeneralStepProps) => {
  const [inputValue, setInputValue] = useState('');
  const [debouncedInputValue, setDebouncedInputValue] = useState('');
  const [loadingBookDetails, setLoadingBookDetails] = useState(false);
  const [, setBookFound] = useState(false);
  const [fieldsEnabled, setFieldsEnabled] = useState(false);

  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedInputValue(inputValue);
    }, 800); // debounce delay

    return () => clearTimeout(handler);
  }, [inputValue]);

  const { data, isFetching } = useSearchBooksQuery(debouncedInputValue, {
    skip: !debouncedInputValue,
  });

  const [, setAllClass] = useState<Standards[]>([]);

  useEffect(() => {
    // If medium or its stages are missing, clear classes
    if (!medium || !medium.educationMediumStages?.length) {
      setAllClass([]);
      return;
    }

    // Flatten standards from all stages of this medium
    const mergedStandards =
      medium.educationMediumStages.flatMap((stage: Organization) => stage.standards || []) || [];

    // Add "All" option at the top
    const withAll = [{ id: 'all', name: 'All', divisions: [] }, ...mergedStandards];

    setAllClass(withAll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medium]);

  useEffect(() => {
    if (formik.values.title) {
      setFieldsEnabled(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const languageOptions = [
    { label: 'Gujarati (ગુજરાતી)', value: 'Gujarati' },
    { label: 'Hindi (हिंदी)', value: 'Hindi' },
    { label: 'English', value: 'English' },
    { label: 'Marathi (मराठी)', value: 'Marathi' },
    { label: 'Sanskrit (संस्कृत)', value: 'Sanskrit' },
  ];

  const applicableAgeOptions = [
    { id: 'all', name: 'All' },
    { id: '6-8', name: '6–8 years' },
    { id: '9-12', name: '9–12 years' },
    { id: '13-15', name: '13–15 years' },
    { id: '15plus', name: '15 plus' },
  ];

  return (
    <SectionCard title="General Information">
      <Grid container spacing={3}>
        {/* Title */}
        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField error={!!(formik.touched.title && formik.errors.title)}>
            <Autocomplete
              freeSolo
              loading={isFetching}
              options={(data?.docs || []).map((book: any) => ({
                label: `${book.title}${book.author_name ? ` — ${book.author_name[0]}` : ''}`,
                value: book.key,
                title: book.title,
              }))}
              disableClearable={!formik.values.title}
              fullWidth
              value={formik.values.title}
              inputValue={inputValue}
              onInputChange={(event, newInputValue) => {
                const cleanValue = newInputValue
                  .replace(/[^a-zA-Z0-9\s]/g, '')
                  .split(' ')
                  .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : ''))
                  .join(' ');
                setInputValue(cleanValue);
                formik.setFieldValue('title', cleanValue);
                formik.setFieldTouched('title', false);
                if (cleanValue === '') {
                  formik.setValues(getInitialBookData());
                  setFieldsEnabled(false);
                  setBookFound(false);
                }
              }}
              onChange={async (event, newValue) => {
                if (!newValue) return;

                let selectedTitle = '';

                if (typeof newValue === 'string') {
                  // User typed manually — just update the field, no fetch
                  selectedTitle = newValue.trim();
                  formik.setFieldValue('title', selectedTitle);
                  formik.setFieldTouched('title', false);
                  setFieldsEnabled(true);
                  return;
                }

                if (
                  typeof newValue === 'object' &&
                  newValue !== null &&
                  'title' in newValue &&
                  'value' in newValue
                ) {
                  selectedTitle = (newValue as { title: string }).title;
                  formik.setFieldValue('title', selectedTitle);
                  formik.setFieldTouched('title', false);

                  const url = `https://openlibrary.org${(newValue as { value: string }).value}/${(newValue as { title: string }).title}`;

                  setLoadingBookDetails(true);
                  try {
                    const bookDetails = await fetchBookDetails(url);

                    if (bookDetails) {
                      // ✅ Found in API — auto-fill details
                      setBookFound(true);
                      setFieldsEnabled(true);
                      formik.setValues((prev) => ({
                        ...prev,
                        title: bookDetails.title || selectedTitle,
                        author: bookDetails.author || '',
                        description: bookDetails.description || '',
                        language: bookDetails.language || '',
                        publishDate: bookDetails.publishDate || '',
                        publisher: bookDetails.publisher || '',
                        pages: bookDetails.pages || '',
                        isbn: bookDetails.isbn10 || '',
                        bookCoverImages: bookDetails.coverImage || '',
                      }));
                    } else {
                      setBookFound(false);
                      setFieldsEnabled(true);
                      formik.setFieldValue('title', selectedTitle);
                      formik.setFieldTouched('title', false);
                    }
                  } catch (error) {
                    console.error('Error fetching book details:', error);
                    setBookFound(false);
                    setFieldsEnabled(true);
                    formik.setFieldValue('title', selectedTitle);
                    formik.setFieldTouched('title', false);
                  } finally {
                    setLoadingBookDetails(false);
                  }
                }
              }}
              sx={{ minWidth: 340 }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Title *"
                  size="small"
                  fullWidth
                  onBlur={() => {
                    setBookFound(false);
                    setFieldsEnabled(!!formik.values.title);
                  }}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingBookDetails ? <CircularProgress color="inherit" size={18} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                  error={!!(formik.touched.title && formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title}
                />
              )}
            />
          </ShakingTextField>
        </Grid>

        {/* ISBN */}

        <Grid size={{ xs: 12, md: 4 }}>
          {fieldsEnabled && (
            <ShakingTextField error={!!(formik.touched.isbn && formik.errors.isbn)}>
              <TextField
                fullWidth
                name="isbn"
                label="ISBN"
                value={formik.values.isbn}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9-]/g, '');
                  if (value.length <= 18) {
                    formik.setFieldValue('isbn', value);
                    formik.setFieldTouched('isbn', false);
                  }
                }}
                error={!!(formik.touched.isbn && formik.errors.isbn)}
                helperText={formik.touched.isbn && formik.errors.isbn}
                size="small"
              />
            </ShakingTextField>
          )}
        </Grid>

        {/* Author */}

        <Grid size={{ xs: 12, md: 4 }}>
          {fieldsEnabled && (
            <ShakingTextField error={!!(formik.touched.author && formik.errors.author)}>
              <TextField
                fullWidth
                name="author"
                label="Author"
                value={formik.values.author}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/[^a-zA-Z\s]/g, '')
                    .split(' ')
                    .map((word) =>
                      word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                    )
                    .join(' ');
                  formik.setFieldValue('author', value);
                }}
                error={!!(formik.touched.author && formik.errors.author)}
                helperText={formik.touched.author && formik.errors.author}
                size="small"
              />
            </ShakingTextField>
          )}
        </Grid>

        {/* Publisher */}

        <Grid size={{ xs: 12, md: 4 }}>
          {fieldsEnabled && (
            <ShakingTextField error={!!(formik.touched.publisher && formik.errors.publisher)}>
              <TextField
                fullWidth
                name="publisher"
                label="Publisher"
                value={formik.values.publisher}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/[^a-zA-Z\s]/g, '')
                    .split(' ')
                    .map((word) =>
                      word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                    )
                    .join(' ');
                  formik.setFieldValue('publisher', value);
                }}
                error={!!(formik.touched.publisher && formik.errors.publisher)}
                helperText={formik.touched.publisher && formik.errors.publisher}
                size="small"
              />
            </ShakingTextField>
          )}
        </Grid>

        {/* Subject */}

        <Grid size={{ xs: 12, md: 4 }}>
          {fieldsEnabled && (
            <ShakingTextField error={!!(formik.touched.subject && formik.errors.subject)}>
              <TextField
                fullWidth
                name="subject"
                label="Subject"
                value={formik.values.subject}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/[^a-zA-Z\s]/g, '')
                    .split(' ')
                    .map((word) =>
                      word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                    )
                    .join(' ');
                  formik.setFieldValue('subject', value);
                }}
                error={!!(formik.touched.subject && formik.errors.subject)}
                helperText={formik.touched.subject && formik.errors.subject}
                size="small"
              />
            </ShakingTextField>
          )}
        </Grid>

        {/* Category */}

        <Grid size={{ xs: 12, md: 4 }}>
          {fieldsEnabled && (
            <ShakingTextField error={!!(formik.touched.category && formik.errors.category)}>
              <CustomSelect
                label="Category"
                name="category"
                options={[
                  { value: 'Fiction', label: 'Fiction' },
                  { value: 'Non-Fiction', label: 'Non-Fiction' },
                  { value: 'Reference', label: 'Reference' },
                  { value: 'Textbook', label: 'Textbook' },
                  { value: 'Children', label: 'Children' },
                  { value: 'Biography', label: 'Biography' },
                ]}
                value={formik.values.category}
                onChange={(value) => {
                  formik.setFieldValue('category', value);
                }}
                error={!!(formik.touched.category && formik.errors.category)}
                helperText={(formik.touched.category && formik.errors.category) as string}
                formControlProps={{ fullWidth: true }}
              />
            </ShakingTextField>
          )}
        </Grid>

        {/* Edition */}

        <Grid size={{ xs: 12, md: 4 }}>
          {fieldsEnabled && (
            <ShakingTextField error={!!(formik.touched.edition && formik.errors.edition)}>
              <TextField
                fullWidth
                name="edition"
                label="Edition"
                value={formik.values.edition}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  formik.setFieldValue('edition', value);
                }}
                error={!!(formik.touched.edition && formik.errors.edition)}
                helperText={formik.touched.edition && formik.errors.edition}
                size="small"
              />
            </ShakingTextField>
          )}
        </Grid>

        {/* Language */}

        <Grid size={{ xs: 12, md: 4 }}>
          {fieldsEnabled && (
            <ShakingTextField error={!!(formik.touched.language && formik.errors.language)}>
              <Autocomplete
                fullWidth
                options={languageOptions}
                getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
                value={languageOptions.find((opt) => opt.value === formik.values.language) || null}
                onChange={(_, newValue) => {
                  formik.setFieldValue('language', newValue ? newValue.value : '');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Language"
                    size="small"
                    error={!!(formik.touched.language && formik.errors.language)}
                    helperText={formik.touched.language && formik.errors.language}
                    fullWidth
                  />
                )}
                isOptionEqualToValue={(option, value) => option.value === value.value}
              />
            </ShakingTextField>
          )}
        </Grid>

        {/* Number of Copies */}

        <Grid size={{ xs: 12, md: 4 }}>
          {fieldsEnabled && (
            <ShakingTextField
              error={!!(formik.touched.numberOfCopies && formik.errors.numberOfCopies)}
            >
              <TextField
                fullWidth
                name="numberOfCopies"
                type="number"
                label="Number of Copies *"
                value={formik.values.numberOfCopies || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  formik.setFieldValue('numberOfCopies', value);
                  formik.setFieldTouched('numberOfCopies', false);
                  const count = Number(value || 0);
                  if (count > 0) {
                    const updated = Array.from({ length: count }, (_, i) => ({
                      copyNo: i + 1,
                      accessionNo: '',
                      section: formik.values.copies?.[i]?.section || '',
                      shelf: formik.values.copies?.[i]?.shelf || '',
                    }));
                    formik.setFieldValue('copies', updated);
                  } else {
                    formik.setFieldValue('copies', []);
                  }
                }}
                onKeyDown={(e) => {
                  if (['e', 'E', '+', '-', '.', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                onWheel={(e) => (e.target as HTMLElement).blur()}
                error={!!(formik.touched.numberOfCopies && formik.errors.numberOfCopies)}
                helperText={formik.touched.numberOfCopies && formik.errors.numberOfCopies}
                size="small"
              />
            </ShakingTextField>
          )}
        </Grid>

        {/* Price */}

        <Grid size={{ xs: 12, md: 4 }}>
          {fieldsEnabled && (
            <ShakingTextField error={!!(formik.touched.price && formik.errors.price)}>
              <NumericFormatCustom
                size="small"
                fullWidth
                label="Price Per Book *"
                name="price"
                value={formik.values.price}
                onChange={(e) => {
                  const val = e.target.value.replace(/[₹ ,\s]/g, '');
                  formik.setFieldValue('price', val ? Number(val) : '');
                  formik.setFieldTouched('price', false);
                }}
                error={!!(formik.touched.price && formik.errors.price)}
                helperText={(formik.touched.price && formik.errors.price) as string}
                prefix="₹ "
                thousandSeparator=","
                decimalScale={2}
                fixedDecimalScale
              />
            </ShakingTextField>
          )}
        </Grid>

        {/* Applicable Age */}
        <Grid size={{ xs: 12, md: 4 }}>
          {fieldsEnabled && (
            <ShakingTextField
              error={!!(formik.touched.applicableAge && formik.errors.applicableAge)}
            >
              <CustomSelect
                options={applicableAgeOptions}
                label="Applicable Age"
                multiple
                value={formik.values.applicableAge || []}
                onChange={(val) => {
                  const value = val as string[];

                  // All available age IDs (excluding "All")
                  const allAgeIds = applicableAgeOptions
                    .filter((opt) => opt.id !== 'all')
                    .map((opt) => opt.id);

                  const isAllClicked = value.includes('all');
                  const wasAllPreviouslySelected = (
                    formik.values.applicableAge as string[]
                  ).includes('all');

                  if (isAllClicked && !wasAllPreviouslySelected) {
                    formik.setFieldValue('applicableAge', ['all', ...allAgeIds]);
                  } else if (!isAllClicked && wasAllPreviouslySelected) {
                    formik.setFieldValue('applicableAge', []);
                  } else if (isAllClicked && wasAllPreviouslySelected) {
                    const selectedWithoutAll = value.filter((id) => id !== 'all');
                    if (selectedWithoutAll.length === allAgeIds.length) {
                      formik.setFieldValue('applicableAge', ['all', ...allAgeIds]);
                    } else {
                      formik.setFieldValue('applicableAge', selectedWithoutAll);
                    }
                  } else {
                    const selectedWithoutAll = value.filter((id) => id !== 'all');
                    if (selectedWithoutAll.length === allAgeIds.length) {
                      formik.setFieldValue('applicableAge', ['all', ...allAgeIds]);
                    } else {
                      formik.setFieldValue('applicableAge', selectedWithoutAll);
                    }
                  }
                }}
                onBlur={() => formik.setFieldTouched('applicableAge', true)}
                error={formik.touched.applicableAge && Boolean(formik.errors.applicableAge)}
                helperText={(formik.touched.applicableAge && formik.errors.applicableAge) as string}
                labelKey="name"
                valueKey="id"
                formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
              />
            </ShakingTextField>
          )}
        </Grid>

        {/* Number of Pages */}
        <Grid size={{ xs: 12, md: 4 }}>
          {fieldsEnabled && (
            <ShakingTextField
              error={!!(formik.touched.numberOfPages && formik.errors.numberOfPages)}
            >
              <TextField
                fullWidth
                name="numberOfPages"
                type="number"
                label="Number of Pages"
                value={formik.values.numberOfPages || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  formik.setFieldValue('numberOfPages', value);
                  formik.setFieldTouched('numberOfPages', false);
                }}
                onKeyDown={(e) => {
                  if (['e', 'E', '+', '-', '.', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                onWheel={(e) => (e.target as HTMLElement).blur()}
                error={!!(formik.touched.numberOfPages && formik.errors.numberOfPages)}
                helperText={formik.touched.numberOfPages && formik.errors.numberOfPages}
                size="small"
              />
            </ShakingTextField>
          )}
        </Grid>

        {/* Upload */}
        <Grid size={{ xs: 12 }}>
          {fieldsEnabled && (
            <CustomUpload
              multiple
              onChange={(files) => {
                formik.setFieldValue(`bookCoverImages`, files);
              }}
              value={formik.values.bookCoverImages as unknown as (string | FileWithPreview)[]}
              label="Upload Book Cover, Front, Back Images."
              outputFormat="file"
            />
          )}
        </Grid>

        <Grid size={{ xs: 12 }}>
          {loadingBookDetails && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                bgcolor: 'rgba(255,255,255,0.6)',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CircularProgress />
            </Box>
          )}
        </Grid>
      </Grid>
    </SectionCard>
  );
};

export default BookGeneralStep;
