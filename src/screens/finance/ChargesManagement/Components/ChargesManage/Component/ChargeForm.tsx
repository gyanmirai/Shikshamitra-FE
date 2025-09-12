import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import React, { useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import { useLazyGetFilterStudentsQuery } from 'src/redux/student';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Grid, Chip, Button, TextField, Autocomplete, DialogActions } from '@mui/material';

import type { IChargeFormProps } from './type';

const ChargeForm = ({ open, onClose, editData, isEdit = false }: IChargeFormProps) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [allDivision, setAllDivision] = useState<Division[]>([]);

  const [getStudents, { data: StudentsData, isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetFilterStudentsQuery,
  });

  // Get current board, medium and medium setter from global state
  const {
    currentBoard,
    currentMedium: medium,
    setCurrentMedium: setMedium,
  } = useSelector((state: RootState) => state.globalState);

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
        divisions: editData.divisions || [],
        students: editData.studentList || [],
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
      divisions: [],
      students: [],
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
      divisions: Yup.array()
        .min(1, 'At least one division must be selected')
        .required('Divisions are required'),
      students: Yup.array()
        .min(1, 'At least one student must be selected')
        .required('Students are required'),
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
    if (values.class && values.divisions.length > 0) {
      const filterCriteria = {
        classIds: [values.class],
        divisionIds: values.divisions.filter((d) => d !== 'all'),
      };
      getStudents(filterCriteria);
    }
  }, [values.class, values.divisions, getStudents]);

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
    <BackPopUpChecked initialValues={initialValues} currentValues={values}>
      <DialogScrollContent>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <ShakingTextField error={!!(touched.chargeCategory && errors.chargeCategory) || false}>
              <CustomSelect
                name="chargeCategory"
                label="Charge Category *"
                options={[
                  { id: 'Tuition Fee', name: 'Tuition Fee' },
                  { id: 'COMPETITION', name: 'Competition Fee' },
                  { id: 'EXAM', name: 'Exam Fee' },
                  { id: 'LAB', name: 'Lab Fee' },
                  { id: 'LIBRARY', name: 'Library Fee' },
                  { id: 'TRANSPORT', name: 'Transport Fee' },
                  { id: 'SPORTS', name: 'Sports Fee' },
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
                  const selectedClassDivisions =
                    allClass.find((cls) => cls.id === value)?.divisions || [];
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
                  const allDivisionIds = ['all', ...selectedClassDivisions.map((div) => div.id)];
                  setFieldValue('divisions', allDivisionIds);
                }}
                error={!!(touched.class && errors.class) || false}
                helperText={(touched.class && errors.class) || ''}
                formControlProps={{ sx: { width: '100%' } }}
                multiple={false}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <ShakingTextField error={!!(touched.divisions && errors.divisions) || false}>
              <CustomSelect
                name="divisions"
                label="Division *"
                labelKey="name"
                valueKey="id"
                multiple
                disabled={!values.class}
                options={[
                  { id: 'all', name: 'All' },
                  ...(allClass?.find((i: Standards) => i.id === values.class)?.divisions || []),
                ]}
                value={values.divisions}
                onChange={(val) => {
                  const value = val as string[];
                  const divisionOptions =
                    allClass?.find((i: Standards) => i.id === values.class)?.divisions || [];
                  const allDivisionIds = divisionOptions.map((d) => d.id);
                  const isAllClicked = value.includes('all');
                  const wasAllPreviouslySelected = (values.divisions as string[]).includes('all');

                  if (isAllClicked && !wasAllPreviouslySelected) {
                    setFieldValue('divisions', ['all', ...allDivisionIds]);
                  } else if (!isAllClicked && wasAllPreviouslySelected) {
                    setFieldValue('divisions', []);
                  } else if (isAllClicked && wasAllPreviouslySelected) {
                    const selectedWithoutAll = value.filter((id) => id !== 'all');
                    if (selectedWithoutAll.length === allDivisionIds.length) {
                      setFieldValue('divisions', ['all', ...allDivisionIds]);
                    } else {
                      setFieldValue('divisions', selectedWithoutAll);
                    }
                  } else {
                    const selectedWithoutAll = value.filter((id) => id !== 'all');
                    if (selectedWithoutAll.length === allDivisionIds.length) {
                      setFieldValue('divisions', ['all', ...allDivisionIds]);
                    } else {
                      setFieldValue('divisions', selectedWithoutAll);
                    }
                  }
                  setFieldTouched('divisions', false);
                }}
                formControlProps={{ sx: { width: '100%' } }}
                error={!!(touched.divisions && errors.divisions)}
                helperText={(touched.divisions && errors.divisions) as string}
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
                  val = val.replace(/[₹,\s]/g, '');
                  setFieldValue('amount', Number(val));
                  setFieldTouched('amount', false);
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
            <ShakingTextField error={!!(touched.students && errors.students) || false}>
              <Autocomplete
                loading={isLoading}
                multiple
                fullWidth
                value={values.students}
                onChange={(e, value: any) => setFieldValue('students', value)}
                renderTags={(tagValue, getTagProps) =>
                  tagValue.map((option, index) => (
                    <Chip label={option.name} size="small" {...getTagProps({ index })} />
                  ))
                }
                options={tableData}
                getOptionLabel={(option: any) => option?.name || ''}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    label="Select Student *"
                    fullWidth
                    error={!!(touched.students && errors.students)}
                    helperText={(touched.students && errors.students) as string}
                  />
                )}
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

          <Grid size={{ xs: 12 }}>
            <ShakingTextField error={!!(touched.description && errors.description) || false}>
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

          <Grid size={{ xs: 12 }}>
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
    </BackPopUpChecked>
  );
};

export default ChargeForm;
