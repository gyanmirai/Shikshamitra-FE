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
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { useLazyGetClassByMediumQuery } from 'src/redux/class/classApi';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
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
  Alert,
  Button,
  Divider,
  Skeleton,
  TextField,
  Typography,
} from '@mui/material';

import { DUMMY_STUDENTS } from './dummyStudents';
import { SelectedStudentsPanel } from './SelectedStudentsPanel';
import { StudentSelectionLayout } from './StudentSelectionLayout';
import { useDirtyState, useChargeDetails } from './useChargeDetails';
import { createUpdateChargeValidationSchema } from './UpdateChargeValidation';

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
}) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  // Determine mode based on chargeId or isEdit flag
  const isEditMode = isEdit || !!chargeId;

  // Fetch charge details only if in edit mode
  const {
    prefillValues,
    chargeDetail,
    isLoading: chargeLoading,
    restrictions,
    divisionVisibility,
    isCreateMode,
  } = useChargeDetails(chargeId);

  // State for academic structure
  const [boards, setBoards] = useState<any[]>([]);
  const [mediums, setMediums] = useState<any[]>([]);
  const [allDivision, setAllDivision] = useState<any[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [filteredStudents, setFilteredStudents] = useState(DUMMY_STUDENTS);

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
    },
  });

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
      additionalNotes: '',
      boardId: '',
      educationMediumId: '',
      standardId: [],
      divisionIds: [],
      studentIds: [],
      selectedStudents: [],
      selectionMode: 'students',
    };
  }, [prefillValues]);

  // Validation schema with single class condition
  const validationSchema = useMemo(() => {
    const singleClassSelected =
      Array.isArray(initialValues.standardId) && initialValues.standardId.length === 1;
    return createUpdateChargeValidationSchema(currentYear, singleClassSelected);
  }, [currentYear, initialValues.standardId]);

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      try {
        const payload = {
          chargeName: values.chargeName,
          chargeCategoryId: values.chargeCategoryId,
          purposeDescription: values.purposeDescription,
          amount: parseFloat(String(values.amount)),
          dueDate: values.dueDate ? dayjs(values.dueDate).toISOString() : null,
          additionalNotes: values.additionalNotes,
          studentIds: values.studentIds.length > 0 ? values.studentIds : undefined,
          divisionIds: values.divisionIds.length > 0 ? values.divisionIds : undefined,
          classIds:
            Array.isArray(values.standardId) && values.standardId.length > 0
              ? values.standardId
              : undefined,
        };

        if (isEditMode && chargeId) {
          // Update existing charge
          await updateCharge({ id: chargeId, body: payload }).unwrap();
          shikshaMitraToast.success({
            message: `Charge updated successfully for ${values.chargeCategoryName}`,
          });
        } else {
          // Create new charge
          const createPayload = {
            ...payload,
            studentIds: values.studentIds,
          };
          await postCharge({ academicYearId: currentYear?.id, body: createPayload }).unwrap();
          shikshaMitraToast.success({
            message: `Charge created successfully for ${values.chargeCategoryName}`,
          });
        }
        onClose(null, true);
      } catch (error) {
        console.error('Failed to submit charge:', error);
        shikshaMitraToast.error({
          message: `Failed to ${isEditMode ? 'update' : 'create'} charge. Please try again.`,
        });
      }
    },
  });

  const { values, touched, errors, setFieldValue, setFieldTouched } = formik;
  const isDirty = useDirtyState(initialValues, values);

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
    setBoards(currentYear?.boards || []);
  }, [currentYear]);

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

  // Filter students based on search
  useEffect(() => {
    const filtered = DUMMY_STUDENTS.filter((student) => {
      const query = studentSearch.toLowerCase();
      return (
        student.label.toLowerCase().includes(query) ||
        student.grNumber?.toString().includes(query) ||
        student.rollNumber?.toString().includes(query)
      );
    });
    setFilteredStudents(filtered);
  }, [studentSearch]);

  // Track dirty state in Redux
  useEffect(() => {
    if (isDirty) {
      dispatch(setIsChanges(true));
    }
  }, [isDirty, dispatch]);

  const handleSubmit = useCallback(() => {
    formik.validateForm().then(() => {
      formik.handleSubmit();
    });
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
                            options={chargeCategories?.items || []}
                            labelKey="name"
                            valueKey="id"
                            value={values.chargeCategoryId}
                            onChange={(value) => setFieldValue('chargeCategoryId', value)}
                            error={!!(touched.chargeCategoryId && errors.chargeCategoryId) || false}
                            helperText={
                              isEditMode
                                ? 'Charge category cannot be changed after creation'
                                : (touched.chargeCategoryId && errors.chargeCategoryId) || ''
                            }
                            formControlProps={{ fullWidth: true }}
                          />
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
                            onChange={(e) => {
                              let val = e.target.value;
                              val = val.replace(/\D/g, '');
                              if (/^\d*$/.test(val)) {
                                setFieldValue('amount', val);
                              }
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
                                      setFieldValue('standardId', updated);
                                      setFieldTouched('standardId', false);
                                      // Clear divisions if not single class
                                      if (updated.length !== 1) {
                                        setFieldValue('divisionIds', []);
                                      }
                                      setFieldValue('studentIds', []);
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
                                        setFieldValue('divisionIds', updated);
                                        setFieldTouched('divisionIds', false);
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
                  <Grid container spacing={2}>
                    {/* Student List */}
                    <Grid size={{ xs: 12, md: 8 }}>
                      <StudentSelectionLayout
                        students={filteredStudents}
                        selectedStudentIds={values.studentIds}
                        onSelectionChange={(selectedIds) => {
                          setFieldValue('studentIds', selectedIds);
                          const selected = DUMMY_STUDENTS.filter((s) => selectedIds.includes(s.id));
                          setFieldValue('selectedStudents', selected);
                        }}
                        searchQuery={studentSearch}
                        onSearchChange={setStudentSearch}
                      />
                    </Grid>

                    {/* Selected Students Panel */}
                    <Grid size={{ xs: 12, md: 4 }}>
                      <SelectedStudentsPanel
                        selectedStudents={values.selectedStudents || []}
                        onRemove={(studentId) => {
                          const newIds = values.studentIds.filter((id) => id !== studentId);
                          setFieldValue('studentIds', newIds);
                          const selected = DUMMY_STUDENTS.filter((s) => newIds.includes(s.id));
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

                {/* Additional Notes */}
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
                        icon="solar:notes-bold-duotone"
                        width={18}
                        sx={{ color: 'primary.main' }}
                      />
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>
                          Additional Notes
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Add internal remarks or special conditions
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
              gap={1.5}
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
