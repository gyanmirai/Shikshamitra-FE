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
import React, { useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable';
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
  Button,
  Avatar,
  TextField,
  Typography,
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
  const [selectedBook, setSelectedBook] = useState<IBookCopyWithBook | null>(null);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [reservationList, setReservationList] = useState([]);
  const [loading, setLoading] = useState(false);

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
      chargeCategory: '',
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
      remarks: Yup.string().when('chargeCategory', {
        is: (val: string) => !!val && val !== 'none',
        then: (schema) => schema.required('Remarks is required'),
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

    setTimeout(() => {
      const foundCopy = copies?.find((c: IBookCopy) => c.accessionNo === value);

      const foundBook = foundCopy
        ? {
            ...foundCopy,
            book: books?.find((b) => b.id === foundCopy.bookId),
          }
        : null;
      if (foundBook) {
        if (foundBook.status !== 1) {
          console.log('wrong----', foundBook);

          // only proceed if book is currently issued
          shikshaMitraToast.error({
            message: `Book "${foundBook.book.title}" is not currently issued.`,
          });
          setSelectedBook(null);
          setSelectedMember(null);
        } else {
          console.log('right----', foundBook);

          setSelectedBook(foundBook);
          formik.setFieldValue('accessionNo', foundBook.accessionNo);

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
    }, 400);
  };

  // Auto search when accession number is passed as prop
  useEffect(() => {
    if (accessionNo) handleSearchBookForReturn(accessionNo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessionNo]);

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={3}>
          {!accessionNo && (
            <Grid size={{ xs: 12 }}>
              <ShakingTextField error={!!(formik.touched.accessionNo && formik.errors.accessionNo)}>
                <TextField
                  label="Search by Accession No."
                  size="small"
                  fullWidth
                  value={formik.values.accessionNo}
                  onChange={(e) => handleSearchBookForReturn(e.target.value)}
                  disabled={!!accessionNo}
                  error={!!(formik.touched.accessionNo && formik.errors.accessionNo)}
                  helperText={(formik.touched.accessionNo && formik.errors.accessionNo) as string}
                  placeholder="Enter accession number (e.g., ACC-0001, ACC-0002, ACC-0003)"
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
                <Card variant="outlined" sx={{ boxShadow: 'var(--shadows-8)', p: 2 }}>
                  {' '}
                  <CardContent sx={{ p: '0 !important' }}>
                    {' '}
                    <Grid container spacing={2}>
                      {' '}
                      <Grid size={{ xs: 12, md: 3 }}>
                        {' '}
                        <Box
                          component="img"
                          src={selectedBook?.book.bookCoverImages?.[0] || '/placeholder-book.jpg'}
                          alt={selectedBook?.book.title}
                          sx={{ width: 240, height: 240, borderRadius: 2, flexShrink: 0 }}
                        />{' '}
                      </Grid>{' '}
                      <Grid size={{ xs: 12, md: 9 }}>
                        {' '}
                        <Grid container spacing={1}>
                          {' '}
                          <Grid size={{ xs: 12, md: 4 }}>
                            {' '}
                            <Typography fontWeight={600}>Book Title</Typography>{' '}
                            <Typography>
                              {selectedBook?.book.title ? selectedBook?.book.title : '-'}
                            </Typography>{' '}
                          </Grid>{' '}
                          <Grid size={{ xs: 12, md: 4 }}>
                            {' '}
                            <Typography fontWeight={600}>Accession No.</Typography>{' '}
                            <Typography>{selectedBook?.accessionNo || '-'}</Typography>{' '}
                          </Grid>{' '}
                          <Grid size={{ xs: 12, md: 4 }}>
                            {' '}
                            <Typography fontWeight={600}>Author</Typography>{' '}
                            <Typography>{selectedBook?.book.author || '-'}</Typography>{' '}
                          </Grid>{' '}
                          <Grid size={{ xs: 12, md: 4 }}>
                            {' '}
                            <Typography fontWeight={600}>ISBN</Typography>{' '}
                            <Typography>{selectedBook?.book.isbn || '-'}</Typography>{' '}
                          </Grid>{' '}
                          <Grid size={{ xs: 12, md: 4 }}>
                            {' '}
                            <Typography fontWeight={600}>Publisher</Typography>{' '}
                            <Typography>{selectedBook?.book.publisher || '-'}</Typography>{' '}
                          </Grid>{' '}
                          <Grid size={{ xs: 12, md: 4 }}>
                            {' '}
                            <Typography fontWeight={600}>Added On</Typography>{' '}
                            <Typography>
                              {' '}
                              {selectedBook?.book.createdOn
                                ? dayjs(selectedBook.book.createdOn).format('YYYY')
                                : '-'}{' '}
                            </Typography>{' '}
                          </Grid>{' '}
                          <Grid size={{ xs: 12, md: 4 }}>
                            {' '}
                            <Typography fontWeight={600}>Language</Typography>{' '}
                            <Typography>{selectedBook?.book.language || '-'}</Typography>{' '}
                          </Grid>{' '}
                          <Grid size={{ xs: 12, md: 4 }}>
                            {' '}
                            <Typography fontWeight={600}>Edition</Typography>{' '}
                            <Typography>{selectedBook?.book.edition || '-'}</Typography>{' '}
                          </Grid>{' '}
                          <Grid size={{ xs: 12, md: 4 }}>
                            {' '}
                            <Typography fontWeight={600}>Category</Typography>{' '}
                            <Typography>{selectedBook?.book.category || '-'}</Typography>{' '}
                          </Grid>{' '}
                          <Grid size={{ xs: 12, md: 4 }}>
                            {' '}
                            <Typography fontWeight={600}>No. of Pages</Typography>{' '}
                            <Typography>{selectedBook?.book.numberOfPages || '-'}</Typography>{' '}
                          </Grid>{' '}
                        </Grid>{' '}
                      </Grid>{' '}
                    </Grid>{' '}
                  </CardContent>{' '}
                </Card>
              </Grid>

              {/* Member details */}
              {selectedMember && (
                <Grid size={{ xs: 12 }}>
                  <Card variant="outlined" sx={{ boxShadow: 'var(--shadows-8)', p: 2 }}>
                    <CardContent sx={{ padding: '0 !important' }}>
                      <Grid container spacing={2}>
                        {/* Avatar */}
                        <Grid
                          size={{ xs: 12, md: 2 }}
                          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Avatar src={selectedMember.avatarUrl} sx={{ width: 80, height: 80 }} />
                        </Grid>

                        {/* Details */}
                        <Grid size={{ xs: 12, md: 10 }}>
                          <Grid container spacing={1}>
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
                              <Typography>{selectedMember.email || 'N/A'}</Typography>
                            </Grid>

                            {selectedMember.role === 'Student' && (
                              <>
                                <Grid size={{ xs: 12, md: 4 }}>
                                  <Typography fontWeight={600}>Class/Division</Typography>
                                  <Typography>
                                    {selectedMember.class || 'N/A'} -{' '}
                                    {selectedMember.division || 'N/A'}
                                  </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                  <Typography fontWeight={600}>Roll No.</Typography>
                                  <Typography>{selectedMember.rollNo || 'N/A'}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                  <Typography fontWeight={600}>GR No.</Typography>
                                  <Typography>{selectedMember.grNo || 'N/A'}</Typography>
                                </Grid>
                              </>
                            )}

                            <Grid size={{ xs: 12, md: 4 }}>
                              <Typography fontWeight={600}>Phone</Typography>
                              <Typography>{selectedMember.contactNo || 'N/A'}</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                              <Typography fontWeight={600}>Role</Typography>
                              <Typography>{selectedMember.role}</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                              <Typography fontWeight={600}>Join Date</Typography>
                              <Typography>{selectedMember.joinDate || 'N/A'}</Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </>
          ) : formik.values.accessionNo !== '' ? (
            <Typography color="error">
              Book with accession number &quot;{formik.values.accessionNo}&quot; not found or not
              issued.
            </Typography>
          ) : null}

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
                      <Card
                        variant="outlined"
                        sx={{
                          boxShadow: 'var(--shadows-8)',
                          background: '#fafbfc',
                          p: 3,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography color="text.secondary" fontSize={20}>
                          No reservations yet
                        </Typography>
                      </Card>
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
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={(e: any) => formik.handleSubmit(e)}
          startIcon={<Iconify icon="carbon:return" width={16} height={16} />}
        >
          Return
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default ReturnBookModal;
