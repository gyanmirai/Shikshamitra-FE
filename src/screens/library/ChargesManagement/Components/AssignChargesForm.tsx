'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { DatePicker } from '@mui/x-date-pickers';
import { useMemo, useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import { useLazyGetFilterStudentsQuery } from 'src/redux/student';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetRoleOptionsQuery } from 'src/redux/library/roleApi';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Chip, Grid, Button, TextField, Autocomplete, DialogActions } from '@mui/material';
import { useGetLibraryChargeCategoryOptionsQuery } from 'src/redux/library/charges-management/charge-category-api';

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
  { id: 'M001', name: 'Dharmik Jinjala' },
  { id: 'M002', name: 'Prerna Atre' },
  { id: 'M003', name: 'Raj Baku' },
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
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { medium } = useSelector((state: RootState) => state.globalState);
  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store selected class/standard ID
  const [classes, setClasses] = useState<string>('');
  // State to store all divisions for the selected class
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  // State to store selected division ID
  const [division, setDivision] = useState<string>('');

  const { data: roleData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRoleOptionsQuery,
  });

  const { data: chargeCategoryOptions } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetLibraryChargeCategoryOptionsQuery,
  });

  const formik = useFormik({
    initialValues: assignLibraryChargeInitialValues(fillEditData(editData)),
    validationSchema: assignLibraryChargeValidationSchema(currentYear),
    onSubmit: (values) => {
      const bookTitle =
        editData?.bookTitle ||
        (values.bookTitle && typeof values.bookTitle === 'string' ? values.bookTitle : '') ||
        '';
      shikshaMitraToast.success({
        message: editData
          ? `Charges for "${bookTitle}" updated successfully`
          : `Charges for "${bookTitle}" assigned successfully`,
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

  // Fallback for classes/divisions if API data is missing
  const effectiveAllClass = allClass.length > 0 ? allClass : staticClasses;
  const effectiveAllDivision =
    effectiveAllClass.find((cls: any) => cls.id === formik.values.class)?.divisions ||
    staticClasses[0].divisions;

  // Fallback for members if API data is missing
  const effectiveTableData =
    formik.values.role === 'Student'
      ? tableData.length > 0
        ? tableData
        : staticMembers
      : [
          { id: '1', name: 'Prerna Atre' },
          { id: '2', name: 'Raj Baku' },
          { id: '3', name: 'Dharmik Jinjala' },
        ];

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={3}>
          {/* Role */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField error={!!(formik.touched.role && formik.errors.role)}>
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
                    options={effectiveAllDivision}
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
                noOptionsText="No Member Found"
                fullWidth
                value={effectiveTableData.find((s: any) => s.id === formik.values.member) || null}
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
                options={effectiveTableData}
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
              <CustomSelect
                label="Book Title *"
                options={staticBookTitles}
                value={formik.values.bookTitle}
                onChange={(val) => formik.setFieldValue('bookTitle', val)}
                labelKey="label"
                valueKey="value"
                formControlProps={{ fullWidth: true }}
                error={!!(formik.touched.bookTitle && formik.errors.bookTitle)}
                helperText={(formik.touched.bookTitle && formik.errors.bookTitle) as string}
              />
            </ShakingTextField>
          </Grid>

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
