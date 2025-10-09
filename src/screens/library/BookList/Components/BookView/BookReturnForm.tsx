import type { RootState } from 'src/redux/store';
import type {
  IBookCopy,
  IBookCopyWithBook,
} from 'src/screens/library/BookManagement/Components/type';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import ClearIcon from '@mui/icons-material/Clear';
import React, { useState, useEffect } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { useGetAllMembersQuery } from 'src/redux/library/bookList/memberApi';
import { useGetAllCopiesQuery } from 'src/redux/library/bookList/copies-api';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { staticChargeCategories } from 'src/screens/library/ChargesManagement/Components/AssignChargesForm';
import {
  Box,
  Grid,
  Card,
  Stack,
  Button,
  Avatar,
  TextField,
  Typography,
  IconButton,
  CardContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';

import libraryDummyData from '../../../../../../libraryData.json';

interface ReturnBookFormProps {
  onClose: (e: any, isSubmit: boolean) => void;
  accessionNo?: string | null;
}

const ReturnBookModal: React.FC<ReturnBookFormProps> = ({ onClose, accessionNo }) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [searchBook, setSearchBook] = useState(accessionNo || '');
  const [selectedBook, setSelectedBook] = useState<IBookCopyWithBook | null>(null);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);

  const [loading, setLoading] = useState(false);

  const { data: memberData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAllMembersQuery,
  });
  const { data: copies } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAllCopiesQuery,
  });
  const [books] = useState(libraryDummyData.books);

  // formik setup
  const formik = useFormik({
    initialValues: {
      accessionNo: accessionNo || '',
      chargeCategory: '',
      amount: '',
      returnDate: dayjs(),
    },
    validationSchema: Yup.object({
      returnDate: Yup.mixed()
        .required('Return date is required')
        .test(
          'is-valid-dayjs',
          'Return date must be a valid date',
          (value) => value && dayjs(value as any).isValid()
        )
        .test(
          'min-date',
          (value) =>
            `Return date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
          (value) => value && dayjs(value as any).isSameOrAfter(dayjs(currentYear.startDate), 'day')
        )
        .test(
          'max-date',
          (value) =>
            `Return date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
          (value) => value && dayjs(value as any).isSameOrBefore(dayjs(currentYear.endDate), 'day')
        ),
      amount: Yup.string().when('chargeCategory', (chargeCategory, schema) =>
        chargeCategory ? schema.required('Amount is required') : schema.nullable()
      ),
    }),
    onSubmit: (values) => {
      shikshaMitraToast.success({
        message: `Book with accession no. ${values.accessionNo} returned successfully.`,
      });
      onClose(null, true);
    },
  });

  const handleSearchBook = () => {
    const value = (searchBook || formik.values.accessionNo).trim();
    if (!value) {
      shikshaMitraToast.error({ message: 'Please enter accession number to search.' });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      // 1️⃣ Find the matching copy using accession number
      const foundCopy = copies?.find((c: IBookCopy) => c.accessionNo === value);

      // 2️⃣ If copy exists, find the related book
      const foundBook = foundCopy
        ? {
            ...foundCopy,
            book: books?.find((b) => b.id === foundCopy.bookId),
          }
        : null;

      // 3️⃣ Handle found or not found cases
      if (foundBook) {
        setSelectedBook(foundBook);
        formik.setFieldValue('accessionNo', foundBook.accessionNo);

        // 4️⃣ Find the member from the copy's memberId
        const foundMember = memberData?.find(
          (member: any) => member.memberId?.toLowerCase() === foundBook.memberId?.toLowerCase()
        );
        setSelectedMember(foundMember || null);
      } else {
        setSelectedBook(null);
        setSelectedMember(null);
        shikshaMitraToast.error({
          message: 'No book found for this accession number.',
        });
      }

      // 5️⃣ Stop loading after search completes
      setLoading(false);
    }, 400);
  };

  const handleClearBook = () => {
    setSearchBook('');
    setSelectedBook(null);
    formik.setFieldValue('accessionNo', '');
  };

  // Auto search when accession number is passed as prop
  useEffect(() => {
    if (accessionNo) handleSearchBook();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessionNo]);

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={3}>
          {!accessionNo && (
            <Grid size={{ xs: 12 }}>
              <Stack direction="row" spacing={2}>
                <TextField
                  variant="outlined"
                  size="small"
                  value={searchBook}
                  onChange={(e) => setSearchBook(e.target.value)}
                  label="Search by Accession No."
                  sx={{ flex: 1 }}
                  disabled={!!selectedBook}
                  InputProps={{
                    endAdornment: searchBook && (
                      <IconButton size="small" onClick={handleClearBook} disabled={!!selectedBook}>
                        <ClearIcon />
                      </IconButton>
                    ),
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SearchIcon />}
                  onClick={handleSearchBook}
                  disabled={!!selectedBook}
                  sx={{ px: 3 }}
                >
                  Search
                </Button>
              </Stack>
            </Grid>
          )}

          {loading ? (
            <Grid size={{ xs: 12 }}>
              <Box display="flex" justifyContent="center" alignItems="center">
                <CircularProgress size={20} />
              </Box>
            </Grid>
          ) : selectedBook ? (
            <>
              <Grid size={{ xs: 12 }}>
                <Card variant="outlined" sx={{ boxShadow: 'var(--shadows-8)', p: 2 }}>
                  <CardContent sx={{ p: '0 !important' }}>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Box
                          component="img"
                          src={selectedBook.book.bookCoverImages?.[0] || '/placeholder-book.jpg'}
                          alt={selectedBook.book.title}
                          sx={{
                            width: 220,
                            height: 200,
                            borderRadius: 2,
                            objectFit: 'cover',
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 8 }}>
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Typography fontWeight={600}>Title</Typography>
                            <Typography>{selectedBook.book.title}</Typography>
                          </Grid>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Typography fontWeight={600}>Accession No.</Typography>
                            <Typography>{selectedBook.accessionNo}</Typography>
                          </Grid>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Typography fontWeight={600}>Author</Typography>
                            <Typography>{selectedBook.book.author}</Typography>
                          </Grid>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Typography fontWeight={600}>Borrowed By</Typography>
                            <Typography>{selectedBook.memberName || 'N/A'}</Typography>
                          </Grid>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Typography fontWeight={600}>Issue Date</Typography>
                            <Typography>{selectedBook.issueDate || 'N/A'}</Typography>
                          </Grid>
                          <Grid size={{ xs: 12, md: 6 }}>
                            <Typography fontWeight={600}>Due Date</Typography>
                            <Typography>{selectedBook.dueDate || 'N/A'}</Typography>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              {selectedMember && (
                <Grid size={{ xs: 12 }}>
                  <Card variant="outlined" sx={{ boxShadow: 'var(--shadows-8)', p: 2 }}>
                    <CardContent
                      sx={{
                        padding: '0 !important',
                      }}
                    >
                      <Grid container spacing={2}>
                        {/* Avatar on the left */}
                        <Grid size={{ xs: 12, md: 2 }}>
                          <Avatar
                            src={selectedMember.avatarUrl}
                            sx={{ width: 80, height: 80, mt: 2 }}
                          />
                        </Grid>

                        {/* Member details on the right */}
                        <Grid size={{ xs: 12, md: 10 }}>
                          <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 4 }}>
                              <Typography fontWeight={600}>Member Name</Typography>
                              <Typography>{selectedMember.name}</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                              <Typography fontWeight={600}>Member ID</Typography>
                              <Typography>{selectedMember.memberId}</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                              <Typography fontWeight={600}>Email</Typography>
                              <Typography>{selectedMember.email}</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                              <Typography fontWeight={600}>Phone</Typography>
                              <Typography>{selectedMember.contactNo}</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                              <Typography fontWeight={600}>Member Type</Typography>
                              <Typography>{selectedMember.role}</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                              <Typography fontWeight={600}>Join Date</Typography>
                              <Typography>{selectedMember.joinDate}</Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </>
          ) : null}

          {selectedBook && (
            <>
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={!!(formik.touched.chargeCategory && formik.errors.chargeCategory)}
                >
                  <CustomSelect
                    label="Charge Category"
                    options={staticChargeCategories || []}
                    value={formik.values.chargeCategory}
                    onChange={(val) => {
                      formik.setFieldValue('chargeCategory', val);
                      // Find selected charge category and set its amount
                      const selectedCategory = (staticChargeCategories || []).find(
                        (cat: any) => cat.id === val
                      );
                      if (selectedCategory && selectedCategory.amount !== undefined) {
                        formik.setFieldValue('amount', selectedCategory.amount);
                      }
                    }}
                    labelKey="name"
                    valueKey="id"
                    formControlProps={{ fullWidth: true }}
                    error={!!(formik.touched.chargeCategory && formik.errors.chargeCategory)}
                    helperText={
                      (formik.touched.chargeCategory && formik.errors.chargeCategory) as string
                    }
                  />
                </ShakingTextField>
              </Grid>

              {/* Amount */}
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={!!(formik.touched.amount && formik.errors.amount)}>
                  <NumericFormatCustom
                    size="small"
                    fullWidth
                    label={`Amount${formik.values.chargeCategory ? ' *' : ''}`}
                    name="amount"
                    value={formik.values.amount}
                    disabled={
                      !!(staticChargeCategories || []).find(
                        (cat: any) => cat.id === formik.values.chargeCategory && cat.isFixed
                      )
                    }
                    error={!!(formik.touched.amount && formik.errors.amount)}
                    helperText={(formik.touched.amount && formik.errors.amount) as string}
                    onChange={(e: any) => {
                      // Remove non-numeric characters and parse to number
                      const rawValue = e.target.value.replace(/[^0-9.]/g, '');
                      formik.setFieldValue('amount', rawValue ? Number(rawValue) : '');
                    }}
                  />
                </ShakingTextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={!!(formik.touched.returnDate && formik.errors.returnDate)}>
                  <DatePicker
                    label="Return Date *"
                    format="DD-MM-YYYY"
                    value={formik.values.returnDate}
                    onChange={(newValue) => {
                      formik.setFieldValue('returnDate', newValue);
                    }}
                    minDate={dayjs(selectedBook.issueDate || currentYear?.startDate)}
                    maxDate={dayjs(currentYear?.endDate)}
                    sx={{ width: '100%' }}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        error: !!(formik.touched.returnDate && formik.errors.returnDate),
                        helperText: (formik.touched.returnDate &&
                          formik.errors.returnDate) as string,
                      },
                    }}
                  />
                </ShakingTextField>
              </Grid>
            </>
          )}
        </Grid>
      </DialogScrollContent>

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => onClose(null, false)}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={(e: any) => formik.handleSubmit(e)}
          startIcon={<Iconify icon={GlobalIcons.submit} width={16} height={16} />}
          disabled={!selectedBook}
        >
          Submit
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default ReturnBookModal;
