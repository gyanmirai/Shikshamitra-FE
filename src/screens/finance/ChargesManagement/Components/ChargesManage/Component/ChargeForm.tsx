import type { RootState } from 'src/redux/store';
import type { Division } from 'src/types/school';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { motion } from 'framer-motion';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { alpha, useTheme } from '@mui/material/styles';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetStudentsByDivisionQuery } from 'src/redux/student';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { useLazyGetClassByMediumQuery } from 'src/redux/class/classApi';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useGetChargeCategoriesQuery } from 'src/redux/finance/chargeCategory';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  usePostChargeMutation,
  useUpdateChargeMutation,
} from 'src/redux/finance/ChargeManagement/chargeApi';
import {
  Box,
  Grid,
  Paper,
  Stack,
  Button,
  Divider,
  TextField,
  Typography,
  Autocomplete,
} from '@mui/material';

import type { IChargeFormProps } from './type';

const ChargeForm = ({ open, onClose, editData, isEdit = false }: IChargeFormProps) => {
  const theme = useTheme();
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

  const [
    getStudents,
    { data: studentsData, isLoading: studentLoading, isFetching: studentFetching },
  ] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetStudentsByDivisionQuery,
  });

  const studentOptions = useMemo(
    () =>
      studentsData?.items?.map((item: any) => ({
        ...item,
        name: `${item.firstName}${item.middleName ? ` ${item.middleName}` : ''} ${item.lastName}`,
      })) || [],
    [studentsData?.items]
  );
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

  const handleSubmit = useCallback(() => {
    formik.validateForm().then((validationErrors) => {
      formik.handleSubmit();
    });
  }, [formik]);

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

  useEffect(() => {
    if (values.divisionId) getStudents(values.divisionId);
  }, [values.divisionId, getStudents]);

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          display="flex"
          flexDirection="column"
          height="100%"
        >
          <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
            <Box sx={{ p: 1 }}>
              <Grid container spacing={0}>
                <Grid size={{ xs: 12 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      mb: 1.5,
                      borderRadius: 2,
                      transition: 'box-shadow 0.2s ease',
                      '&:hover': { boxShadow: 4 },
                    }}
                  >
                    <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                      <Iconify
                        icon="mdi:information-outline"
                        width={18}
                        sx={{ color: 'primary.main' }}
                      />
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>
                          Charge Details
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Configure amount, due date, and charge priority
                        </Typography>
                      </Box>
                    </Stack>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      {/* Charge Category */}
                      <Grid size={{ xs: 12, md: 3 }}>
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

                      {/* Amount */}
                      <Grid size={{ xs: 6, md: 3 }}>
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

                      {/* Due Date */}
                      <Grid size={{ xs: 6, md: 3 }}>
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

                      {/* Priority */}
                      <Grid size={{ xs: 12, md: 3 }}>
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

                      {/* Purpose/Description */}
                      <Grid size={{ xs: 12 }}>
                        <ShakingTextField
                          error={
                            !!(touched.purposeDescription && errors.purposeDescription) || false
                          }
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
                    </Grid>
                  </Paper>
                </Grid>
                {/* Student Information */}
                <Grid size={{ xs: 12 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      mb: 1.5,
                      borderRadius: 2,
                      transition: 'box-shadow 0.2s ease',
                      '&:hover': { boxShadow: 4 },
                    }}
                  >
                    <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                      <Iconify
                        icon="solar:users-group-rounded-bold-duotone"
                        width={18}
                        sx={{ color: 'primary.main' }}
                      />
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>
                          Student Information
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Select board, class, and student to proceed
                        </Typography>
                      </Box>
                    </Stack>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      {/* Board */}
                      <Grid size={{ xs: 6, md: 3 }}>
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
                      <Grid size={{ xs: 6, md: 3 }}>
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
                      <Grid size={{ xs: 6, md: 3 }}>
                        <ShakingTextField
                          error={!!(touched.standardId && errors.standardId) || false}
                        >
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
                      <Grid size={{ xs: 6, md: 3 }}>
                        <ShakingTextField
                          error={!!(touched.divisionId && errors.divisionId) || false}
                        >
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
                      {/* Student */}
                      <Grid size={{ xs: 12 }}>
                        <ShakingTextField
                          error={!!(touched.selectedStudent && errors.selectedStudent) || false}
                        >
                          <Autocomplete
                            loading={studentLoading || studentFetching}
                            noOptionsText={
                              values.divisionId ? 'No Student Found' : 'Select a division first'
                            }
                            fullWidth
                            disabled={!values.divisionId || isEdit}
                            options={studentOptions}
                            value={
                              studentOptions.find((s: any) => s.studentId === values.studentId) ||
                              (values.studentId && values.selectedStudent
                                ? {
                                    name: values.selectedStudent.label,
                                    studentId: values.studentId,
                                  }
                                : null)
                            }
                            onChange={(_e, value: any) => {
                              setFieldValue(
                                'selectedStudent',
                                value ? { label: value.name, id: value.studentId } : null
                              );
                              setFieldValue('studentId', value?.studentId || null);
                            }}
                            getOptionLabel={(option: any) => option.name || ''}
                            renderOption={(props, option: any) => (
                              <li {...props} key={option.studentId}>
                                {option.name}
                              </li>
                            )}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                size="small"
                                label="Student *"
                                fullWidth
                                error={!!(touched.selectedStudent && errors.selectedStudent)}
                                helperText={
                                  (touched.selectedStudent && errors.selectedStudent) as string
                                }
                              />
                            )}
                          />
                        </ShakingTextField>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
                {/* Additional Notes */}
                <Grid size={{ xs: 12 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      mb: 1.5,
                      borderRadius: 2,
                      transition: 'box-shadow 0.2s ease',
                      '&:hover': { boxShadow: 4 },
                    }}
                  >
                    <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                      <Iconify
                        icon="solar:notes-bold-duotone"
                        width={18}
                        sx={{ color: 'primary.main' }}
                      />
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>
                          Additional Notes
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Add any internal remarks or special conditions
                        </Typography>
                      </Box>
                    </Stack>
                    <Divider sx={{ mb: 2 }} />
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
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </Scrollbar>

          {/* ── Sticky Finance Action Bar ── */}
          <Box
            sx={{
              flexShrink: 0,
              borderTop: `1px solid ${theme.palette.divider}`,
              bgcolor: alpha(theme.palette.background.paper, 0.92),
              backdropFilter: 'blur(12px)',
              px: { xs: 2, md: 3 },
              py: 1.5,
            }}
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="flex-end"
              flexWrap="wrap"
              gap={1.5}
            >
              <Stack direction="row" spacing={1.5} flexWrap="wrap">
                <Button
                  variant="outlined"
                  color="inherit"
                  size="small"
                  onClick={() => onClose(null, false)}
                  startIcon={<Iconify icon={GlobalIcons.cancel} />}
                  disabled={postChargeLoading || updateChargeLoading}
                >
                  Cancel
                </Button>
                <LoadingButton
                  type="button"
                  variant="contained"
                  loading={postChargeLoading || updateChargeLoading}
                  startIcon={<Iconify icon={isEdit ? GlobalIcons.edit : GlobalIcons.submit} />}
                  size="small"
                  onClick={handleSubmit}
                >
                  {isEdit ? 'Update' : 'Create'}
                </LoadingButton>
              </Stack>
            </Box>
          </Box>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default ChargeForm;
