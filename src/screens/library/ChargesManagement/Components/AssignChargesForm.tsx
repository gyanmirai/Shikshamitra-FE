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
import { Grid, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { assignLibraryChargeInitialValues } from './AssignChargeInitialValues';
import { assignLibraryChargeValidationSchema } from './AssignChargesValidationSchema';

import type { IAssignChargesFormProps } from './type';

// Static Data
const staticRoles = [
  { id: '1', role: 'Employee' },
  { id: '2', role: 'Student' },
];

const staticChargeCategories = [
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
    id: 'M001',
    name: 'Dharmik Jinjala',
    role: 'Student',
    class: '10',
    division: 'A',
    contactNumber: '+91-9876543210',
    email: 'dharmik@example.com',
  },
  {
    id: 'M002',
    name: 'Prerna Atre',
    role: 'Employee',
    department: 'Library',
    contactNumber: '+91-9876543211',
    email: 'prerna@example.com',
  },
  {
    id: 'M003',
    name: 'Raj Baku',
    role: 'Student',
    class: '12',
    division: 'B',
    contactNumber: '+91-9876543212',
    email: 'raj@example.com',
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
            const selectedMember = staticMembers.find((m) => m.id === formik.values.memberId);

            if (selectedMember) {
              return (
                <Grid size={{ xs: 12 }}>
                  <div
                    style={{
                      padding: '16px',
                      backgroundColor: '#f5f5f5',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                    }}
                  >
                    <div style={{ marginBottom: '8px', fontWeight: 'bold', fontSize: '16px' }}>
                      Member Details
                    </div>
                    <div style={{ marginBottom: '4px' }}>
                      <strong>Name:</strong> {selectedMember.name}
                    </div>
                    <div style={{ marginBottom: '4px' }}>
                      <strong>Role:</strong> {selectedMember.role}
                    </div>
                    {selectedMember.role === 'Student' && (
                      <>
                        <div style={{ marginBottom: '4px' }}>
                          <strong>Class:</strong> {selectedMember.class}
                        </div>
                        <div style={{ marginBottom: '4px' }}>
                          <strong>Division:</strong> {selectedMember.division}
                        </div>
                      </>
                    )}
                    {selectedMember.department && (
                      <div style={{ marginBottom: '4px' }}>
                        <strong>Department:</strong> {selectedMember.department}
                      </div>
                    )}
                    <div style={{ marginBottom: '4px' }}>
                      <strong>Contact:</strong> {selectedMember.contactNumber}
                    </div>
                  </div>
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
              <div
                style={{
                  padding: '16px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0',
                }}
              >
                <div style={{ marginBottom: '8px', fontWeight: 'bold', fontSize: '16px' }}>
                  Book Details
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <strong>Title:</strong> Introduction to Physics
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <strong>Author:</strong> Dr. John Smith
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <strong>ISBN:</strong> 978-0123456789
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <strong>Category:</strong> Science
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <strong>Publisher:</strong> Academic Press
                </div>
                <div>
                  <strong>Edition:</strong> 3rd Edition
                </div>
              </div>
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
