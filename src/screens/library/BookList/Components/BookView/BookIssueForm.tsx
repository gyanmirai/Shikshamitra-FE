import type { RootState } from 'src/redux/store';
import type {
  IBookCopy,
  IBookCopyWithBook,
} from 'src/screens/library/BookManagement/Components/type';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { Stack } from '@mui/system';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { DatePicker } from '@mui/x-date-pickers';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetAllMembersQuery } from 'src/redux/library/bookList/memberApi';
import { useGetAllCopiesQuery } from 'src/redux/library/bookList/copies-api';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  Box,
  Grid,
  Card,
  Paper,
  Button,
  Avatar,
  TextField,
  Typography,
  DialogActions,
  CircularProgress,
} from '@mui/material';

import { getInitialValues } from './getBookIssueInitialValues';
import libraryDummyData from '../../../../../../libraryData.json';
import { getIssueBookSchema } from './getBookIssueValidatonSchema';

// basic validation schema (customize as per your logic)

export interface IssueBookFormProps {
  onClose: (e: any, isSubmit: boolean) => void;
  editData: IBookCopyWithBook | null;
}

const IssueBookModal: React.FC<IssueBookFormProps> = ({ onClose, editData }) => {
  const [selectedBook, setSelectedBook] = useState<IBookCopyWithBook | null>(editData);
  const [selectedMember, setSelectedMember] = useState<any | null>(editData?.memberId || null);
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [books, setBooks] = useState(libraryDummyData.books);
  const [loading, setLoading] = useState(false);
  const [loadingMember, setLoadingMember] = useState(false);

  const { data: memberData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAllMembersQuery,
  });
  const { data: copies } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAllCopiesQuery,
  });

  const handleSearchBook = (value: string) => {
    formik.setFieldValue('accessionNumber', value);
    if (!value) {
      setSelectedBook(null);
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
        setSelectedBook(foundBook);
        formik.setFieldValue('accessionNo', foundBook.accessionNo);
      } else {
        setSelectedBook(null);
      }
      setLoading(false);
    }, 400);
  };

  const handleMemberSearch = (value: string) => {
    formik.setFieldValue('memberId', value);

    if (!value) {
      setSelectedMember(null);
      return;
    }

    setLoadingMember(true);

    setTimeout(() => {
      const searchValue = value.toLowerCase().trim();

      const foundMember = memberData.find(
        (member: any) =>
          member.memberId?.toLowerCase() === searchValue ||
          member.rollNo?.toLowerCase() === searchValue ||
          member.name?.toLowerCase() === searchValue
      );

      if (foundMember) {
        setSelectedMember(foundMember);
        formik.setFieldValue('memberName', foundMember.name || '');
        formik.setFieldValue('role', foundMember.role);
        formik.setFieldValue('class', foundMember.className || '');
        formik.setFieldValue('division', foundMember.division || '');
      } else {
        setSelectedMember(null);
      }

      setLoadingMember(false);
    }, 400);
  };

  const formik = useFormik({
    initialValues: getInitialValues(editData),
    validationSchema: getIssueBookSchema(currentYear),
    onSubmit: (values) => {
      shikshaMitraToast.success({
        message: `${editData?.book?.title || ''} book issued successfully`,
      });
      onClose(null, true);
    },
  });
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={3}>
          {!editData && (
            <Grid size={{ xs: 12 }}>
              <ShakingTextField
                error={!!(formik.touched.accessionNumber && formik.errors.accessionNumber)}
              >
                <TextField
                  label="Search by Accession No."
                  size="small"
                  fullWidth
                  value={formik.values.accessionNumber}
                  onChange={(e) => handleSearchBook(e.target.value)}
                  disabled={!!editData}
                  error={!!(formik.touched.accessionNumber && formik.errors.accessionNumber)}
                  helperText={
                    (formik.touched.accessionNumber && formik.errors.accessionNumber) as string
                  }
                  placeholder="Enter accession number (e.g., ACC-0001, ACC-0002, ACC-0003)"
                />
              </ShakingTextField>
            </Grid>
          )}

          {/* Book Details Display */}
          {(() => {
            if (loading) {
              return (
                <Grid size={{ xs: 12 }}>
                  <Box display="flex" justifyContent="center" alignItems="center">
                    <CircularProgress size={20} />
                  </Box>
                </Grid>
              );
            }

            if (selectedBook) {
              return (
                <Grid size={{ xs: 12 }}>
                  <Box
                    sx={{
                      boxShadow: 'var(--shadows-8)',
                      p: 2,
                      background: '#fff',
                      borderRadius: 3,
                    }}
                  >
                    <Grid container spacing={2} alignItems="center">
                      {/* Book Cover */}
                      <Grid size={{ xs: 12, md: 3 }}>
                        <Box
                          sx={{
                            borderRadius: 2,
                            overflow: 'hidden',
                            boxShadow: 2,
                            mx: 'auto',
                            background: '#f5f5f5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Box
                            component="img"
                            src={selectedBook?.book.bookCoverImages?.[0] || '/placeholder-book.jpg'}
                            alt={selectedBook?.book.title}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        </Box>
                      </Grid>
                      {/* Book Info */}
                      <Grid size={{ xs: 12, md: 9 }}>
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, md: 4 }}>
                            <Paper
                              variant="outlined"
                              sx={{ p: 0.5, borderRadius: 2, bgcolor: 'grey.50' }}
                            >
                              <Stack direction="row" spacing={3} alignItems="center" ml={2}>
                                <Iconify icon="mdi:book-open-page-variant" width={22} />
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    textTransform="uppercase"
                                  >
                                    Book Title
                                  </Typography>
                                  <Typography variant="body1" fontWeight={600}>
                                    {selectedBook?.book.title || '-'}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Paper>
                          </Grid>
                          <Grid size={{ xs: 12, md: 4 }}>
                            <Paper
                              variant="outlined"
                              sx={{ p: 0.5, borderRadius: 2, bgcolor: 'grey.50' }}
                            >
                              <Stack direction="row" spacing={3} alignItems="center" ml={2}>
                                <Iconify icon="mdi:barcode" width={22} />
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    textTransform="uppercase"
                                  >
                                    Accession No.
                                  </Typography>
                                  <Typography variant="body1" fontWeight={600}>
                                    {selectedBook?.accessionNo || '-'}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Paper>
                          </Grid>
                          <Grid size={{ xs: 12, md: 4 }}>
                            <Paper
                              variant="outlined"
                              sx={{ p: 0.5, borderRadius: 2, bgcolor: 'grey.50' }}
                            >
                              <Stack direction="row" spacing={3} alignItems="center" ml={2}>
                                <Iconify icon="mdi:account" width={22} />
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    textTransform="uppercase"
                                  >
                                    Author
                                  </Typography>
                                  <Typography variant="body1" fontWeight={600}>
                                    {selectedBook?.book.author || '-'}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Paper>
                          </Grid>
                          <Grid size={{ xs: 12, md: 4 }}>
                            <Paper
                              variant="outlined"
                              sx={{ p: 0.5, borderRadius: 2, bgcolor: 'grey.50' }}
                            >
                              <Stack direction="row" spacing={3} alignItems="center" ml={2}>
                                <Iconify icon="mdi:barcode-scan" width={22} />
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    textTransform="uppercase"
                                  >
                                    ISBN
                                  </Typography>
                                  <Typography variant="body1" fontWeight={600}>
                                    {selectedBook?.book.isbn || '-'}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Paper>
                          </Grid>
                          <Grid size={{ xs: 12, md: 4 }}>
                            <Paper
                              variant="outlined"
                              sx={{ p: 0.5, borderRadius: 2, bgcolor: 'grey.50' }}
                            >
                              <Stack direction="row" spacing={3} alignItems="center" ml={2}>
                                <Iconify icon="mdi:office-building" width={22} />
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    textTransform="uppercase"
                                  >
                                    Publisher
                                  </Typography>
                                  <Typography variant="body1" fontWeight={600}>
                                    {selectedBook?.book.publisher || '-'}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Paper>
                          </Grid>
                          <Grid size={{ xs: 12, md: 4 }}>
                            <Paper
                              variant="outlined"
                              sx={{ p: 0.5, borderRadius: 2, bgcolor: 'grey.50' }}
                            >
                              <Stack direction="row" spacing={3} alignItems="center" ml={2}>
                                <Iconify icon="mdi:calendar" width={22} />
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    textTransform="uppercase"
                                  >
                                    Added On
                                  </Typography>
                                  <Typography variant="body1" fontWeight={600}>
                                    {selectedBook?.book.createdOn
                                      ? dayjs(selectedBook.book.createdOn).format('YYYY')
                                      : '-'}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Paper>
                          </Grid>
                          <Grid size={{ xs: 12, md: 4 }}>
                            <Paper
                              variant="outlined"
                              sx={{ p: 0.5, borderRadius: 2, bgcolor: 'grey.50' }}
                            >
                              <Stack direction="row" spacing={3} alignItems="center" ml={2}>
                                <Iconify icon="mdi:translate" width={22} />
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    textTransform="uppercase"
                                  >
                                    Language
                                  </Typography>
                                  <Typography variant="body1" fontWeight={600}>
                                    {selectedBook?.book.language || '-'}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Paper>
                          </Grid>
                          <Grid size={{ xs: 12, md: 4 }}>
                            <Paper
                              variant="outlined"
                              sx={{ p: 0.5, borderRadius: 2, bgcolor: 'grey.50' }}
                            >
                              <Stack direction="row" spacing={3} alignItems="center" ml={2}>
                                <Iconify icon="mdi:numeric" width={22} />
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    textTransform="uppercase"
                                  >
                                    Edition
                                  </Typography>
                                  <Typography variant="body1" fontWeight={600}>
                                    {selectedBook?.book.edition || '-'}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Paper>
                          </Grid>
                          <Grid size={{ xs: 12, md: 4 }}>
                            <Paper
                              variant="outlined"
                              sx={{ p: 0.5, borderRadius: 2, bgcolor: 'grey.50' }}
                            >
                              <Stack direction="row" spacing={3} alignItems="center" ml={2}>
                                <Iconify icon="mdi:shape" width={22} />
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    textTransform="uppercase"
                                  >
                                    Category
                                  </Typography>
                                  <Typography variant="body1" fontWeight={600}>
                                    {selectedBook?.book.category || '-'}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Paper>
                          </Grid>
                          <Grid size={{ xs: 12, md: 4 }}>
                            <Paper
                              variant="outlined"
                              sx={{ p: 0.5, borderRadius: 2, bgcolor: 'grey.50' }}
                            >
                              <Stack direction="row" spacing={3} alignItems="center" ml={2}>
                                <Iconify icon="mdi:book-open-variant" width={22} />
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    textTransform="uppercase"
                                  >
                                    No. of Pages
                                  </Typography>
                                  <Typography variant="body1" fontWeight={600}>
                                    {selectedBook?.book.numberOfPages || '-'}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Paper>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              );
            }

            if (formik.values.accessionNumber !== '') {
              return (
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
                    Accession number &quot;{formik.values.accessionNumber}&quot; not found.
                  </div>
                </Grid>
              );
            }
            return null;
          })()}

          {selectedBook && (
            <Grid size={{ xs: 12 }}>
              <ShakingTextField error={!!(formik.touched.memberId && formik.errors.memberId)}>
                <TextField
                  variant="outlined"
                  size="small"
                  value={formik.values.memberId}
                  onChange={(e) => handleMemberSearch(e.target.value)}
                  label="Search Member Id"
                  fullWidth
                  error={!!(formik.touched.memberId && formik.errors.memberId)}
                  helperText={(formik.touched.memberId && formik.errors.memberId) as string}
                  placeholder="Search By Member Id (M001, M002)"
                  sx={{ flex: 1 }}
                />
              </ShakingTextField>
            </Grid>
          )}

          {(() => {
            if (loadingMember) {
              return (
                <Grid size={{ xs: 12 }}>
                  <Box display="flex" justifyContent="center" alignItems="center">
                    <CircularProgress size={20} />
                  </Box>
                </Grid>
              );
            }

            if (selectedMember) {
              return (
                <Grid size={{ xs: 12 }}>
                  <Card
                    variant="outlined"
                    sx={{
                      boxShadow: 'var(--shadows-8)',
                      p: 2,
                      background: '#fff',
                      borderRadius: 3,
                    }}
                  >
                    <Grid container spacing={2} alignItems="center">
                      {/* Avatar */}
                      <Grid
                        size={{ xs: 12, md: 2 }}
                        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Avatar src={selectedMember.avatarUrl} sx={{ width: 80, height: 80 }} />
                      </Grid>
                      {/* Member Info */}
                      <Grid size={{ xs: 12, md: 10 }}>
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, md: 4 }}>
                            <Paper
                              variant="outlined"
                              sx={{ p: 0.5, borderRadius: 2, bgcolor: 'grey.50' }}
                            >
                              <Stack direction="row" spacing={2} alignItems="center" ml={2}>
                                <Iconify icon="mdi:account" width={22} />
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    textTransform="uppercase"
                                  >
                                    Member Name
                                  </Typography>
                                  <Typography variant="body1" fontWeight={600}>
                                    {selectedMember.name}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Paper>
                          </Grid>
                          <Grid size={{ xs: 12, md: 4 }}>
                            <Paper
                              variant="outlined"
                              sx={{ p: 0.5, borderRadius: 2, bgcolor: 'grey.50' }}
                            >
                              <Stack direction="row" spacing={2} alignItems="center" ml={2}>
                                <Iconify icon="mdi:card-account-details" width={22} />
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    textTransform="uppercase"
                                  >
                                    Member ID
                                  </Typography>
                                  <Typography variant="body1" fontWeight={600}>
                                    {selectedMember.memberId}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Paper>
                          </Grid>
                          <Grid size={{ xs: 12, md: 4 }}>
                            <Paper
                              variant="outlined"
                              sx={{ p: 0.5, borderRadius: 2, bgcolor: 'grey.50' }}
                            >
                              <Stack direction="row" spacing={2} alignItems="center" ml={2}>
                                <Iconify icon="mdi:email" width={22} />
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    textTransform="uppercase"
                                  >
                                    Email
                                  </Typography>
                                  <Typography variant="body1" fontWeight={600} noWrap>
                                    {selectedMember.email || 'N/A'}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Paper>
                          </Grid>
                          <Grid size={{ xs: 12, md: 4 }}>
                            <Paper
                              variant="outlined"
                              sx={{ p: 0.5, borderRadius: 2, bgcolor: 'grey.50' }}
                            >
                              <Stack direction="row" spacing={2} alignItems="center" ml={2}>
                                <Iconify icon="mdi:school" width={22} />
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    textTransform="uppercase"
                                  >
                                    Class/Division
                                  </Typography>
                                  <Typography variant="body1" fontWeight={600}>
                                    {(selectedMember.class || 'N/A') +
                                      (selectedMember.division
                                        ? ` - ${selectedMember.division}`
                                        : '')}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Paper>
                          </Grid>
                          <Grid size={{ xs: 12, md: 4 }}>
                            <Paper
                              variant="outlined"
                              sx={{ p: 0.5, borderRadius: 2, bgcolor: 'grey.50' }}
                            >
                              <Stack direction="row" spacing={2} alignItems="center" ml={2}>
                                <Iconify icon="mdi:format-list-numbered" width={22} />
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    textTransform="uppercase"
                                  >
                                    Roll No.
                                  </Typography>
                                  <Typography variant="body1" fontWeight={600}>
                                    {selectedMember.rollNo || 'N/A'}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Paper>
                          </Grid>
                          <Grid size={{ xs: 12, md: 4 }}>
                            <Paper
                              variant="outlined"
                              sx={{ p: 0.5, borderRadius: 2, bgcolor: 'grey.50' }}
                            >
                              <Stack direction="row" spacing={2} alignItems="center" ml={2}>
                                <Iconify icon="mdi:card-account-details-outline" width={22} />
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    textTransform="uppercase"
                                  >
                                    GR No.
                                  </Typography>
                                  <Typography variant="body1" fontWeight={600}>
                                    {selectedMember.grNo || 'N/A'}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Paper>
                          </Grid>
                          <Grid size={{ xs: 12, md: 4 }}>
                            <Paper
                              variant="outlined"
                              sx={{ p: 0.5, borderRadius: 2, bgcolor: 'grey.50' }}
                            >
                              <Stack direction="row" spacing={2} alignItems="center" ml={2}>
                                <Iconify icon="mdi:phone" width={22} />
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    textTransform="uppercase"
                                  >
                                    Phone
                                  </Typography>
                                  <Typography variant="body1" fontWeight={600}>
                                    {selectedMember.contactNo || 'N/A'}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Paper>
                          </Grid>
                          <Grid size={{ xs: 12, md: 4 }}>
                            <Paper
                              variant="outlined"
                              sx={{ p: 0.5, borderRadius: 2, bgcolor: 'grey.50' }}
                            >
                              <Stack direction="row" spacing={2} alignItems="center" ml={2}>
                                <Iconify icon="mdi:account-group" width={22} />
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    textTransform="uppercase"
                                  >
                                    Role
                                  </Typography>
                                  <Typography variant="body1" fontWeight={600}>
                                    {selectedMember.role}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Paper>
                          </Grid>
                          <Grid size={{ xs: 12, md: 4 }}>
                            <Paper
                              variant="outlined"
                              sx={{ p: 0.5, borderRadius: 2, bgcolor: 'grey.50' }}
                            >
                              <Stack direction="row" spacing={2} alignItems="center" ml={2}>
                                <Iconify icon="mdi:calendar-check" width={22} />
                                <Box>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    textTransform="uppercase"
                                  >
                                    Join Date
                                  </Typography>
                                  <Typography variant="body1" fontWeight={600}>
                                    {selectedMember.joinDate || 'N/A'}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Paper>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
              );
            }

            if (formik.values.memberId !== '') {
              return (
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
                    Member with ID or name &quot;{formik.values.memberId}&quot; not found.
                  </div>
                </Grid>
              );
            }
            return null;
          })()}

          {selectedBook && selectedMember && (
            <>
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={!!(formik.touched.issueDate && formik.errors.issueDate)}>
                  <DatePicker
                    label="Issue Date *"
                    format="DD-MM-YYYY"
                    value={formik.values.issueDate}
                    onChange={(newValue) => {
                      formik.setFieldValue('issueDate', newValue);
                      formik.setFieldTouched('issueDate', false);
                    }}
                    minDate={dayjs(currentYear?.startDate)}
                    maxDate={dayjs(currentYear?.endDate)}
                    sx={{ minWidth: 180, width: '100%' }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                        error: !!(formik.touched.issueDate && formik.errors.issueDate),
                        helperText: (formik.touched.issueDate && formik.errors.issueDate) as string,
                      },
                    }}
                  />
                </ShakingTextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={!!(formik.touched.dueDate && formik.errors.dueDate)}>
                  <DatePicker
                    label="Due Date *"
                    format="DD-MM-YYYY"
                    value={formik.values.dueDate}
                    onChange={(newValue) => {
                      formik.setFieldValue('dueDate', newValue);
                      formik.setFieldTouched('dueDate', false);
                    }}
                    minDate={dayjs(formik.values.issueDate || currentYear?.startDate)} // ensures due date is after issue date
                    maxDate={dayjs(currentYear?.endDate)}
                    sx={{ minWidth: 180, width: '100%' }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                        error: !!(formik.touched.dueDate && formik.errors.dueDate),
                        helperText: (formik.touched.dueDate && formik.errors.dueDate) as string,
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
          startIcon={<Iconify icon="cib:stackoverflow" width={16} height={16} />}
          onClick={(e: any) => {
            formik.handleSubmit(e);
          }}
          size="small"
          variant="contained"
        >
          Issue
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default IssueBookModal;
