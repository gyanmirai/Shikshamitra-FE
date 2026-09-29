'use client';

import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { motion } from 'framer-motion';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { useSelector, useDispatch } from 'react-redux';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { useLazyGetClassByMediumQuery } from 'src/redux/class/classApi';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useGetChargeCategoriesQuery } from 'src/redux/finance/chargeCategory';
import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { buildAudiencePayload } from 'src/redux/finance/ChargeManagement/chargeMappers';
import {
  usePostChargeMutation,
  useUpdateChargeMutation,
} from 'src/redux/finance/ChargeManagement/chargeApi';
import {
  Box,
  Grid,
  Paper,
  Stack,
  Alert,
  Button,
  Divider,
  Skeleton,
  TextField,
  Typography,
	Radio,
	RadioGroup,
	FormControlLabel,
} from '@mui/material';

import { useStudentsInScope } from './useStudentsInScope';
import { SelectedStudentsPanel } from './SelectedStudentsPanel';
import { StudentSelectionLayout } from './StudentSelectionLayout';
import { useDirtyState, useChargeDetails } from './useChargeDetails';
import {
  getFirstValidationMessage,
  createUpdateChargeValidationSchema,
} from './UpdateChargeValidation';

import type { IUpdateChargeFormProps, IUpdateChargeFormValues } from './types';

/**
 * UpdateChargeForm Component
 * Manages both creation and editing of charges
 */
const UpdateChargeForm: React.FC<IUpdateChargeFormProps> = ({
  chargeId,
  open,
  onClose,
  isEdit,
  defaultBoardId = '',
  defaultMediumId = '',
  defaultStandardId = '',
  defaultDivisionId = '',
}) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [openingScope] = useState(() => ({
    defaultBoardId,
    defaultMediumId,
    defaultStandardId,
    defaultDivisionId,
  }));

  // Determine mode based on chargeId or isEdit flag
  const isEditMode = isEdit || !!chargeId;

  // Fetch charge details only if in edit mode
	const { prefillValues, chargeDetail, isLoading: chargeLoading, restrictions } = useChargeDetails(chargeId);

  // State for academic structure
  const [boards, setBoards] = useState<any[]>([]);
  const [mediums, setMediums] = useState<any[]>([]);
  const [allDivision, setAllDivision] = useState<any[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [pendingSelectionChange, setPendingSelectionChange] = useState<null | {
    type: 'class' | 'division';
    nextStandardIds?: string[];
    nextDivisionIds?: string[];
    deselectedStandardId?: string;
    deselectedDivisionId?: string;
  }>(null);

  // Query hooks
  const [getClassByMedium, { data: classes, isLoading: classesLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetClassByMediumQuery,
  });

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

  // Both mutations - use one based on mode
  const [postCharge, { isLoading: postChargeLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePostChargeMutation,
  });

  const [updateCharge, { isLoading: updateChargeLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateChargeMutation,
  });

  const isSubmitLoading = isEditMode ? updateChargeLoading : postChargeLoading;
  const candidateStudentIdsRef = useRef<string[]>([]);

  // Initialize form with prefilled values
  const initialValues: IUpdateChargeFormValues = useMemo(() => {
    if (prefillValues) {
      return prefillValues;
    }
    return {
      chargeId: '',
      chargeName: '',
      chargeCategoryId: '',
      chargeCategoryName: '',
      purposeDescription: '',
      amount: '',
      dueDate: null,
      boardId: openingScope.defaultBoardId,
      educationMediumId: openingScope.defaultMediumId,
      standardId: openingScope.defaultStandardId ? [openingScope.defaultStandardId] : [],
      divisionIds: openingScope.defaultDivisionId ? [openingScope.defaultDivisionId] : [],
      studentIds: [],
      selectedStudents: [],
      selectionMode: 'selected',
    };
  }, [prefillValues, openingScope]);

  const validationSchema = useMemo(
    () => createUpdateChargeValidationSchema(currentYear, isEditMode),
    [currentYear, isEditMode]
  );

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (!currentYear?.id) {
          shikshaMitraToast.error({ message: 'Academic year is not selected.' });
          return;
        }

        const categoryName =
          availableChargeCategories.find(
            (item: { id: string }) => item.id === values.chargeCategoryId
          )?.name ?? values.chargeName;

        if (values.selectionMode === 'all' && candidateStudentIdsRef.current.length === 0) {
          shikshaMitraToast.error({
            message: 'No students are available in the selected scope.',
          });
          return;
        }

        if (
          values.selectionMode === 'all' &&
          !window.confirm(
            `Create this charge for all ${candidateStudentIdsRef.current.length} students currently in scope?`
          )
        ) {
          return;
        }

        const audience = buildAudiencePayload(values, candidateStudentIdsRef.current);
        const payload = {
          chargeName: values.chargeName,
          chargeCategoryId: values.chargeCategoryId,
          purposeDescription: values.purposeDescription,
          amount: parseFloat(String(values.amount)),
          dueDate: dayjs(values.dueDate).toISOString(),
          audience,
        };

        if (isEditMode && chargeId) {
          await updateCharge({
            id: chargeId,
            body: { ...payload, concurrencyStamp: chargeDetail?.concurrencyStamp ?? '' },
          }).unwrap();
          shikshaMitraToast.success({
            message: `Charge updated successfully for ${categoryName}`,
          });
        } else {
          await postCharge({ academicYearId: currentYear.id, body: payload }).unwrap();
          shikshaMitraToast.success({
            message: `Charge created successfully for ${categoryName}`,
          });
        }
        onClose(null, true);
      } catch (error) {
		console.error('Failed to submit charge:', error);
        shikshaMitraToast.error({
		  message:
			(error as any)?.data?.error?.message ||
			`Failed to ${isEditMode ? 'update' : 'create'} charge. Please try again.`,
        });
      }
    },
  });

  const { values, touched, errors, setFieldValue, setFieldTouched } = formik;
  const isDirty = useDirtyState(initialValues, values);

  const applySelectionChange = useCallback(
    (
      change: {
        type: 'class' | 'division';
        nextStandardIds?: string[];
        nextDivisionIds?: string[];
        deselectedStandardId?: string;
        deselectedDivisionId?: string;
      },
      clearStudents = false
    ) => {
      if (change.type === 'class') {
        const nextStandardIds = change.nextStandardIds || [];
        setFieldValue('standardId', nextStandardIds);
        setFieldTouched('standardId', false);
        if (nextStandardIds.length !== 1) {
          setFieldValue('divisionIds', []);
        }
      }

      if (change.type === 'division') {
        const nextDivisionIds = change.nextDivisionIds || [];
        setFieldValue('divisionIds', nextDivisionIds);
        setFieldTouched('divisionIds', false);
      }

      if (clearStudents) {
        if (change.type === 'class' && change.deselectedStandardId) {
          const newSelectedStudents = values.selectedStudents.filter(
            (s: any) => s.standardId !== change.deselectedStandardId
          );
          setFieldValue(
            'studentIds',
            newSelectedStudents.map((s) => s.id)
          );
          setFieldValue('selectedStudents', newSelectedStudents);
        } else if (change.type === 'division' && change.deselectedDivisionId) {
          const newSelectedStudents = values.selectedStudents.filter(
            (s: any) => s.divisionId !== change.deselectedDivisionId
          );
          setFieldValue(
            'studentIds',
            newSelectedStudents.map((s) => s.id)
          );
          setFieldValue('selectedStudents', newSelectedStudents);
        } else {
          setFieldValue('studentIds', []);
          setFieldValue('selectedStudents', []);
        }
      }
    },
    [setFieldValue, setFieldTouched, values.selectedStudents]
  );

  const {
    students: scopeStudents,
    isLoading: studentsLoading,
    hasFetched: studentsFetched,
    candidateStudentIds,
  } = useStudentsInScope(
    values.boardId,
    values.educationMediumId,
    values.standardId,
    values.divisionIds
  );

  candidateStudentIdsRef.current = candidateStudentIds;

  const filteredStudents = useMemo(() => {
    const query = studentSearch.toLowerCase();
    if (!query) return scopeStudents;
    return scopeStudents.filter(
      (student) =>
        student.label.toLowerCase().includes(query) ||
        student.grNumber?.toString().includes(query) ||
        student.rollNumber?.toString().includes(query)
    );
  }, [scopeStudents, studentSearch]);

  // Handle dialog close with dirty state check
  const handleClose = useCallback(
    (_e: any, isSubmit?: boolean) => {
      const resetState = () => {
        setTimeout(() => {
          dispatch(setIsChanges(false));
        }, 200);
      };

      if (isSubmit || (isDirty && window.confirm('You have unsaved changes. Leave page?'))) {
        open.onFalse();
        resetState();
      } else if (!isDirty) {
        open.onFalse();
      }
    },
    [isDirty, open, dispatch]
  );

  // Load boards on component mount
  useEffect(() => {
    const yearBoards = currentYear?.boards || [];
    setBoards(yearBoards);
    if (yearBoards.length > 0) {
      if (!values.boardId) {
        const firstBoard = yearBoards[0];
        setFieldValue('boardId', firstBoard.id);
        const firstMedium = firstBoard?.educationMediums?.[0]?.id ?? '';
        setFieldValue('educationMediumId', firstMedium);
      } else if (!values.educationMediumId) {
        const board = yearBoards.find((b: any) => b.id === values.boardId);
        const firstMedium = board?.educationMediums?.[0]?.id ?? '';
        setFieldValue('educationMediumId', firstMedium);
      }
    }
  }, [currentYear, values.boardId, values.educationMediumId, setFieldValue]);

  // Load mediums when board changes
  useEffect(() => {
    const selectedBoard = boards.find((b: any) => b.id === values.boardId);
    setMediums(selectedBoard?.educationMediums || []);

    if (values.educationMediumId) {
      getClassByMedium(values.educationMediumId);
    }
  }, [values.boardId, values.educationMediumId, boards, getClassByMedium]);

  // Load divisions when class changes
  useEffect(() => {
    const selectedClass = classes?.find(
      (cls: any) => values.standardId.length === 1 && cls.id === values.standardId[0]
    );
    setAllDivision(selectedClass?.divisions || []);
  }, [values.standardId, classes]);

  // Track dirty state in Redux
  useEffect(() => {
    if (isDirty) {
      dispatch(setIsChanges(true));
    }
  }, [isDirty, dispatch]);

  // Clean up selected students that are no longer in scope
  useEffect(() => {
    if (!studentsLoading && studentsFetched) {
      if (values.standardId.length === 0 && values.studentIds.length > 0) {
        setFieldValue('studentIds', []);
        setFieldValue('selectedStudents', []);
      } else if (values.standardId.length > 0 && scopeStudents) {
        const validIds = new Set(candidateStudentIdsRef.current);
        const needsCleanup = values.studentIds.some((id) => !validIds.has(id));
        if (needsCleanup) {
          const newSelectedStudents = values.selectedStudents.filter((s) => validIds.has(s.id));
          setFieldValue(
            'studentIds',
            newSelectedStudents.map((s) => s.id)
          );
          setFieldValue('selectedStudents', newSelectedStudents);
        }
      }
    }
  }, [
    studentsLoading,
    studentsFetched,
    scopeStudents,
    values.standardId,
    values.studentIds,
    values.selectedStudents,
    setFieldValue,
  ]);

  const handleSubmit = useCallback(async () => {
    const validationErrors = await formik.validateForm();
    const touchedFields = Object.keys(formik.values).reduce<Record<string, boolean>>((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    formik.setTouched(touchedFields, true);

    if (Object.keys(validationErrors).length > 0) {
      const message = getFirstValidationMessage(validationErrors);
      shikshaMitraToast.error({
        message: message || 'Please fix the highlighted fields before submitting.',
      });
      return;
    }

    await formik.submitForm();
  }, [formik]);

  if (chargeLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  return (
    <BackPopUpChecked initialValues={initialValues} currentValues={values}>
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
            <Box sx={{ p: 2 }}>
              <Grid container spacing={2}>
                {/* Restrictions Alert - Only show in edit mode */}
                {isEditMode &&
                  (!restrictions.canChangeBoardId || !restrictions.canChangeEducationMediumId) && (
                    <Grid size={{ xs: 12 }}>
                      <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold" />}>
                        <Typography variant="body2">
                          This charge has been applied and some fields are now read-only to prevent
                          inconsistencies.
                        </Typography>
                      </Alert>
                    </Grid>
                  )}

                {/* Charge Details Section */}
                <Grid size={{ xs: 12 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
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
                          Update charge information and settings
                        </Typography>
                      </Box>
                    </Stack>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      {/* Charge Name */}
                      <Grid size={{ xs: 12, md: 3 }}>
                        <ShakingTextField error={!!(touched.chargeName && errors.chargeName)}>
                          <TextField
                            name="chargeName"
                            label="Charge Name *"
                            fullWidth
                            size="small"
                            disabled={isEditMode}
                            value={values.chargeName}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={!!(touched.chargeName && errors.chargeName)}
                            helperText={(touched.chargeName && errors.chargeName) as string}
                          />
                        </ShakingTextField>
                      </Grid>

                      {/* Charge Category */}
                      <Grid size={{ xs: 12, md: 3 }}>
                        <ShakingTextField
                          error={!!(touched.chargeCategoryId && errors.chargeCategoryId)}
                        >
                          <CustomSelect
                            disabled={isEditMode}
                            name="chargeCategoryId"
                            label="Charge Category"
                            isLoading={chargeCategoriesLoading}
                            options={availableChargeCategories}
                            labelKey="name"
                            valueKey="id"
                            value={values.chargeCategoryId}
                            onChange={(value) => {
                              setFieldValue('chargeCategoryId', value);
                              setFieldTouched('chargeCategoryId', false);
                              const category = availableChargeCategories.find(
                                (item: { id: string }) => item.id === value
                              );
                              setFieldValue('chargeCategoryName', category?.name ?? '');
                            }}
                            error={!!(touched.chargeCategoryId && errors.chargeCategoryId) || false}
                            helperText={
                              (touched.chargeCategoryId && errors.chargeCategoryId) as string
                            }
                            formControlProps={{ fullWidth: true }}
                          />
                          {values.chargeCategoryId && (
                            <Typography variant="caption" color="text.secondary" fontSize="0.75rem">
                              {availableChargeCategories.find(
                                (item: any) => item.id === values.chargeCategoryId
                              )?.isApprovalRequired
                                ? 'Need the approval from the authority'
                                : 'Does not need the approval from the authority'}
                            </Typography>
                          )}
                        </ShakingTextField>
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
                            minRows={2}
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
                          Update academic structure and student mappings
                        </Typography>
                      </Box>
                    </Stack>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      {/* Board */}
                      <Grid size={{ xs: 6, md: 3 }}>
                        <ShakingTextField error={!!(touched.boardId && errors.boardId)}>
                          <CustomSelect
                            disabled={!restrictions.canChangeBoardId}
                            label="Board *"
                            options={boards}
                            labelKey="name"
                            valueKey="id"
                            value={values.boardId}
                            onChange={(val) => {
                              setFieldValue('boardId', val);
                              setFieldTouched('boardId', false);
                              setFieldValue('educationMediumId', '');
                              setFieldValue('standardId', []);
                              setFieldValue('divisionIds', []);
                              setFieldValue('studentIds', []);
                            }}
                            error={!!errors.boardId && touched.boardId}
                            helperText={
                              restrictions.boardChangeReason ||
                              ((touched.boardId && errors.boardId) as string)
                            }
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
                            disabled={!values.boardId || !restrictions.canChangeEducationMediumId}
                            options={mediums}
                            labelKey="name"
                            valueKey="id"
                            value={values.educationMediumId}
                            onChange={(val) => {
                              setFieldValue('educationMediumId', val);
                              setFieldTouched('educationMediumId', false);
                              setFieldValue('standardId', []);
                              setFieldValue('divisionIds', []);
                              setFieldValue('studentIds', []);
                            }}
                            error={!!errors.educationMediumId && touched.educationMediumId}
                            helperText={
                              restrictions.mediumChangeReason ||
                              ((touched.educationMediumId && errors.educationMediumId) as string)
                            }
                          />
                        </ShakingTextField>
                      </Grid>

                      {/* Class - Multi-select Buttons */}
                      <Grid size={{ xs: 12 }}>
                        <Box>
                          <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                            <Iconify
                              icon="solar:notebook-bold-duotone"
                              width={18}
                              sx={{ color: 'primary.main' }}
                            />
                            <Box>
                              <Typography variant="subtitle2" fontWeight={700}>
                                Classes *
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {values.standardId.length === 0
                                  ? 'Select one or more classes'
                                  : `${values.standardId.length} selected`}
                              </Typography>
                            </Box>
                          </Stack>
                          <Divider sx={{ mb: 1.5 }} />
                          <Scrollbar sx={{ height: 'auto', maxHeight: '140px' }}>
                            <Box display="flex" flexWrap="wrap" gap={1} pb={1}>
                              {classesLoading ? (
                                Array.from(new Array(6)).map((_, index) => (
                                  <Skeleton
                                    key={index}
                                    variant="rectangular"
                                    sx={{ width: 90, height: 36, borderRadius: 1 }}
                                  />
                                ))
                              ) : (classes || []).length > 0 ? (
                                (classes || []).map((cls: any) => (
                                  <Button
                                    key={cls.id}
                                    variant={
                                      values.standardId.includes(cls.id) ? 'contained' : 'outlined'
                                    }
                                    color={
                                      values.standardId.includes(cls.id) ? 'primary' : undefined
                                    }
                                    sx={{ minWidth: 60, textTransform: 'none', fontWeight: 500 }}
                                    onClick={() => {
                                      const isSelected = values.standardId.includes(cls.id);
                                      const updated = isSelected
                                        ? values.standardId.filter((id) => id !== cls.id)
                                        : [...values.standardId, cls.id];

                                      if (isSelected && values.studentIds.length > 0) {
                                        setPendingSelectionChange({
                                          type: 'class',
                                          nextStandardIds: updated,
                                          deselectedStandardId: cls.id,
                                        });
                                        return;
                                      }

                                      applySelectionChange(
                                        {
                                          type: 'class',
                                          nextStandardIds: updated,
                                          deselectedStandardId: cls.id,
                                        },
                                        isSelected
                                      );
                                    }}
                                    disabled={!values.educationMediumId}
                                  >
                                    {cls.name.replace('Class ', '')}
                                  </Button>
                                ))
                              ) : (
                                <Box sx={{ p: 2, width: '100%', textAlign: 'center' }}>
                                  <Typography variant="body2" color="text.secondary">
                                    No classes available
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Scrollbar>
                          {touched.standardId && errors.standardId && (
                            <Typography
                              variant="caption"
                              sx={{ color: '#d32f2f', mt: 0.5, display: 'block' }}
                            >
                              {errors.standardId}
                            </Typography>
                          )}
                        </Box>
                      </Grid>

                      {/* Division - Only show if exactly one class selected */}
                      {values.standardId.length === 1 && (
                        <Grid size={{ xs: 12 }}>
                          <Box>
                            <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                              <Iconify
                                icon="solar:layers-bold-duotone"
                                width={18}
                                sx={{ color: 'primary.main' }}
                              />
                              <Box>
                                <Typography variant="subtitle2" fontWeight={700}>
                                  Divisions *
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {values.divisionIds.length === 0
                                    ? 'Select one or more divisions'
                                    : `${values.divisionIds.length} selected`}
                                </Typography>
                              </Box>
                            </Stack>
                            <Divider sx={{ mb: 1.5 }} />
                            <Scrollbar sx={{ height: 'auto', maxHeight: '140px' }}>
                              <Box display="flex" flexWrap="wrap" gap={1}>
                                {!allDivision || allDivision.length === 0 ? (
                                  <Box sx={{ p: 2, width: '100%', textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                      No divisions available
                                    </Typography>
                                  </Box>
                                ) : (
                                  allDivision.map((div) => (
                                    <Button
                                      key={div.id}
                                      variant={
                                        values.divisionIds.includes(div.id)
                                          ? 'contained'
                                          : 'outlined'
                                      }
                                      color={
                                        values.divisionIds.includes(div.id) ? 'primary' : undefined
                                      }
                                      sx={{ minWidth: 60, textTransform: 'none', fontWeight: 500 }}
                                      onClick={() => {
                                        const isSelected = values.divisionIds.includes(div.id);
                                        const updated = isSelected
                                          ? values.divisionIds.filter((id) => id !== div.id)
                                          : [...values.divisionIds, div.id];

                                        if (isSelected && values.studentIds.length > 0) {
                                          setPendingSelectionChange({
                                            type: 'division',
                                            nextDivisionIds: updated,
                                            deselectedDivisionId: div.id,
                                          });
                                          return;
                                        }

                                        applySelectionChange(
                                          {
                                            type: 'division',
                                            nextDivisionIds: updated,
                                            deselectedDivisionId: div.id,
                                          },
                                          isSelected
                                        );
                                      }}
                                    >
                                      {div.name}
                                    </Button>
                                  ))
                                )}
                              </Box>
                            </Scrollbar>
                            {touched.divisionIds && errors.divisionIds && (
                              <Typography
                                variant="caption"
                                sx={{ color: '#d32f2f', mt: 0.5, display: 'block' }}
                              >
                                {errors.divisionIds}
                              </Typography>
                            )}
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </Paper>
                </Grid>

				{/* Student Selection Section */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
                    Student Selection
                  </Typography>
				  <RadioGroup
					row
					value={values.selectionMode}
					onChange={(event) => {
						const mode = event.target.value as 'selected' | 'all';
						setFieldValue('selectionMode', mode);
						if (mode === 'all') {
							setFieldValue('studentIds', []);
							setFieldValue('selectedStudents', []);
						}
					}}
				  >
					<FormControlLabel value="selected" control={<Radio size="small" />} label="Selected students" />
					<FormControlLabel value="all" control={<Radio size="small" />} label="All students in scope" />
				  </RadioGroup>
				  {values.selectionMode === 'all' && (
					<Alert severity="warning" sx={{ mb: 2 }}>
						This will resolve all currently accessible students in the selected scope on the server.
					</Alert>
				  )}
                  <Grid container spacing={2}>
                    {/* Student List */}
                    <Grid size={{ xs: 12, md: 8 }}>
                      <StudentSelectionLayout
						students={filteredStudents}
                        selectedStudentIds={values.studentIds}
                        isLoading={studentsLoading}
						onSelectionChange={(selectedIds) => {
                          setFieldValue('studentIds', selectedIds);
                          const selected = scopeStudents.filter((s) => selectedIds.includes(s.id));
                          setFieldValue('selectedStudents', selected);
                        }}
                        searchQuery={studentSearch}
                        onSearchChange={setStudentSearch}
						disabled={values.selectionMode === 'all'}
                      />
                    </Grid>

                    {/* Selected Students Panel */}
                    <Grid size={{ xs: 12, md: 4 }}>
                      <SelectedStudentsPanel
                        selectedStudents={values.selectedStudents || []}
                        onRemove={(studentId) => {
                          const newIds = values.studentIds.filter((id) => id !== studentId);
                          setFieldValue('studentIds', newIds);
                          const selected = scopeStudents.filter((s) => newIds.includes(s.id));
                          setFieldValue('selectedStudents', selected);
                        }}
                        onClearAll={() => {
                          setFieldValue('studentIds', []);
                          setFieldValue('selectedStudents', []);
                        }}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <ConfirmDialog
                  open={!!pendingSelectionChange}
                  icon="warning"
                  onClose={() => setPendingSelectionChange(null)}
                  title="Confirm Selection Change"
                  content="This change will remove selected students. Do you want to continue?"
                  action={
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => {
                        if (!pendingSelectionChange) return;
                        applySelectionChange(pendingSelectionChange, true);
                        setPendingSelectionChange(null);
                      }}
                    >
                      Continue
                    </Button>
                  }
                />
              </Grid>
            </Box>
          </Scrollbar>

          {/* Sticky Action Bar */}
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
                  onClick={() => handleClose(null, false)}
                  startIcon={<Iconify icon={GlobalIcons.cancel} />}
                  disabled={isSubmitLoading}
                >
                  Cancel
                </Button>
                <LoadingButton
                  type="button"
                  variant="contained"
                  loading={isSubmitLoading}
                  startIcon={<Iconify icon={isEditMode ? GlobalIcons.edit : GlobalIcons.submit} />}
                  size="small"
                  onClick={handleSubmit}
                >
                  {isEditMode ? 'Update' : 'Create'}
                </LoadingButton>
              </Stack>
            </Box>
          </Box>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default UpdateChargeForm;
