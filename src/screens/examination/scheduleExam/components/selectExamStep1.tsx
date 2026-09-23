import type { FormikProps } from 'formik';
import type { Variants } from 'framer-motion';
import type { RootState } from 'src/redux/store';
import type { Medium, Standards, Organization } from 'src/types/school';

import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { useRef, useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { LanguageInputField } from 'src/screens/academic/components/language-typing';
import { Box, Grid, Checkbox, TextField, Typography, Autocomplete } from '@mui/material';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import { useGetExaminationTypesQuery } from 'src/redux/academicAPI/ExaminationApi/examSetting/exam-type-api';
import { useGetGradeScalingsQuery } from 'src/redux/academicAPI/ExaminationApi/examSetting/grade-scalling-api';
import { useGetExamSubjectsLookupQuery } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/schedule-examApi';
import { cardStyle } from 'src/screens/academic/homework-assignment-management/homeworkCreation/component/homeworkForm';
import { SubjectAssignmentStatus } from 'src/screens/academic/curriculum-management/subjectAssignment/enum/subjectType';
import { useLazyGetStudentElectiveAssignmentsQuery } from 'src/redux/classManagementApi/studentElectiveAssignment/studentElectiveAssignment';

import { pruneRoomDetails } from './initialValues';
import { applyExamSubjectSelection } from './exam-subject-form-state';
import { resolveDivisionSelection, getDisplayedDivisionSelection } from './division-selection';
import ExamTypeForm from '../../settings/examAssessmentTypeSetting.tsx/examTypeSetting/examTypeForm';
import {
  normalizeSubjectId,
  getSubjectSelectionKey,
  getUncachedElectiveGroupIds,
  normalizeSelectedExamSubjects,
} from './exam-subject-selection';

import type { IExamFormValues } from '../type';
import type { ElectiveReadiness, SubjectSelectionOption } from './exam-subject-selection';

type StudentElectiveAssignmentsResponse = {
  records?: Array<{ selectedSubjectId?: string | null }>;
  data?: {
    records?: Array<{ selectedSubjectId?: string | null }>;
  };
};

const getStudentElectiveRecords = (response: StudentElectiveAssignmentsResponse) =>
  response.records ?? response.data?.records ?? [];

const SELECTABLE_SETTING_STATUSES = new Set([0, 2, 'Active', 'SystemDefault']);

const isSelectableSetting = (item: any) =>
  item?.status == null || SELECTABLE_SETTING_STATUSES.has(item.status);

// Framer Motion stagger variants for form fields
const formContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, ease: 'easeOut' },
  },
};

const formItemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' } },
};

const SelectExam = (props: FormikProps<IExamFormValues>) => {
  // Dialog state to control exam type creation modal visibility
  const examTypeDialog = useBoolean();

  // Formik form instance passed down as props
  const formik = props;
  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);

  // Get current board, medium and medium setter from global state
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);
  const [electiveReadiness, setElectiveReadiness] = useState<Record<string, ElectiveReadiness>>({});
  const [checkElectiveAssignments] = useLazyGetStudentElectiveAssignmentsQuery();
  const selectionVersionRef = useRef(0);
  const readinessRequestsRef = useRef(new Map<string, Promise<ElectiveReadiness>>());

  // Update classes when organization changes
  useEffect(() => {
    // Flatten the list of standards from all stages
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

    setAllClass(allClasses);
    // setClasses(allClasses[0]?.id || '');
  }, [medium]);

  const {
    data: examTypeData,
    isLoading,
    isFetching,
    refetch: refetchExamTypes,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExaminationTypesQuery,
    params: { academicMediumId: (medium as Medium)?.id, includeArchived: false },
    options: {
      skip: !(medium as Medium)?.id,
    },
  });

  const {
    data: gradeScalingsData,
    isLoading: isGradeScalingsLoading,
    isFetching: isGradeScalingsFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetGradeScalingsQuery,
    params: { academicMediumId: (medium as Medium)?.id, includeArchived: false },
    options: {
      skip: !(medium as Medium)?.id,
    },
  });

  const examTypeOptions = useMemo(
    () => (examTypeData?.items || []).filter(isSelectableSetting),
    [examTypeData?.items]
  );

  const gradeScalingOptions = useMemo(
    () => (gradeScalingsData?.data || []).filter(isSelectableSetting),
    [gradeScalingsData?.data]
  );

  const [query, setQuery] = useState<{ page: number; pageSize: number }>({
    page: 0,
    pageSize: 10,
  });

  const selectedDivisionIds = useMemo(
    () => formik.values.divisions.filter((divisionId: string) => divisionId !== 'all'),
    [formik.values.divisions]
  );

  const {
    data: subjectTableData = [],
    isLoading: isTableLoading,
    refetch,
    isFetching: isFetchingSubjects,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamSubjectsLookupQuery,
    params: {
      classId: formik.values.className,
      divisionIds: selectedDivisionIds,
    },
    options: { skip: !formik.values.className || selectedDivisionIds.length === 0 },
  });

  const subjectOptions: any = useMemo(
    () =>
      (subjectTableData || [])
        .filter((item: any) => item.status !== SubjectAssignmentStatus.Draft)
        .flatMap((item: any) => {
          if (item.electiveGroupId && Array.isArray(item.subjects)) {
            return item.subjects.map((subject: any) => ({
              ...item,
              ...subject,
              id: subject.subjectId || subject.id,
              subjectId: subject.subjectId || subject.id,
              subjectName: subject.subjectName || subject.name || item.electiveGroupName,
              selectedElectiveSubjectId: subject.subjectId || subject.id,
              electiveGroupId: item.electiveGroupId,
              electiveGroupName: item.electiveGroupName || item.name || '',
              subjects: [subject],
              optionGroup: item.electiveGroupName || 'Elective Group',
            }));
          }

          return [{ ...item, optionGroup: 'Subjects' }];
        }),
    [subjectTableData]
  );

  useEffect(() => {
    selectionVersionRef.current += 1;
    readinessRequestsRef.current.clear();
    setElectiveReadiness({});
  }, [formik.values.className, formik.values.divisions]);

  const getElectiveReadiness = (electiveGroupId: string): Promise<ElectiveReadiness> => {
    const existingRequest = readinessRequestsRef.current.get(electiveGroupId);
    if (existingRequest) return existingRequest;

    const request = (async () => {
      if (!medium?.id || !formik.values.className || selectedDivisionIds.length === 0) {
        return {
          isReady: false,
          message: 'Select class and division before selecting an elective group.',
          assignedCounts: {},
        };
      }

      try {
        const assignments = await Promise.all(
          selectedDivisionIds.map(
            (divisionId) =>
              checkElectiveAssignments(
                {
                  academicMediumId: medium.id,
                  classId: formik.values.className,
                  divisionId,
                  electiveGroupId,
                },
                true
              ).unwrap() as Promise<StudentElectiveAssignmentsResponse>
          )
        );

        const assignedCounts = assignments.reduce<Record<string, number>>((counts, assignment) => {
          getStudentElectiveRecords(assignment).forEach(({ selectedSubjectId }) => {
            const normalizedSubjectId = normalizeSubjectId(selectedSubjectId);
            if (normalizedSubjectId) {
              counts[normalizedSubjectId] = (counts[normalizedSubjectId] ?? 0) + 1;
            }
          });
          return counts;
        }, {});

        return { isReady: true, assignedCounts };
      } catch {
        return {
          isReady: false,
          message: 'Unable to load elective subject assignments. Please try again.',
          assignedCounts: {},
        };
      }
    })();

    readinessRequestsRef.current.set(electiveGroupId, request);
    request.finally(() => {
      if (readinessRequestsRef.current.get(electiveGroupId) === request) {
        readinessRequestsRef.current.delete(electiveGroupId);
      }
    });
    return request;
  };

  const commitSubjectSelection = (subjects: IExamFormValues['subjects']) => {
    formik.setFormikState((currentState) => applyExamSubjectSelection(currentState, subjects));
  };

  const handleSubjectsChange = async (value: SubjectSelectionOption[]) => {
    selectionVersionRef.current += 1;
    const selectionVersion = selectionVersionRef.current;
    const selectedType = examTypeOptions.find((item: any) => item.id === formik.values.examType);
    const defaultGradeScaleId =
      formik.values.gradingScaleId || selectedType?.defaultGradeScaleId || null;
    const selectedGradeScale = gradeScalingOptions.find(
      (item: any) => String(item.id) === String(defaultGradeScaleId)
    );
    const defaultTotalMarks =
      selectedGradeScale?.totalMarks ?? selectedType?.defaultTotalMarks ?? '';
    const defaultPassingMarks = selectedGradeScale?.passMarks ?? '';
    const defaults = {
      totalMarks: defaultTotalMarks,
      passingMarks: defaultPassingMarks,
      gradeScalingId: defaultGradeScaleId,
    };

    // Commit before starting readiness I/O so the controlled checkbox paints on the click frame.
    commitSubjectSelection(normalizeSelectedExamSubjects(value, defaults, electiveReadiness));

    const groupIds = getUncachedElectiveGroupIds(value, electiveReadiness);
    if (groupIds.length === 0) return;

    const readinessEntries = await Promise.all(
      groupIds.map(async (groupId) => [groupId, await getElectiveReadiness(groupId)] as const)
    );
    if (selectionVersion !== selectionVersionRef.current) return;

    const nextReadiness = { ...electiveReadiness, ...Object.fromEntries(readinessEntries) };
    setElectiveReadiness(nextReadiness);

    const failedGroupIds = new Set(
      readinessEntries.filter(([, readiness]) => !readiness.isReady).map(([groupId]) => groupId)
    );
    readinessEntries.forEach(([, readiness]) => {
      if (!readiness.isReady) {
        shikshaMitraToast.error({
          message: readiness.message ?? 'Elective assignment is pending.',
        });
      }
    });

    const validOptions = value.filter(
      (option) => !option.electiveGroupId || !failedGroupIds.has(option.electiveGroupId)
    );
    commitSubjectSelection(normalizeSelectedExamSubjects(validOptions, defaults, nextReadiness));
    if (failedGroupIds.size > 0) {
      formik.setFieldError('subjects', 'One or more elective assignments could not be loaded.');
    }
  };

  return (
    <Grid container>
      <Grid size={{ xs: 12 }}>
        <SectionCard
          title="Exam Setup"
          paperProps={{ sx: cardStyle }}
          headerContent={
            <Typography variant="body2" color="text.secondary">
              Define exam identity, scope, defaults, and planning strategy.
            </Typography>
          }
        >
          <motion.div
            variants={formContainerVariants}
            initial="hidden"
            animate="show"
            style={{ width: '100%' }}
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <motion.div variants={formItemVariants} style={{ width: '100%' }}>
                  <ShakingTextField
                    error={formik.touched.examType && Boolean(formik.errors.examType)}
                  >
                    <CustomSelect
                      options={examTypeOptions}
                      isLoading={isLoading || isFetching}
                      value={formik.values.examType}
                      onChange={(val) => {
                        formik.setFieldValue('examType', val);
                        // Also store the display name so the Review step shows it correctly
                        const selectedType = examTypeOptions.find((item: any) => item.id === val);
                        formik.setFieldValue('examTypeName', selectedType?.examType ?? '');
                        formik.setFieldTouched(`examType`, false);

                        if (selectedType?.defaultGradeScaleId) {
                          formik.setFieldValue('gradingScaleId', selectedType.defaultGradeScaleId);
                        }

                        const defaultTotalMarks = selectedType?.defaultTotalMarks ?? '';
                        const defaultGradeScaleId = selectedType?.defaultGradeScaleId ?? null;

                        const normalizeScheduleFields = (subject: any) => ({
                          ...subject,
                          totalMarks: subject.totalMarks || defaultTotalMarks,
                          passingMarks: subject.passingMarks ?? '',
                          gradeScalingId: subject.gradeScalingId || defaultGradeScaleId,
                        });

                        formik.setFieldValue(
                          'subjects',
                          formik.values.subjects.map((subject: any) => {
                            const normalized = normalizeScheduleFields(subject);
                            if (subject.electiveGroupId && Array.isArray(subject.subjects)) {
                              return {
                                ...normalized,
                                subjects: subject.subjects.map(normalizeScheduleFields),
                              };
                            }
                            return normalized;
                          })
                        );
                      }}
                      labelKey="examType"
                      valueKey="id"
                      label="Exam Type *"
                      formControlProps={{ fullWidth: true }}
                      error={formik.touched.examType && Boolean(formik.errors.examType)}
                      helperText={formik.touched.examType ? formik.errors.examType : undefined}
                      helperTextProps={{
                        sx: {
                          position: 'relative',
                          whiteSpace: 'normal',
                          mx: 0,
                          mt: 0.5,
                        },
                      }}
                    />
                  </ShakingTextField>

                  <CustomDialog
                    title="Create Exam Type"
                    open={examTypeDialog.value}
                    handleClose={examTypeDialog.onFalse}
                  >
                    <ExamTypeForm
                      onClose={examTypeDialog.onFalse}
                      data={null}
                      onSubmit={() => {}}
                      isEdit={false}
                    />
                  </CustomDialog>
                </motion.div>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <motion.div variants={formItemVariants} style={{ width: '100%' }}>
                  <ShakingTextField error={!!(formik.touched.className && formik.errors.className)}>
                    <CustomSelect
                      options={allClass}
                      onChange={(val) => {
                        formik.setFieldValue('className', val as string);
                        // Reset all class-dependent fields on class change
                        formik.setFieldValue('divisions', []);
                        formik.setFieldValue('subjects', []);
                        formik.setFieldValue('roomDetails', {});
                        formik.setFieldTouched(`className`, false);
                        formik.setFieldTouched('divisions', false);
                        formik.setFieldTouched('subjects', false);
                      }}
                      label="Class *"
                      labelKey="name"
                      valueKey="id"
                      value={formik.values.className}
                      formControlProps={{ fullWidth: true }}
                      error={!!(formik.touched.className && formik.errors.className)}
                      helperText={
                        formik.touched.className && formik.errors.className
                          ? formik.errors.className
                          : 'Select the class for this exam'
                      }
                      helperTextProps={{
                        sx: {
                          position: 'relative',
                          whiteSpace: 'normal',
                          mx: 0,
                          mt: 0.5,
                        },
                      }}
                    />
                  </ShakingTextField>
                </motion.div>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <motion.div variants={formItemVariants} style={{ width: '100%' }}>
                  <ShakingTextField error={!!(formik.touched.divisions && formik.errors.divisions)}>
                    <CustomSelect
                      label="Division *"
                      labelKey="name"
                      valueKey="id"
                      multiple
                      disabled={!formik.values.className}
                      isLoading={isTableLoading || isFetchingSubjects}
                      options={[
                        { id: 'all', name: 'All' },
                        ...(allClass?.find((i: Standards) => i.id === formik.values.className)
                          ?.divisions || []),
                      ]}
                      value={getDisplayedDivisionSelection(formik.values.divisions)}
                      onChange={(val) => {
                        const value = val as string[];
                        const divisionOptions =
                          allClass?.find((i: Standards) => i.id === formik.values.className)
                            ?.divisions || [];
                        const allDivisionIds = divisionOptions.map((d) => d.id);
                        const nextDivisions = resolveDivisionSelection(
                          value,
                          formik.values.divisions,
                          allDivisionIds
                        );

                        formik.setFieldValue('divisions', nextDivisions);
                        formik.setFieldTouched(`divisions`, false);

                        // Prune room details for deselected divisions and subjects
                        const updatedRoomDetails = pruneRoomDetails(
                          formik.values.roomDetails,
                          formik.values.subjects,
                          nextDivisions
                        );
                        formik.setFieldValue('roomDetails', updatedRoomDetails);
                      }}
                      formControlProps={{ fullWidth: true }}
                      error={!!(formik.touched.divisions && formik.errors.divisions)}
                      helperText={
                        formik.touched.divisions && formik.errors.divisions
                          ? Array.isArray(formik.errors.divisions)
                            ? formik.errors.divisions.join(', ')
                            : formik.errors.divisions
                          : 'Select one or more divisions (choose “All” to include all)'
                      }
                      helperTextProps={{
                        sx: {
                          position: 'relative',
                          whiteSpace: 'normal',
                          mx: 0,
                          mt: 0.5,
                        },
                      }}
                    />
                  </ShakingTextField>
                </motion.div>
              </Grid>

              <Grid size={{ xs: 12, md: 12 }}>
                <motion.div variants={formItemVariants} style={{ width: '100%' }}>
                  <ShakingTextField
                    error={formik.touched.subjects && typeof formik.errors.subjects === 'string'}
                  >
                    <Autocomplete
                      multiple
                      options={subjectOptions}
                      disabled={!formik.values.className || selectedDivisionIds.length === 0}
                      loading={isTableLoading || isFetchingSubjects}
                      getOptionLabel={(option: any) =>
                        option?.subjectName ||
                        option?.subjects?.[0]?.subjectName ||
                        option?.electiveGroupName ||
                        option?.name ||
                        ''
                      }
                      groupBy={(option: any) => option.optionGroup || 'Subjects'}
                      getOptionDisabled={(option: any) => !!option.isDisabled}
                      isOptionEqualToValue={(option: any, val: any) => {
                        const optionKey = getSubjectSelectionKey(option);
                        const valueKey = getSubjectSelectionKey(val);
                        return !!optionKey && optionKey === valueKey;
                      }}
                      size="small"
                      disableCloseOnSelect
                      renderOption={(optionProps, option, { selected }) => {
                        const { key, ...restOptionProps } = optionProps as any;
                        const label =
                          option?.subjectName ||
                          option?.subjects?.[0]?.subjectName ||
                          option?.electiveGroupName ||
                          option?.name ||
                          '';
                        const optionKey = getSubjectSelectionKey(option);
                        return (
                          <li key={key ?? optionKey} {...restOptionProps}>
                            <Checkbox
                              checked={selected}
                              size="small"
                              sx={{ mr: 0.5, p: 0.5 }}
                              disabled={!!option.isDisabled}
                            />
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                              <Typography
                                variant="body2"
                                color={option.isDisabled ? 'text.disabled' : 'text.primary'}
                              >
                                {label}
                              </Typography>
                              {option.isDisabled && (
                                <Typography
                                  variant="caption"
                                  color="error.main"
                                  sx={{ fontSize: '0.725rem', mt: -0.25 }}
                                >
                                  {option.disabledReason ||
                                    'This subject is not finalized from class management.'}
                                </Typography>
                              )}
                            </Box>
                          </li>
                        );
                      }}
                      renderGroup={(params) => (
                        <li key={params.key}>
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              px: 1.5,
                              py: 0.75,
                              fontWeight: 700,
                              color: 'text.secondary',
                            }}
                          >
                            {params.group}
                          </Typography>
                          <ul style={{ padding: 0 }}>{params.children}</ul>
                        </li>
                      )}
                      value={formik.values.subjects}
                      onChange={(_event, value) => {
                        handleSubjectsChange(value as SubjectSelectionOption[]);
                      }}
                      onBlur={() => {
                        formik.setFieldTouched('subjects', true, true);
                      }}
                      slotProps={{
                        chip: {
                          variant: 'soft' as any,
                        },
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Subjects *"
                          size="small"
                          error={
                            formik.touched.subjects && typeof formik.errors.subjects === 'string'
                          }
                          helperText={
                            formik.touched.subjects && typeof formik.errors.subjects === 'string'
                              ? formik.errors.subjects
                              : undefined
                          }
                          FormHelperTextProps={{
                            sx: {
                              position: 'relative',
                              whiteSpace: 'normal',
                              mx: 0,
                              mt: 0.5,
                            },
                          }}
                        />
                      )}
                    />
                  </ShakingTextField>
                </motion.div>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <motion.div variants={formItemVariants} style={{ width: '100%' }}>
                  <ShakingTextField
                    error={Boolean(formik.touched.examName && formik.errors.examName)}
                  >
                    <LanguageInputField
                      fullWidth
                      label="Exam Name *"
                      size="small"
                      name="examName"
                      placeholder="e.g. First Terminal 2024-25"
                      value={formik.values.examName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={Boolean(formik.touched.examName && formik.errors.examName)}
                      helperText={
                        formik.touched.examName && formik.errors.examName
                          ? formik.errors.examName
                          : 'Use a clear name; punctuation such as hyphens is allowed (maximum 100 characters)'
                      }
                      FormHelperTextProps={{
                        sx: {
                          position: 'relative',
                          whiteSpace: 'normal',
                          mx: 0,
                          mt: 0.5,
                        },
                      }}
                    />
                  </ShakingTextField>
                </motion.div>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <motion.div variants={formItemVariants} style={{ width: '100%' }}>
                  <ShakingTextField
                    error={formik.touched.gradingScaleId && Boolean(formik.errors.gradingScaleId)}
                  >
                    <CustomSelect
                      options={gradeScalingOptions}
                      isLoading={isGradeScalingsLoading || isGradeScalingsFetching}
                      value={formik.values.gradingScaleId || ''}
                      onChange={(val) => {
                        formik.setFieldValue('gradingScaleId', val);
                        formik.setFieldTouched('gradingScaleId', false);

                        const selectedGradeScale = gradeScalingOptions.find(
                          (item: any) => String(item.id) === String(val)
                        );
                        const normalizeScheduleFields = (subject: any) => ({
                          ...subject,
                          gradeScalingId: val || null,
                          totalMarks: selectedGradeScale?.totalMarks ?? '',
                          passingMarks: selectedGradeScale?.passMarks ?? '',
                        });

                        formik.setFieldValue(
                          'subjects',
                          formik.values.subjects.map((subject: any) => {
                            const normalized = normalizeScheduleFields(subject);
                            if (subject.electiveGroupId && Array.isArray(subject.subjects)) {
                              return {
                                ...normalized,
                                subjects: subject.subjects.map(normalizeScheduleFields),
                              };
                            }
                            return normalized;
                          })
                        );
                      }}
                      labelKey="name"
                      valueKey="id"
                      label="Grading Scale *"
                      formControlProps={{ fullWidth: true }}
                      error={formik.touched.gradingScaleId && Boolean(formik.errors.gradingScaleId)}
                      helperText={
                        formik.touched.gradingScaleId && formik.errors.gradingScaleId
                          ? formik.errors.gradingScaleId
                          : 'Select overall exam grading scale'
                      }
                      helperTextProps={{
                        sx: {
                          position: 'relative',
                          whiteSpace: 'normal',
                          mx: 0,
                          mt: 0.5,
                        },
                      }}
                    />
                  </ShakingTextField>
                </motion.div>
              </Grid>

              {/* <Grid size={{ xs: 12 }}>
                <motion.div variants={formItemVariants} style={{ width: '100%' }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                    Scheduling Mode
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderRadius: 1,
                          cursor: 'pointer',
                          borderColor: 'primary.main',
                          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 1.5,
                        }}
                      >
                        <Radio checked={true} size="small" sx={{ p: 0 }} color="primary" />
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700}>
                            Manual scheduling
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Define date, time, and marks for each subject manually in the next step.
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Tooltip title="Coming soon!" arrow>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            borderRadius: 1,
                            borderColor: 'divider',
                            opacity: 0.6,
                            bgcolor: 'action.disabledBackground',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 1.5,
                            cursor: 'not-allowed',
                          }}
                        >
                          <Radio checked={false} disabled size="small" sx={{ p: 0 }} />
                          <Box>
                            <Typography variant="subtitle2" fontWeight={700} color="text.disabled">
                              Copy from existing exam
                            </Typography>
                            <Typography variant="caption" color="text.disabled">
                              Import schedule parameters from a previously scheduled exam.
                            </Typography>
                          </Box>
                        </Paper>
                      </Tooltip>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Tooltip title="Coming soon!" arrow>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            borderRadius: 1,
                            borderColor: 'divider',
                            opacity: 0.6,
                            bgcolor: 'action.disabledBackground',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 1.5,
                            cursor: 'not-allowed',
                          }}
                        >
                          <Radio checked={false} disabled size="small" sx={{ p: 0 }} />
                          <Box>
                            <Typography variant="subtitle2" fontWeight={700} color="text.disabled">
                              Auto-generate schedule
                            </Typography>
                            <Typography variant="caption" color="text.disabled">
                              AI-powered automatic scheduling based on school timetable constraints.
                            </Typography>
                          </Box>
                        </Paper>
                      </Tooltip>
                    </Grid>
                  </Grid>
                </motion.div>
              </Grid> */}

              {/* NON-BREAKING: Subject chips preview — shown below the Subjects selector */}
              {formik.values.subjects.length > 0 && (
                <Grid size={{ xs: 12 }}>
                  <motion.div variants={formItemVariants} style={{ width: '100%' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 0.75,
                        pt: 0.5,
                        pb: 0.5,
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={600}
                        sx={{ mr: 0.5, whiteSpace: 'nowrap' }}
                      >
                        {formik.values.subjects.length} subject
                        {formik.values.subjects.length !== 1 ? 's' : ''} selected
                      </Typography>
                      {formik.values.subjects.map((sub: any) => (
                        <Box
                          key={sub.subjectId}
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.75,
                            px: 1.25,
                            height: 26,
                            borderRadius: '13px',
                            border: '1px solid',
                            borderColor: 'divider',
                            bgcolor: 'action.hover',
                          }}
                        >
                          <Box
                            sx={{
                              width: 7,
                              height: 7,
                              borderRadius: '50%',
                              bgcolor: sub.subjectColor || 'grey.500',
                              flexShrink: 0,
                            }}
                          />
                          <Typography
                            variant="caption"
                            fontWeight={600}
                            sx={{ color: 'text.primary', lineHeight: 1 }}
                          >
                            {sub.subjectName}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </motion.div>
                </Grid>
              )}

              {/* NON-BREAKING: Lightweight step preview summary card */}
              {(formik.values.examName || formik.values.className) && (
                <Grid size={{ xs: 12 }}>
                  <motion.div variants={formItemVariants} style={{ width: '100%' }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 1.25,
                        borderRadius: 1.5,
                        border: '1px dashed',
                        borderColor: (theme) => alpha(theme.palette.success.main, 0.4),
                        bgcolor: (theme) => alpha(theme.palette.success.main, 0.06),
                      }}
                    >
                      <Iconify
                        icon="eva:checkmark-circle-2-fill"
                        width={20}
                        sx={{ color: 'success.main', flexShrink: 0 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Setting up:{' '}
                        <strong>
                          {[
                            formik.values.examName,
                            allClass.find((c: Standards) => c.id === formik.values.className)?.name,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </strong>
                        {formik.values.subjects.length > 0 &&
                          ` · ${formik.values.subjects.length} subject${
                            formik.values.subjects.length !== 1 ? 's' : ''
                          }`}
                      </Typography>
                    </Box>
                  </motion.div>
                </Grid>
              )}
            </Grid>
          </motion.div>
        </SectionCard>
      </Grid>
    </Grid>
  );
};

export default SelectExam;
