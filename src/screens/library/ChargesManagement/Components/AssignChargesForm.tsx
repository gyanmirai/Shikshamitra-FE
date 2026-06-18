'use client';

import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import Image from 'next/image';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import debounce from 'src/utils/debounce';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { DatePicker } from '@mui/x-date-pickers';
import { ExpandMore } from '@mui/icons-material';
import noCover from 'src/assets/icons/no-cover.png';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import React, { useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { useGetMemberDetailsQuery } from 'src/redux/library/libraryMembers/memberManagementApi';
import { useGetBookDetailsByAccessionQuery } from 'src/redux/library/issueAndReturnApi/issueAndReturnApi';
import {
  buildCreateChargePayload,
  buildUpdateChargePayload,
} from 'src/redux/library/library-adapters';
import { useGetLibraryChargeCategoryOptionsQuery } from 'src/redux/library/charges-management/charge-category-api';
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

function fillEditData(editData: any) {
  if (!editData) return null;
  return {
    role: editData.role || '',
    class: editData.classNo || '',
    division: editData.division || '',
    member: editData.memberId || '',
    bookNumber: editData.accessionNo || editData.bookNumber || '',
    bookTitle: editData.bookTitle || '',
    chargeCategory: editData.chargeCategoryId || editData.chargeCategory || '',
    amount:
      editData.fineAmount !== undefined
        ? editData.fineAmount
        : editData.amount !== undefined
          ? editData.amount
          : '',
    dueDate: editData.dueDate || '',
    reason: editData.reason || '',
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

  const { data: chargeCategoryData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetLibraryChargeCategoryOptionsQuery,
    params: { academicYearId: currentAcademicYearId, pageSize: 100 },
  });

  const { data: queriedMember, isLoading: isMemberQueryLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetMemberDetailsQuery,
    params: { memberId: debouncedMemberId },
    options: { skip: !debouncedMemberId },
  });

  const { data: queriedBook, isLoading: isBookQueryLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBookDetailsByAccessionQuery,
    params: { accessionNo: debouncedBookNumber },
    options: { skip: !debouncedBookNumber },
  });

  const chargeCategories = useMemo(() => chargeCategoryData || [], [chargeCategoryData]);

  const [addLibraryCharge, { isLoading: isAddChargeLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddLibraryChargeMutation,
  });

  const [updateLibraryCharge, { isLoading: isUpdateChargeLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateLibraryChargeMutation,
  });

  useEffect(() => {
    if (!debouncedMemberId) return;
    setSelectedMember(queriedMember || null);
  }, [debouncedMemberId, queriedMember]);

  useEffect(() => {
    if (!debouncedBookNumber) return;

    setSelectedBook(
      queriedBook
        ? {
            bookNumber: queriedBook.accessionNo,
            title: queriedBook.title,
            author: queriedBook.author,
            isbn: queriedBook.isbn,
            category: queriedBook.category,
            publisher: queriedBook.publisher,
            edition: queriedBook.edition,
            coverImage: queriedBook.coverImage,
          }
        : null
    );
  }, [debouncedBookNumber, queriedBook]);

  const formik = useFormik({
    initialValues: assignLibraryChargeInitialValues(fillEditData(editData)),
    validationSchema: assignLibraryChargeValidationSchema(currentYear),
    onSubmit: async (values) => {
      try {
        const result = editData
          ? await updateLibraryCharge({
              chargeId: editData.id,
              body: buildUpdateChargePayload(values),
            })
          : await addLibraryCharge({
              body: buildCreateChargePayload(values),
            });

        if (result?.error) {
          const parsed = parseApiProblemDetail(result.error);
          shikshaMitraToast.error({ message: parsed.detail });
          return;
        }

        shikshaMitraToast.success({
          message: editData ? 'Charge updated successfully' : 'Charge assigned successfully',
        });
        onClose(null, true);
      } catch (error) {
        const parsed = parseApiProblemDetail(error);
        shikshaMitraToast.error({ message: parsed.detail });
      }
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
      setDebouncedMemberId(value.trim());
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
      setDebouncedBookNumber(value.trim());
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
            if (loadingMember || isMemberQueryLoading) {
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
                            src={selectedMember.avatar || selectedMember.avatarUrl}
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
            if (loadingBook || isBookQueryLoading) {
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
                options={chargeCategories}
                value={formik.values.chargeCategory}
                onChange={(val) => {
                  formik.setFieldValue('chargeCategory', val);
                  const selectedCategory = chargeCategories.find((cat: any) => cat.id === val);
                  if (selectedCategory?.isFixed) {
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
                label="Amount *"
                name="amount"
                value={formik.values.amount}
                disabled={
                  !!chargeCategories.find(
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
          disabled={isAddChargeLoading || isUpdateChargeLoading}
          sx={{ minWidth: 120, px: 3 }}
        >
          {editData ? 'Update' : 'Submit'}
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default AssignChargesForm;
