'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { DatePicker } from '@mui/x-date-pickers';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { useGetRolesQuery } from 'src/redux/role/roleApi';
import React, { useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import { useLazyGetFilterStudentsQuery } from 'src/redux/student';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Grid, Chip, Button, TextField, Autocomplete, DialogActions } from '@mui/material';
import { useGetBookCategoryOptionsQuery } from 'src/redux/bookCategoryOptionsApi/bookCategoryOptionApi';

import { reservationInitialValues } from './ResevationInitialValues';
import { reservationValidationSchema } from './ReservationValidation';

import type { IReservationFormProps } from './type';
import type { ITitle, IBookCategoryOption } from '../../IssuedBook/Components/type';

const ReservationForm: React.FC<IReservationFormProps> = ({ open, onClose, editData }) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  //   Fetch issued/returned books
  const { data: bookCategoryOptions } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBookCategoryOptionsQuery,
  });

  console.log('bookCategoryOptions----', bookCategoryOptions);
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

  const formik = useFormik({
    initialValues: reservationInitialValues(editData),
    validationSchema: reservationValidationSchema(currentYear),
    onSubmit: (values) => {
      shikshaMitraToast.success({
        message: editData
          ? 'Reservation updated successfully'
          : 'Reservation submitted successfully',
      });
      onClose(null, true);
    },
  });

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

  // Update divisions when class changes
  useEffect(() => {
    setAllDivision(allClass.find((org: any) => org?.id === formik.values.class)?.divisions || []);
    setDivision(
      allClass.find((org: any) => org?.id === formik.values.class)?.divisions?.[0]?.id || ''
    );
  }, [allClass, formik.values.class, setDivision]);

  //   Fetch students when division, class and organization are all selected
  useEffect(() => {
    if (division && formik.values.class) {
      getStudents({
        educationMediumStageId: allOrganization[1].id,
        standardId: formik.values.class,
        divisionId: division,
      });
    }
  }, [division, formik.values.class, getStudents, allOrganization]);

  //   Transform student data to include full name
  const tableData = useMemo(
    () =>
      StudentsData?.items?.map((item: any) => ({
        ...item,
        name: `${item.firstName} ${item.lastName} ${item.middleName}`,
      })) || [],
    [StudentsData?.items]
  );

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={2}>
          {/* Role */}
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
                disabled={!formik.values.role}
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

          {/* Book Category */}
          <Grid size={{ xs: 12, md: 4 }}>
            <ShakingTextField error={!!(formik.touched.bookCategory && formik.errors.bookCategory)}>
              <CustomSelect
                label="Book Category *"
                options={
                  bookCategoryOptions?.map((item: IBookCategoryOption) => ({
                    id: item.id,
                    label: item.label,
                    value: item.value,
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
                options={
                  bookCategoryOptions
                    ?.find((cat: IBookCategoryOption) => cat.value === formik.values.bookCategory)
                    ?.titles?.map((title: ITitle) => ({
                      id: title.id,
                      label: title.label,
                      value: title.value,
                    })) ?? []
                }
                value={formik.values.bookTitle}
                onChange={(val) => {
                  formik.setFieldValue('bookTitle', val);
                  formik.setFieldTouched('bookTitle', false);
                  formik.setFieldValue('edition', ''); // reset child
                }}
                error={!!(formik.touched.bookTitle && formik.errors.bookTitle)}
                helperText={(formik.touched.bookTitle && formik.errors.bookTitle) as string}
                formControlProps={{ fullWidth: true }}
              />
            </ShakingTextField>
          </Grid>
          {/* Start Time DatePicker */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField
              error={!!(formik.touched.requestedDate && formik.errors.requestedDate) || false}
            >
              <DatePicker
                label="Requested Date *"
                format="DD/MM/YYYY"
                value={formik.values.requestedDate}
                onChange={(newValue) => {
                  formik.setFieldValue('requestedDate', newValue);
                }}
                minDate={dayjs(currentYear?.startDate)}
                maxDate={dayjs(currentYear?.endDate)}
                sx={{ minWidth: 180, width: '100%' }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    error: !!(formik.touched.requestedDate && formik.errors.requestedDate) || false,
                    helperText: (formik.touched.requestedDate &&
                      formik.errors.requestedDate) as string,
                  },
                }}
              />
            </ShakingTextField>
          </Grid>

          {/* Due Date DatePicker */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField error={!!(formik.touched.dueDate && formik.errors.dueDate) || false}>
              <DatePicker
                label="Due Date *"
                format="DD/MM/YYYY"
                minDate={dayjs(currentYear?.startDate)}
                maxDate={dayjs(currentYear?.endDate)}
                value={formik.values.dueDate}
                onChange={(newValue) => {
                  formik.setFieldValue('dueDate', newValue);
                }}
                sx={{ minWidth: 180, width: '100%' }}
                slotProps={{
                  textField: {
                    size: 'small',
                    error: !!(formik.touched.dueDate && formik.errors.dueDate) || false,
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
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={() => onClose(null, false)}
          variant="outlined"
          size="small"
        >
          Cancel
        </Button>
        <Button
          startIcon={
            <Iconify
              icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
              width={editData ? 16 : 20}
              height={editData ? 16 : 20}
            />
          }
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

export default ReservationForm;
