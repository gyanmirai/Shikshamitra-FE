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
import React, { useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import { useLazyGetFilterStudentsQuery } from 'src/redux/student';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetRoleOptionsQuery } from 'src/redux/library/roleApi';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Grid, Button, TextField, Autocomplete, DialogActions } from '@mui/material';
import { useGetBookCategoryOptionsQuery } from 'src/redux/bookCategoryOptionsApi/bookCategoryOptionApi';

import { reservationInitialValues } from './ResevationInitialValues';
import { reservationValidationSchema } from './ReservationValidation';

import type { IReservationFormProps } from './type';
import type { IBookCategoryOption } from '../../IssuedBook/Components/type';

// Static Data for Classes and Divisions
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
    name: '9',
    divisions: [
      { id: 'A', name: 'A' },
      { id: 'B', name: 'B' },
    ],
  },
  {
    id: '12',
    name: '12',
    divisions: [
      { id: 'A', name: 'A' },
      { id: 'B', name: 'B' },
      { id: 'D', name: 'D' },
    ],
  },
  {
    id: '7',
    name: '7',
    divisions: [
      { id: 'A', name: 'A' },
      { id: 'B', name: 'B' },
    ],
  },
];

// Static Data for Members
const staticMemberOptions = [
  { id: 'M001', name: 'Dharmik Jinjala' },
  { id: 'M002', name: 'Prerna Atre' },
  { id: 'M003', name: 'Raj Baku' },
  { id: 'M004', name: 'Mayur Solanki' },
  { id: 'M005', name: 'Krishna Patel' },
];

// Helper to fill missing fields from static data for edit
function fillEditData(editData: any) {
  return {
    role: editData?.role || '',
    class: editData?.class || staticClasses[0].id,
    division: editData?.division || staticClasses[0].divisions[0].id,
    member: editData?.memberId || staticMemberOptions[0].id,
    bookTitle: editData?.bookTitle || '',
    bookCategory: editData?.bookCategory || '',
    requestedDate: editData?.reservedOn ? dayjs(editData.reservedOn, 'DD-MM-YYYY') : null,
    dueDate: editData?.dueDate ? dayjs(editData.dueDate, 'DD-MM-YYYY') : null,
    // add other fields as needed
  };
}

const ReservationForm: React.FC<IReservationFormProps> = ({ open, onClose, editData }) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const { data: bookCategoryOptions } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBookCategoryOptionsQuery,
  });

  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  const [division, setDivision] = useState<string>('');

  const { data: roleData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRoleOptionsQuery,
  });

  // Use editData for initial values if updating, otherwise use default initial values
  const formik = useFormik({
    initialValues: editData ? fillEditData(editData) : reservationInitialValues(editData),
    validationSchema: reservationValidationSchema(currentYear, editData),
    enableReinitialize: true,
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

  useEffect(() => {
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];
    setAllClass(allClasses.length > 0 ? allClasses : staticClasses);
  }, [medium]);

  useEffect(() => {
    const divisions =
      allClass.find((org: any) => org?.id === formik.values.class)?.divisions ||
      staticClasses[0].divisions;

    // Map static divisions to Division type
    const mappedDivisions = divisions.map((div: any) => ({
      ...div,
      creationTime: div.creationTime || '',
      creatorId: div.creatorId || '',
      lastModificationTime: div.lastModificationTime || '',
      lastModifierId: div.lastModifierId || '',
      isDeleted: div.isDeleted || false,
      id: div.id,
      name: div.name,
    }));

    setAllDivision(mappedDivisions);
    setDivision(mappedDivisions[0]?.id || '');
  }, [allClass, formik.values.class]);

  const [getStudents, { data: StudentsData }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetFilterStudentsQuery,
  });

  useEffect(() => {
    if (division && formik.values.class) {
      getStudents({
        educationMediumStageId: allOrganization[1]?.id || allOrganization[0]?.id,
        standardId: formik.values.class,
        divisionId: division,
      });
    }
  }, [division, formik.values.class, getStudents, allOrganization]);

  const tableData = useMemo(
    () =>
      StudentsData?.items?.map((item: any) => ({
        ...item,
        name: `${item.firstName} ${item.lastName} ${item.middleName}`,
      })) || [],
    [StudentsData?.items]
  );

  // Use static data as fallback
  const effectiveAllClass = allClass.length > 0 ? allClass : staticClasses;
  const effectiveAllDivision = allDivision.length > 0 ? allDivision : staticClasses[0].divisions;
  const effectiveMemberOptions =
    formik.values.role === 'Student'
      ? tableData.length > 0
        ? tableData
        : staticMemberOptions
      : staticMemberOptions;

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={2}>
          {/* Role */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField error={formik.touched.role && Boolean(formik.errors.role)}>
              <Autocomplete
                disabled={isLoading}
                options={roleData || []}
                value={
                  (roleData || []).find((item: any) => item.role === formik.values.role) || null
                }
                getOptionLabel={(option: any) => option?.role || ''}
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
                  formik.setFieldValue('role', value?.role || '');
                  formik.setFieldValue('class', '');
                  formik.setFieldValue('division', '');
                  formik.setFieldValue('member', '');
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
                    options={effectiveAllClass}
                    value={formik.values.class}
                    onChange={(val) => {
                      formik.setFieldValue('class', val);
                      formik.setFieldValue('division', '');
                      formik.setFieldValue('member', '');
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
                    options={effectiveAllDivision}
                    disabled={!formik.values.class}
                    value={formik.values.division}
                    onChange={(val) => {
                      formik.setFieldValue('division', val);
                      formik.setFieldValue('member', '');
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

          {/* Member Dropdown */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField error={!!(formik.touched.member && formik.errors.member)}>
              <Autocomplete
                loading={isLoading}
                disabled={!formik.values.role}
                noOptionsText="No Member Found"
                fullWidth
                value={
                  effectiveMemberOptions.find((s: any) => s.id === formik.values.member) || null
                }
                onChange={(e, value: any) => {
                  formik.setFieldValue('member', value?.id || '');
                }}
                options={effectiveMemberOptions}
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

          {/* Book Title */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField error={!!(formik.touched.bookTitle && formik.errors.bookTitle)}>
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
                  formik.setFieldValue('bookCategory', value?.categoryName || '');
                  formik.setFieldTouched('bookTitle', false);
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
                sx={{ width: '100%' }}
              />
            </ShakingTextField>
          </Grid>

          {/* Book Category */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField error={!!(formik.touched.bookCategory && formik.errors.bookCategory)}>
              <TextField
                label="Book Category"
                value={formik.values.bookCategory || ''}
                InputProps={{ readOnly: true }}
                size="small"
                fullWidth
                error={!!(formik.touched.bookCategory && formik.errors.bookCategory)}
                helperText={(formik.touched.bookCategory && formik.errors.bookCategory) as string}
              />
            </ShakingTextField>
          </Grid>

          {/* Requested Date */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField
              error={!!(formik.touched.requestedDate && formik.errors.requestedDate) || false}
            >
              <DatePicker
                label="Requested Date *"
                value={
                  formik.values.requestedDate && dayjs.isDayjs(formik.values.requestedDate)
                    ? formik.values.requestedDate
                    : formik.values.requestedDate
                      ? dayjs(formik.values.requestedDate)
                      : null
                }
                format="DD/MM/YYYY"
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

          {/* Due Date */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField error={!!(formik.touched.dueDate && formik.errors.dueDate) || false}>
              <DatePicker
                label="Due Date *"
                format="DD/MM/YYYY"
                minDate={dayjs(currentYear?.startDate)}
                maxDate={dayjs(currentYear?.endDate)}
                value={
                  formik.values.dueDate && dayjs.isDayjs(formik.values.dueDate)
                    ? formik.values.dueDate
                    : formik.values.dueDate
                      ? dayjs(formik.values.dueDate)
                      : null
                }
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
