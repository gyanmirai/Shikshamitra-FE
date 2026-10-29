'use client';

import type { RootState } from 'src/redux/store';
import type { Division } from 'src/types/school';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { motion } from 'framer-motion';
import { LoadingButton } from '@mui/lab';
import { useSession } from 'next-auth/react';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { useSelector, useDispatch } from 'react-redux';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { formatCurrency } from 'src/utils/cureencyFormater';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useGetChargeCategoriesQuery } from 'src/redux/finance/chargeCategory';
import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { isFinanceAdministratorSession } from 'src/utils/finance-admin-auto-approval';
import { buildAudiencePayload } from 'src/redux/finance/ChargeManagement/chargeMappers';
import FinancePrerequisiteState from 'src/screens/finance/components/FinancePrerequisiteState';
import { isFinancePrerequisiteMissing } from 'src/screens/finance/components/financePrerequisites';
import { useRefreshFinancePrerequisites } from 'src/screens/finance/hooks/useRefreshFinancePrerequisites';
import {
  usePostChargeMutation,
  useUpdateChargeMutation,
} from 'src/redux/finance/ChargeManagement/chargeApi';
import {
  Box,
  Grid,
  Stack,
  Alert,
  Radio,
  Button,
  Tooltip,
  Skeleton,
  Collapse,
  TextField,
  Typography,
  RadioGroup,
  FormControlLabel,
} from '@mui/material';

import { useStudentsInScope } from './useStudentsInScope';
import { SelectedStudentsPanel } from './SelectedStudentsPanel';
import { useChargePermissions } from '../../useChargePermissions';
import { StudentSelectionLayout } from './StudentSelectionLayout';
import { useDirtyState, useChargeDetails } from './useChargeDetails';
import { useChargeAcademicStructure } from './useChargeAcademicStructure';
import { emptyStudentFilters, filterChargeStudents } from './studentFilters';
import {
  getFirstValidationMessage,
  createUpdateChargeValidationSchema,
} from './UpdateChargeValidation';

import type { IStudentOption, IUpdateChargeFormProps, IUpdateChargeFormValues } from './types';

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
  const permissions = useChargePermissions();
  const { data: session, status: sessionStatus } = useSession();
  const isAdminCreator = isFinanceAdministratorSession(session);
  const [adminConfirmation, setAdminConfirmation] = useState<{
    snapshot: string;
    count: number;
    amount: number;
    name: string;
    category: string;
    dueDate: string;
  } | null>(null);
  const confirmedAdminSnapshotRef = useRef<string | null>(null);
  const [studentFilters, setStudentFilters] = useState(emptyStudentFilters);
  const [, setSelectionNotice] = useState('');
  const [allScopeConfirmation, setAllScopeConfirmation] = useState<{
    count: number;
    snapshot: string;
    updated: boolean;
  } | null>(null);
  const approvedAllScopeRef = useRef<string | null>(null);
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
  const {
    prefillValues,
    chargeDetail,
    isLoading: chargeLoading,
    restrictions,
  } = useChargeDetails(chargeId);

  // State for academic structure
  const [boards, setBoards] = useState<any[]>([]);
  const [mediums, setMediums] = useState<any[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [showStudentFilters, setShowStudentFilters] = useState(false);
  const [pendingSelectionChange, setPendingSelectionChange] = useState<null | {
    type: 'class' | 'division';
    nextStandardIds?: string[];
    nextDivisionIds?: string[];
    deselectedStandardId?: string;
    deselectedDivisionId?: string;
  }>(null);

  // Query hooks

  const {
    currentData: chargeCategories,
    isLoading: chargeCategoriesLoading,
    isFetching: chargeCategoriesFetching,
    isError: chargeCategoriesError,
    isUninitialized: chargeCategoriesUninitialized,
    refetch: refetchChargeCategories,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetChargeCategoriesQuery,
    params: {
      academicYearId: currentYear?.id,
      page: 1,
      pageSize: 100,
      isActive: true,
    },
    options: { skip: !currentYear?.id },
  });

  const availableChargeCategories = useMemo(
    () => (chargeCategories?.items ?? []).filter((category: any) => category.isActive === true),
    [chargeCategories?.items]
  );
  const missingChargeCategory = isFinancePrerequisiteMissing({
    options: chargeCategories ? availableChargeCategories : undefined,
    required: !isEditMode,
    isLoading: chargeCategoriesLoading,
    isFetching: chargeCategoriesFetching,
    isError: chargeCategoriesError,
    isUninitialized: chargeCategoriesUninitialized,
  });
  useRefreshFinancePrerequisites(() => refetchChargeCategories(), Boolean(currentYear?.id));

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
  const editInitialValuesRef = useRef<IUpdateChargeFormValues | null>(null);
  const editConcurrencyStampRef = useRef('');
  if (prefillValues && !editInitialValuesRef.current) {
    editInitialValuesRef.current = prefillValues;
    editConcurrencyStampRef.current = chargeDetail?.concurrencyStamp ?? '';
  }

  // Initialize form with prefilled values
  const initialValues: IUpdateChargeFormValues = useMemo(() => {
    const initialEditValues = editInitialValuesRef.current ?? prefillValues;
    if (initialEditValues) {
      return initialEditValues;
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
    validateOnMount: true,
    onSubmit: async (values) => {
      if (missingChargeCategory) return;
      try {
        if (!permissions.isReady || !(isEditMode ? permissions.canEdit : permissions.canAdd)) {
          shikshaMitraToast.error({ message: 'You do not have permission to save this charge.' });
          return;
        }
        if (!currentYear?.id) {
          shikshaMitraToast.error({ message: 'Academic year is not selected.' });
          return;
        }

        const category = availableChargeCategories.find(
          (item: { id: string }) => item.id === values.chargeCategoryId
        );
        const categoryName = category?.name ?? values.chargeName;
        const automaticallyApproved = isAdminCreator || category?.isApprovalRequired === false;

        if (values.selectionMode === 'all' && candidateStudentIdsRef.current.length === 0) {
          shikshaMitraToast.error({
            message: 'No students are available in the selected scope.',
          });
          return;
        }

        const audienceSnapshot = JSON.stringify({
          values,
          studentIds: [...candidateStudentIdsRef.current].sort(),
        });
        if (values.selectionMode === 'all' && approvedAllScopeRef.current !== audienceSnapshot) {
          setAllScopeConfirmation({
            count: candidateStudentIdsRef.current.length,
            snapshot: audienceSnapshot,
            updated: false,
          });
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

        if (
          !isEditMode &&
          automaticallyApproved &&
          confirmedAdminSnapshotRef.current !== audienceSnapshot
        ) {
          setAdminConfirmation({
            snapshot: audienceSnapshot,
            count:
              values.selectionMode === 'all'
                ? candidateStudentIdsRef.current.length
                : values.studentIds.length,
            amount: payload.amount,
            name: payload.chargeName,
            category: categoryName,
            dueDate: dayjs(values.dueDate).format('DD MMM YYYY'),
          });
          return;
        }
        approvedAllScopeRef.current = null;

        if (isEditMode && chargeId) {
          await updateCharge({
            id: chargeId,
            body: { ...payload, concurrencyStamp: editConcurrencyStampRef.current },
          }).unwrap();
          shikshaMitraToast.success({
            message: `Charge updated successfully for ${categoryName}`,
          });
        } else {
          const created = await postCharge({
            academicYearId: currentYear.id,
            body: payload,
          }).unwrap();
          if (automaticallyApproved && created.data.status !== 1) {
            shikshaMitraToast.warning({
              message: 'Charge was created as Pending. Automatic approval did not occur.',
            });
          } else {
            shikshaMitraToast.success({
              message:
                created.data.status === 1
                  ? `Charge created and approved for ${categoryName}`
                  : `Charge created as Pending for ${categoryName}`,
            });
          }
        }
        confirmedAdminSnapshotRef.current = null;
        dispatch(setIsChanges(false));
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

  const { values, touched, errors, setFieldValue, setFieldTouched, setValues } = formik;
  const selectedCategoryRequiresApproval =
    availableChargeCategories.find((item: { id: string }) => item.id === values.chargeCategoryId)
      ?.isApprovalRequired !== false;
  const isDirty = useDirtyState(initialValues, values);
  const {
    classes,
    divisions: allDivision,
    isFetching: classesLoading,
    isError: classesError,
    refetch: retryClasses,
  } = useChargeAcademicStructure(values.educationMediumId, values.standardId);

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
        setValues((previous) => ({
          ...previous,
          standardId: nextStandardIds,
          divisionIds:
            nextStandardIds.length === 1 &&
            previous.standardId.length === 1 &&
            nextStandardIds[0] === previous.standardId[0]
              ? previous.divisionIds
              : [],
        }));
        setFieldTouched('standardId', false, false);
        if (nextStandardIds.length !== 1) {
          if (values.divisionIds.length)
            setSelectionNotice(
              'Division selection was cleared because the scope now includes multiple classes or no class.'
            );
        }
      }

      if (change.type === 'division') {
        const nextDivisionIds = change.nextDivisionIds || [];
        setValues((previous) => ({ ...previous, divisionIds: nextDivisionIds }));
        setFieldTouched('divisionIds', false, false);
      }

      if (clearStudents)
        setSelectionNotice('Student selections will be checked against the updated scope.');
    },
    [setValues, setFieldTouched, values.divisionIds]
  );

  const {
    students: scopeStudents,
    isLoading: studentsLoading,
    hasFetched: studentsFetched,
    candidateStudentIds,
    isError: studentsError,
    retry: retryStudents,
  } = useStudentsInScope(
    values.boardId,
    values.educationMediumId,
    values.standardId,
    values.divisionIds,
    values.chargeCategoryId
  );

  candidateStudentIdsRef.current = candidateStudentIds;
  const audienceSnapshot = JSON.stringify({ values, studentIds: [...candidateStudentIds].sort() });
  useEffect(() => {
    if (
      allScopeConfirmation &&
      !studentsLoading &&
      !studentsError &&
      allScopeConfirmation.snapshot !== audienceSnapshot
    ) {
      setAllScopeConfirmation({
        count: candidateStudentIds.length,
        snapshot: audienceSnapshot,
        updated: true,
      });
    }
  }, [
    allScopeConfirmation,
    audienceSnapshot,
    candidateStudentIds.length,
    studentsLoading,
    studentsError,
  ]);

  const filteredStudents = useMemo(
    () => filterChargeStudents(scopeStudents, studentSearch, studentFilters),
    [scopeStudents, studentSearch, studentFilters]
  );
  const activeStudentFilterCount = Object.values(studentFilters).filter(Boolean).length;

  // Handle dialog close with dirty state check
  const handleClose = useCallback(() => onClose(null, false), [onClose]);

  // Load boards on component mount
  useEffect(() => {
    const yearBoards = currentYear?.boards || [];
    setBoards(yearBoards);
    if (yearBoards.length > 0) {
      if (!values.boardId) {
        const firstBoard = yearBoards[0];
        const firstMedium = firstBoard?.educationMediums?.[0]?.id ?? '';
        setValues((previous) => ({
          ...previous,
          boardId: firstBoard.id,
          educationMediumId: firstMedium,
        }));
      } else if (!values.educationMediumId) {
        const board = yearBoards.find((b: any) => b.id === values.boardId);
        const firstMedium = board?.educationMediums?.[0]?.id ?? '';
        setFieldValue('educationMediumId', firstMedium);
      }
    }
  }, [currentYear, values.boardId, values.educationMediumId, setFieldValue, setValues]);

  // Load mediums when board changes
  useEffect(() => {
    const selectedBoard = boards.find((b: any) => b.id === values.boardId);
    setMediums(selectedBoard?.educationMediums || []);
  }, [values.boardId, boards]);

  // Track dirty state in Redux
  useEffect(() => {
    if (isDirty) {
      dispatch(setIsChanges(true));
    }
  }, [isDirty, dispatch]);

  // Clean up selected students that are no longer in scope
  useEffect(() => {
    // Existing edit audiences are snapshots. A lookup refetch must not remove historical
    // students unless the user actually changes the charge's academic scope.
    const scopeChanged =
      initialValues.boardId !== values.boardId ||
      initialValues.educationMediumId !== values.educationMediumId ||
      JSON.stringify(initialValues.standardId) !== JSON.stringify(values.standardId) ||
      JSON.stringify(initialValues.divisionIds) !== JSON.stringify(values.divisionIds);
    if (isEditMode && !scopeChanged) return;
    if (!studentsLoading && studentsFetched) {
      if (values.standardId.length === 0 && values.studentIds.length > 0) {
        setSelectionNotice('Selected students were cleared because no class is selected.');
        setValues((previous) => ({ ...previous, studentIds: [], selectedStudents: [] }));
      } else if (values.standardId.length > 0 && scopeStudents) {
        const validIds = new Set(candidateStudentIdsRef.current);
        const needsCleanup = values.studentIds.some((id) => !validIds.has(id));
        if (needsCleanup) {
          setSelectionNotice(
            `${values.studentIds.filter((id) => !validIds.has(id)).length} selected student(s) were removed because they are outside the updated scope.`
          );
          const newSelectedStudents = values.selectedStudents.filter((s) => validIds.has(s.id));
          setValues((previous) => ({
            ...previous,
            studentIds: newSelectedStudents.map((student) => student.id),
            selectedStudents: newSelectedStudents,
          }));
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
    setValues,
    isEditMode,
    initialValues,
    values.boardId,
    values.educationMediumId,
    values.divisionIds,
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

  const submitDisabledReason = missingChargeCategory
    ? 'Add an active charge category before creating this charge.'
    : sessionStatus === 'loading'
      ? 'Checking your role…'
      : !permissions.isReady
        ? 'Checking charge permissions…'
        : !(isEditMode ? permissions.canEdit : permissions.canAdd)
          ? `You do not have permission to ${isEditMode ? 'update' : 'create'} charges.`
          : !isEditMode &&
              isAdminCreator &&
              selectedCategoryRequiresApproval &&
              !permissions.canApprove
            ? 'Approve permission is required for an administrator to create an automatically approved charge.'
            : studentsLoading
              ? 'Wait for the student list to finish loading.'
              : studentsError
                ? 'Reload the student list before saving.'
                : !formik.isValid
                  ? getFirstValidationMessage(errors) ||
                    'Complete all required fields and select at least one student.'
                  : values.selectionMode === 'all' && candidateStudentIds.length === 0
                    ? 'No students are available in the selected scope.'
                    : '';

  if (chargeLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  return (
    <BackPopUpChecked initialValues={initialValues} currentValues={values}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!submitDisabledReason) handleSubmit();
        }}
        style={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}
      >
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          display="flex"
          flexDirection="column"
          height="100%"
          minHeight={0}
        >
          <Box
            role="region"
            aria-label="Charge form fields"
            tabIndex={0}
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              overflowX: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {missingChargeCategory ? (
              <FinancePrerequisiteState
                requirements={[{ key: 'charge-category' }]}
                onRefresh={() => refetchChargeCategories()}
              />
            ) : (
              <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Grid container spacing={1.5}>
                  {/* Charge Details Section */}
                  <Grid size={{ xs: 12 }}>
                    <FormSectionCard
                      descriptionTooltip="Set the charge name, category, amount, due date, and reason."
                      icon="solar:bill-list-bold-duotone"
                      title="Charge details"
                    >
                      <Grid container spacing={1.5}>
                        {/* Charge Name */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <ShakingTextField error={!!(touched.chargeName && errors.chargeName)}>
                            <TextField
                              name="chargeName"
                              label="Charge name *"
                              fullWidth
                              size="small"
                              disabled={isEditMode}
                              value={values.chargeName}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              error={!!(touched.chargeName && errors.chargeName)}
                              helperText={
                                ((touched.chargeName && errors.chargeName) as string) || undefined
                              }
                            />
                          </ShakingTextField>
                        </Grid>

                        {/* Charge Category */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <ShakingTextField
                            error={!!(touched.chargeCategoryId && errors.chargeCategoryId)}
                          >
                            <CustomSelect
                              disabled={isEditMode}
                              name="chargeCategoryId"
                              label="Charge category *"
                              isLoading={chargeCategoriesLoading}
                              options={availableChargeCategories}
                              labelKey="name"
                              valueKey="id"
                              value={values.chargeCategoryId}
                              onChange={(value) => {
                                if (Array.isArray(value)) return;
                                const chargeCategoryId = String(value);
                                const category = availableChargeCategories.find(
                                  (item: { id: string }) => item.id === chargeCategoryId
                                );
                                setValues((previous) => ({
                                  ...previous,
                                  chargeCategoryId,
                                  chargeCategoryName: category?.name ?? '',
                                }));
                                setFieldTouched('chargeCategoryId', false, false);
                              }}
                              error={
                                !!(touched.chargeCategoryId && errors.chargeCategoryId) || false
                              }
                              helperText={
                                ((touched.chargeCategoryId && errors.chargeCategoryId) as string) ||
                                undefined
                              }
                              formControlProps={{ fullWidth: true }}
                            />
                            {!isEditMode && values.chargeCategoryId && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                fontSize="0.75rem"
                              >
                                {isAdminCreator || !selectedCategoryRequiresApproval
                                  ? 'Your charge will be approved automatically after confirmation.'
                                  : 'This charge will start as Pending and require approval.'}
                              </Typography>
                            )}
                          </ShakingTextField>
                        </Grid>

                        {/* Amount */}
                        <Grid size={{ xs: 12, sm: 6 }}>
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
                              helperText={
                                ((touched.amount && errors.amount) as string) || undefined
                              }
                            />
                          </ShakingTextField>
                        </Grid>

                        {/* Due Date */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <ShakingTextField error={!!(touched.dueDate && errors.dueDate) || false}>
                            <DatePicker
                              label="Due date *"
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
                              label="Purpose / description *"
                              multiline
                              minRows={2}
                              fullWidth
                              value={values.purposeDescription}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              error={!!(touched.purposeDescription && errors.purposeDescription)}
                              helperText={
                                ((touched.purposeDescription &&
                                  errors.purposeDescription) as string) || undefined
                              }
                            />
                          </ShakingTextField>
                        </Grid>
                      </Grid>
                    </FormSectionCard>
                  </Grid>

                  {/* Student Information */}
                  <Grid size={{ xs: 12 }}>
                    <FormSectionCard
                      descriptionTooltip="Choose the board and medium whose students can receive this charge."
                      icon="solar:users-group-rounded-bold-duotone"
                      title="Academic scope"
                    >
                      <Grid container spacing={1.5}>
                        {/* Board */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <ShakingTextField error={!!(touched.boardId && errors.boardId)}>
                            <CustomSelect
                              disabled={!restrictions.canChangeBoardId}
                              label="Board *"
                              options={boards}
                              labelKey="name"
                              valueKey="id"
                              value={values.boardId}
                              onChange={(val) => {
                                if (Array.isArray(val)) return;
                                const boardId = String(val);
                                if (boardId === values.boardId) return;
                                if (
                                  values.standardId.length ||
                                  values.divisionIds.length ||
                                  values.studentIds.length
                                )
                                  setSelectionNotice(
                                    'Classes, divisions and students were cleared because the selected board changed.'
                                  );
                                setValues((previous) => ({
                                  ...previous,
                                  boardId,
                                  educationMediumId: '',
                                  standardId: [],
                                  divisionIds: [],
                                  studentIds: [],
                                  selectedStudents: [],
                                }));
                                setFieldTouched('boardId', false, false);
                              }}
                              error={!!errors.boardId && touched.boardId}
                              helperText={
                                restrictions.boardChangeReason ||
                                ((touched.boardId && errors.boardId) as string) ||
                                undefined
                              }
                            />
                          </ShakingTextField>
                        </Grid>

                        {/* Medium */}
                        <Grid size={{ xs: 12, sm: 6 }}>
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
                                if (Array.isArray(val)) return;
                                const educationMediumId = String(val);
                                if (educationMediumId === values.educationMediumId) return;
                                if (
                                  values.standardId.length ||
                                  values.divisionIds.length ||
                                  values.studentIds.length
                                )
                                  setSelectionNotice(
                                    'Classes, divisions and students were cleared because the selected medium changed.'
                                  );
                                setValues((previous) => ({
                                  ...previous,
                                  educationMediumId,
                                  standardId: [],
                                  divisionIds: [],
                                  studentIds: [],
                                  selectedStudents: [],
                                }));
                                setFieldTouched('educationMediumId', false, false);
                              }}
                              error={!!errors.educationMediumId && touched.educationMediumId}
                              helperText={
                                restrictions.mediumChangeReason ||
                                ((touched.educationMediumId &&
                                  errors.educationMediumId) as string) ||
                                undefined
                              }
                            />
                          </ShakingTextField>
                        </Grid>
                      </Grid>
                    </FormSectionCard>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <FormSectionCard
                      title="Classes"
                      icon="solar:notebook-bold-duotone"
                      descriptionTooltip="Select one or more classes within the chosen board and medium."
                    >
                      <ShakingTextField error={!!(touched.standardId && errors.standardId)}>
                        <Box role="group" aria-label="Classes (required)">
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                            {values.standardId.length === 0
                              ? 'Select one or more classes *'
                              : `${values.standardId.length} selected`}
                          </Typography>
                          <Box display="flex" flexWrap="wrap" gap={1}>
                            {classesLoading && classes.length === 0 ? (
                              Array.from(new Array(6)).map((_, index) => (
                                <Skeleton
                                  key={index}
                                  variant="rectangular"
                                  sx={{ width: 90, height: 36, borderRadius: 1 }}
                                />
                              ))
                            ) : classesError && classes.length === 0 ? (
                              <Alert
                                severity="error"
                                action={
                                  <Button size="small" onClick={() => retryClasses()}>
                                    Retry
                                  </Button>
                                }
                              >
                                Classes and divisions could not be loaded.
                              </Alert>
                            ) : (classes || []).length > 0 ? (
                              (classes || []).map((cls: any) => (
                                <Button
                                  key={cls.id}
                                  variant={
                                    values.standardId.includes(cls.id) ? 'contained' : 'outlined'
                                  }
                                  color={values.standardId.includes(cls.id) ? 'primary' : undefined}
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
                          {touched.standardId && errors.standardId && (
                            <Typography
                              variant="caption"
                              sx={{ color: 'error.main', mt: 0.5, display: 'block' }}
                            >
                              {errors.standardId}
                            </Typography>
                          )}
                        </Box>
                      </ShakingTextField>
                    </FormSectionCard>
                  </Grid>

                  {values.standardId.length === 1 && (
                    <Grid size={{ xs: 12 }}>
                      <FormSectionCard
                        title="Divisions"
                        icon="solar:layers-bold-duotone"
                        descriptionTooltip="Select divisions to narrow the class scope. Leaving this empty includes all divisions."
                      >
                        <Typography variant="body2" color="text.secondary">
                          {values.divisionIds.length === 0
                            ? 'All divisions included; select divisions to narrow the scope'
                            : `${values.divisionIds.length} selected`}
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap={1}>
                          {classesLoading && classes.length === 0 ? (
                            <Typography role="status" variant="body2">
                              Loading divisions…
                            </Typography>
                          ) : !allDivision || allDivision.length === 0 ? (
                            <Box sx={{ p: 2, width: '100%', textAlign: 'center' }}>
                              <Typography variant="body2" color="text.secondary">
                                No divisions are configured for this class. Students from the whole
                                class are included.
                              </Typography>
                            </Box>
                          ) : (
                            allDivision.map((div: Division) => (
                              <Button
                                key={div.id}
                                variant={
                                  values.divisionIds.includes(div.id) ? 'contained' : 'outlined'
                                }
                                color={values.divisionIds.includes(div.id) ? 'primary' : undefined}
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
                        {touched.divisionIds && errors.divisionIds && (
                          <Typography
                            variant="caption"
                            sx={{ color: 'error.main', mt: 0.5, display: 'block' }}
                          >
                            {errors.divisionIds}
                          </Typography>
                        )}
                      </FormSectionCard>
                    </Grid>
                  )}

                  {/* Student Selection Section */}
                  <Grid size={{ xs: 12 }}>
                    <FormSectionCard
                      descriptionTooltip="Only enrolled students with a fee structure assignment can receive charges. Already charged means a pending or approved charge in this category and academic year. Search and filters change the visible list only."
                      icon="solar:user-check-rounded-bold-duotone"
                      title="Student selection"
                    >
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        alignItems={{ xs: 'stretch', sm: 'center' }}
                        justifyContent="space-between"
                        gap={1}
                      >
                        <RadioGroup
                          row
                          aria-label="Student selection mode"
                          value={values.selectionMode}
                          onChange={(event) => {
                            const mode = event.target.value as 'selected' | 'all';
                            setFieldValue('selectionMode', mode);
                          }}
                        >
                          <FormControlLabel
                            value="selected"
                            control={<Radio size="small" />}
                            label="Selected students"
                          />
                          <FormControlLabel
                            value="all"
                            control={<Radio size="small" />}
                            label="All students in scope"
                          />
                        </RadioGroup>
                        <Typography variant="body2" color="text.secondary">
                          {values.selectionMode === 'all'
                            ? `${candidateStudentIds.length} eligible students in scope`
                            : `${values.studentIds.length} students selected`}
                        </Typography>
                      </Stack>

                      {studentsError && (
                        <Alert
                          severity="error"
                          action={<Button onClick={retryStudents}>Retry</Button>}
                          sx={{ mb: 1 }}
                        >
                          Students could not be loaded. Your selections have been kept.
                        </Alert>
                      )}
                      <Box>
                        <Button
                          size="small"
                          onClick={() => setShowStudentFilters((visible) => !visible)}
                          aria-expanded={showStudentFilters}
                          aria-controls="charge-student-filters"
                          startIcon={<Iconify icon="solar:filter-bold-duotone" />}
                        >
                          Filters{activeStudentFilterCount ? ` (${activeStudentFilterCount})` : ''}
                        </Button>
                        <Collapse in={showStudentFilters}>
                          <Box
                            id="charge-student-filters"
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: {
                                xs: '1fr',
                                sm: 'repeat(2, minmax(0, 1fr))',
                                lg: 'repeat(3, minmax(0, 1fr))',
                              },
                              gap: 1,
                              pt: 1.5,
                              '& > *': { minWidth: 0 },
                            }}
                          >
                            <CustomSelect
                              label="Division filter"
                              value={studentFilters.division}
                              options={Array.from(
                                new Map(
                                  scopeStudents
                                    .filter(
                                      (
                                        student
                                      ): student is IStudentOption & { divisionId: string } =>
                                        !!student.divisionId
                                    )
                                    .map((student) => [
                                      student.divisionId,
                                      {
                                        id: student.divisionId,
                                        name: [student.standardName, student.divisionName]
                                          .filter(Boolean)
                                          .join(' · '),
                                      },
                                    ])
                                ).values()
                              )}
                              labelKey="name"
                              valueKey="id"
                              onChange={(value) =>
                                setStudentFilters((filters) => ({
                                  ...filters,
                                  division: value as string,
                                }))
                              }
                              formControlProps={{ fullWidth: true }}
                            />
                            <CustomSelect
                              label="Gender"
                              value={studentFilters.gender}
                              options={[
                                { id: '0', name: 'Male' },
                                { id: '1', name: 'Female' },
                              ]}
                              labelKey="name"
                              valueKey="id"
                              onChange={(value) =>
                                setStudentFilters((filters) => ({
                                  ...filters,
                                  gender: value as string,
                                }))
                              }
                              formControlProps={{ fullWidth: true }}
                            />
                            <TextField
                              size="small"
                              label="Roll No. from"
                              type="number"
                              value={studentFilters.rollFrom}
                              onChange={(event) =>
                                setStudentFilters((filters) => ({
                                  ...filters,
                                  rollFrom: event.target.value,
                                }))
                              }
                              fullWidth
                            />
                            <TextField
                              size="small"
                              label="Roll No. to"
                              type="number"
                              value={studentFilters.rollTo}
                              onChange={(event) =>
                                setStudentFilters((filters) => ({
                                  ...filters,
                                  rollTo: event.target.value,
                                }))
                              }
                              fullWidth
                            />
                            <CustomSelect
                              label="Fee structure assigned"
                              value={studentFilters.assigned}
                              options={[
                                { id: 'yes', name: 'Assigned' },
                                { id: 'no', name: 'Not assigned' },
                              ]}
                              labelKey="name"
                              valueKey="id"
                              onChange={(value) =>
                                setStudentFilters((filters) => ({
                                  ...filters,
                                  assigned: value as string,
                                }))
                              }
                              formControlProps={{ fullWidth: true }}
                            />
                            <CustomSelect
                              label="Charged in selected category"
                              disabled={!values.chargeCategoryId}
                              value={studentFilters.charged}
                              options={[
                                { id: 'yes', name: 'Already charged' },
                                { id: 'no', name: 'Not charged' },
                              ]}
                              labelKey="name"
                              valueKey="id"
                              onChange={(value) =>
                                setStudentFilters((filters) => ({
                                  ...filters,
                                  charged: value as string,
                                }))
                              }
                              formControlProps={{ fullWidth: true }}
                            />
                            <Button
                              size="small"
                              disabled={activeStudentFilterCount === 0 && !studentSearch}
                              onClick={() => {
                                setStudentFilters(emptyStudentFilters);
                                setStudentSearch('');
                              }}
                            >
                              Reset filters
                            </Button>
                          </Box>
                        </Collapse>
                      </Box>
                      <Grid container spacing={1.5}>
                        {/* Student List */}
                        <Grid
                          size={{
                            xs: 12,
                            md:
                              values.selectionMode === 'selected' &&
                              values.selectedStudents.length > 0
                                ? 8
                                : 12,
                          }}
                        >
                          <StudentSelectionLayout
                            students={filteredStudents}
                            totalCount={scopeStudents.length}
                            emptyMessage={
                              studentsError
                                ? 'Student availability could not be checked. Use Retry to load this scope.'
                                : values.standardId.length === 0
                                  ? 'Select at least one class to see students.'
                                  : studentSearch || activeStudentFilterCount > 0
                                    ? 'No students match the current search or filters.'
                                    : 'No students are available in this academic scope.'
                            }
                            selectedStudentIds={
                              values.selectionMode === 'all'
                                ? candidateStudentIds
                                : values.studentIds
                            }
                            isLoading={studentsLoading}
                            onSelectionChange={(selectedIds) => {
                              const selected = scopeStudents.filter((s) =>
                                selectedIds.includes(s.id)
                              );
                              setValues((previous) => ({
                                ...previous,
                                studentIds: selectedIds,
                                selectedStudents: selected,
                              }));
                            }}
                            searchQuery={studentSearch}
                            onSearchChange={setStudentSearch}
                            disabled={values.selectionMode === 'all'}
                          />
                        </Grid>

                        {/* Selected Students Panel */}
                        {values.selectionMode === 'selected' &&
                          values.selectedStudents.length > 0 && (
                            <Grid size={{ xs: 12, md: 4 }}>
                              <SelectedStudentsPanel
                                selectedStudents={values.selectedStudents}
                                onRemove={(studentId) => {
                                  const newIds = values.studentIds.filter((id) => id !== studentId);
                                  const selected = scopeStudents.filter((s) =>
                                    newIds.includes(s.id)
                                  );
                                  setValues((previous) => ({
                                    ...previous,
                                    studentIds: newIds,
                                    selectedStudents: selected,
                                  }));
                                }}
                                onClearAll={() => {
                                  setValues((previous) => ({
                                    ...previous,
                                    studentIds: [],
                                    selectedStudents: [],
                                  }));
                                }}
                              />
                            </Grid>
                          )}
                      </Grid>
                    </FormSectionCard>
                  </Grid>

                  <ConfirmDialog
                    open={!!pendingSelectionChange}
                    icon="warning"
                    onClose={() => setPendingSelectionChange(null)}
                    title="Confirm Selection Change"
                    content="This change will remove selected students. Do you want to continue?"
                    action={
                      <Button
                        startIcon={<Iconify icon="mdi:arrow-right" />}
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
            )}
          </Box>

          {/* Sticky Action Bar */}
          <Box
            sx={{
              flexShrink: 0,
              position: 'sticky',
              bottom: 0,
              zIndex: 2,
              bgcolor: 'background.paper',
              borderTop: `1px solid ${theme.palette.divider}`,
              backdropFilter: 'blur(12px)',
              px: { xs: 2, md: 3 },
              py: 1.5,
            }}
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              flexWrap="wrap"
              gap={1}
            >
              <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 520 }}>
                {submitDisabledReason ||
                  `${values.selectionMode === 'all' ? candidateStudentIds.length : values.studentIds.length} students will receive this charge.`}
              </Typography>
              <Stack direction="row" spacing={1.5} flexWrap="wrap">
                <Button
                  variant="outlined"
                  color="inherit"
                  size="small"
                  onClick={handleClose}
                  startIcon={<Iconify icon={GlobalIcons.cancel} />}
                  disabled={isSubmitLoading}
                >
                  Cancel
                </Button>
                <Tooltip title={submitDisabledReason}>
                  {/* Keyboard access exposes the reason while the actual action is disabled. */}
                  {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
                  <span tabIndex={submitDisabledReason ? 0 : undefined}>
                    <LoadingButton
                      disabled={!!submitDisabledReason}
                      type="button"
                      variant="contained"
                      loading={isSubmitLoading || formik.isSubmitting}
                      startIcon={
                        <Iconify icon={isEditMode ? GlobalIcons.edit : GlobalIcons.submit} />
                      }
                      size="small"
                      onClick={handleSubmit}
                    >
                      Submit
                    </LoadingButton>
                  </span>
                </Tooltip>
              </Stack>
            </Box>
          </Box>
        </Box>
        <ConfirmDialog
          open={allScopeConfirmation !== null}
          icon="warning"
          title={isEditMode ? 'Update charge audience?' : 'Create charge for all students?'}
          content={
            <Stack spacing={1}>
              <Typography>
                This charge will apply to all {allScopeConfirmation?.count ?? 0} eligible students
                in the selected academic scope.
              </Typography>
              <Typography variant="body2">
                Quick filters and search do not restrict this audience.
              </Typography>
            </Stack>
          }
          onClose={() => {
            approvedAllScopeRef.current = null;
            setAllScopeConfirmation(null);
          }}
          action={
            <LoadingButton
              startIcon={<Iconify icon="mdi:check-circle-outline" />}
              type="button"
              variant="contained"
              loading={formik.isSubmitting || isSubmitLoading}
              disabled={
                !!submitDisabledReason || allScopeConfirmation?.snapshot !== audienceSnapshot
              }
              onClick={async () => {
                const currentSnapshot = JSON.stringify({
                  values: formik.values,
                  studentIds: [...candidateStudentIdsRef.current].sort(),
                });
                if (allScopeConfirmation?.snapshot !== currentSnapshot) {
                  setAllScopeConfirmation({
                    count: candidateStudentIdsRef.current.length,
                    snapshot: currentSnapshot,
                    updated: true,
                  });
                  return;
                }
                approvedAllScopeRef.current = currentSnapshot;
                setAllScopeConfirmation(null);
                await formik.submitForm();
              }}
            >
              Confirm
            </LoadingButton>
          }
        />
        <ConfirmDialog
          open={adminConfirmation !== null}
          icon="warning"
          title="Create and approve charge?"
          disableBackdropClick
          content={
            <Stack spacing={1}>
              <Typography>
                {adminConfirmation?.name} · {adminConfirmation?.category} · {currentYear?.name}
              </Typography>
              <Typography>
                {formatCurrency(adminConfirmation?.amount ?? 0)} per student for{' '}
                {adminConfirmation?.count ?? 0} students.
              </Typography>
              <Typography>
                Total:{' '}
                {formatCurrency((adminConfirmation?.amount ?? 0) * (adminConfirmation?.count ?? 0))}{' '}
                · Due {adminConfirmation?.dueDate}
              </Typography>
              <Typography>This request will be approved automatically when you confirm.</Typography>
            </Stack>
          }
          onClose={() => setAdminConfirmation(null)}
          cancelText="Keep editing"
          action={
            <LoadingButton
              startIcon={<Iconify icon="mdi:check-circle-outline" />}
              type="button"
              variant="contained"
              loading={formik.isSubmitting || isSubmitLoading}
              onClick={async () => {
                if (!adminConfirmation) return;
                confirmedAdminSnapshotRef.current = adminConfirmation.snapshot;
                setAdminConfirmation(null);
                await formik.submitForm();
              }}
            >
              Create and approve
            </LoadingButton>
          }
        />
      </form>
    </BackPopUpChecked>
  );
};

export default UpdateChargeForm;
