'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { useGetRolesQuery } from 'src/redux/role/roleApi';
import React, { useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import { useLazyGetFilterStudentsQuery } from 'src/redux/student';
import { DialogScrollContent } from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { useGetBookCategoryOptionsQuery } from 'src/redux/bookCategoryOptionsApi/bookCategoryOptionApi';
import { useGetReservationRequestDataQuery } from 'src/redux/reservationRequestApi/reservationRequestApi';
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

import { getInitialValues } from './IssueInitialValues';
import { getIssueBookSchema } from './IssurFormValidationSchema';

import type { ITitle, IEdition, IssueBookFormProps, IBookCategoryOption } from './type';

const IssueBookForm: React.FC<IssueBookFormProps> = ({ open, onClose, editData }) => {
  //   Fetch issued/returned books
  const { data: bookCategoryOptions } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBookCategoryOptionsQuery,
  });

  const { data: reservationRequestData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetReservationRequestDataQuery,
  });
  const [bookSelected, setBookSelected] = useState(false);
  const [showReservation, setShowReservation] = useState(false);
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);

  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store selected class/standard ID
  const [classes, setClasses] = useState<string>('');
  // State to store all divisions for the selected class
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  // State to store selected division ID
  const [division, setDivision] = useState<string>('');
  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRolesQuery,
  });
  // Get current board, medium and medium setter from global state
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [getStudents, { data: StudentsData }] = useQueryAndMutation({
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

  console.log('formik...errors---', formik.errors);
  console.log('formik...values---', formik.values);

  const selectedCategory = bookCategoryOptions?.find(
    (cat: IBookCategoryOption) => cat.value === formik.values.bookCategory
  );

  const selectedBook = selectedCategory?.titles.find(
    (title: ITitle) => title.value === formik.values.bookTitle
  );

  const availableQuantity = selectedBook?.quantity || 0;

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={3}>
          {/* Book Category */}
          <Grid size={{ xs: 12, md: 4 }}>
            <ShakingTextField error={!!(formik.touched.bookCategory && formik.errors.bookCategory)}>
              <CustomSelect
                label="Book Category *"
                options={
                  bookCategoryOptions?.map((item: IBookCategoryOption) => ({
                    id: item?.id,
                    label: item?.label,
                    value: item?.value,
                  })) ?? []
                }
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
          <Grid size={{ xs: 12, md: 4 }}>
            <ShakingTextField error={!!(formik.touched.bookTitle && formik.errors.bookTitle)}>
              <CustomSelect
                label="Book Title *"
                disabled={!formik.values.bookCategory}
                options={
                  bookCategoryOptions
                    ?.find(
                      (cat: IBookCategoryOption) => cat?.value === formik?.values?.bookCategory
                    )
                    ?.titles?.map((title: ITitle) => ({
                      id: title?.id,
                      label: title?.label,
                      value: title?.value,
                    })) ?? []
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
          <Grid size={{ xs: 12, md: 4 }}>
            <ShakingTextField error={!!(formik.touched.edition && formik.errors.edition)}>
              <CustomSelect
                label="Edition *"
                disabled={!formik.values.bookTitle}
                options={
                  bookCategoryOptions
                    ?.find((cat: IBookCategoryOption) => cat.value === formik.values.bookCategory)
                    ?.titles?.find((title: ITitle) => title.value === formik.values.bookTitle)
                    ?.editions?.map((edition: IEdition) => ({
                      id: edition?.id,
                      label: edition?.label,
                      value: edition?.value,
                    })) ?? []
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
              <Grid size={12}>
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
                      <>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => setShowReservation(true)}
                        >
                          Make Reservation
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => setShowReservation(false)}
                          sx={{ ml: 1 }}
                        >
                          Dismiss
                        </Button>
                      </>
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
                <Grid size={12}>
                  <Typography variant="subtitle1">Reserved List</Typography>
                  <CustomizableTable
                    tableId="reservation-table"
                    columns={[
                      { id: 'memberId', label: 'Member ID', align: 'left' },
                      { id: 'memberName', label: 'Member Name', align: 'left' },
                      {
                        id: 'reservationDate',
                        label: 'Reservation Date',
                        filterType: 'date',
                        align: 'left',
                      },
                      { id: 'dueDate', label: 'Due Date', filterType: 'date', align: 'left' },
                    ]}
                    data={reservationRequestData || []}
                  />
                </Grid>
              )}
            </>
          )}

          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField error={formik.touched.role && Boolean(formik.errors.role)}>
              <Autocomplete
                disabled={isLoading}
                options={data?.items || []}
                value={data?.items?.find((item: any) => item.name === formik.values.role) || null}
                getOptionLabel={(option: any) => option?.name || ''}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Role *"
                    size="small"
                    fullWidth
                    sx={{ width: '100%', minWidth: '200px' }}
                    error={formik.touched.role && Boolean(formik.errors.role)}
                    helperText={(formik.touched.role && formik.errors.role) as string}
                  />
                )}
                onChange={(e, value) => {
                  formik.setFieldValue('role', value?.name || '');
                }}
              />
            </ShakingTextField>
          </Grid>

          {formik.values.role === 'Student' && (
            <>
              {/* Class */}
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={!!(formik.touched.class && formik.errors.class)}>
                  <CustomSelect
                    label="Class *"
                    options={allClass}
                    value={formik.values.class}
                    onChange={(val) => {
                      formik.setFieldValue('class', val);
                      formik.setFieldValue('division', '');
                      formik.setFieldValue('student', '');
                      formik.setFieldTouched('class', false);
                    }}
                    labelKey="name"
                    valueKey="id"
                    formControlProps={{ fullWidth: true }}
                    error={!!(formik.touched.class && formik.errors.class)}
                    helperText={(formik.touched.class && formik.errors.class) as string}
                  />
                </ShakingTextField>
              </Grid>

              {/* Division */}
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={!!(formik.touched.division && formik.errors.division)}>
                  <CustomSelect
                    label="Division *"
                    options={allDivision}
                    disabled={!formik.values.class}
                    value={formik.values.division}
                    onChange={(val) => {
                      formik.setFieldValue('division', val);
                      formik.setFieldValue('student', '');
                      formik.setFieldTouched('division', false);
                    }}
                    labelKey="name"
                    valueKey="id"
                    formControlProps={{ fullWidth: true }}
                    error={!!(formik.touched.division && formik.errors.division)}
                    helperText={(formik.touched.division && formik.errors.division) as string}
                  />
                </ShakingTextField>
              </Grid>
            </>
          )}
          {/* Member Dropdown for Non-Students */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField error={!!(formik.touched.member && formik.errors.member)}>
              <Autocomplete
                loading={isLoading}
                disabled={!formik.values.division}
                noOptionsText="No Member Found"
                fullWidth
                value={tableData.find((s: any) => s.id === formik.values.member) || null}
                onChange={(e, value: any) => {
                  formik.setFieldValue('member', value?.id || '');
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
                options={formik.values.role === 'Student' ? tableData : []}
                getOptionLabel={(option: any) => option?.name || ''}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    label="Member *"
                    fullWidth
                    error={!!(formik.touched.member && formik.errors.member)}
                    helperText={(formik.touched.member && formik.errors.member) as string}
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

          {/* Issue Date */}
          <Grid size={{ xs: 12, md: 6 }}>
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
          <Grid size={{ xs: 12, md: 6 }}>
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
