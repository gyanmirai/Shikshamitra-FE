import type { RootState } from 'src/redux/store';
import type {
  IBookCopy,
  IBookCopyWithBook,
} from 'src/screens/library/BookManagement/Components/type';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Stack } from '@mui/system';
import { useSelector } from 'react-redux';
import debounce from 'src/utils/debounce';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { ExpandMore } from '@mui/icons-material';
import { shikshaMitraToast } from 'src/components/toast';
import React, { useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { useGetAllMembersQuery } from 'src/redux/library/bookList/memberApi';
import { useGetAllCopiesQuery } from 'src/redux/library/bookList/copies-api';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { staticChargeCategories } from 'src/screens/library/ChargesManagement/Components/AssignChargesForm';
import {
  Box,
  Grid,
  Button,
  Avatar,
  TextField,
  Accordion,
  Typography,
  DialogActions,
  CircularProgress,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import libraryDummyData from '../../../../../../libraryData.json';

interface ReturnBookFormProps {
  onClose: (e: any, isSubmit: boolean) => void;
  accessionNo?: string | null;
}

const ReturnBookModal: React.FC<ReturnBookFormProps> = ({ onClose, accessionNo }) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [selectedBook, setSelectedBook] = useState<IBookCopyWithBook | null>(null);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [reservationList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedBook, setExpandedBook] = useState(false);
  const [expandedMemberAccordion, setExpandedMemberAccordion] = useState(false);

  const { data: memberData, isLoading: memberLoading } = useQueryAndMutation({
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
      chargeCategory: 'None',
      amount: '',
      returnDate: dayjs(),
      fineDueDate: null,
      remarks: '',
    },
    validationSchema: Yup.object({
      accessionNo: Yup.string().required('Accession No. is required'),
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
      fineDueDate: Yup.mixed().when('chargeCategory', {
        is: (val: string) => !!val && val !== 'none',
        then: (schema) =>
          schema
            .required('Fine Due Date is required')
            .test(
              'is-valid-dayjs',
              'Fine due date must be a valid date',
              (value) => value && dayjs(value as any).isValid()
            )
            .test(
              'min-date',
              (value) =>
                `Fine due date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
              (value) =>
                value && dayjs(value as any).isSameOrAfter(dayjs(currentYear.startDate), 'day')
            )
            .test(
              'max-date',
              (value) =>
                `Fine due date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
              (value) =>
                value && dayjs(value as any).isSameOrBefore(dayjs(currentYear.endDate), 'day')
            ),
        otherwise: (schema) => schema.nullable(),
      }),
      amount: Yup.string().when('chargeCategory', {
        is: (val: string) => !!val && val !== 'none',
        then: (schema) => schema.required('Amount is required'),
        otherwise: (schema) => schema.nullable(),
      }),
      remarks: Yup.string()
        .transform((value) => (value ? value.trim() : value)) // Automatically trim the value
        .when('chargeCategory', {
          is: (val: string) => !!val && val !== 'none',
          then: (schema) =>
            schema.required('Remarks is required').min(1, 'Remarks must have at least 1 character'),
          otherwise: (schema) => schema.nullable(),
        }),
    }),
    onSubmit: (values) => {
      shikshaMitraToast.success({
        message: `Book with accession no. ${values.accessionNo} returned successfully.`,
      });
      onClose(null, true);
    },
  });

  const handleSearchBookForReturn = (value: string) => {
    formik.setFieldValue('accessionNo', value);
    if (!value) {
      setSelectedBook(null);
      setSelectedMember(null);
      return;
    }

    setLoading(true);
    debounce(() => {
      const foundCopy = copies?.find((c: IBookCopy) => c.accessionNo === value);
      const foundBook = foundCopy
        ? {
            ...foundCopy,
            book: books?.find((b) => b.id === foundCopy.bookId),
          }
        : null;

      if (foundBook) {
        if (foundBook.status !== 1) {
          // only proceed if book is currently issued
          shikshaMitraToast.error({
            message: `Book "${foundBook.book.title}" is not currently issued.`,
          });
          setSelectedBook(null);
          setSelectedMember(null);
        } else {
          setSelectedBook(foundBook);

          const foundMember = memberData?.find(
            (member: any) => member.memberId?.toLowerCase() === foundBook.memberId?.toLowerCase()
          );
          setSelectedMember(foundMember || null);
        }
      } else {
        setSelectedBook(null);
        setSelectedMember(null);
      }
      setLoading(false);
    }, 1000);
  };

  // Auto search when accession number is passed as prop
  useEffect(() => {
    if (accessionNo) handleSearchBookForReturn(accessionNo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessionNo]);

  const bookDetails = useMemo(() => {
    if (!selectedBook) return [];
    return [
      {
        label: 'Book Title',
        icon: 'mdi:book-open-page-variant',
        value: selectedBook.book.title || '—',
      },
      { label: 'Accession No.', icon: 'mdi:barcode', value: selectedBook.accessionNo || '—' },
      { label: 'Author', icon: 'mdi:account', value: selectedBook.book.author || '—' },
      { label: 'ISBN', icon: 'mdi:barcode-scan', value: selectedBook.book.isbn || '—' },
      {
        label: 'Publisher',
        icon: 'mdi:office-building',
        value: selectedBook.book.publisher || '—',
      },
      {
        label: 'Added On',
        icon: 'mdi:calendar',
        value: selectedBook.book.createdOn
          ? dayjs(selectedBook.book.createdOn).format('YYYY')
          : '—',
      },
      { label: 'Language', icon: 'mdi:translate', value: selectedBook.book.language || '—' },
      { label: 'Edition', icon: 'mdi:numeric', value: selectedBook.book.edition || '—' },
      { label: 'Category', icon: 'mdi:shape', value: selectedBook.book.category || '—' },
      {
        label: 'No. of Pages',
        icon: 'mdi:book-open-variant',
        value: selectedBook.book.numberOfPages || '—',
      },
    ];
  }, [selectedBook]);

  const memberDetails = useMemo(() => {
    if (!selectedMember) return [];
    const details = [
      { label: 'Member Name', icon: 'mdi:account', value: selectedMember.name || '—' },
      { label: 'Email', icon: 'mdi:email', value: selectedMember.email || '—' },
      {
        label: 'Member ID',
        icon: 'mdi:card-account-details',
        value: selectedMember.memberId || '—',
      },
      { label: 'Phone', icon: 'mdi:phone', value: selectedMember.contactNo || '—' },
      { label: 'Role', icon: 'mdi:account-group', value: selectedMember.role || '—' },
      { label: 'Join Date', icon: 'mdi:calendar-check', value: selectedMember.joinDate || '—' },
    ];

    if (selectedMember.role === 'Student') {
      details.splice(
        3,
        0,
        {
          label: 'Class/Division',
          icon: 'mdi:school',
          value: `${selectedMember.class || '—'} - ${selectedMember.division || '—'}`,
        },
        {
          label: 'Roll No.',
          icon: 'mdi:format-list-numbered',
          value: selectedMember.rollNo || '—',
        },
        {
          label: 'GR No.',
          icon: 'mdi:card-account-details-outline',
          value: selectedMember.grNo || '—',
        }
      );
    }

    return details;
  }, [selectedMember]);

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={3}>
          {!accessionNo && (
            <Grid size={{ xs: 12 }}>
              <ShakingTextField error={!!(formik.touched.accessionNo && formik.errors.accessionNo)}>
                <TextField
                  label="Search by Accession No. *"
                  size="small"
                  fullWidth
                  value={formik.values.accessionNo}
                  onChange={(e) => handleSearchBookForReturn(e.target.value)}
                  disabled={!!accessionNo}
                  error={!!(formik.touched.accessionNo && formik.errors.accessionNo)}
                  helperText={(formik.touched.accessionNo && formik.errors.accessionNo) as string}
                  placeholder="Enter Accession No. (e.g., ACC-0001, ACC-0002, ACC-0003)"
                />
              </ShakingTextField>
            </Grid>
          )}

          {loading ? (
            <CircularProgress size={20} />
          ) : selectedBook ? (
            <>
              {/* Book details */}
              <Grid size={{ xs: 12 }}>
                <Accordion
                  expanded={expandedBook}
                  onChange={() => setExpandedBook(!expandedBook)}
                  sx={{
                    boxShadow: 1,
                    borderRadius: '12px !important',
                    '&:before': { display: 'none' },
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMore />}
                    sx={{
                      '& .MuiAccordionSummary-content': {
                        my: 1.5,
                        display: 'block',
                      },
                    }}
                  >
                    <Typography variant="h6" color="primary.main" mb={expandedBook ? 0 : 1}>
                      Book Details
                    </Typography>

                    {/* Show preview when collapsed */}
                    {!expandedBook && (
                      <Grid container spacing={2} mt={0.5}>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Iconify
                              icon="mdi:book-open-page-variant"
                              width={18}
                              color="text.secondary"
                            />
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                                sx={{ fontSize: '0.75rem', lineHeight: 1.3 }}
                              >
                                Book Title:
                              </Typography>
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                color="text.primary"
                                sx={{ fontSize: '0.9rem' }}
                                noWrap
                                title={selectedBook.book.title}
                              >
                                {selectedBook.book.title || '—'}
                              </Typography>
                            </Box>
                          </Stack>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Iconify icon="mdi:barcode" width={18} color="text.secondary" />
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                                sx={{ fontSize: '0.75rem', lineHeight: 1.3 }}
                              >
                                Accession No.:
                              </Typography>
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                color="text.primary"
                                sx={{ fontSize: '0.9rem' }}
                                noWrap
                              >
                                {selectedBook.accessionNo || '—'}
                              </Typography>
                            </Box>
                          </Stack>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Iconify icon="mdi:account" width={18} color="text.secondary" />
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                                sx={{ fontSize: '0.75rem', lineHeight: 1.3 }}
                              >
                                Author:
                              </Typography>
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                color="text.primary"
                                sx={{ fontSize: '0.9rem' }}
                                noWrap
                                title={selectedBook.book.author}
                              >
                                {selectedBook.book.author || '—'}
                              </Typography>
                            </Box>
                          </Stack>
                        </Grid>
                      </Grid>
                    )}
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0 }}>
                    <Grid container spacing={2}>
                      {/* Book Cover */}
                      <Grid size={{ xs: 12, md: 2 }}>
                        <Box
                          component="img"
                          src={selectedBook?.book.bookCoverImages?.[0] || '/placeholder-book.jpg'}
                          alt={selectedBook?.book.title}
                          sx={{
                            width: '100%',
                            height: 'auto',
                            maxWidth: 150,
                            borderRadius: 2,
                            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
                          }}
                        />
                      </Grid>

                      {/* Book Details Grid - 4 per row */}
                      <Grid size={{ xs: 12, md: 10 }}>
                        <Grid container spacing={2}>
                          {bookDetails.map((d) => (
                            <Grid key={d.label} size={{ xs: 12, sm: 6, md: 3 }}>
                              <Stack direction="row" spacing={1.5} alignItems="center">
                                <Iconify icon={d.icon} width={20} color="text.secondary" />
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    display="block"
                                    sx={{ fontSize: '0.7rem', lineHeight: 1.2 }}
                                  >
                                    {d.label}:
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    fontWeight={600}
                                    color="text.primary"
                                    sx={{ fontSize: '0.8rem' }}
                                    noWrap
                                    title={String(d.value)}
                                  >
                                    {d.value}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Grid>
                          ))}
                        </Grid>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grid>

              {/* Member details */}
              {selectedMember && (
                <Grid size={{ xs: 12 }}>
                  <Accordion
                    expanded={expandedMemberAccordion}
                    onChange={() => setExpandedMemberAccordion(!expandedMemberAccordion)}
                    sx={{
                      boxShadow: 1,
                      borderRadius: '12px !important',
                      '&:before': { display: 'none' },
                      border: '1px solid',
                      borderColor: 'divider',
                      mb: 2,
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMore />}
                      sx={{
                        '& .MuiAccordionSummary-content': {
                          my: 1.5,
                          display: 'block',
                        },
                      }}
                    >
                      <Typography
                        variant="h6"
                        color="primary.main"
                        mb={expandedMemberAccordion ? 0 : 1}
                      >
                        Member Details
                      </Typography>

                      {/* Show preview when collapsed */}
                      {!expandedMemberAccordion && (
                        <Grid container spacing={2} mt={0.5}>
                          <Grid size={{ xs: 12, sm: 4 }}>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Iconify icon="mdi:account" width={18} color="text.secondary" />
                              <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  display="block"
                                  sx={{ fontSize: '0.75rem', lineHeight: 1.3 }}
                                >
                                  Member Name:
                                </Typography>
                                <Typography
                                  variant="body2"
                                  fontWeight={600}
                                  color="text.primary"
                                  sx={{ fontSize: '0.9rem' }}
                                  noWrap
                                  title={selectedMember.name}
                                >
                                  {selectedMember.name || '—'}
                                </Typography>
                              </Box>
                            </Stack>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 4 }}>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Iconify
                                icon="mdi:card-account-details"
                                width={18}
                                color="text.secondary"
                              />
                              <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  display="block"
                                  sx={{ fontSize: '0.75rem', lineHeight: 1.3 }}
                                >
                                  Member ID:
                                </Typography>
                                <Typography
                                  variant="body2"
                                  fontWeight={600}
                                  color="text.primary"
                                  sx={{ fontSize: '0.9rem' }}
                                  noWrap
                                >
                                  {selectedMember.memberId || '—'}
                                </Typography>
                              </Box>
                            </Stack>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 4 }}>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Iconify icon="mdi:account-group" width={18} color="text.secondary" />
                              <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  display="block"
                                  sx={{ fontSize: '0.75rem', lineHeight: 1.3 }}
                                >
                                  Role:
                                </Typography>
                                <Typography
                                  variant="body2"
                                  fontWeight={600}
                                  color="text.primary"
                                  sx={{ fontSize: '0.9rem' }}
                                  noWrap
                                >
                                  {selectedMember.role || '—'}
                                </Typography>
                              </Box>
                            </Stack>
                          </Grid>
                        </Grid>
                      )}
                    </AccordionSummary>
                    <AccordionDetails sx={{ pt: 0 }}>
                      <Grid container spacing={2}>
                        {/* Avatar */}
                        <Grid
                          size={{ xs: 12, md: 2 }}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: 150,
                          }}
                        >
                          <Avatar
                            src={selectedMember.avatarUrl}
                            sx={{
                              width: 80,
                              height: 80,
                            }}
                          />
                        </Grid>
                        {/* Member Details Grid - 4 per row */}
                        <Grid size={{ xs: 12, md: 10 }}>
                          <Grid container spacing={2}>
                            {memberDetails.map((d) => (
                              <Grid key={d.label} size={{ xs: 12, sm: 6, md: 3 }}>
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                  <Iconify icon={d.icon} width={20} color="text.secondary" />
                                  <Box sx={{ minWidth: 0, flex: 1 }}>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      display="block"
                                      sx={{ fontSize: '0.7rem', lineHeight: 1.2 }}
                                    >
                                      {d.label}:
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      fontWeight={600}
                                      color="text.primary"
                                      sx={{ fontSize: '0.8rem' }}
                                      noWrap
                                      title={String(d.value)}
                                    >
                                      {d.value}
                                    </Typography>
                                  </Box>
                                </Stack>
                              </Grid>
                            ))}
                          </Grid>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              )}
            </>
          ) : (
            formik.values.accessionNo !== '' && (
              <Grid size={{ xs: 12 }}>
                <div
                  style={{
                    padding: '12px',
                    backgroundColor: '#ffebee',
                    borderRadius: '4px',
                    border: '1px solid #f44336',
                    color: '#d32f2f',
                    textAlign: 'center',
                  }}
                >
                  Book with accession number &quot;{formik.values.accessionNo}&quot; not found or
                  not issued.
                </div>
              </Grid>
            )
          )}

          {selectedBook && (
            <>
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
                    maxDate={dayjs()}
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
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={!!(formik.touched.chargeCategory && formik.errors.chargeCategory)}
                >
                  <PaginatedSearchSelect
                    key={formik.values.chargeCategory || 'charge-cat-empty'}
                    fullWidth
                    label="Charge Category"
                    noOptionsText="No Charge Category Found"
                    minChars={0}
                    size="small"
                    fetchOptions={async (query: string, page: number) => {
                      const filtered = (staticChargeCategories || []).filter((o: any) =>
                        o.name.toLowerCase().includes(query.toLowerCase())
                      );
                      const pageSize = 10;
                      const start = (page - 1) * pageSize;
                      return {
                        data: filtered.slice(start, start + pageSize).map((item: any) => ({
                          label: item.name,
                          id: item.id,
                          amount: item.amount,
                          isFixed: item.isFixed,
                        })),
                        hasMore: start + pageSize < filtered.length,
                      };
                    }}
                    getOptionLabel={(option: any) => option?.label || ''}
                    value={(() => {
                      const found = (staticChargeCategories || []).find(
                        (cat: any) => cat.id === formik.values.chargeCategory
                      );
                      return found
                        ? {
                            label: found.name,
                            id: found.id,
                            amount: found.amount,
                            isFixed: found.isFixed,
                          }
                        : null;
                    })()}
                    onChange={(_, newValue: any) => {
                      formik.setFieldValue('chargeCategory', newValue?.id || '');
                      if (newValue && newValue.amount !== undefined) {
                        formik.setFieldValue('amount', newValue.amount);
                      }
                    }}
                    isOptionEqualToValue={(option: any, value: any) => option.id === value.id}
                    error={!!(formik.touched.chargeCategory && formik.errors.chargeCategory)}
                    helperText={
                      (formik.touched.chargeCategory && formik.errors.chargeCategory) as string
                    }
                  />
                </ShakingTextField>
              </Grid>

              {/* Amount */}
              {formik.values.chargeCategory && formik.values.chargeCategory !== 'none' && (
                <>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <ShakingTextField error={!!(formik.touched.amount && formik.errors.amount)}>
                      <NumericFormatCustom
                        size="small"
                        fullWidth
                        label="Amount *"
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
                    <ShakingTextField
                      error={!!(formik.touched.fineDueDate && formik.errors.fineDueDate)}
                    >
                      <DatePicker
                        label="Fine Due Date *"
                        format="DD-MM-YYYY"
                        value={formik.values.fineDueDate}
                        onChange={(newValue) => {
                          formik.setFieldValue('fineDueDate', newValue);
                        }}
                        minDate={dayjs(formik.values.returnDate || currentYear?.startDate)}
                        maxDate={dayjs(currentYear?.endDate)}
                        sx={{ width: '100%' }}
                        slotProps={{
                          textField: {
                            size: 'small',
                            fullWidth: true,
                            error: !!(formik.touched.fineDueDate && formik.errors.fineDueDate),
                            helperText: (formik.touched.fineDueDate &&
                              formik.errors.fineDueDate) as string,
                          },
                        }}
                      />
                    </ShakingTextField>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <ShakingTextField error={!!(formik.touched.remarks && formik.errors.remarks)}>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Remarks *"
                        name="remarks"
                        value={formik.values.remarks}
                        onChange={formik.handleChange}
                        error={!!(formik.touched.remarks && formik.errors.remarks)}
                        helperText={(formik.touched.remarks && formik.errors.remarks) as string}
                      />
                    </ShakingTextField>
                  </Grid>
                  <Grid size={12}>
                    {reservationList?.length ? (
                      <>
                        <Typography variant="subtitle1">Reserved List</Typography>
                        <CustomizableTable
                          tableId="reserved-members-table"
                          noDataText="No Reserved Members Found"
                          isLoading={memberLoading}
                          columns={[
                            { id: 'memberId', label: 'Member ID', align: 'left', sticky: true },
                            { id: 'name', label: 'Member Name', align: 'left' },
                            { id: 'role', label: 'Role', align: 'left' },
                            { id: 'class', label: 'Class', align: 'left' },
                            { id: 'division', label: 'Division', align: 'left' },
                            { id: 'rollNo', label: 'Roll No', align: 'left' },
                            { id: 'grNo', label: 'GR No', align: 'left' },
                            {
                              id: 'accessionNo',
                              label: 'Accession No',
                              align: 'left',
                            },
                            {
                              id: 'reservedBook',
                              label: 'Reserved Book',
                              align: 'left',
                              render: (value) => (
                                <Typography variant="caption" fontSize="13px">
                                  {typeof value === 'object' ? value?.title || '-' : value || '-'}
                                </Typography>
                              ),
                            },
                            {
                              id: 'requestedDate',
                              label: 'Requested Date',
                              align: 'left',
                              filterType: 'date',
                              render: (value) => (
                                <Typography variant="caption" fontSize="13px">
                                  {dayjs(value).format('DD-MM-YYYY')}
                                </Typography>
                              ),
                            },
                            {
                              id: 'reserveDueDate',
                              label: 'Reserve Due Date',
                              align: 'left',
                              filterType: 'date',
                              render: (value) => (
                                <Typography variant="caption" fontSize="13px">
                                  {dayjs(value).format('DD-MM-YYYY')}
                                </Typography>
                              ),
                            },
                          ]}
                          data={reservationList || []}
                        />
                      </>
                    ) : (
                      <Grid size={{ xs: 12 }}>
                        <div
                          style={{
                            padding: '12px',
                            borderRadius: '4px',
                            backgroundColor: '#e3f2fd',
                            color: '#2196f3',
                            textAlign: 'center',
                          }}
                        >
                          No reservations yet
                        </div>
                      </Grid>
                    )}
                  </Grid>
                </>
              )}
            </>
          )}
        </Grid>
      </DialogScrollContent>

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => onClose(null, false)}
          startIcon={<Iconify icon={GlobalIcons.cancel} width={16} height={10} />}
          sx={{ minWidth: 120, px: 3 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={(e: any) => formik.handleSubmit(e)}
          startIcon={<Iconify icon="mdi:arrow-u-left-top" width={16} height={16} />}
          sx={{ minWidth: 120, px: 3 }}
        >
          Return
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default ReturnBookModal;
