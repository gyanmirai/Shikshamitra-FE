import type { Board, Division, Standards, AcademicYear } from 'src/types/school';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { useGetYearQuery } from 'src/redux/year/yearApi';
import React, { useMemo, useState, useEffect } from 'react';
import { useGetBoardsQuery } from 'src/redux/board/boardApi';
import ShakingTextField from 'src/components/shaking-text-field';
import { useLazyGetFilterStudentsQuery } from 'src/redux/student';
import { DialogScrollContent } from 'src/components/custom-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetClassByMediumQuery } from 'src/redux/class/classApi';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Grid, Chip, Button, TextField, Autocomplete, DialogActions } from '@mui/material';

import type { InvoiceFormProps } from './type';

const InvoiceForm = ({ open, onClose }: InvoiceFormProps) => {
  const formik = useFormik({
    initialValues: {
      invoiceType: '',
      academicYear: '',
      medium: '',
      class: '',
      board: '',
      divisions: [],
      students: [],
      dueDate: null,
      installmentName: '',
    },
    validationSchema: Yup.object({
      academicYear: Yup.string().required('Academic Year is required'),
      medium: Yup.string().required('Medium is required'),
      class: Yup.string().required('Class is required'),
      board: Yup.string().required('Board is required'),
    }),
    onSubmit: (values) => {
      // Handle form submission
    },
  });

  const { values, touched, errors, setFieldValue, setFieldTouched, initialValues } = formik;
  // State to store list of all divisions
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  /**
   * Hook to get classes by medium
   */
  const [getClassByMedium, { data: classes, isLoading: classLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetClassByMediumQuery,
  });
  const { data: board, isLoading: boardLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBoardsQuery,
  });

  // Initialize query hook for fetching students
  const [getStudents, { data: StudentsData, isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetFilterStudentsQuery,
  });

  const [boards, setBoards] = useState([]);
  // Fetch students when division, class and organization are all selected
  useEffect(() => {
    if (values.divisions.length > 0 && values.class && values.medium) {
      // Create array of API calls for each selected division
      const studentPromises = values.divisions.map((divisionId) =>
        getStudents({
          educationMediumStageId: values.medium,
          standardId: values.class,
          divisionId,
        })
      );

      // Execute all API calls in parallel
      Promise.all(studentPromises).catch((error) => {
        console.error('Error fetching students:', error);
      });
    }
  }, [values.divisions, values.class, values.medium, getStudents]);

  // Transform student data to include full name
  const tableData = useMemo(
    () =>
      StudentsData?.items?.map((item: any) => ({
        ...item,
        name: `${item.firstName} ${item.lastName} ${item.middleName}`,
      })) || [],
    [StudentsData?.items]
  );

  const [, setSelectedAcademicYear] = useState<string>(''); /**
  /**
   * Hook to fetch academic year data
   */
  const { data: academicYear, isLoading: yearLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetYearQuery,
  });
  useEffect(() => {
    // Find and set selected academic year name
    const year = academicYear?.items?.find((item: AcademicYear) => item.id === values.academicYear);
    setSelectedAcademicYear(year?.name ?? '');

    // Filter and set boards based on academic year
    if (board?.items) {
      const findBoards = board.items.filter(
        (item: Board) => item.academicYearId === values.academicYear
      );
      setBoards(findBoards);
    }
  }, [academicYear?.items, board?.items, values.academicYear]);

  return (
    <BackPopUpChecked initialValues={initialValues} currentValues={values}>
      <DialogScrollContent>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <CustomSelect
              name="academicYear"
              label="Academic Year *"
              isLoading={yearLoading}
              options={academicYear?.items || []}
              value={values.academicYear}
              labelKey="name"
              valueKey="id"
              onChange={(value) => {
                const findBoards = board?.items.filter(
                  (item: Board) => item.academicYearId === value
                );

                setBoards(findBoards);
                setFieldValue('board', '');
                setFieldValue('medium', '');
                setFieldValue('class', '');
                setFieldValue('academicYear', value);
              }}
              error={!!(touched.academicYear && errors.academicYear) || false}
              helperText={(touched.academicYear && errors.academicYear) || ''}
              formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <ShakingTextField error={!!(touched.board && errors.board) || false}>
              <CustomSelect
                name="board"
                label="Board *"
                isLoading={boardLoading}
                options={boards || []}
                labelKey="name"
                valueKey="id"
                value={values.board}
                onChange={(value) => {
                  setFieldValue('medium', '');
                  setFieldValue('class', '');
                  setFieldValue('board', value);
                }}
                error={!!(touched.board && errors.board) || false}
                helperText={(touched.board && errors.board) || ''}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                disabled={!values.academicYear}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <ShakingTextField error={!!(touched.medium && errors.medium) || false}>
              <CustomSelect
                name="medium"
                label="Medium *"
                disabled={!values.board}
                options={
                  board?.items?.find((item: Board) => item.id === values.board)?.educationMediums ||
                  []
                }
                value={values.medium}
                labelKey="name"
                valueKey="id"
                onChange={async (value) => {
                  setFieldValue('medium', value);
                  setFieldValue('class', '');
                  setFieldTouched('medium', false);
                  await getClassByMedium(value);
                }}
                error={!!(touched.medium && errors.medium) || false}
                helperText={(touched.medium && errors.medium) || ''}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <ShakingTextField error={!!(touched.invoiceType && errors.invoiceType) || false}>
              <CustomSelect
                name="invoiceType"
                label="Invoice Type *"
                options={[
                  { id: 'REGULAR', name: 'Regular Invoice' },
                  { id: 'INSTALLMENT', name: 'Installment Invoice' },
                  { id: 'SPECIAL', name: 'Special Invoice' },
                ]}
                labelKey="name"
                valueKey="id"
                value={values.invoiceType}
                onChange={(value) => {
                  setFieldValue('invoiceType', value);
                }}
                error={!!(touched.invoiceType && errors.invoiceType) || false}
                helperText={(touched.invoiceType && errors.invoiceType) || ''}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <ShakingTextField error={!!(touched.class && errors.class) || false}>
              <CustomSelect
                name="class"
                label="Class *"
                disabled={!values.medium}
                isLoading={classLoading}
                labelKey="name"
                valueKey="id"
                options={classes || []}
                value={values.class}
                onChange={async (value) => {
                  setFieldValue('class', value);
                  setFieldValue('divisions', []);

                  const selectedClass = classes?.find((c: Standards) => c.id === value);
                  if (selectedClass?.divisions) {
                    setAllDivision(selectedClass.divisions);
                  }
                }}
                error={!!(touched.class && errors.class) || false}
                helperText={(touched.class && errors.class) || ''}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CustomSelect
              options={allDivision}
              label="Division *"
              value={formik.values.divisions}
              onChange={(val) => formik.setFieldValue('divisions', val)}
              onBlur={() => formik.setFieldTouched('divisions', true)}
              error={formik.touched.divisions && Boolean(formik.errors.divisions)}
              helperText={(formik.touched.divisions && formik.errors.divisions) as string}
              labelKey="name"
              valueKey="id"
              multiple
              formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
              disabled={formik.values.class.length === 0}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <ShakingTextField error={!!(touched.students && errors.students) || false}>
              <Autocomplete
                loading={isLoading}
                noOptionsText="No Student Found"
                multiple
                fullWidth
                value={values.students}
                onChange={(e, value: any) => {
                  setFieldValue('student', value);
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
                    error={!!(touched.students && errors.students)}
                    helperText={(touched.students && errors.students) as string}
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

          <Grid size={{ xs: 12 }}>
            <ShakingTextField
              error={!!(touched.installmentName && errors.installmentName) || false}
            >
              <CustomSelect
                name="installmentName"
                label="Installment Name *"
                options={[
                  { id: 'FIRST', name: 'First Installment' },
                  { id: 'SECOND', name: 'Second Installment' },
                  { id: 'THIRD', name: 'Third Installment' },
                  { id: 'FOURTH', name: 'Fourth Installment' },
                ]}
                labelKey="name"
                valueKey="id"
                value={values.installmentName}
                onChange={(value) => {
                  setFieldValue('installmentName', value);
                }}
                error={!!(touched.installmentName && errors.installmentName) || false}
                helperText={(touched.installmentName && errors.installmentName) || ''}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
            </ShakingTextField>
          </Grid>
        </Grid>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={() => {
            onClose(null, false);
          }}
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
          onClick={(e: any) => {
            formik.handleSubmit(e);
          }}
        >
          Submit
        </Button>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default InvoiceForm;
