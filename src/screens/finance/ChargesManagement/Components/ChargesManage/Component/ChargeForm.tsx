import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import React, { useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import { useLazyGetFilterStudentsQuery } from 'src/redux/student';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import { Box, Grid, Button, Checkbox, TextField, Autocomplete, DialogActions } from '@mui/material';
import { cardStyle } from 'src/screens/academic/homework-assignment-management/homeworkCreation/component/homeworkForm';

import type { IChargeFormProps } from './type';

const ChargeForm = ({ open, onClose, editData, isEdit = false }: IChargeFormProps) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [, setAllDivision] = useState<Division[]>([]);

  const [getStudents, { data: StudentsData, isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetFilterStudentsQuery,
  });

  // Get current board, medium and medium setter from global state
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);
  // Memoize initial values to prevent re-creation on every render
  const initialValues = useMemo(() => {
    if (isEdit && editData) {
      return {
        chargeCategory: editData.category || '',
        description: editData.description || '',
        amount: editData.amount || '',
        dueDate: editData.dueDate ? dayjs(editData.dueDate, 'DD-MM-YYYY') : null,
        priority: editData.priority?.toString() || '',
        academicYear: editData.academicYear || '',
        board: editData.board || '',
        medium: editData.medium || '',
        class: editData.class || '',
        division: editData.division || '',
        studentName: editData.studentName || '',
        additionalNotes: editData.additionalNotes || '',
      };
    }
    return {
      chargeCategory: '',
      description: '',
      amount: '',
      dueDate: null,
      priority: '',
      academicYear: '',
      board: '',
      medium: '',
      class: '',
      division: '',
      studentName: null,
      additionalNotes: '',
    };
  }, [isEdit, editData]);

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: Yup.object({
      chargeCategory: Yup.string().required('Charge Category is required'),
      description: Yup.string().required('Purpose/Description is required'),
      amount: Yup.string()
        .required('Amount is required')
        .transform((value) => value.replace(/[^0-9.]/g, ''))
        .test('is-number', 'Amount must be a valid number greater than zero', (value) => {
          const numericValue = Number(value);
          return numericValue > 0;
        }),
      dueDate: Yup.mixed()
        .required('Due Date is required')
        .test(
          'is-valid-dayjs',
          'Due Date must be a valid date',
          (value) => value && dayjs(value as any).isValid()
        )
        .test(
          'min-date',
          (value) =>
            `Due Date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
          (value) => value && dayjs(value as any).isSameOrAfter(dayjs(currentYear.startDate), 'day')
        )
        .test(
          'max-date',
          (value) =>
            `Due Date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
          (value) => value && dayjs(value as any).isSameOrBefore(dayjs(currentYear.endDate), 'day')
        ),
      priority: Yup.string().required('Priority is required'),
      class: Yup.string().required('Class is required'),
      division: Yup.string().required('Division is required'),
      studentName: Yup.object().nullable().required('Student is required'),
    }),
    onSubmit: (values) => {
      onClose(null, true);
    },
  });

  const { values, touched, errors, setFieldValue, setFieldTouched } = formik;

  // Update classes when medium changes (only when medium changes)
  useEffect(() => {
    if (medium?.educationMediumStages) {
      const allClasses = medium.educationMediumStages.flatMap(
        (stage: Organization) => stage.standards || []
      );
      setAllClass(allClasses);
    }
  }, [medium]); // Only depend on medium

  // Load divisions when class changes and allClass is available
  useEffect(() => {
    if (values.class && allClass.length > 0) {
      const selectedClassDivisions =
        allClass.find((cls) => cls.id === values.class || cls.name === values.class)?.divisions ||
        [];

      const divisionsWithAll = [
        {
          id: 'all',
          name: 'All',
          creationTime: '',
          creatorId: '',
          lastModificationTime: '',
          lastModifierId: '',
          strength: 0,
          standardId: '',
        },
        ...selectedClassDivisions,
      ];
      setAllDivision(divisionsWithAll);
    }
  }, [values.class, allClass]); // Only depend on class value and allClass
  // Fetch students when class and divisions are selected
  useEffect(() => {
    if (values.class && values.division) {
      const filterCriteria = {
        classIds: [values.class],
        divisionIds: [values.division],
      };
      getStudents(filterCriteria);
    }
  }, [values.class, values.division, getStudents]);

  // Student table data
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
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid container>
              <Grid size={{ xs: 12 }}>
                <SectionCard title="Charge Details" paperProps={{ sx: { ...cardStyle } }}>
                  <Grid size={{ xs: 12 }}>
                    <ShakingTextField
                      error={!!(touched.chargeCategory && errors.chargeCategory) || false}
                    >
                      <CustomSelect
                        name="chargeCategory"
                        label="Charge Category *"
                        options={[
                          { id: 'Library Fine', name: 'Library Fine' },
                          { id: 'Transport Damage', name: 'Transport Damage' },
                          { id: 'Hostel Maintenance', name: 'Hostel Maintenance' },
                        ]}
                        labelKey="name"
                        valueKey="id"
                        value={values.chargeCategory}
                        onChange={(value) => setFieldValue('chargeCategory', value)}
                        error={!!(touched.chargeCategory && errors.chargeCategory) || false}
                        helperText={(touched.chargeCategory && errors.chargeCategory) || ''}
                        formControlProps={{ fullWidth: true }}
                      />
                    </ShakingTextField>
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <ShakingTextField
                      error={!!(touched.description && errors.description) || false}
                    >
                      <TextField
                        name="description"
                        label="Purpose/Description *"
                        multiline
                        minRows={3}
                        fullWidth
                        value={values.description}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={!!(touched.description && errors.description)}
                        helperText={(touched.description && errors.description) as string}
                      />
                    </ShakingTextField>
                  </Grid>

                  <Grid size={{ xs: 6 }}>
                    <ShakingTextField error={!!(touched.amount && errors.amount) || false}>
                      <NumericFormatCustom
                        size="small"
                        fullWidth
                        label="Amount *"
                        name="amount"
                        value={values.amount || ''}
                        onChange={(e) => {
                          let val = e.target.value;
                          // Remove currency symbol, commas, spaces and negative signs
                          val = val.replace(/\D/g, '');
                          // Convert to number and ensure it's positive
                          if (/^\d*$/.test(val)) {
                            setFieldValue('amount', val); // keep it as string while typing
                          }
                        }}
                        sx={{
                          width: '100%',
                          padding: '0',
                          borderRadius: 1,
                        }}
                        error={!!(touched.amount && errors.amount)}
                        helperText={(touched.amount && errors.amount) as string}
                      />
                    </ShakingTextField>
                  </Grid>

                  <Grid size={{ xs: 6 }}>
                    <ShakingTextField error={!!(touched.dueDate && errors.dueDate) || false}>
                      <DatePicker
                        label="Due Date *"
                        name="dueDate"
                        format="DD/MM/YYYY"
                        minDate={dayjs().startOf('day')} // disables all past dates
                        maxDate={dayjs(currentYear?.endDate)}
                        value={dayjs(values.dueDate) || null}
                        onChange={(newValue) => setFieldValue('dueDate', newValue)}
                        slotProps={{
                          textField: {
                            size: 'small',
                            fullWidth: true,
                            error: !!(touched.dueDate && errors.dueDate),
                            helperText: (touched.dueDate && errors.dueDate) as string,
                            onBlur: () => setFieldTouched('dueDate', true),
                          },
                        }}
                      />
                    </ShakingTextField>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <ShakingTextField error={!!(touched.priority && errors.priority) || false}>
                      <CustomSelect
                        name="priority"
                        label="Priority *"
                        options={[
                          { id: '0', name: 'Low' },
                          { id: '1', name: 'Medium' },
                          { id: '2', name: 'High' },
                        ]}
                        labelKey="name"
                        valueKey="id"
                        value={values.priority}
                        onChange={(value) => setFieldValue('priority', value)}
                        error={!!(touched.priority && errors.priority) || false}
                        helperText={(touched.priority && errors.priority) || ''}
                        formControlProps={{ fullWidth: true }}
                      />
                    </ShakingTextField>
                  </Grid>
                </SectionCard>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <SectionCard title="Student Information" paperProps={{ sx: { ...cardStyle } }}>
                  <Grid size={{ xs: 6 }}>
                    <ShakingTextField error={!!(touched.class && errors.class) || false}>
                      <CustomSelect
                        name="class"
                        label="Class *"
                        options={allClass}
                        labelKey="name"
                        valueKey="id"
                        value={values.class}
                        onChange={(value) => {
                          setFieldValue('class', value);
                          setFieldTouched('class', false);
                        }}
                        error={!!(touched.class && errors.class) || false}
                        helperText={(touched.class && errors.class) || ''}
                        formControlProps={{ sx: { width: '100%' } }}
                        multiple={false}
                      />
                    </ShakingTextField>
                  </Grid>

                  <Grid size={{ xs: 6 }}>
                    <ShakingTextField error={!!(touched.division && errors.division) || false}>
                      <CustomSelect
                        name="division"
                        label="Division *"
                        labelKey="name"
                        valueKey="id"
                        disabled={!values.class}
                        options={
                          allClass?.find((i: Standards) => i.id === values.class)?.divisions || []
                        }
                        value={values.division}
                        onChange={(value) => {
                          setFieldValue('division', value);
                          setFieldTouched('division', false);
                          setFieldValue('studentName', '');
                        }}
                        formControlProps={{ sx: { width: '100%' } }}
                        error={!!(touched.division && errors.division)}
                        helperText={(touched.division && errors.division) as string}
                      />
                    </ShakingTextField>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <ShakingTextField
                      error={!!(touched.studentName && errors.studentName) || false}
                    >
                      <Autocomplete
                        loading={isLoading}
                        fullWidth
                        disableCloseOnSelect
                        value={values.studentName}
                        disabled={!values.division}
                        onChange={(e, value: any) => {
                          setFieldValue('studentName', value);
                          setFieldTouched('studentName', false);
                        }}
                        options={tableData}
                        getOptionLabel={(option: any) => option?.name || ''}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        renderOption={(props, option, { selected }) => (
                          <li {...props} key={option.id}>
                            <Checkbox
                              icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                              checkedIcon={<CheckBoxIcon fontSize="small" />}
                              style={{ marginRight: 8 }}
                              checked={selected}
                            />
                            {option.name}
                          </li>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            label="Student *"
                            fullWidth
                            error={!!(touched.studentName && errors.studentName)}
                            helperText={(touched.studentName && errors.studentName) as string}
                            sx={(theme) => ({
                              ...(!!(touched.studentName && errors.studentName) &&
                                !values.division && {
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: `${theme.palette.error.main} !important`,
                                  },
                                  '& .MuiInputLabel-root.Mui-disabled': {
                                    color: `${theme.palette.error.main} !important`,
                                  },
                                }),
                            })}
                          />
                        )}
                      />
                    </ShakingTextField>
                  </Grid>
                </SectionCard>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <SectionCard title="Additional Notes" paperProps={{ sx: { ...cardStyle } }}>
                  <TextField
                    name="additionalNotes"
                    label="Additional Notes"
                    multiline
                    minRows={3}
                    fullWidth
                    value={values.additionalNotes}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </SectionCard>
              </Grid>
            </Grid>
          </Scrollbar>

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
              type="submit"
              variant="contained"
              size="small"
              onClick={(e: any) => {
                formik.handleSubmit(e);
              }}
              startIcon={<Iconify icon={isEdit ? GlobalIcons.edit : GlobalIcons.submit} />}
            >
              {isEdit ? 'Update' : 'Submit'}
            </Button>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default ChargeForm;
