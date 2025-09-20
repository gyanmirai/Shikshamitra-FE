import type { FormikErrors } from 'formik';

import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import CustomizableTable from 'src/components/customizabaleTable';
import CustomUpload from 'src/components/custom-upload/custom-upload';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Box, Grid, Card, Button, Switch, TextField, DialogActions } from '@mui/material';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import { bookValidationSchema } from './BookValidationSchema';
import { getInitialBookData } from './BookManageInitialValues';

import type { IBookCopy, IBookPayload, IBookFormProps } from './type';

const BookForm: React.FC<IBookFormProps> = ({ open, onClose, editData }) => {
  const [copies, setCopies] = useState<IBookCopy[]>([]);

  const formik = useFormik<IBookPayload>({
    initialValues: getInitialBookData(editData),
    validationSchema: bookValidationSchema,
    validateOnChange: true,
    onSubmit: (values) => {
      if (editData) {
        shikshaMitraToast.success({ message: `Book "${values.title}" updated successfully` });
      } else {
        shikshaMitraToast.success({ message: `Book "${values.title}" added successfully` });
      }
      onClose(null, true);
    },
  });

  // auto-generate copies when numberOfCopies changes
  useEffect(() => {
    const count = Number(formik.values.numberOfCopies || 0);
    if (count > 0) {
      const updated = Array.from({ length: count }, (_, i) => ({
        copyNo: i + 1,
        accessionNo: formik.values.copies?.[i]?.accessionNo || '',
        rfidEnabled: formik.values.copies?.[i]?.rfidEnabled || false,
        rfidId: formik.values.copies?.[i]?.rfidId || null,
        vendor: formik.values.copies?.[i]?.vendor || '',
      }));
      setCopies(updated);
      formik.setFieldValue('copies', updated);
    } else {
      setCopies([]);
      formik.setFieldValue('copies', []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.numberOfCopies]);

  return (
    <Card sx={{ height: '100%', boxShadow: 'none', background: 'transparent', mt: 1 }}>
      <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
        <Box
          component="form"
          sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          onSubmit={formik.handleSubmit}
        >
          <Scrollbar
            sx={{
              px: 1,
              height: '100%',
            }}
          >
            <SectionCard title="General Information">
              {/* Title */}
              <Grid size={{ xs: 4, md: 4 }}>
                <ShakingTextField error={!!(formik.touched.title && formik.errors.title)}>
                  <TextField
                    fullWidth
                    name="title"
                    label="Title *"
                    value={formik.values.title}
                    onChange={(e) => {
                      const value = e.target.value
                        // Remove everything except letters and spaces
                        .replace(/[^a-zA-Z\s]/g, '')
                        // Capitalize each word
                        .split(' ')
                        .map((word) =>
                          word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                        )
                        .join(' ');
                      formik.setFieldValue('title', value);
                    }}
                    error={!!(formik.touched.title && formik.errors.title)}
                    helperText={formik.touched.title && formik.errors.title}
                    size="small"
                  />
                </ShakingTextField>
              </Grid>

              {/* ISBN */}
              <Grid size={{ xs: 4, md: 4 }}>
                <ShakingTextField error={!!(formik.touched.isbn && formik.errors.isbn)}>
                  <TextField
                    fullWidth
                    name="isbn"
                    label="ISBN *"
                    value={formik.values.isbn}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9-]/g, '');
                      // Validate ISBN-10 or ISBN-13 format
                      if (value.length <= 13) {
                        const cleanValue = value.replace(/-/g, '');
                        if (cleanValue.length === 10 || cleanValue.length === 13) {
                          formik.setFieldValue('isbn', value);
                        } else {
                          formik.setFieldValue('isbn', value);
                        }
                      }
                    }}
                    error={!!(formik.touched.isbn && formik.errors.isbn)}
                    helperText={formik.touched.isbn && formik.errors.isbn}
                    size="small"
                  />
                </ShakingTextField>
              </Grid>

              {/* Author */}
              <Grid size={{ xs: 4, md: 4 }}>
                <ShakingTextField error={!!(formik.touched.author && formik.errors.author)}>
                  <TextField
                    fullWidth
                    name="author"
                    label="Author *"
                    value={formik.values.author}
                    onChange={(e) => {
                      const value = e.target.value
                        // Remove everything except letters and spaces
                        .replace(/[^a-zA-Z\s]/g, '')
                        // Capitalize each word
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
              </Grid>

              {/* Publisher */}
              <Grid size={{ xs: 4, md: 4 }}>
                <ShakingTextField error={!!(formik.touched.publisher && formik.errors.publisher)}>
                  <TextField
                    fullWidth
                    name="publisher"
                    label="Publisher *"
                    value={formik.values.publisher}
                    onChange={(e) => {
                      const value = e.target.value
                        // Remove everything except letters and spaces
                        .replace(/[^a-zA-Z\s]/g, '')
                        // Capitalize each word
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
              </Grid>

              {/* Subject */}
              <Grid size={{ xs: 4, md: 4 }}>
                <ShakingTextField error={!!(formik.touched.subject && formik.errors.subject)}>
                  <TextField
                    fullWidth
                    name="subject"
                    label="Subject *"
                    value={formik.values.subject}
                    onChange={(e) => {
                      const value = e.target.value
                        // Remove everything except letters and spaces
                        .replace(/[^a-zA-Z\s]/g, '')
                        // Capitalize each word
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
              </Grid>

              {/* Category */}
              <Grid size={{ xs: 4, md: 4 }}>
                <ShakingTextField error={!!(formik.touched.category && formik.errors.category)}>
                  <CustomSelect
                    label="Category *"
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
                    onChange={(value) => formik.setFieldValue('category', value)}
                    error={!!(formik.touched.category && formik.errors.category)}
                    helperText={(formik.touched.category && formik.errors.category) as string}
                    formControlProps={{ fullWidth: true }}
                  />
                </ShakingTextField>
              </Grid>

              {/* Edition */}
              <Grid size={{ xs: 4, md: 4 }}>
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
              </Grid>

              {/* Language */}
              <Grid size={{ xs: 4, md: 4 }}>
                <ShakingTextField error={!!(formik.touched.language && formik.errors.language)}>
                  <CustomSelect
                    label="Language *"
                    name="language"
                    options={[
                      { value: 'English', label: 'English' },
                      { value: 'Hindi', label: 'Hindi' },
                      { value: 'Gujarati', label: 'Gujarati' },
                      { value: 'Bengali', label: 'Bengali' },
                      { value: 'Marathi', label: 'Marathi' },
                      { value: 'Tamil', label: 'Tamil' },
                      { value: 'Telugu', label: 'Telugu' },
                      { value: 'Kannada', label: 'Kannada' },
                      { value: 'Malayalam', label: 'Malayalam' },
                      { value: 'Urdu', label: 'Urdu' },
                    ]}
                    value={formik.values.language}
                    onChange={(value) => formik.setFieldValue('language', value)}
                    error={!!(formik.touched.language && formik.errors.language)}
                    helperText={(formik.touched.language && formik.errors.language) as string}
                    formControlProps={{ fullWidth: true }}
                  />
                </ShakingTextField>
              </Grid>

              {/* Number of Copies */}
              <Grid size={{ xs: 4, md: 4 }}>
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
                    }}
                    onKeyDown={(e) => {
                      if (['e', 'E', '+', '-', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onWheel={(e) => (e.target as HTMLElement).blur()}
                    error={!!(formik.touched.numberOfCopies && formik.errors.numberOfCopies)}
                    helperText={formik.touched.numberOfCopies && formik.errors.numberOfCopies}
                    size="small"
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <ShakingTextField error={!!(formik.touched.price && formik.errors.price)}>
                  <NumericFormatCustom
                    size="small"
                    fullWidth
                    label="Price *"
                    name="price"
                    value={formik.values.price}
                    onChange={(e) => {
                      let val = e.target.value;
                      // remove ₹, commas, spaces
                      val = val.replace(/[₹ ,\s]/g, '');
                      formik.setFieldValue('price', val ? Number(val) : '');
                    }}
                    error={!!(formik.touched.price && formik.errors.price)}
                    helperText={(formik.touched.price && formik.errors.price) as string}
                    prefix="₹"
                    thousandSeparator=","
                    decimalScale={2}
                    fixedDecimalScale
                  />
                </ShakingTextField>
              </Grid>
              <Grid size={12}>
                <CustomUpload
                  multiple
                  previewCount={6}
                  onChange={(files) => formik.setFieldValue(`documents`, files)}
                  value={formik.values.documents}
                  // error={formik.touched[name] && formik.errors[name]}
                  // helperText={formik.touched[name] && formik.errors[name]}
                  label="Upload Book Cover, Front, Back Images."
                  outputFormat="file"
                />
              </Grid>
            </SectionCard>

            {/* Copies Table */}
            {copies.length > 0 && (
              <Box mt={2}>
                <SectionCard title="Manage Copies">
                  <Grid size={12}>
                    <CustomizableTable
                      tableId="copies-table"
                      isSearch={false}
                      isFilter={false}
                      columns={[
                        {
                          id: 'copyNo',
                          label: 'Copy No.',
                          align: 'left',
                          minWidth: 100,
                          render: (value, row) => <span>{row.copyNo}</span>,
                        },
                        {
                          id: 'accessionNo',
                          label: 'Accession No.',
                          minWidth: 170,
                          align: 'left',
                          render: (value, row) => (
                            <ShakingTextField
                              error={
                                !!(
                                  formik?.touched?.copies?.[row.copyNo - 1]?.accessionNo &&
                                  Array.isArray(formik?.errors?.copies) &&
                                  typeof formik?.errors?.copies?.[row.copyNo - 1] === 'object' &&
                                  (formik.errors.copies[row.copyNo - 1] as FormikErrors<IBookCopy>)
                                    ?.accessionNo
                                )
                              }
                            >
                              <TextField
                                size="small"
                                fullWidth
                                label="Accession No *"
                                value={formik.values.copies[row.copyNo - 1]?.accessionNo || ''}
                                onChange={(e) => {
                                  const val = e.target.value
                                    .replace(/[^a-zA-Z0-9-]/g, '')
                                    .split(' ')
                                    .map((word) => word || '')
                                    .join(' ');

                                  // Allow max 12 digits/characters
                                  if (val.length <= 12) {
                                    formik.setFieldValue(
                                      `copies.${row.copyNo - 1}.accessionNo`,
                                      val
                                    );
                                    const updated = [...copies];
                                    updated[row.copyNo - 1].accessionNo = val;
                                    setCopies(updated);
                                    formik.setFieldTouched(
                                      `copies.${row.copyNo - 1}.accessionNo`,
                                      false
                                    );
                                  }
                                }}
                                error={
                                  !!(
                                    formik?.touched?.copies?.[row.copyNo - 1]?.accessionNo &&
                                    Array.isArray(formik?.errors?.copies) &&
                                    typeof formik?.errors?.copies?.[row.copyNo - 1] === 'object' &&
                                    (
                                      formik.errors.copies[
                                        row.copyNo - 1
                                      ] as FormikErrors<IBookCopy>
                                    )?.accessionNo
                                  )
                                }
                                sx={{
                                  mb: 2,
                                  width: '100%',
                                  padding: '0',
                                  borderRadius: 1,
                                }}
                                helperText={
                                  (formik?.touched?.copies?.[row.copyNo - 1]?.accessionNo &&
                                    Array.isArray(formik?.errors?.copies) &&
                                    typeof formik?.errors?.copies?.[row.copyNo - 1] === 'object' &&
                                    (
                                      formik.errors.copies[
                                        row.copyNo - 1
                                      ] as FormikErrors<IBookCopy>
                                    )?.accessionNo) ||
                                  ''
                                }
                              />
                            </ShakingTextField>
                          ),
                        },
                        {
                          id: 'rfidEnabled',
                          label: 'RFID Enabled',
                          minWidth: 130,
                          align: 'left',
                          render: (value, row) => (
                            <ShakingTextField
                              error={
                                !!(
                                  formik?.touched?.copies?.[row.copyNo - 1]?.rfidEnabled &&
                                  Array.isArray(formik?.errors?.copies) &&
                                  typeof formik?.errors?.copies?.[row.copyNo - 1] === 'object' &&
                                  (formik.errors.copies[row.copyNo - 1] as FormikErrors<IBookCopy>)
                                    ?.rfidEnabled
                                )
                              }
                            >
                              <Switch
                                size="small"
                                checked={formik.values.copies[row.copyNo - 1]?.rfidEnabled || false}
                                onChange={(e) => {
                                  const updated = [...copies];
                                  updated[row.copyNo - 1].rfidEnabled = e.target.checked;
                                  setCopies(updated);
                                  formik.setFieldValue('copies', updated);
                                  formik.setFieldTouched(
                                    `copies.${row.copyNo - 1}.rfidEnabled`,
                                    true
                                  );
                                }}
                              />
                            </ShakingTextField>
                          ),
                        },
                        {
                          id: 'rfidId',
                          label: 'RFID ID',
                          minWidth: 160,
                          align: 'left',
                          render: (value, row) => (
                            <ShakingTextField
                              error={
                                !!(
                                  formik?.touched?.copies?.[row.copyNo - 1]?.rfidId &&
                                  Array.isArray(formik?.errors?.copies) &&
                                  typeof formik?.errors?.copies?.[row.copyNo - 1] === 'object' &&
                                  (formik.errors.copies[row.copyNo - 1] as FormikErrors<IBookCopy>)
                                    ?.rfidId
                                )
                              }
                            >
                              <TextField
                                size="small"
                                fullWidth
                                label="RFID ID *"
                                value={formik.values.copies[row.copyNo - 1]?.rfidId || ''}
                                disabled={!formik.values.copies[row.copyNo - 1]?.rfidEnabled}
                                onChange={(e) => {
                                  const val = e.target.value
                                    // Remove everything except letters, numbers and spaces
                                    .replace(/[^a-zA-Z0-9\s]/g, '')
                                    // Keep original case
                                    .split(' ')
                                    .map((word) => word || '')
                                    .join(' ');

                                  const updated = [...copies];
                                  updated[row.copyNo - 1].rfidId = val;
                                  setCopies(updated);
                                  formik.setFieldValue('copies', updated);
                                  formik.setFieldTouched(`copies.${row.copyNo - 1}.rfidId`, false);
                                }}
                                sx={{
                                  mb: 2,
                                  width: '100%',
                                  padding: '0',
                                  borderRadius: 1,
                                }}
                                error={
                                  !!(
                                    formik?.touched?.copies?.[row.copyNo - 1]?.rfidId &&
                                    Array.isArray(formik?.errors?.copies) &&
                                    typeof formik?.errors?.copies?.[row.copyNo - 1] === 'object' &&
                                    (
                                      formik.errors.copies[
                                        row.copyNo - 1
                                      ] as FormikErrors<IBookCopy>
                                    )?.rfidId
                                  )
                                }
                                helperText={
                                  (formik?.touched?.copies?.[row.copyNo - 1]?.rfidId &&
                                    Array.isArray(formik?.errors?.copies) &&
                                    typeof formik?.errors?.copies?.[row.copyNo - 1] === 'object' &&
                                    (
                                      formik.errors.copies[
                                        row.copyNo - 1
                                      ] as FormikErrors<IBookCopy>
                                    )?.rfidId) ||
                                  ''
                                }
                              />
                            </ShakingTextField>
                          ),
                        },
                        {
                          id: 'electiveSubject',
                          label: 'Vendor',
                          minWidth: '',
                          align: 'left',
                          isSort: false,
                          isFilter: false,
                          render: (_, row: any) => (
                            <ShakingTextField
                              error={
                                !!(
                                  formik?.touched?.copies?.[row.copyNo - 1]?.vendor &&
                                  Array.isArray(formik?.errors?.copies) &&
                                  typeof formik?.errors?.copies?.[row.copyNo - 1] === 'object' &&
                                  (formik.errors.copies[row.copyNo - 1] as FormikErrors<IBookCopy>)
                                    ?.vendor
                                )
                              }
                            >
                              <CustomSelect
                                label="Vendor"
                                options={[
                                  { value: 'amazon', label: 'Amazon' },
                                  { value: 'flipkart', label: 'Flipkart' },
                                  { value: 'local_store', label: 'Local Bookstore' },
                                  { value: 'publisher_direct', label: 'Direct from Publisher' },
                                  { value: 'other', label: 'Other' },
                                ]}
                                name="vendor"
                                value={formik.values.copies[row.copyNo - 1]?.vendor || ''}
                                onChange={(val) => {
                                  const updated = [...copies];
                                  updated[row.copyNo - 1].vendor = val as string;
                                  setCopies(updated);
                                  formik.setFieldValue('copies', updated);
                                  formik.setFieldTouched(`copies.${row.copyNo - 1}.vendor`, true);
                                }}
                                sx={{
                                  mb: 2,
                                  width: '100%',
                                  padding: '0',
                                  borderRadius: 1,
                                }}
                                helperText={
                                  (formik?.touched?.copies?.[row.copyNo - 1]?.vendor &&
                                    Array.isArray(formik?.errors?.copies) &&
                                    typeof formik?.errors?.copies?.[row.copyNo - 1] === 'object' &&
                                    (
                                      formik.errors.copies[
                                        row.copyNo - 1
                                      ] as FormikErrors<IBookCopy>
                                    )?.vendor) ||
                                  ''
                                }
                                error={
                                  !!(
                                    formik?.touched?.copies?.[row.copyNo - 1]?.vendor &&
                                    Array.isArray(formik?.errors?.copies) &&
                                    typeof formik?.errors?.copies?.[row.copyNo - 1] === 'object' &&
                                    (
                                      formik.errors.copies[
                                        row.copyNo - 1
                                      ] as FormikErrors<IBookCopy>
                                    )?.vendor
                                  )
                                }
                                formControlProps={{ sx: { minWidth: 275 } }}
                              />
                            </ShakingTextField>
                          ),
                        },
                      ]}
                      data={copies}
                    />
                  </Grid>
                </SectionCard>
              </Box>
            )}
          </Scrollbar>

          {/* Footer Actions */}

          <DialogActions sx={{ flexShrink: 0, p: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={() => {
                onClose(null, false);
              }}
              size="small"
            >
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              variant="contained"
              startIcon={<Iconify icon={GlobalIcons.submit} />}
              size="small"
            >
              Submit
            </LoadingButton>
          </DialogActions>
        </Box>
      </BackPopUpChecked>
    </Card>
  );
};

export default BookForm;
