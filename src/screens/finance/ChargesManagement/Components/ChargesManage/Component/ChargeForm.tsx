import type { RootState } from 'src/redux/store';
import type { Division } from 'src/types/school';
import type { StudentLookupItem } from 'src/redux/student';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { motion } from 'framer-motion';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetStudentsByScopeQuery } from 'src/redux/student';
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
  Chip,
  Grid,
  Paper,
  Stack,
  Button,
  Divider,
  Checkbox,
  TextField,
  Typography,
  FormHelperText,
} from '@mui/material';

import type { IChargeFormProps } from './type';

const ChargeForm = ({ open, onClose, editData, isEdit = false }: IChargeFormProps) => {
  const theme = useTheme();
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  // State
  const [boards, setBoards] = useState<any[]>([]);
  const [mediums, setMediums] = useState<any[]>([]);
  const [allDivision, setAllDivision] = useState<Division[]>([]);

  // New scope-based student query
  const [
    getStudentsByScope,
    { data: scopeStudentsData, isLoading: studentLoading, isFetching: studentFetching },
  ] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetStudentsByScopeQuery,
  });

  // Queries
  const [getClassByMedium, { data: classes, isLoading: classesLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetClassByMediumQuery,
  });

  const studentOptions: StudentLookupItem[] = useMemo(
    () => (scopeStudentsData as StudentLookupItem[] | undefined) ?? [],
    [scopeStudentsData]
  );

  // Get charge categories data
  const { data: chargeCategories, isLoading: chargeCategoriesLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetChargeCategoriesQuery,
    params: {
      academicYearId: currentYear?.id,
      page: 1,
      pageSize: 100,
      isActive: true,
    },
  });
  const availableChargeCategories = useMemo(
    () =>
      (chargeCategories?.items ?? []).filter(
        (category: any) => category.isActive === true && category.isAccountingReady === true
      ),
    [chargeCategories?.items]
  );
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
        chargeCategoryName: editData.categoryName || '',
        purposeDescription: editData.purposeDescription || '',
        amount: editData.amount || '',
        dueDate: editData.dueDate ? dayjs(editData.dueDate, 'DD-MM-YYYY') : null,
        priority: editData.priority?.toString() || '',
        boardId: editData.boardId || '',
        educationMediumId: editData.educationMediumId || '',
        // Multiple class IDs (array)
        classIds: [] as string[],
        // Optional division IDs (only when single class selected)
        divisionIds: [] as string[],
        // Selected students (multiple, from scope lookup)
        selectedStudentIds: [] as string[],
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
      classIds: [] as string[],
      divisionIds: [] as string[],
      selectedStudentIds: [] as string[],
    };
  }, [isEdit, editData]);

  const isSingleClass = (classIds: string[]) => classIds.length === 1;

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: Yup.object({
      chargeCategoryId: Yup.string().required('Charge Category is required'),
      purposeDescription: Yup.string()
        .required('Purpose/Description is required')
        .min(10, 'Purpose/Description must be at least 10 characters')
        .max(500, 'Purpose/Description cannot exceed 500 characters'),
      amount: Yup.string()
        .required('Amount is required')
        .matches(/^\d+(\.\d{1,2})?$/, 'Amount must have at most 2 decimal places')
        .test('is-number', 'Amount must be a valid number greater than zero', (value) => {
          const numericValue = Number(value);
          return Number.isFinite(numericValue) && numericValue > 0;
        })
        .test('maximum', 'Amount cannot exceed 9,999,999.00', (value) => Number(value) <= 9999999),
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
      classIds: Yup.array()
        .of(Yup.string().required())
        .min(1, 'At least one Class is required')
        .required('Class is required'),
      selectedStudentIds: Yup.array()
        .of(Yup.string().required())
        .min(1, 'At least one Student must be selected')
        .required('Student is required'),
    }),
    onSubmit: async (values) => {
      try {
        const payload = {
          chargeCategoryId: values.chargeCategoryId,
          purposeDescription: values.purposeDescription,
          amount: parseFloat(String(values.amount)),
          dueDate: values.dueDate ? dayjs(values.dueDate).toISOString() : null,
          priority: parseInt(values.priority, 10),
        };

        if (isEdit && editData) {
          await updateCharge({ id: editData.chargeId, body: payload }).unwrap();
          shikshaMitraToast.success({
            message: `Charge updated successfully for ${values.chargeCategoryName}`,
          });
        } else {
          // Build the audience payload as expected by backend CreateChargeRequest
          const isAllInScope =
            values.selectedStudentIds.length === studentOptions.length && studentOptions.length > 0;
          const createPayload = {
            ...payload,
            chargeName:
              availableChargeCategories.find((c: any) => c.id === values.chargeCategoryId)?.name ??
              '',
            audience: {
              scope: {
                boardId: values.boardId,
                educationMediumId: values.educationMediumId,
                classIds: values.classIds,
                // Only send divisionIds when a single class is selected and divisions were chosen
                divisionIds:
                  isSingleClass(values.classIds) && values.divisionIds.length > 0
                    ? values.divisionIds
                    : undefined,
              },
              selection: {
                // 0 = AllInScope, 1 = Explicit
                mode: isAllInScope ? 0 : 1,
                studentIds: isAllInScope ? undefined : values.selectedStudentIds,
              },
            },
          };
          await postCharge({ academicYearId: currentYear?.id, body: createPayload }).unwrap();
          shikshaMitraToast.success({
            message: `Charge added successfully for ${values.chargeCategoryName} — ${values.selectedStudentIds.length} student(s)`,
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
    formik.validateForm().then(() => {
      formik.handleSubmit();
    });
  }, [formik]);

  // Load boards on year change
  useEffect(() => {
    formik.resetForm();
    setBoards(currentYear?.boards || []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentYear]);

  // Load mediums when board changes
  useEffect(() => {
    const selectedBoard = boards.find((b: any) => b.id === values.boardId);
    setMediums(selectedBoard?.educationMediums || []);
    if (values.educationMediumId) {
      getClassByMedium(values.educationMediumId);
    }
  }, [values.boardId, values.educationMediumId, boards, getClassByMedium]);

  // Load divisions when a single class is selected
  useEffect(() => {
    if (isSingleClass(values.classIds)) {
      setAllDivision(classes?.find((cls: any) => cls.id === values.classIds[0])?.divisions || []);
    } else {
      setAllDivision([]);
      setFieldValue('divisionIds', []);
    }
  }, [values.classIds, classes, setFieldValue]);

  // Fetch students from scope API when board, medium, classes, or divisions change
  useEffect(() => {
    if (
      values.boardId &&
      values.educationMediumId &&
      values.classIds.length > 0 &&
      currentYear?.id
    ) {
      const params: any = {
        academicYearId: currentYear.id,
        boardId: values.boardId,
        educationMediumId: values.educationMediumId,
        classIds: values.classIds,
      };
      if (isSingleClass(values.classIds) && values.divisionIds.length > 0) {
        params.divisionIds = values.divisionIds;
      }
      getStudentsByScope(params);
      // Clear selected students when scope changes
      setFieldValue('selectedStudentIds', []);
    }
  }, [
    values.boardId,
    values.educationMediumId,
    values.classIds,
    values.divisionIds,
    currentYear?.id,
    getStudentsByScope,
    setFieldValue,
  ]);

  const handleToggleStudent = (studentId: string) => {
    const current = values.selectedStudentIds;
    if (current.includes(studentId)) {
      setFieldValue(
        'selectedStudentIds',
        current.filter((id) => id !== studentId)
      );
    } else {
      setFieldValue('selectedStudentIds', [...current, studentId]);
    }
  };

  const handleSelectAllStudents = () => {
    if (values.selectedStudentIds.length === studentOptions.length) {
      setFieldValue('selectedStudentIds', []);
    } else {
      setFieldValue(
        'selectedStudentIds',
        studentOptions.map((s) => s.studentId)
      );
    }
  };

  const isStudentSelected = (studentId: string) => values.selectedStudentIds.includes(studentId);
  const allSelected =
    studentOptions.length > 0 && values.selectedStudentIds.length === studentOptions.length;

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
                            options={availableChargeCategories}
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
                            All charges start as Pending and require approval from an authorized person.
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
                            decimalScale={2}
                            allowLeadingZeros={false}
                            valueIsNumericString
                            onValueChange={(numericValues) => {
                              setFieldValue('amount', numericValues.value);
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
                          Student Selection
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Select board, medium, one or more classes, then choose students
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
                              setFieldValue('classIds', []);
                              setFieldValue('divisionIds', []);
                              setFieldValue('selectedStudentIds', []);
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
                              setFieldValue('classIds', []);
                              setFieldValue('divisionIds', []);
                              setFieldValue('selectedStudentIds', []);
                            }}
                            error={!!errors.educationMediumId && touched.educationMediumId}
                            helperText={
                              (touched.educationMediumId && errors.educationMediumId) as string
                            }
                          />
                        </ShakingTextField>
                      </Grid>
                      {/* Class — multi-select */}
                      <Grid size={{ xs: 6, md: 3 }}>
                        <ShakingTextField error={!!(touched.classIds && errors.classIds) || false}>
                          <CustomSelect
                            name="classIds"
                            label="Class *"
                            options={classes || []}
                            labelKey="name"
                            valueKey="id"
                            isLoading={classesLoading}
                            value={values.classIds}
                            disabled={!values.educationMediumId || isEdit}
                            onChange={(value) => {
                              setFieldValue('classIds', value);
                              setFieldTouched('classIds', false);
                              setFieldValue('divisionIds', []);
                              setFieldValue('selectedStudentIds', []);
                            }}
                            error={!!(touched.classIds && errors.classIds) || false}
                            helperText={(touched.classIds && (errors.classIds as string)) || ''}
                            formControlProps={{ sx: { width: '100%' } }}
                            multiple
                          />
                        </ShakingTextField>
                      </Grid>
                      {/* Division — only shown when exactly one class is selected */}
                      {isSingleClass(values.classIds) && (
                        <Grid size={{ xs: 6, md: 3 }}>
                          <ShakingTextField
                            error={!!(touched.divisionIds && errors.divisionIds) || false}
                          >
                            <CustomSelect
                              name="divisionIds"
                              label="Division (optional)"
                              labelKey="name"
                              valueKey="id"
                              disabled={isEdit}
                              options={allDivision}
                              value={values.divisionIds}
                              onChange={(value) => {
                                setFieldValue('divisionIds', value);
                                setFieldTouched('divisionIds', false);
                                setFieldValue('selectedStudentIds', []);
                              }}
                              formControlProps={{ sx: { width: '100%' } }}
                              error={!!(touched.divisionIds && errors.divisionIds)}
                              helperText={(touched.divisionIds && errors.divisionIds) as string}
                              multiple
                            />
                          </ShakingTextField>
                        </Grid>
                      )}
                    </Grid>

                    {/* Student list with multi-select checkboxes */}
                    {values.classIds.length > 0 && (
                      <Box mt={2}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          mb={1}
                        >
                          <Typography variant="subtitle2" color="text.secondary">
                            {studentLoading || studentFetching
                              ? 'Loading students…'
                              : `${studentOptions.length} student(s) in scope — ${values.selectedStudentIds.length} selected`}
                          </Typography>
                          {studentOptions.length > 0 && (
                            <Button
                              size="small"
                              variant="text"
                              onClick={handleSelectAllStudents}
                              disabled={isEdit}
                            >
                              {allSelected ? 'Deselect All' : 'Select All'}
                            </Button>
                          )}
                        </Stack>

                        {studentOptions.length === 0 && !studentLoading && !studentFetching && (
                          <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                            No enrolled students found in the selected scope.
                          </Typography>
                        )}

                        <Box
                          sx={{
                            maxHeight: 260,
                            overflowY: 'auto',
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 1,
                          }}
                        >
                          {studentOptions.map((student) => (
                            <Stack
                              key={student.studentId}
                              direction="row"
                              alignItems="center"
                              spacing={1}
                              sx={{
                                px: 1.5,
                                py: 0.75,
                                cursor: isEdit ? 'default' : 'pointer',
                                '&:hover': { bgcolor: isEdit ? 'inherit' : 'action.hover' },
                                borderBottom: `1px solid ${theme.palette.divider}`,
                                '&:last-child': { borderBottom: 'none' },
                              }}
                              onClick={() => !isEdit && handleToggleStudent(student.studentId)}
                            >
                              <Checkbox
                                size="small"
                                checked={isStudentSelected(student.studentId)}
                                disabled={isEdit}
                                onChange={() => !isEdit && handleToggleStudent(student.studentId)}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <Box flex={1}>
                                <Typography variant="body2" fontWeight={500}>
                                  {student.studentName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {[
                                    student.standardName,
                                    student.divisionName,
                                    student.grNo != null ? `GR: ${student.grNo}` : null,
                                    student.rollNo != null ? `Roll: ${student.rollNo}` : null,
                                  ]
                                    .filter(Boolean)
                                    .join(' · ')}
                                </Typography>
                              </Box>
                            </Stack>
                          ))}
                        </Box>

                        {touched.selectedStudentIds && errors.selectedStudentIds && (
                          <FormHelperText error sx={{ mt: 0.5, ml: 1 }}>
                            {errors.selectedStudentIds as string}
                          </FormHelperText>
                        )}

                        {values.selectedStudentIds.length > 0 && (
                          <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
                            {values.selectedStudentIds.slice(0, 5).map((id) => {
                              const s = studentOptions.find((o) => o.studentId === id);
                              return s ? (
                                <Chip
                                  key={id}
                                  label={s.studentName}
                                  size="small"
                                  onDelete={isEdit ? undefined : () => handleToggleStudent(id)}
                                />
                              ) : null;
                            })}
                            {values.selectedStudentIds.length > 5 && (
                              <Chip
                                label={`+${values.selectedStudentIds.length - 5} more`}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        )}
                      </Box>
                    )}
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
              gap={1}
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
