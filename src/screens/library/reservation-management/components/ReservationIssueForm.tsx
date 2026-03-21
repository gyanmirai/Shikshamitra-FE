'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import ShakingTextField from 'src/components/shaking-text-field';
import { useLazyGetFilterStudentsQuery } from 'src/redux/student';
import { DialogScrollContent } from 'src/components/custom-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Grid, Button, TextField, Autocomplete, DialogActions } from '@mui/material';
import { useGetBookCategoryOptionsQuery } from 'src/redux/book-category-options-api/bookCategoryOptionApi';

import { getIssueBookInitialValues } from './ReservationIssueInitialValues';
import { getReservationIssueBookSchema } from './ReservationIssueValidation';

import type {
  IEdition,
  IssueBookFormProps,
  IBookCategoryOption,
} from '../../issued-book/components/type';

const ReservationIssueBookForm: React.FC<IssueBookFormProps> = ({ open, onClose, editData }) => {
  //   Fetch issued/returned books
  const { data: bookCategoryOptions } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBookCategoryOptionsQuery,
  });
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [classes, setClasses] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  const [division, setDivision] = useState<string>('');

  // Get current board, medium and medium setter from global state
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  useEffect(() => {
    setAllOrganization(medium?.educationMediumStages || []);
  }, [medium?.educationMediumStages]);

  // Initialize query hook for fetching students
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [getStudents, { data: StudentsData, isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetFilterStudentsQuery,
  });

  // Update classes when organization changes
  useEffect(() => {
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];
    setAllClass(allClasses);
    setClasses(allClasses[0]?.id || '');
  }, [medium]);

  // Update divisions when class changes
  useEffect(() => {
    setAllDivision(allClass.find((org: any) => org?.id === classes)?.divisions || []);
    setDivision(allClass.find((org: any) => org?.id === classes)?.divisions?.[0]?.id || '');
  }, [allClass, classes]);

  // Fetch students
  useEffect(() => {
    if (division && classes && allOrganization.length > 0) {
      getStudents({
        educationMediumStageId: allOrganization[0].id,
        standardId: classes,
        divisionId: division,
      });
    }
  }, [division, classes, allOrganization, getStudents]);

  const formik = useFormik({
    initialValues: getIssueBookInitialValues(editData),
    validationSchema: getReservationIssueBookSchema(currentYear),
    onSubmit: (values) => {
      shikshaMitraToast.success({
        message: editData
          ? `Issued "${formik.values.bookTitle}" book  successfully`
          : `Reservation for "${formik.values.bookTitle}" book submitted successfully`,
      });
      onClose(values, true);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={3}>
          {/* Book Title */}
          <Grid size={{ xs: 12, md: 5 }}>
            <CustomTooltip
              placement="top"
              title={
                formik.values.bookTitle
                  ? bookCategoryOptions?.find(
                      (item: IBookCategoryOption) => item.value === formik.values.bookTitle
                    )?.label || ''
                  : undefined
              }
            >
              <Autocomplete
                options={
                  bookCategoryOptions?.map((item: IBookCategoryOption) => ({
                    id: item.id,
                    label: item.label,
                    value: item.value,
                    categoryName: item.categoryName,
                  })) ?? []
                }
                getOptionLabel={(option) => option.label}
                value={
                  bookCategoryOptions?.find(
                    (item: IBookCategoryOption) => item.value === formik.values.bookTitle
                  ) || null
                }
                onChange={(_, value) => {
                  formik.setFieldValue('bookTitle', value?.value || '');
                  formik.setFieldTouched('bookTitle', false);
                  formik.setFieldValue('bookCategory', value?.categoryName || '');
                  formik.setFieldValue('edition', ''); // reset child
                  // If you use setBookSelected, call it here
                  // setBookSelected(!!value);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Book Title *"
                    size="small"
                    fullWidth
                    error={!!(formik.touched.bookTitle && formik.errors.bookTitle)}
                    helperText={(formik.touched.bookTitle && formik.errors.bookTitle) as string}
                  />
                )}
                isOptionEqualToValue={(option, value) => option.value === value.value}
              />
            </CustomTooltip>
          </Grid>

          {/* Book Category */}
          <Grid size={{ xs: 12, md: 4 }}>
            <ShakingTextField error={!!(formik.touched.bookCategory && formik.errors.bookCategory)}>
              <TextField
                label="Book Category"
                disabled
                value={formik.values.bookCategory || ''}
                InputProps={{ readOnly: true }}
                size="small"
                fullWidth
                error={!!(formik.touched.bookCategory && formik.errors.bookCategory)}
                helperText={(formik.touched.bookCategory && formik.errors.bookCategory) as string}
              />
            </ShakingTextField>
          </Grid>
          {/* Edition */}
          <Grid size={{ xs: 12, md: 3 }}>
            <ShakingTextField error={!!(formik.touched.edition && formik.errors.edition)}>
              <CustomSelect
                label="Edition *"
                disabled
                options={
                  bookCategoryOptions
                    ?.find((item: IBookCategoryOption) => item.value === formik.values.bookTitle)
                    ?.editions?.map((edition: IEdition) => ({
                      id: edition?.id,
                      label: edition?.label,
                      value: edition?.value,
                    })) ?? []
                }
                value="1"
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
          startIcon={<Iconify icon={GlobalIcons.submit} width={16} height={16} />}
          onClick={(e: any) => {
            formik.handleSubmit(e);
          }}
          type="submit"
          size="small"
          variant="contained"
        >
          {/* {editData ? 'Update' : 'Submit'} */}
          Submit
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default ReservationIssueBookForm;
