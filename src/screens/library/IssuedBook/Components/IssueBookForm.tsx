'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import React, { useMemo, useState, useEffect } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import {
  Grid,
  Chip,
  Alert,
  Button,
  TextField,
  Typography,
  Autocomplete,
  DialogActions,
} from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { useLazyGetFilterStudentsQuery } from 'src/redux/student';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { getInitialValues } from './IssueInitialValues';
import { getIssueBookSchema } from './IssurFormValidationSchema';

import type { IssueBookFormProps } from './type';

// ------------------ Options Dummy ------------------
const bookCategoryOptions = [
  {
    id: 'cat1',
    label: 'Text Book',
    value: 'Text Book',
    titles: [
      {
        id: 'title1',
        label: 'Introduction to Physics',
        value: 'Introduction to Physics',
        author: 'H.C. Verma',
        quantity: 25,
        editions: [
          { id: 'ed1', label: '01', value: '01' },
          { id: 'ed2', label: '02', value: '02' },
        ],
      },
      {
        id: 'title2',
        label: 'Advanced Chemistry',
        value: 'Advanced Chemistry',
        author: 'O.P. Tandon',
        quantity: 0,
        editions: [{ id: 'ed1', label: '01', value: '01' }],
      },
    ],
  },
  {
    id: 'cat2',
    label: 'Reference Book',
    value: 'Reference Book',
    titles: [
      {
        id: 'title3',
        label: 'Introduction to Physics',
        value: 'Introduction to Physics',
        author: 'Resnick & Halliday',
        quantity: 10,
        editions: [{ id: 'ed3', label: '01', value: '01' }],
      },
    ],
  },
];

const IssueBookForm: React.FC<IssueBookFormProps> = ({ open, onClose, editData }) => {
  const [bookSelected, setBookSelected] = useState(false);
  const [showReservation, setShowReservation] = useState(false);
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);

  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store selected class/standard ID
  const [classes, setClasses] = useState<string>('');
  // State to store all divisions for the selected class
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  // State to store selected division ID
  const [division, setDivision] = useState<string>('');
  // Query hook to fetch class data from the API

  // Get current board, medium and medium setter from global state
  const {
    currentBoard,
    currentMedium: medium,
    setCurrentMedium: setMedium,
  } = useSelector((state: RootState) => state.globalState);

  useEffect(() => {
    setAllOrganization(medium?.educationMediumStages || []);
  }, [medium?.educationMediumStages]);

  // Update divisions when class changes
  //   // Update divisions when class changes
  useEffect(() => {
    if (!classes) return;

    const selectedClass = allClass.find((org: any) => org?.id === classes);

    if (selectedClass) {
      setAllDivision(selectedClass.divisions || []);

      // only set division if it's not already selected
      if (!division && selectedClass.divisions?.length > 0) {
        setDivision(selectedClass.divisions[0].id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allClass, classes]); // removed setDivision

  // Initialize query hook for fetching students
  const [getStudents, { data: StudentsData, isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetFilterStudentsQuery,
  });

  // Update classes when organization changes
  useEffect(() => {
    // Flatten the list of standards from all stages
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

    setAllClass(allClasses);
    setClasses(allClasses[0]?.id || '');
  }, [medium]);

  // Update divisions when class changes
  useEffect(() => {
    setAllDivision(allClass.find((org: any) => org?.id === classes)?.divisions || []);
    setDivision(allClass.find((org: any) => org?.id === classes)?.divisions?.[0]?.id || '');
  }, [allClass, classes, setDivision]);

  //   Fetch students when division, class and organization are all selected
  useEffect(() => {
    if (division && classes) {
      getStudents({
        educationMediumStageId: allOrganization[1].id,
        standardId: classes,
        divisionId: division,
      });
    }
  }, [division, classes, getStudents, allOrganization]);

  //   Transform student data to include full name
  const tableData = useMemo(
    () =>
      StudentsData?.items?.map((item: any) => ({
        ...item,
        name: `${item.firstName} ${item.lastName} ${item.middleName}`,
      })) || [],
    [StudentsData?.items]
  );

  const formik = useFormik({
    initialValues: getInitialValues(editData),
    validationSchema: getIssueBookSchema(currentYear),
    // enableReinitialize: true,
    onSubmit: (values) => {
      onClose(values, true);
    },
  });

  const selectedCategory = bookCategoryOptions.find(
    (cat) => cat.value === formik.values.bookCategory
  );

  const selectedBook = selectedCategory?.titles.find(
    (title) => title.value === formik.values.bookTitle
  );

  const availableQuantity = selectedBook?.quantity || 0;

  console.log('formik00000000000', formik.values);

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={3}>
          {/* Book Category */}
          <Grid item xs={12} md={4}>
            <ShakingTextField error={!!(formik.touched.bookCategory && formik.errors.bookCategory)}>
              <CustomSelect
                label="Book Category *"
                options={bookCategoryOptions.map((item) => ({
                  id: item.id,
                  label: item.label,
                  value: item.value,
                }))}
                value={formik.values.bookCategory}
                onChange={(val) => {
                  if (formik.values.bookCategory !== val) {
                    formik.setFieldValue('bookCategory', val);
                    formik.setFieldTouched('bookCategory', false);
                    formik.setFieldValue('bookTitle', '');
                    formik.setFieldValue('edition', '');
                  }
                }}
                error={!!(formik.touched.bookCategory && formik.errors.bookCategory)}
                helperText={(formik.touched.bookCategory && formik.errors.bookCategory) as string}
                formControlProps={{ fullWidth: true }}
              />
            </ShakingTextField>
          </Grid>

          {/* Book Title */}
          <Grid item xs={12} md={4}>
            <ShakingTextField error={!!(formik.touched.bookTitle && formik.errors.bookTitle)}>
              <CustomSelect
                label="Book Title *"
                options={
                  bookCategoryOptions
                    .find((cat) => cat.value === formik.values.bookCategory)
                    ?.titles.map((title) => ({
                      id: title.id,
                      label: title.label,
                      value: title.value,
                    })) || []
                }
                value={formik.values.bookTitle}
                onChange={(val) => {
                  formik.setFieldValue('bookTitle', val);
                  formik.setFieldTouched('bookTitle', false);
                  formik.setFieldValue('edition', ''); // reset child
                  setBookSelected(!!val);
                }}
                error={!!(formik.touched.bookTitle && formik.errors.bookTitle)}
                helperText={(formik.touched.bookTitle && formik.errors.bookTitle) as string}
                formControlProps={{ fullWidth: true }}
              />
            </ShakingTextField>
          </Grid>

          {/* Edition */}
          <Grid item xs={12} md={4}>
            <ShakingTextField error={!!(formik.touched.edition && formik.errors.edition)}>
              <CustomSelect
                label="Edition *"
                options={
                  bookCategoryOptions
                    .find((cat) => cat.value === formik.values.bookCategory)
                    ?.titles.find((title) => title.value === formik.values.bookTitle)
                    ?.editions.map((edition) => ({
                      id: edition.id,
                      label: edition.label,
                      value: edition.value,
                    })) || []
                }
                value={formik.values.edition}
                onChange={(val) => {
                  formik.setFieldValue('edition', val);
                  formik.setFieldTouched('edition', false);
                }}
                error={!!(formik.touched.edition && formik.errors.edition)}
                helperText={(formik.touched.edition && formik.errors.edition) as string}
                formControlProps={{ fullWidth: true }}
              />
            </ShakingTextField>
          </Grid>

          {/* Availability Indicator + Reservation */}
          {bookSelected && (
            <>
              <Grid item xs={12}>
                {availableQuantity > 0 ? (
                  <Alert
                    severity="success"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      '& .MuiAlert-message': {
                        fontSize: '0.9rem',
                        fontWeight: 700,
                      },
                    }}
                  >
                    Book Available - {availableQuantity}
                  </Alert>
                ) : (
                  <Alert
                    severity="error"
                    action={
                      <Button
                        variant="contained"
                        color="warning"
                        size="small"
                        onClick={() => setShowReservation(true)}
                      >
                        Make Reservation
                      </Button>
                    }
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      '& .MuiAlert-message': {
                        fontSize: '0.9rem',
                        fontWeight: 700,
                      },
                    }}
                  >
                    Book Not Available
                  </Alert>
                )}
              </Grid>

              {showReservation && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Reserved List</Typography>
                  <CustomizableTable
                    tableId="reservation-table"
                    columns={[
                      { id: 'memberId', label: 'Member ID' },
                      { id: 'memberName', label: 'Member Name' },
                      { id: 'reservationDate', label: 'Reservation Date' },
                    ]}
                    data={[
                      {
                        memberId: 'DDVS001',
                        memberName: 'Dharmik Jinjala',
                        reservationDate: '01-08-2025',
                      },
                      {
                        memberId: 'DDVS002',
                        memberName: 'Prerna Atre',
                        reservationDate: '13-08-2025',
                      },
                      {
                        memberId: 'DDVS003',
                        memberName: 'Mayur Solanki',
                        reservationDate: '20-08-2025',
                      },
                    ]}
                  />
                </Grid>
              )}
            </>
          )}

          {/* Class */}
          <Grid item xs={12} md={6}>
            <ShakingTextField error={!!(formik.touched.class && formik.errors.class)}>
              <CustomSelect
                label="Class *"
                options={allClass}
                value={formik.values.class}
                onChange={(val) => {
                  const selectedClass = allClass.find((cls: any) => cls.id === val);
                  const firstDivision = selectedClass?.divisions?.[0];
                  formik.setFieldValue('class', val as string);
                  formik.setFieldTouched('class', false);
                }}
                labelKey="name"
                valueKey="id"
                formControlProps={{
                  fullWidth: true,
                  sx: { maxWidth: 'unset' },
                }}
                error={!!(formik.touched.class && formik.errors.class)}
                helperText={(formik.touched.class && formik.errors.class) as string}
              />
            </ShakingTextField>
          </Grid>

          {/* Division */}
          <Grid item xs={12} md={6}>
            <ShakingTextField error={!!(formik.touched.division && formik.errors.division)}>
              <CustomSelect
                label="Division *"
                options={allDivision}
                disabled={!formik.values.class}
                value={formik.values.division}
                onChange={(val) => {
                  formik.setFieldValue('division', val as string);
                  formik.setFieldTouched('division', false);
                }}
                labelKey="name"
                valueKey="id"
                formControlProps={{
                  fullWidth: true,
                  sx: { maxWidth: 'unset', width: '100%' },
                }}
                error={!!(formik.touched.division && formik.errors.division)}
                helperText={(formik.touched.division && formik.errors.division) as string}
              />
            </ShakingTextField>
          </Grid>

          {/* Student */}
          <Grid item xs={12} md={6}>
            <ShakingTextField error={!!(formik.touched.student && formik.errors.student) || false}>
              <Autocomplete
                loading={isLoading}
                disabled={!formik.values.division}
                noOptionsText="No Student Found"
                fullWidth
                value={tableData.find((s: any) => s.id === formik.values.student) || null}
                onChange={(e, value: any) => {
                  formik.setFieldValue('student', value?.id || '');
                }}
                renderTags={(tagValue, getTagProps) =>
                  tagValue.map((option, index) => (
                    <Chip
                      label={option.name}
                      variant="soft"
                      size="small"
                      {...getTagProps({ index })}
                    />
                  ))
                }
                options={tableData}
                getOptionLabel={(option: any) => option?.name || ''}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    label="Student *"
                    fullWidth
                    error={!!(formik.touched.student && formik.errors.student)}
                    helperText={(formik.touched.student && formik.errors.student) as string}
                  />
                )}
                renderOption={(prop: any, option: any) => (
                  <li {...prop} key={option.id}>
                    {option.name}
                  </li>
                )}
              />
            </ShakingTextField>
          </Grid>

          {/* Quantity */}
          <Grid item xs={12} md={6}>
            <ShakingTextField error={!!(formik.touched.quantity && formik.errors.quantity)}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Quantity *"
                name="quantity"
                value={formik.values.quantity}
                onChange={formik.handleChange}
                error={!!(formik.touched.quantity && formik.errors.quantity)}
                helperText={(formik.touched.quantity && formik.errors.quantity) as string}
              />
            </ShakingTextField>
          </Grid>

          {/* Issue Date */}
          <Grid item xs={12} md={6}>
            <ShakingTextField error={!!(formik.touched.issueDate && formik.errors.issueDate)}>
              <DatePicker
                label="Issue Date *"
                value={dayjs(formik.values.issueDate)}
                onChange={(newValue) => formik.setFieldValue('issueDate', newValue)}
                format="DD-MM-YYYY"
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

          {/* Due Date */}
          <Grid item xs={12} md={6}>
            <ShakingTextField error={!!(formik.touched.dueDate && formik.errors.dueDate)}>
              <DatePicker
                label="Due Date *"
                value={dayjs(formik.values.dueDate)}
                onChange={(newValue) => formik.setFieldValue('dueDate', newValue)}
                format="DD-MM-YYYY"
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
          startIcon={
            <Iconify
              icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
              width={16}
              height={16}
            />
          }
          onClick={(e: any) => {
            formik.handleSubmit(e);
          }}
          type="submit"
          size="small"
          variant="contained"
        >
          {editData ? 'Update' : 'Submit'}
        </Button>
      </DialogActions>
    </BackPopUpChecked>
    // </BackPopUpChecked>
  );
};

export default IssueBookForm;
