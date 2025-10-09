import type { RootState } from 'src/redux/store';
import type { IBook, IBookCopyWithBook } from 'src/screens/library/BookManagement/Components/type';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { DatePicker } from '@mui/x-date-pickers';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetAllMembersQuery } from 'src/redux/library/bookList/memberApi';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
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

import { getInitialValues } from './getBookIssueInitialValues';
import libraryDummyData from '../../../../../../libraryData.json';
import { getIssueBookSchema } from './getBookIssueValidatonSchema';

// basic validation schema (customize as per your logic)

export interface IssueBookFormProps {
  onClose: (e: any, isSubmit: boolean) => void;
  editData: IBookCopyWithBook | null;
}

const IssueBookModal: React.FC<IssueBookFormProps> = ({ onClose, editData }) => {
  const [searchBook, setSearchBook] = useState(editData?.accessionNo || '');
  const [searchMember, setSearchMember] = useState('');
  const [selectedBook, setSelectedBook] = useState<IBook | null>(editData?.book || null);
  const [selectedMember, setSelectedMember] = useState<any | null>(editData?.memberId || null);
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [books, setBooks] = useState(libraryDummyData.books);

  const [loading, setLoading] = useState(false);
  const [loadingMember, setLoadingMember] = useState(false);

  const { data: memberData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAllMembersQuery,
  });

  const handleSearchBook = () => {
    const { accessionNumber } = formik.values;
    if (!accessionNumber) return;

    setTimeout(() => {
      const foundBook = books.find((book: IBook) =>
        book.copies?.some((copy) => copy.accessionNo === accessionNumber)
      );

      if (foundBook) {
        setSelectedBook(foundBook);
      } else {
        setSelectedBook(null);
        shikshaMitraToast.error({ message: 'No book found for this accession number.' });
      }
      setLoading(false);
    }, 400);
  };

  const handleMemberSearch = () => {
    const searchValue = searchMember.trim().toLowerCase();
    if (!searchValue) return;
    setLoadingMember(true);
    setTimeout(() => {
      const foundMember = memberData.find(
        (member: any) =>
          member.memberId?.toLowerCase() === searchValue ||
          member.name?.toLowerCase().includes(searchValue) ||
          member.rollNo?.toLowerCase() === searchValue
      );
      if (foundMember) {
        setSelectedMember(foundMember);
        formik.setFieldValue('memberId', foundMember.memberId);
        formik.setFieldValue('memberName', foundMember.name || '');
        formik.setFieldValue('role', foundMember.role);
        formik.setFieldValue('class', foundMember.className || '');
        formik.setFieldValue('division', foundMember.division || '');
      } else {
        setSelectedMember(null);
        shikshaMitraToast.error({ message: 'No member found.' });
      }
      setLoadingMember(false);
    }, 400);
  };

  const handleClearBook = () => {
    setSearchBook('');
    setSelectedBook(null);
    formik.setFieldValue('bookTitle', '');
  };

  const handleClearMember = () => {
    setSearchMember('');
    setSelectedMember(null);
    formik.setFieldValue('member', '');
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
          <Grid size={{ xs: 12 }}>
            <Stack direction="row" spacing={2}>
              <TextField
                variant="outlined"
                size="small"
                value={searchBook}
                disabled={!!selectedBook}
                label="Scan Barcode or Search by Accession No."
                onChange={(e) => setSearchBook(e.target.value)}
                sx={{ flex: 1 }}
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
                disabled={!!selectedBook}
                startIcon={<SearchIcon />}
                onClick={() => {
                  handleSearchBook();
                }}
                sx={{ px: 3 }}
              >
                Search
              </Button>
            </Stack>
          </Grid>

          {loading ? (
            <Grid size={{ xs: 12 }}>
              <Box display="flex" justifyContent="center" alignItems="center">
                <CircularProgress size={20} />
              </Box>
            </Grid>
          ) : selectedBook ? (
            <Card variant="outlined" sx={{ boxShadow: 'var(--shadows-8)', p: 2 }}>
              <CardContent sx={{ p: '0 !important' }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box
                      component="img"
                      src={selectedBook.bookCoverImages?.[0] || '/placeholder-book.jpg'}
                      alt={selectedBook.title}
                      sx={{
                        width: 240,
                        height: 210,
                        borderRadius: 2,
                        objectFit: 'cover',
                        flexShrink: 0,
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography fontWeight={600}>Book Title</Typography>
                        <Typography>{selectedBook.title}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography fontWeight={600}>Accession No.</Typography>
                        <Typography>{editData?.accessionNo}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography fontWeight={600}>Author</Typography>
                        <Typography>{selectedBook.author}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography fontWeight={600}>ISBN</Typography>
                        <Typography>{selectedBook.isbn}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography fontWeight={600}>Publisher</Typography>
                        <Typography>{selectedBook.publisher}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Typography fontWeight={600}>Year</Typography>
                        <Typography>{dayjs(selectedBook.createdOn).format('YYYY')}</Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ) : null}

          <Grid size={{ xs: 12 }}>
            <Stack direction="row" spacing={2}>
              <TextField
                variant="outlined"
                size="small"
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                label="Search Member Id"
                sx={{ flex: 1 }}
                disabled={!!selectedMember}
                InputProps={{
                  endAdornment: searchMember && (
                    <IconButton
                      size="small"
                      onClick={handleClearMember}
                      disabled={!!selectedMember}
                    >
                      <ClearIcon />
                    </IconButton>
                  ),
                }}
              />
              <Button
                variant="contained"
                color="primary"
                startIcon={<SearchIcon />}
                disabled={!!selectedMember}
                onClick={handleMemberSearch}
                sx={{ px: 3 }}
              >
                Search
              </Button>
            </Stack>
          </Grid>

          {loadingMember ? (
            <Grid size={{ xs: 12 }}>
              <Box display="flex" justifyContent="center" alignItems="center">
                <CircularProgress size={20} />
              </Box>
            </Grid>
          ) : selectedMember ? (
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
          ) : null}

          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField error={!!(formik.touched.issueDate && formik.errors.issueDate)}>
              <DatePicker
                label="Issue Date *"
                format="DD-MM-YYYY"
                value={formik.values.issueDate}
                onChange={(newValue) => {
                  formik.setFieldValue('issueDate', newValue);
                  formik.setFieldTouched('issueDate', true);
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
                  formik.setFieldTouched('dueDate', true);
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
          startIcon={<Iconify icon={GlobalIcons.submit} width={16} height={16} />}
          onClick={(e: any) => {
            formik.handleSubmit(e);
          }}
          size="small"
          variant="contained"
        >
          Submit
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default IssueBookModal;
