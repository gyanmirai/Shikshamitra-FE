import type { RootState } from 'src/redux/store';
import type { Division } from 'src/types/school';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import React, { useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import { useLazyGetFilterStudentsQuery } from 'src/redux/student';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { useLazyGetClassByMediumQuery } from 'src/redux/class/classApi';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import { useGetChargeCategoriesQuery } from 'src/redux/finance/chargeCategory';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Box, Grid, Button, TextField, Typography, DialogActions } from '@mui/material';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import {
  usePostChargeMutation,
  useUpdateChargeMutation,
} from 'src/redux/finance/ChargeManagement/chargeApi';
import { cardStyle } from 'src/screens/academic/homework-assignment-management/homeworkCreation/component/homeworkForm';

import type { IChargeFormProps } from './type';

const ChargeForm = ({ open, onClose, editData, isEdit = false }: IChargeFormProps) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  // State
  const [boards, setBoards] = useState<any[]>([]);
  const [mediums, setMediums] = useState<any[]>([]);
  const [allDivision, setAllDivision] = useState<Division[]>([]);

  // Queries
  const [getClassByMedium, { data: classes, isLoading: classesLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetClassByMediumQuery,
  });

  const [getFilterStudents] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetFilterStudentsQuery,
  });
  // Get charge categories data
  const {
    data: chargeCategories,
    isLoading: chargeCategoriesLoading,
    refetch: chargeCategoriesRefetch,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetChargeCategoriesQuery,
    params: {
      academicYearId: currentYear?.id,
    },
  });
  const [postCharge, { isLoading: postChargeLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePostChargeMutation,
  });
  const [updateCharge, { isLoading: updateChargeLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateChargeMutation,
  });

  // Memoize initial values
  const initialValues = useMemo(() => {
    if (isEdit && editData) {
      return {
        chargeCategoryId: editData.chargeCategoryId || '',
        chargeCategoryName: editData.chargeCategoryName || '',
        purposeDescription: editData.purposeDescription || '',
        amount: editData.amount || '',
        dueDate: editData.dueDate ? dayjs(editData.dueDate, 'DD-MM-YYYY') : null,
        priority: editData.priority?.toString() || '',
        boardId: editData.boardId || '',
        educationMediumId: editData.educationMediumId || '',
        standardId: editData.standardId || '',
        divisionId: editData.divisionId || '',
        studentId: editData.studentId || null,
        selectedStudent:
          editData.studentId && editData.studentName
            ? { id: editData.studentId, label: editData.studentName }
            : null,
        additionalNotes: editData.additionalNotes || '',
      };
    }
    return {
      chargeCategoryId: '',
      chargeCategoryName: '',
      purposeDescription: '',
      amount: '',
      dueDate: null,
      priority: '',
      boardId: '',
      educationMediumId: '',
      standardId: '',
      divisionId: '',
      studentId: null,
      selectedStudent: null,
      additionalNotes: '',
    };
  }, [isEdit, editData]);

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: Yup.object({
      chargeCategoryId: Yup.string().required('Charge Category is required'),
      purposeDescription: Yup.string().required('Purpose/Description is required'),
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
      boardId: Yup.string().required('Board is required'),
      educationMediumId: Yup.string().required('Medium is required'),
      standardId: Yup.string().required('Class is required'),
      divisionId: Yup.string().required('Division is required'),
      selectedStudent: Yup.object().nullable().required('Student is required'),
      studentId: Yup.string().nullable().required('Student is required'),
    }),
    onSubmit: async (values) => {
      try {
        const payload = {
          chargeCategoryId: values.chargeCategoryId,
          purposeDescription: values.purposeDescription,
          amount: parseFloat(String(values.amount)),
          dueDate: values.dueDate ? dayjs(values.dueDate).toISOString() : null,
          priority: parseInt(values.priority, 10),
          additionalNotes: values.additionalNotes,
        };

        if (isEdit && editData) {
          await updateCharge({ id: editData.chargeId, body: payload }).unwrap();
          shikshaMitraToast.success({
            message: `Charge updated successfully for ${values.chargeCategoryName}`,
          });
        } else {
          const createPayload = {
            ...payload,
            boardId: values.boardId,
            educationMediumId: values.educationMediumId,
            standardId: values.standardId,
            divisionId: values.divisionId,
            studentId: values.studentId,
          };
          await postCharge({ academicYearId: currentYear?.id, body: createPayload }).unwrap();
          shikshaMitraToast.success({
            message: `Charge added successfully for ${values.chargeCategoryName}`,
          });
        }
        onClose(null, true);
      } catch (error) {
        console.error('Failed to submit charge:', error);
      }
    },
  });

  const { values, touched, errors, setFieldValue, setFieldTouched } = formik;
  console.log('values000000', values);
  console.log('erroes----', errors);
  // Load boards on year change
  useEffect(() => {
    setBoards(currentYear?.boards || []);
  }, [currentYear]);

  // Load mediums when board changes
  // Load mediums when board changes
  useEffect(() => {
    const selectedBoard = boards.find((b: any) => b.id === values.boardId);
    setMediums(selectedBoard?.educationMediums || []);

    // Fetch classes if medium is already selected (e.g. edit mode) or re-selected
    if (values.educationMediumId) {
      getClassByMedium(values.educationMediumId);
    }
  }, [values.boardId, values.educationMediumId, boards, getClassByMedium]);

  // Load divisions when class changes
  useEffect(() => {
    setAllDivision(classes?.find((cls: any) => cls.id === values.standardId)?.divisions || []);
  }, [values.standardId, classes]);

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
                      error={!!(touched.chargeCategoryId && errors.chargeCategoryId) || false}
                    >
                      <CustomSelect
                        name="chargeCategoryId"
                        label="Charge Category *"
                        isLoading={chargeCategoriesLoading}
                        options={chargeCategories?.items || []}
                        labelKey="name"
                        valueKey="id"
                        value={values.chargeCategoryId}
                        onChange={(value) => setFieldValue('chargeCategoryId', value)}
                        error={!!(touched.chargeCategoryId && errors.chargeCategoryId) || false}
                        helperText={(touched.chargeCategoryId && errors.chargeCategoryId) || ''}
                        formControlProps={{ fullWidth: true }}
                      />
                    </ShakingTextField>
                    {values.chargeCategoryId && (
                      <Typography variant="body2" color="text.secondary">
                        {chargeCategories?.items?.find(
                          (item: any) => item.id === values.chargeCategoryId
                        )?.isApprovalRequired
                          ? 'This charge need the approval from the authority'
                          : 'This charge does not need the approval from the authority'}
                      </Typography>
                    )}
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <ShakingTextField
                      error={!!(touched.purposeDescription && errors.purposeDescription) || false}
                    >
                      <TextField
                        name="purposeDescription"
                        label="Purpose/Description *"
                        multiline
                        minRows={3}
                        fullWidth
                        value={values.purposeDescription}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={!!(touched.purposeDescription && errors.purposeDescription)}
                        helperText={
                          (touched.purposeDescription && errors.purposeDescription) as string
                        }
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
                    <ShakingTextField error={!!(touched.boardId && errors.boardId)}>
                      <CustomSelect
                        disabled={isEdit}
                        label="Board *"
                        options={boards}
                        labelKey="name"
                        valueKey="id"
                        value={values.boardId}
                        onChange={(val) => {
                          setFieldValue('boardId', val);
                          setFieldTouched('boardId', false);
                          setFieldValue('educationMediumId', '');
                          setFieldValue('standardId', '');
                          setFieldValue('divisionId', '');
                          setFieldValue('studentId', null);
                          setFieldValue('selectedStudent', null);
                        }}
                        error={!!errors.boardId && touched.boardId}
                        helperText={(touched.boardId && errors.boardId) as string}
                      />
                    </ShakingTextField>
                  </Grid>

                  {/* Medium */}
                  <Grid size={{ xs: 6 }}>
                    <ShakingTextField
                      error={!!(touched.educationMediumId && errors.educationMediumId)}
                    >
                      <CustomSelect
                        label="Medium *"
                        disabled={!values.boardId || isEdit}
                        options={mediums}
                        labelKey="name"
                        valueKey="id"
                        value={values.educationMediumId}
                        onChange={(val) => {
                          setFieldValue('educationMediumId', val);
                          setFieldTouched('educationMediumId', false);
                          setFieldValue('standardId', '');
                          setFieldValue('divisionId', '');
                          setFieldValue('studentId', null);
                          setFieldValue('selectedStudent', null);
                        }}
                        error={!!errors.educationMediumId && touched.educationMediumId}
                        helperText={
                          (touched.educationMediumId && errors.educationMediumId) as string
                        }
                      />
                    </ShakingTextField>
                  </Grid>

                  {/* Class */}
                  <Grid size={{ xs: 6 }}>
                    <ShakingTextField error={!!(touched.standardId && errors.standardId) || false}>
                      <CustomSelect
                        name="standardId"
                        label="Class *"
                        options={classes || []}
                        labelKey="name"
                        valueKey="id"
                        isLoading={classesLoading}
                        value={values.standardId}
                        disabled={!values.educationMediumId || isEdit}
                        onChange={(value) => {
                          setFieldValue('standardId', value);
                          setFieldTouched('standardId', false);
                          setFieldValue('divisionId', '');
                          setFieldValue('studentId', null);
                          setFieldValue('selectedStudent', null);
                        }}
                        error={!!(touched.standardId && errors.standardId) || false}
                        helperText={(touched.standardId && errors.standardId) || ''}
                        formControlProps={{ sx: { width: '100%' } }}
                        multiple={false}
                      />
                    </ShakingTextField>
                  </Grid>

                  {/* Division */}
                  <Grid size={{ xs: 6 }}>
                    <ShakingTextField error={!!(touched.divisionId && errors.divisionId) || false}>
                      <CustomSelect
                        name="divisionId"
                        label="Division *"
                        labelKey="name"
                        valueKey="id"
                        disabled={!values.standardId || isEdit}
                        options={allDivision}
                        value={values.divisionId}
                        onChange={(value) => {
                          setFieldValue('divisionId', value);
                          setFieldTouched('divisionId', false);
                          setFieldValue('studentId', null);
                          setFieldValue('selectedStudent', null);
                        }}
                        formControlProps={{ sx: { width: '100%' } }}
                        error={!!(touched.divisionId && errors.divisionId)}
                        helperText={(touched.divisionId && errors.divisionId) as string}
                      />
                    </ShakingTextField>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <ShakingTextField
                      error={!!(touched.selectedStudent && errors.selectedStudent) || false}
                    >
                      <PaginatedSearchSelect
                        key={`${values.standardId}-${values.divisionId}`}
                        label="Student *"
                        disabled={!values.divisionId || isEdit}
                        fetchOptions={async (query, page) => {
                          if (!values.divisionId) return { data: [], hasMore: false };

                          const res = await getFilterStudents({
                            page,
                            pageSize: 10,
                            academicYearId: currentYear.id,
                            standardId: values.standardId,
                            divisionId: values.divisionId,
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
                        value={values.selectedStudent}
                        renderOption={(prop, option: any) => (
                          <li {...prop} key={option.id}>
                            {option.label}
                          </li>
                        )}
                        getOptionLabel={(option: any) => option?.label || ''}
                        minChars={2}
                        onChange={(_, value) => {
                          setFieldValue('selectedStudent', value);
                          setFieldValue('studentId', value?.id || null);
                        }}
                        debounceMs={400}
                        placeholder="Search by name"
                        sx={{ minWidth: 250 }}
                        size="small"
                        error={!!(touched.selectedStudent && errors.selectedStudent) || false}
                        helperText={(touched.selectedStudent && errors.selectedStudent) || ''}
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
            <LoadingButton
              type="submit"
              variant="contained"
              size="small"
              disabled={postChargeLoading || updateChargeLoading}
              startIcon={<Iconify icon={isEdit ? GlobalIcons.edit : GlobalIcons.submit} />}
              loading={postChargeLoading || updateChargeLoading}
            >
              {isEdit ? 'Update' : 'Submit'}
            </LoadingButton>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default ChargeForm;
