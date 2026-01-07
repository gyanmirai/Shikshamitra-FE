'use client';

import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import Image from 'next/image';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import debounce from 'src/utils/debounce';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { DatePicker } from '@mui/x-date-pickers';
import { ExpandMore } from '@mui/icons-material';
import noCover from 'src/assets/icons/no-cover.png';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  useAddLibraryChargeMutation,
  useUpdateLibraryChargeMutation,
} from 'src/redux/library/charges-management/charges-get-api';
import {
  Box,
  Grid,
  Stack,
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

import { assignLibraryChargeInitialValues } from './AssignChargeInitialValues';
import { assignLibraryChargeValidationSchema } from './AssignChargesValidationSchema';

import type { IAssignChargesFormProps } from './type';

// Static Data
const staticRoles = [
  { id: '1', role: 'Employee' },
  { id: '2', role: 'Student' },
];

export const staticChargeCategories = [
  { id: 'None', name: 'None', amount: '', isFixed: false },
  { id: 'Late Book Return', name: 'Late Book Return', amount: '', isFixed: false },
  { id: 'Damaged Book', name: 'Damaged Book', amount: '', isFixed: false },
  { id: 'Lost Book', name: 'Lost Book', amount: '', isFixed: false },
  { id: 'Membership Renewal', name: 'Membership Renewal', amount: 100, isFixed: true },
  { id: 'Reservation Fee', name: 'Reservation Fee', amount: 30, isFixed: true },
];

const staticBookTitles = [
  { id: 'title1', label: 'Introduction to Physics', value: 'Introduction to Physics' },
  { id: 'title2', label: 'Advanced Chemistry', value: 'Advanced Chemistry' },
  { id: 'title3', label: 'Science Explorer', value: 'Science Explorer' },
  { id: 'title4', label: 'Mathematics Grade 10', value: 'Mathematics Grade 10' },
];

const staticClasses = [
  {
    id: '10',
    name: '10',
    divisions: [
      { id: 'A', name: 'A' },
      { id: 'B', name: 'B' },
    ],
  },
  {
    id: '9',
    name: ' 9',
    divisions: [
      { id: 'A', name: 'A' },
      { id: 'B', name: 'B' },
    ],
  },
  {
    id: '12',
    name: ' 12',
    divisions: [
      { id: 'A', name: 'A' },
      { id: 'B', name: 'B' },
      { id: 'D', name: 'D' },
    ],
  },
  {
    id: '7',
    name: ' 7',
    divisions: [
      { id: 'A', name: 'A' },
      { id: 'B', name: 'B' },
    ],
  },
];

const staticMembers = [
  {
    id: '1',
    memberId: 'M001',
    class: '10',
    division: 'A',
    reservedBook: 'Introduction to Computer Science',
    accessionNo: 'ACC01',
    grNo: 'G001',
    role: 'Student',
    name: 'Dharmik Jinjala',
    email: 'dharmik@school.edu',
    contactNo: '9876543210',
    joinDate: '2023-06-15',
    currentIssue: 4,
    overdueReturn: 1,
    memberStatus: '0',
    requestedDate: '2025-09-15T10:30:00Z',
    reserveDueDate: '2025-09-22T10:30:00Z',
    rollNo: '1',
    avatarUrl: 'https://randomuser.me/api/portraits/men/10.jpg',
  },
  {
    id: '2',
    memberId: 'M002',
    class: '-',
    division: '-',
    reservedBook: 'Introduction to Computer Science',
    accessionNo: 'ACC01',
    grNo: '-',
    role: 'Employee',
    name: 'Prerna Atre',
    email: 'prerna.atre@school.edu',
    contactNo: '9123456789',
    joinDate: '2021-04-10',
    currentIssue: 1,
    overdueReturn: 0,
    memberStatus: '0',
    requestedDate: '2025-09-16T09:45:00Z',
    reserveDueDate: '2025-09-23T09:45:00Z',
    avatarUrl: 'https://randomuser.me/api/portraits/women/5.jpg',
  },
  {
    id: '3',
    memberId: 'M003',
    class: '12',
    division: 'C',
    reservedBook: 'Introduction to Computer Science',
    accessionNo: 'ACC01',
    grNo: 'G003',
    role: 'Student',
    name: 'Parth Ghusar',
    email: 'parth.ghusar@school.edu',
    contactNo: '9988776655',
    joinDate: '2022-07-01',
    currentIssue: 2,
    overdueReturn: 0,
    memberStatus: '1',
    requestedDate: '2025-09-17T11:00:00Z',
    reserveDueDate: '2025-09-24T11:00:00Z',
    rollNo: '2',
    avatarUrl: 'https://randomuser.me/api/portraits/men/12.jpg',
  },
  {
    id: '4',
    memberId: 'M004',
    class: '11',
    division: 'A',
    reservedBook: 'Introduction to Computer Science',
    accessionNo: 'ACC01',
    grNo: 'G004',
    role: 'Student',
    name: 'Mayur Solanki',
    email: 'mayur.solanki@school.edu',
    contactNo: '9876543211',
    joinDate: '2023-03-20',
    currentIssue: 0,
    overdueReturn: 2,
    memberStatus: '0',
    requestedDate: '2025-09-18T13:15:00Z',
    reserveDueDate: '2025-09-25T13:15:00Z',
    rollNo: '3',
    avatarUrl: 'https://randomuser.me/api/portraits/men/15.jpg',
  },
  {
    id: '5',
    memberId: 'M005',
    class: '9',
    division: 'D',
    reservedBook: 'Introduction to Computer Science',
    accessionNo: 'ACC01',
    grNo: 'G005',
    role: 'Student',
    name: 'Raj Baku',
    email: 'raj.baku@school.edu',
    contactNo: '9123456788',
    joinDate: '2024-01-05',
    currentIssue: 7,
    overdueReturn: 0,
    memberStatus: '1',
    requestedDate: '2025-09-19T08:20:00Z',
    reserveDueDate: '2025-09-26T08:20:00Z',
    rollNo: '4',
    avatarUrl: 'https://randomuser.me/api/portraits/men/25.jpg',
  },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const staticBooks = [
  {
    bookNumber: 'BK001',
    title: 'Introduction to Physics',
    author: 'Dr. John Smith',
    isbn: '978-0123456789',
    category: 'Science',
    publisher: 'Academic Press',
    edition: '3rd Edition',
  },
  {
    bookNumber: 'BK002',
    title: 'Advanced Chemistry',
    author: 'Prof. Sarah Johnson',
    isbn: '978-0987654321',
    category: 'Science',
    publisher: 'Scientific Publications',
    edition: '2nd Edition',
  },
  {
    bookNumber: 'BK003',
    title: 'Science Explorer',
    author: 'Dr. Michael Brown',
    isbn: '978-0456789123',
    category: 'General Science',
    publisher: 'Education Books',
    edition: '1st Edition',
  },
  {
    bookNumber: 'BK004',
    title: 'Mathematics Grade 10',
    author: 'Prof. Lisa Wilson',
    isbn: '978-0321654987',
    category: 'Mathematics',
    publisher: 'Math Publishers',
    edition: '4th Edition',
  },
];

// Helper to fill missing fields from static data
function fillEditData(editData: any) {
  if (!editData) return null;
  return {
    role: editData.role || staticRoles[0].role,
    class: editData.classNo || staticClasses[0].id,
    division: editData.division || staticClasses[0].divisions[0].id,
    member: editData.memberId || staticMembers[0].id,
    bookTitle: editData.bookTitle || staticBookTitles[0].value,
    chargeCategory: editData.chargeCategory || staticChargeCategories[0].id,
    amount:
      editData.fineAmount !== undefined
        ? editData.fineAmount
        : staticChargeCategories.find((cat) => cat.id === editData.chargeCategory)?.amount || '',
    dueDate: editData.dueDate || '',
    reason: editData.reason || '',
    // Add other fields as needed
  };
}

const AssignChargesForm: React.FC<IAssignChargesFormProps> = ({ open, onClose, editData }) => {
  const { currentYear, currentAcademicYearId } = useSelector(
    (state: RootState) => state.globalState
  );
  const [expandedMemberAccordion, setExpandedMemberAccordion] = useState(false);
  const [loadingMember, setLoadingMember] = useState(false);
  const [loadingBook, setLoadingBook] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [selectedBook, setSelectedBook] = useState<any | null>(null);
  const [expandedBookAccordion, setExpandedBookAccordion] = useState(false);

  // Debounced states to track when debounce completes
  const [debouncedMemberId, setDebouncedMemberId] = useState('');
  const [debouncedBookNumber, setDebouncedBookNumber] = useState('');

  // Add library charge mutation hook
  const { addLibraryCharge } = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddLibraryChargeMutation,
  });

  // Update library charge mutation hook
  const { updateLibraryCharge } = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateLibraryChargeMutation,
  });

  const formik = useFormik({
    initialValues: assignLibraryChargeInitialValues(fillEditData(editData)),
    validationSchema: assignLibraryChargeValidationSchema(currentYear),
    onSubmit: async (values) => {
      // Construct payload matching API specification
      const payload = {
        memberId: values.memberId,
        accessionNo: values.bookNumber,
        chargeCategory: values.chargeCategory,
        amount: Number(values.amount),
        dueDate: values.dueDate,
        reason: values.reason,
      };

      if (editData) {
        // Update existing charge - PUT /library/charges/{chargeId}?academicYearId={academicYearId}
        await updateLibraryCharge({
          chargeId: editData.id,
          data: payload,
          academicYearId: currentAcademicYearId,
        });
        shikshaMitraToast.success({
          message: 'Charge updated successfully',
        });
      } else {
        // Create new charge - POST /library/charges/create
        await addLibraryCharge(payload);
        shikshaMitraToast.success({
          message: 'Charge assigned successfully',
        });
      }
      onClose(null, true);
    },
  });

  // Handle member search
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
      const foundMember = staticMembers.find((m) => m.memberId === value);

      if (foundMember) {
        setSelectedMember(foundMember);
      } else {
        setSelectedMember(null);
      }
      setLoadingMember(false);
    }, 800);
  };

  // Handle book number change
  const handleBookNumberChange = (value: string) => {
    formik.setFieldValue('bookNumber', value);

    if (!value) {
      setSelectedBook(null);
      setDebouncedBookNumber('');
      return;
    }

    setLoadingBook(true);
    debounce(() => {
      setDebouncedBookNumber(value);
      if (value === 'ACC-0001') {
        setSelectedBook({
          bookNumber: 'ACC-0001',
          title: 'Introduction to Physics',
          author: 'Dr. John Smith',
          isbn: '978-0123456789',
          category: 'Science',
          publisher: 'Academic Press',
          edition: '3rd Edition',
          coverImage: '/placeholder-book.jpg',
        });
      } else {
        setSelectedBook(null);
      }
      setLoadingBook(false);
    }, 800);
  };

  // Member details calculation
  const memberDetails = selectedMember
    ? [
        { label: 'Member Name', icon: 'mdi:account', value: selectedMember.name || '—' },
        { label: 'Email', icon: 'mdi:email', value: selectedMember.email || '—' },
        {
          label: 'Member ID',
          icon: 'mdi:card-account-details',
          value: selectedMember.memberId || '—',
        },
        ...(selectedMember.role === 'Student'
          ? [
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
              },
            ]
          : []),
        { label: 'Phone', icon: 'mdi:phone', value: selectedMember.contactNo || '—' },
        { label: 'Role', icon: 'mdi:account-group', value: selectedMember.role || '—' },
        { label: 'Join Date', icon: 'mdi:calendar-check', value: selectedMember.joinDate || '—' },
      ]
    : [];

  // Book details calculation
  const bookDetails = selectedBook
    ? [
        {
          label: 'Book Title',
          icon: 'mdi:book-open-page-variant',
          value: selectedBook.title || '—',
        },
        { label: 'Accession No.', icon: 'mdi:barcode', value: selectedBook.bookNumber || '—' },
        { label: 'Author', icon: 'mdi:account-edit', value: selectedBook.author || '—' },
        { label: 'ISBN', icon: 'mdi:barcode-scan', value: selectedBook.isbn || '—' },
        { label: 'Publisher', icon: 'mdi:domain', value: selectedBook.publisher || '—' },
        { label: 'Edition', icon: 'mdi:book-variant', value: selectedBook.edition || '—' },
        { label: 'Category', icon: 'mdi:shape', value: selectedBook.category || '—' },
      ]
    : [];

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={3}>
          {/* Member ID */}
          <Grid size={{ xs: 12 }}>
            <ShakingTextField error={!!(formik.touched.memberId && formik.errors.memberId)}>
              <TextField
                label="Member ID *"
                size="small"
                fullWidth
                value={formik.values.memberId}
                onChange={(e) => handleMemberIdChange(e.target.value)}
                error={!!(formik.touched.memberId && formik.errors.memberId)}
                helperText={(formik.touched.memberId && formik.errors.memberId) as string}
                placeholder="Enter member ID (e.g., M001, M002, M003)"
              />
            </ShakingTextField>
          </Grid>

          {/* Member Details Display */}
          {(() => {
            if (loadingMember) {
              return (
                <Grid size={{ xs: 12 }}>
                  <Box display="flex" justifyContent="center" alignItems="center" py={2}>
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
                    Member with ID &quot;{formik.values.memberId}&quot; not found.
                  </Box>
                </Grid>
              );
            }
            return null;
          })()}

          {/* Book Number */}
          <Grid size={{ xs: 12 }}>
            <ShakingTextField error={!!(formik.touched.bookNumber && formik.errors.bookNumber)}>
              <TextField
                label="Accession no *"
                size="small"
                fullWidth
                value={formik.values.bookNumber}
                onChange={(e) => handleBookNumberChange(e.target.value)}
                error={!!(formik.touched.bookNumber && formik.errors.bookNumber)}
                helperText={(formik.touched.bookNumber && formik.errors.bookNumber) as string}
                placeholder="Enter Accession no (e.g., ACC-0001)"
              />
            </ShakingTextField>
          </Grid>

          {/* Book Details Display */}
          {(() => {
            if (loadingBook) {
              return (
                <Grid size={{ xs: 12 }}>
                  <Box display="flex" justifyContent="center" alignItems="center" py={2}>
                    <CircularProgress size={20} />
                  </Box>
                </Grid>
              );
            }

            if (selectedBook) {
              return (
                <Grid size={{ xs: 12 }}>
                  <Accordion
                    expanded={expandedBookAccordion}
                    onChange={() => setExpandedBookAccordion(!expandedBookAccordion)}
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
                        mb={expandedBookAccordion ? 0 : 1}
                      >
                        Book Details
                      </Typography>

                      {/* Show preview when collapsed */}
                      {!expandedBookAccordion && (
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
                                >
                                  {selectedBook.title || '—'}
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
                                  {selectedBook.bookNumber || '—'}
                                </Typography>
                              </Box>
                            </Stack>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 4 }}>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Iconify icon="mdi:account-edit" width={18} color="text.secondary" />
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
                                >
                                  {selectedBook.author || '—'}
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
                          <Image
                            src={noCover}
                            alt={selectedBook?.title || 'No Preview'}
                            width={250}
                            height={250}
                            unoptimized
                            style={{
                              width: '100%',
                              height: '120px',
                              maxWidth: 150,
                              borderRadius: 8,
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
              formik.values.bookNumber !== '' &&
              formik.values.bookNumber === debouncedBookNumber
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
                    Book with Accession no &quot;{formik.values.bookNumber}&quot; not found.
                  </Box>
                </Grid>
              );
            }
            return null;
          })()}

          {/* Charge Category */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField
              error={!!(formik.touched.chargeCategory && formik.errors.chargeCategory)}
            >
              <CustomSelect
                label="Charge Category *"
                options={staticChargeCategories || []}
                value={formik.values.chargeCategory}
                onChange={(val) => {
                  formik.setFieldValue('chargeCategory', val);
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
                  const rawValue = e.target.value.replace(/[^0-9.]/g, '');
                  formik.setFieldValue('amount', rawValue ? Number(rawValue) : '');
                }}
              />
            </ShakingTextField>
          </Grid>

          {/* Due Date */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField error={!!(formik.touched.dueDate && formik.errors.dueDate)}>
              <DatePicker
                label="Due Date *"
                format="DD/MM/YYYY"
                value={formik.values.dueDate}
                onChange={(newValue) => {
                  formik.setFieldValue('dueDate', newValue);
                }}
                minDate={dayjs(currentYear?.startDate)}
                maxDate={dayjs(currentYear?.endDate)}
                sx={{ minWidth: 180, width: '100%' }}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    error: !!(formik.touched.dueDate && formik.errors.dueDate),
                    helperText: (formik.touched.dueDate && formik.errors.dueDate) as string,
                  },
                }}
              />
            </ShakingTextField>
          </Grid>

          {/* Reason */}
          <Grid size={{ xs: 12 }}>
            <ShakingTextField error={!!(formik.touched.reason && formik.errors.reason)}>
              <TextField
                label="Reason of Charge *"
                size="small"
                fullWidth
                multiline
                minRows={2}
                value={formik.values.reason}
                onChange={(e) => formik.setFieldValue('reason', e.target.value)}
                error={!!(formik.touched.reason && formik.errors.reason)}
                helperText={(formik.touched.reason && formik.errors.reason) as string}
              />
            </ShakingTextField>
          </Grid>
        </Grid>
      </DialogScrollContent>

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} width={16} height={10} />}
          onClick={() => onClose(null, false)}
          variant="outlined"
          size="small"
          sx={{ minWidth: 120, px: 3 }}
        >
          Cancel
        </Button>
        <Button
          startIcon={
            <Iconify
              icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
              width={16}
              height={10}
            />
          }
          type="submit"
          variant="contained"
          size="small"
          onClick={(e: any) => formik.handleSubmit(e)}
          sx={{ minWidth: 120, px: 3 }}
        >
          {editData ? 'Update' : 'Submit'}
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default AssignChargesForm;
