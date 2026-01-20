import type { RootState } from 'src/redux/store';
import type {
  IBookCopy,
  IBookCopyWithBook,
} from 'src/screens/library/BookManagement/Components/type';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { Stack } from '@mui/system';
import { useSelector } from 'react-redux';
import debounce from 'src/utils/debounce';
import { GlobalIcons } from 'src/utils/icons';
import React, { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { DatePicker } from '@mui/x-date-pickers';
import { ExpandMore } from '@mui/icons-material';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetAllMembersQuery } from 'src/redux/library/bookList/memberApi';
import { useGetAllCopiesQuery } from 'src/redux/library/bookList/copies-api';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { useGetBookDetailsByAccessionQuery } from 'src/redux/library/issueAndReturnApi/issueAndReturnApi';
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

import { getInitialValues } from './getBookIssueInitialValues';
import libraryDummyData from '../../../../../../libraryData.json';
import { getIssueBookSchema } from './getBookIssueValidatonSchema';

export interface IssueBookFormProps {
  onClose: (e: any, isSubmit: boolean) => void;
  editData: IBookCopyWithBook | null;
}

const IssueBookModal: React.FC<IssueBookFormProps> = ({ onClose, editData }) => {
  const [selectedBook, setSelectedBook] = useState<IBookCopyWithBook | null>(editData);
  const [selectedMember, setSelectedMember] = useState<any | null>(editData?.memberId || null);
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [books] = useState(libraryDummyData.books);
  const [loading, setLoading] = useState(false);
  const [loadingMember, setLoadingMember] = useState(false);
  const [expandedBook, setExpandedBook] = useState(false);
  const [expandedMemberAccordion, setExpandedMemberAccordion] = useState(false);

  // Debounce states
  const [debouncedAccessionNumber, setDebouncedAccessionNumber] = useState(
    editData?.accessionNo || ''
  );
  const [debouncedMemberId, setDebouncedMemberId] = useState(editData?.memberId || '');

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: bookData, isLoading: isLoadingBookData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBookDetailsByAccessionQuery,
    params: { accessionNo: debouncedAccessionNumber, academicYearId: currentYear?.id },
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: memberData, isLoading: isLoadingMemberData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAllMembersQuery,
  });
  const { data: copies } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAllCopiesQuery,
  });

  // Accession Number Search Handler
  const handleAccessionNumberChange = (value: string) => {
    formik.setFieldValue('accessionNumber', value);

    if (!value) {
      setSelectedBook(null);
      setDebouncedAccessionNumber('');
      setLoading(false);
      return;
    }

    setLoading(true);
    debounce(() => {
      setDebouncedAccessionNumber(value);
      const foundCopy = copies?.find((c: IBookCopy) => c.accessionNo === value);
      const foundBook = foundCopy
        ? {
            ...foundCopy,
            book: books?.find((b) => b.id === foundCopy.bookId),
          }
        : null;

      if (foundBook) {
        setSelectedBook(foundBook);
      } else {
        setSelectedBook(null);
      }
      setLoading(false);
    }, 800);
  };

  // Book details using useMemo
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

  // Member details using useMemo
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

    // Add student-specific fields if role is Student
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

  // Member ID Search Handler
  const handleMemberIdChange = (value: string) => {
    formik.setFieldValue('memberId', value);

    if (!value) {
      setSelectedMember(null);
      setDebouncedMemberId('');
      return;
    }

    setLoadingMember(true);
    debounce(() => {
      setDebouncedMemberId(value);
      const searchValue = value.toLowerCase().trim();

      const foundMember = memberData?.find(
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
    }, 800);
  };

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
                  label="Search by Accession No. *"
                  size="small"
                  fullWidth
                  value={formik.values.accessionNumber}
                  onChange={(e) => handleAccessionNumberChange(e.target.value)}
                  disabled={!!editData}
                  error={!!(formik.touched.accessionNumber && formik.errors.accessionNumber)}
                  helperText={
                    (formik.touched.accessionNumber && formik.errors.accessionNumber) as string
                  }
                  placeholder="Enter Accession No. (e.g., ACC-0001, ACC-0002, ACC-0003)"
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
                  <Accordion
                    expanded={expandedBook}
                    onChange={() => setExpandedBook(!expandedBook)}
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
              );
            }

            if (
              formik.values.accessionNumber !== '' &&
              formik.values.accessionNumber === debouncedAccessionNumber
            ) {
              return (
                <Grid size={{ xs: 12 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: '#ffebee',
                      borderRadius: 1,
                      border: '1px solid #f44336',
                      color: '#d32f2f',
                      textAlign: 'center',
                    }}
                  >
                    Accession number &quot;{formik.values.accessionNumber}&quot; not found.
                  </Box>
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
                  onChange={(e) => handleMemberIdChange(e.target.value)}
                  label="Search Member Id *"
                  fullWidth
                  error={!!(formik.touched.memberId && formik.errors.memberId)}
                  helperText={(formik.touched.memberId && formik.errors.memberId) as string}
                  placeholder="Enter Member Id (M001, M002)"
                  InputProps={{
                    endAdornment: (
                      <>
                        {formik.values.memberId !== debouncedMemberId && (
                          <CircularProgress size={20} />
                        )}
                      </>
                    ),
                  }}
                />
              </ShakingTextField>
            </Grid>
          )}

          {/* Member Details */}
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
              );
            }

            if (formik.values.memberId !== '' && formik.values.memberId === debouncedMemberId) {
              return (
                <Grid size={{ xs: 12 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: '#ffebee',
                      borderRadius: 1,
                      border: '1px solid #f44336',
                      color: '#d32f2f',
                      textAlign: 'center',
                    }}
                  >
                    Member with ID or name &quot;{formik.values.memberId}&quot; not found.
                  </Box>
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
                    maxDate={dayjs()}
                    sx={{ width: '100%' }}
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
                    minDate={dayjs(formik.values.issueDate || currentYear?.startDate)}
                    maxDate={dayjs(currentYear?.endDate)}
                    sx={{ width: '100%' }}
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
          startIcon={<Iconify icon={GlobalIcons.cancel} width={16} height={10} />}
          sx={{ minWidth: 120, px: 3 }}
        >
          Cancel
        </Button>
        <Button
          startIcon={<Iconify icon="octicon:issue-closed-16" width={16} height={10} />}
          onClick={(e: any) => {
            formik.handleSubmit(e);
          }}
          size="small"
          variant="contained"
          sx={{ minWidth: 120, px: 3 }}
        >
          Issue
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default IssueBookModal;
