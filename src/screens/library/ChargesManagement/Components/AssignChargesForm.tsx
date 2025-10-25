'use client';

import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { DatePicker } from '@mui/x-date-pickers';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
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
    email: 'dharmik.jinjala@school.edu',
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
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const formik = useFormik({
    initialValues: assignLibraryChargeInitialValues(fillEditData(editData)),
    validationSchema: assignLibraryChargeValidationSchema(currentYear),
    onSubmit: (values) => {
      // // const bookTitle = selectedBook?.title || values.bookTitle || '';
      // shikshaMitraToast.success({
      //   message: editData
      //     ? `Charges for "${bookTitle}" updated successfully`
      //     : `Charges for "${bookTitle}" assigned successfully`,
      // });
      onClose(null, true);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={3}>
          {/* Member ID */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField error={!!(formik.touched.memberId && formik.errors.memberId)}>
              <TextField
                label="Member ID *"
                size="small"
                fullWidth
                value={formik.values.memberId}
                onChange={(e) => formik.setFieldValue('memberId', e.target.value)}
                error={!!(formik.touched.memberId && formik.errors.memberId)}
                helperText={(formik.touched.memberId && formik.errors.memberId) as string}
                placeholder="Enter member ID (e.g., M001, M002, M003)"
              />
            </ShakingTextField>
          </Grid>

          {/* Member Details Display */}
          {(() => {
            const selectedMember = staticMembers.find((m) => m.memberId === formik.values.memberId);

            if (selectedMember) {
              return (
                <Grid size={{ xs: 12 }}>
                  <Card variant="outlined" sx={{ boxShadow: 'var(--shadows-8)', p: 2 }}>
                    <CardContent sx={{ padding: '0 !important' }}>
                      <Grid container spacing={2}>
                        {/* Avatar on the left */}
                        <Grid
                          size={{ xs: 12, md: 2 }}
                          sx={{ display: 'flex', alignItems: 'center' }}
                        >
                          <Avatar src={selectedMember.avatarUrl} sx={{ width: 80, height: 80 }} />
                        </Grid>

                        {/* Member details on the right */}
                        <Grid size={{ xs: 12, md: 10 }}>
                          <Grid container spacing={1}>
                            <Grid size={{ xs: 12, md: 4 }}>
                              <Typography fontWeight={600}>Member Name</Typography>
                              <Typography>{selectedMember.name}</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                              <Typography fontWeight={600}>Member ID</Typography>
                              <Typography>{selectedMember.id}</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                              <Typography fontWeight={600}>Email</Typography>
                              <Typography>{selectedMember.email}</Typography>
                            </Grid>
                            {selectedMember.role === 'Student' && (
                              <>
                                <Grid size={{ xs: 12, md: 4 }}>
                                  <Typography fontWeight={600}>Class/Division</Typography>
                                  <Typography>
                                    {selectedMember.class}-{selectedMember.division}
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
                              <Typography>{selectedMember.contactNo}</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                              <Typography fontWeight={600}>Member Type</Typography>
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
                    }}
                  >
                    Member with ID &quot;{formik.values.memberId}&quot; not found. Available IDs:{' '}
                    {staticMembers.map((m) => m.id).join(', ')}
                  </div>
                </Grid>
              );
            }

            return null;
          })()}

          {/* Book Number */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField error={!!(formik.touched.bookNumber && formik.errors.bookNumber)}>
              <TextField
                label="Accession no *"
                size="small"
                fullWidth
                value={formik.values.bookNumber}
                onChange={(e) => formik.setFieldValue('bookNumber', e.target.value)}
                error={!!(formik.touched.bookNumber && formik.errors.bookNumber)}
                helperText={(formik.touched.bookNumber && formik.errors.bookNumber) as string}
                placeholder="Enter Accession no (e.g., Acc001)"
              />
            </ShakingTextField>
          </Grid>

          {/* Book Details Display */}
          {formik.values.bookNumber === 'Acc001' ? (
            <Grid size={{ xs: 12 }}>
              <Card variant="outlined" sx={{ boxShadow: 'var(--shadows-8)', p: 2 }}>
                <CardContent sx={{ p: '0 !important' }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Box
                        component="img"
                        src="/placeholder-book.jpg"
                        alt="Introduction to Physics"
                        sx={{
                          width: 240,
                          height: 160,
                          borderRadius: 2,
                          flexShrink: 0,
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 8 }}>
                      <Grid container spacing={1}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Typography fontWeight={600}>Book Title</Typography>
                          <Typography>Introduction to Physics</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Typography fontWeight={600}>Accession No.</Typography>
                          <Typography>Acc001</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Typography fontWeight={600}>Author</Typography>
                          <Typography>Dr. John Smith</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Typography fontWeight={600}>ISBN</Typography>
                          <Typography>978-0123456789</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Typography fontWeight={600}>Publisher</Typography>
                          <Typography>Academic Press</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Typography fontWeight={600}>Edition</Typography>
                          <Typography>3rd Edition</Typography>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ) : (
            formik.values.bookNumber !== '' && (
              <Grid size={{ xs: 12 }}>
                <div
                  style={{
                    padding: '12px',
                    backgroundColor: '#ffebee',
                    borderRadius: '4px',
                    border: '1px solid #f44336',
                    color: '#d32f2f',
                  }}
                >
                  Book with number &quot;{formik.values.bookNumber}&quot; not found. Available
                  numbers: BK001, BK002, BK003, BK004
                </div>
              </Grid>
            )
          )}

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
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={() => onClose(null, false)}
          variant="outlined"
          size="small"
        >
          Cancel
        </Button>
        <Button
          startIcon={<Iconify icon={editData ? GlobalIcons.edit : GlobalIcons.submit} />}
          type="submit"
          variant="contained"
          size="small"
          onClick={(e: any) => formik.handleSubmit(e)}
        >
          {editData ? 'Update' : 'Submit'}
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default AssignChargesForm;
