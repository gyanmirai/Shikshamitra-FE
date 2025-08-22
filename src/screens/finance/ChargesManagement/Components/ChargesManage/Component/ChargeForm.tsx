import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import React, { useMemo, useState, useEffect } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Grid, Chip, Button, TextField, Autocomplete, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { useLazyGetFilterStudentsQuery } from 'src/redux/student';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import type { IChargeFormProps } from './type';

const ChargeForm = ({ open, onClose }: IChargeFormProps) => {
  const formik = useFormik({
    initialValues: {
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
      additionalNotes: '', // This field is optional
    },
    validationSchema: Yup.object({
      chargeCategory: Yup.string().required('Charge Category is required'),
      description: Yup.string().required('Description is required'),
      amount: Yup.number().required('Amount is required'),
      dueDate: Yup.date().required('Due Date is required'),
      priority: Yup.string().required('Priority is required'),
      academicYear: Yup.string().required('Academic Year is required'),
      board: Yup.string().required('Board is required'),
      medium: Yup.string().required('Medium is required'),
      class: Yup.string().required('Class is required'),
      divisions: Yup.array()
        .min(1, 'At least one division must be selected')
        .required('Divisions are required'),
      students: Yup.array()
        .min(1, 'At least one student must be selected')
        .required('Students are required'),
      additionalNotes: Yup.string().required('Additional Notes are required'),
    }),
    onSubmit: (values) => {
      console.log('Charge Form Submit:', values);
    },
  });
  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [classes, setClass] = useState<string>('');
  // State to store all divisions for the selected class
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  // State to store selected division ID
  const [division, setDivision] = useState<string>('');
  const { values, touched, errors, setFieldValue, setFieldTouched, initialValues } = formik;

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

  // Update classes when organization changes
  useEffect(() => {
    // Flatten the list of standards from all stages
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];
    setAllClass(allClasses);
    setClass(allClasses[0]?.name || '');
  }, [medium]);

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
          <Grid item xs={12}>
            <ShakingTextField error={!!(touched.chargeCategory && errors.chargeCategory) || false}>
              <CustomSelect
                name="chargeCategory"
                label="Charge Category *"
                options={[
                  { id: 'COMPETITION', name: 'Competition Fee' },
                  { id: 'EXAM', name: 'Exam Fee' },
                  { id: 'LAB', name: 'Lab Fee' },
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

          <Grid item xs={12}>
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
          </Grid>

          <Grid item xs={12}>
            <TextField
              name="amount"
              label="Amount *"
              type="number"
              fullWidth
              value={values.amount}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={!!(touched.amount && errors.amount)}
              helperText={(touched.amount && errors.amount) as string}
            />
          </Grid>

          <Grid item xs={12}>
            <DatePicker
              label="Due Date *"
              name="dueDate"
              value={values.dueDate}
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
          </Grid>

          <Grid item xs={12}>
            <ShakingTextField error={!!(touched.priority && errors.priority) || false}>
              <CustomSelect
                name="priority"
                label="Priority *"
                options={[
                  { id: 'LOW', name: 'Low' },
                  { id: 'MEDIUM', name: 'Medium' },
                  { id: 'HIGH', name: 'High' },
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

          <Grid item xs={12}>
            <ShakingTextField error={!!(touched.class && errors.class) || false}>
              <CustomSelect
                name="class"
                label="Class *"
                options={allClass}
                labelKey="name"
                valueKey="id"
                value={values.class}
                onChange={(value) => {
                  // Set the selected class value
                  setFieldValue('class', value);

                  // Get divisions for the selected class
                  const selectedClassDivisions =
                    allClass.find((cls) => cls.id === value)?.divisions || [];

                  // Add 'All' option to divisions list with full Division interface structure
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
                  // Set 'all' as default selected division and include all actual divisions
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

          <Grid item xs={12}>
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
                    // Select all divisions when "All" is clicked
                    setFieldValue('divisions', ['all', ...allDivisionIds]);
                  } else if (!isAllClicked && wasAllPreviouslySelected) {
                    // Deselect all when "All" is unchecked
                    setFieldValue('divisions', []);
                  } else if (isAllClicked && wasAllPreviouslySelected) {
                    // Handle individual selections while "All" is selected
                    const selectedWithoutAll = value.filter((id) => id !== 'all');
                    if (selectedWithoutAll.length === allDivisionIds.length) {
                      setFieldValue('divisions', ['all', ...allDivisionIds]);
                    } else {
                      setFieldValue('divisions', selectedWithoutAll);
                    }
                  } else {
                    // Handle individual selections without "All"
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
          <Grid item xs={12}>
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

          <Grid item xs={12}>
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
          startIcon={<Iconify icon={GlobalIcons.submit} width={20} height={20} />}
          type="submit"
          variant="contained"
          size="small"
          onClick={(e: any) => formik.handleSubmit(e)}
        >
          Submit
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default ChargeForm;
