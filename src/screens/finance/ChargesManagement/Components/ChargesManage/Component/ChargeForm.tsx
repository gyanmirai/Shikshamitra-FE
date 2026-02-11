import type { RootState } from 'src/redux/store';
import type { Division } from 'src/types/school';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import React, { useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import { useLazyGetFilterStudentsQuery } from 'src/redux/student';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { useLazyGetClassByMediumQuery } from 'src/redux/class/classApi';
import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import { cardStyle } from 'src/screens/academic/homework-assignment-management/homeworkCreation/component/homeworkForm';

import type { IChargeFormProps } from './type';

const ChargeForm = ({ open, onClose, editData, isEdit = false }: IChargeFormProps) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  // State
  const [boards, setBoards] = useState<any[]>([]);
  const [mediums, setMediums] = useState<any[]>([]);
  const [allDivision, setAllDivision] = useState<Division[]>([]);

  // Queries
  const [getClassByMedium, { data: classes }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetClassByMediumQuery,
  });

  const [getFilterStudents] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetFilterStudentsQuery,
  });

  // Memoize initial values
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
      board: Yup.string().required('Board is required'),
      medium: Yup.string().required('Medium is required'),
      class: Yup.string().required('Class is required'),
      division: Yup.string().required('Division is required'),
      studentName: Yup.object().nullable().required('Student is required'),
    }),
    onSubmit: (values) => {
      onClose(null, true);
    },
  });

  const { values, touched, errors, setFieldValue, setFieldTouched } = formik;

  // Load boards on year change
  useEffect(() => {
    setBoards(currentYear?.boards || []);
  }, [currentYear]);

  // Load mediums when board changes
  useEffect(() => {
    const selectedBoard = boards.find((b: any) => b.id === values.board);
    setMediums(selectedBoard?.educationMediums || []);

    // Fetch classes if medium is already selected (e.g. edit mode) or re-selected
    if (values.medium) {
      getClassByMedium(values.medium);
    }
  }, [values.board, values.medium, boards, getClassByMedium]);

  // Load divisions when class changes
  useEffect(() => {
    setAllDivision(classes?.find((cls: any) => cls.id === values.class)?.divisions || []);
  }, [values.class, classes]);

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
                          val = val.replace(/\D/g, '');
                          if (/^\d*$/.test(val)) {
                            setFieldValue('amount', val);
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
                        minDate={dayjs().startOf('day')}
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
                  {/* Board */}
                  <Grid size={{ xs: 6 }}>
                    <ShakingTextField error={!!(touched.board && errors.board)}>
                      <CustomSelect
                        label="Board *"
                        options={boards}
                        labelKey="name"
                        valueKey="id"
                        value={values.board}
                        onChange={(val) => {
                          setFieldValue('board', val);
                          setFieldTouched('board', false);
                          setFieldValue('medium', '');
                          setFieldValue('class', '');
                          setFieldValue('division', '');
                          setFieldValue('studentName', null);
                        }}
                        error={!!errors.board && touched.board}
                        helperText={(touched.board && errors.board) as string}
                      />
                    </ShakingTextField>
                  </Grid>

                  {/* Medium */}
                  <Grid size={{ xs: 6 }}>
                    <ShakingTextField error={!!(touched.medium && errors.medium)}>
                      <CustomSelect
                        label="Medium *"
                        disabled={!values.board}
                        options={mediums}
                        labelKey="name"
                        valueKey="id"
                        value={values.medium}
                        onChange={(val) => {
                          setFieldValue('medium', val);
                          setFieldTouched('medium', false);
                          setFieldValue('class', '');
                          setFieldValue('division', '');
                          setFieldValue('studentName', null);
                        }}
                        error={!!errors.medium && touched.medium}
                        helperText={(touched.medium && errors.medium) as string}
                      />
                    </ShakingTextField>
                  </Grid>

                  {/* Class */}
                  <Grid size={{ xs: 6 }}>
                    <ShakingTextField error={!!(touched.class && errors.class) || false}>
                      <CustomSelect
                        name="class"
                        label="Class *"
                        options={classes || []}
                        labelKey="name"
                        valueKey="id"
                        value={values.class}
                        disabled={!values.medium}
                        onChange={(value) => {
                          setFieldValue('class', value);
                          setFieldTouched('class', false);
                          setFieldValue('division', '');
                          setFieldValue('studentName', null);
                        }}
                        error={!!(touched.class && errors.class) || false}
                        helperText={(touched.class && errors.class) || ''}
                        formControlProps={{ sx: { width: '100%' } }}
                        multiple={false}
                      />
                    </ShakingTextField>
                  </Grid>

                  {/* Division */}
                  <Grid size={{ xs: 6 }}>
                    <ShakingTextField error={!!(touched.division && errors.division) || false}>
                      <CustomSelect
                        name="division"
                        label="Division *"
                        labelKey="name"
                        valueKey="id"
                        disabled={!values.class}
                        options={allDivision}
                        value={values.division}
                        onChange={(value) => {
                          setFieldValue('division', value);
                          setFieldTouched('division', false);
                          setFieldValue('studentName', null);
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
                      <PaginatedSearchSelect
                        key={`${values.class}-${values.division}`}
                        label="Student *"
                        disabled={!values.division}
                        fetchOptions={async (query, page) => {
                          if (!values.division) return { data: [], hasMore: false };

                          const res = await getFilterStudents({
                            page,
                            pageSize: 10,
                            academicYearId: currentYear.id,
                            standardId: values.class,
                            divisionId: values.division,
                            search: query,
                          }).unwrap();

                          const hasMore = res.currentPage !== res.totalPages;
                          return {
                            data: res?.items?.map((item: any) => ({
                              label: `${item.firstName} ${item.lastName} ${item.middleName}`,
                              id: item.studentId,
                            })),
                            hasMore,
                          };
                        }}
                        value={values.studentName}
                        renderOption={(prop, option: any) => (
                          <li {...prop} key={option.id}>
                            {option.label}
                          </li>
                        )}
                        getOptionLabel={(option: any) => option?.label || ''}
                        minChars={2}
                        onChange={(_, value) => setFieldValue('studentName', value)}
                        debounceMs={400}
                        placeholder="Search by name"
                        sx={{ minWidth: 250 }}
                        size="small"
                        error={!!(touched.studentName && errors.studentName) || false}
                        helperText={(touched.studentName && errors.studentName) || ''}
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
