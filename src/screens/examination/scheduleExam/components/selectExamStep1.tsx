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
import ShakingTextField from 'src/components/shaking-text-field';
import { useMemo, useState, useEffect, useCallback } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import { useGetExaminationTypesQuery } from 'src/redux/academicAPI/ExaminationApi/examSetting/exam-type-api';
import { useGetGradeScalingsQuery } from 'src/redux/academicAPI/ExaminationApi/examSetting/grade-scalling-api';
import { cardStyle } from 'src/screens/academic/homework-assignment-management/homeworkCreation/component/homeworkForm';
import { SubjectAssignmentStatus } from 'src/screens/academic/curriculum-management/subjectAssignment/enum/subjectType';
import {
  Box,
  Grid,
  Paper,
  Switch,
  Checkbox,
  TextField,
  Typography,
  Autocomplete,
} from '@mui/material';
import { useLazyGetStudentElectiveAssignmentsQuery } from 'src/redux/classManagementApi/studentElectiveAssignment/studentElectiveAssignment';
import { useGetSubjectAssignmentsQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';

import ExamTypeForm from '../../settings/examAssessmentTypeSetting.tsx/examTypeSetting/examTypeForm';

import type { IExamFormValues, IDivisionRoomDetail } from '../type';

type ElectiveReadiness = {
  isReady: boolean;
  message?: string;
  assignedCounts: Record<string, number>;
};

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

  const {
    data: subjectTableData = [],
    isLoading: isTableLoading,
    refetch,
    isFetching: isFetchingSubjects,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectAssignmentsQuery,
    params: {
      standardId: formik.values.className,
      ...query,
      status: SubjectAssignmentStatus.Published,
    },
    options: { skip: !formik.values.className },
  });

  const subjectOptions: any = useMemo(
    () =>
      subjectTableData?.data?.items
        .filter((item: any) => item.status !== SubjectAssignmentStatus.Draft)
        .map((item: any) => ({
          ...item,
        })) || [],
    [subjectTableData]
  );

  const selectedDivisionIds = useMemo(
    () => formik.values.divisions.filter((divisionId: string) => divisionId !== 'all'),
    [formik.values.divisions]
  );

  useEffect(() => {
    setElectiveReadiness({});
  }, [formik.values.className, formik.values.divisions]);

  const getElectiveReadiness = useCallback(
    async (electiveGroupId: string): Promise<ElectiveReadiness> => {
      if (!medium?.id || !formik.values.className || selectedDivisionIds.length === 0) {
        return {
          isReady: false,
          message: 'Select class and division before selecting an elective group.',
          assignedCounts: {},
        };
      }

      const divisionResults = await Promise.all(
        selectedDivisionIds.map((divisionId) =>
          checkElectiveAssignments({
            academicMediumId: medium.id,
            classId: formik.values.className,
            divisionId,
            electiveGroupId,
          }).unwrap()
        )
      );
      const firstPendingResult = divisionResults.find((result) => {
        const records = result?.records ?? [];
        return !(
          records.length > 0 &&
          result?.isLocked === true &&
          records.every((record: any) => !!record.selectedSubjectId)
        );
      });

      if (firstPendingResult) {
        return {
          isReady: false,
          message:
            'This class and division elective subject assignment is pending. Please assign every student and lock elective subject selection first.',
          assignedCounts: {},
        };
      }

      const assignedCounts = divisionResults
        .flatMap((result) => result?.records ?? [])
        .reduce((acc: Record<string, number>, record: any) => {
          if (!record.selectedSubjectId) return acc;
          acc[record.selectedSubjectId] = (acc[record.selectedSubjectId] ?? 0) + 1;
          return acc;
        }, {});

      return { isReady: true, assignedCounts };
    },
    [checkElectiveAssignments, formik.values.className, medium?.id, selectedDivisionIds]
  );

  const handleSubjectsChange = useCallback(
    async (value: any[]) => {
      const selectedType = examTypeOptions.find((item: any) => item.id === formik.values.examType);
      const defaultTotalMarks = selectedType?.defaultTotalMarks ?? '';
      const defaultGradeScaleId = selectedType?.defaultGradeScaleId ?? null;
      const nextReadiness = { ...electiveReadiness };
      const normalizedResults = await Promise.all(
        value.map(async (sub) => {
          const isElective = !!sub.electiveGroupId;
          let readiness = sub.electiveGroupId ? nextReadiness[sub.electiveGroupId] : undefined;

          if (isElective && sub.electiveGroupId) {
            readiness = await getElectiveReadiness(sub.electiveGroupId);
            nextReadiness[sub.electiveGroupId] = readiness;
            if (!readiness.isReady) {
              shikshaMitraToast.error({
                message: readiness.message ?? 'Elective assignment is pending.',
              });
              formik.setFieldError('subjects', readiness.message);
              return null;
            }
          }

          const assignedElectiveSubjects = isElective
            ? (sub.subjects ?? [])
                .map((subjectItem: any) => {
                  const assignedStudentCount =
                    readiness?.assignedCounts?.[subjectItem.subjectId] ??
                    readiness?.assignedCounts?.[subjectItem.id] ??
                    0;
                  return {
                    ...subjectItem,
                    assignedStudentCount,
                    isExamSelectionDisabled: assignedStudentCount === 0,
                    subjectColor: subjectItem.color || subjectItem.subjectColor || '#9E9E9E',
                    examDate: subjectItem.examDate || null,
                    startTime: subjectItem.startTime || null,
                    endTime: subjectItem.endTime || null,
                    totalMarks: subjectItem.totalMarks || defaultTotalMarks,
                    passingMarks: subjectItem.passingMarks ?? '',
                    notes: subjectItem.notes || '',
                    gradeScalingId: subjectItem.gradeScalingId || defaultGradeScaleId,
                  };
                })
                .filter((subjectItem: any) => subjectItem.assignedStudentCount > 0)
            : sub.subjects;

          return {
            ...sub,
            subjectId: sub.electiveGroupId || sub?.subjects?.[0]?.subjectId || sub.subjectId,
            subjectName:
              sub?.electiveGroupName || sub.subjects?.[0]?.subjectName || sub.subjectName || '',
            examDate: sub?.examDate || null,
            startTime: sub?.startTime || null,
            endTime: sub?.endTime || null,
            totalMarks: sub?.totalMarks || defaultTotalMarks,
            passingMarks: sub?.passingMarks ?? '',
            notes: sub?.notes || '',
            gradeScalingId: sub?.gradeScalingId || defaultGradeScaleId,
            subjectCode: isElective ? '' : sub?.subjects?.[0]?.subjectCode || sub.subjectCode || '',
            subjectColor: sub?.color || sub?.subjectColor || '#9E9E9E',
            schedulingMode: sub.schedulingMode ?? (isElective ? 'separate' : undefined),
            subjects: assignedElectiveSubjects,
          };
        })
      );

      setElectiveReadiness(nextReadiness);
      formik.setFieldValue('subjects', normalizedResults.filter(Boolean));
      formik.setFieldTouched('subjects', false);
    },
    [electiveReadiness, examTypeOptions, formik, getElectiveReadiness]
  );

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
                      value={formik.values.divisions}
                      onChange={(val) => {
                        const value = val as string[];
                        const divisionOptions =
                          allClass?.find((i: Standards) => i.id === formik.values.className)
                            ?.divisions || [];
                        const allDivisionIds = divisionOptions.map((d) => d.id);
                        const isAllClicked = value.includes('all');
                        const wasAllPreviouslySelected = formik.values.divisions.includes('all');

                        if (isAllClicked && !wasAllPreviouslySelected) {
                          formik.setFieldValue('divisions', ['all', ...allDivisionIds]);
                        } else if (!isAllClicked && wasAllPreviouslySelected) {
                          formik.setFieldValue('divisions', []);
                        } else if (isAllClicked && wasAllPreviouslySelected) {
                          const selectedWithoutAll = value.filter((id) => id !== 'all');
                          formik.setFieldValue(
                            'divisions',
                            selectedWithoutAll.length === allDivisionIds.length
                              ? ['all', ...allDivisionIds]
                              : selectedWithoutAll
                          );
                        } else {
                          const selectedWithoutAll = value.filter((id) => id !== 'all');
                          formik.setFieldValue(
                            'divisions',
                            selectedWithoutAll.length === allDivisionIds.length
                              ? ['all', ...allDivisionIds]
                              : selectedWithoutAll
                          );
                        }

                        formik.setFieldTouched(`divisions`, false);

                        // Update room details
                        const updatedRoomDetails = { ...(formik.values.roomDetails || {}) };
                        formik.values.subjects.forEach((subject: any) => {
                          const key =
                            subject.subjectId ||
                            subject.electiveGroupId ||
                            subject?.subjects?.[0]?.subjectId;
                          if (!key) return;
                          const existing = updatedRoomDetails?.[key] ?? {};
                          const divisionIds = value.filter((code: string) => code !== 'all');
                          const divisionsObj = divisionIds.reduce(
                            (acc: Record<string, IDivisionRoomDetail>, divisionId: string) => {
                              acc[divisionId] = existing[divisionId] ?? {
                                roomIds: [],
                                capacity: 0,
                              };
                              return acc;
                            },
                            {} as Record<string, IDivisionRoomDetail>
                          );
                          updatedRoomDetails[key] = divisionsObj;
                        });
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
                      loading={isTableLoading || isFetchingSubjects}
                      getOptionLabel={(option: any) =>
                        option?.electiveGroupName ||
                        option?.subjectName ||
                        option?.subjects?.[0]?.subjectName ||
                        option?.name ||
                        ''
                      }
                      isOptionEqualToValue={(option: any, val: any) => {
                        const optId =
                          option?.electiveGroupId || option?.subjects?.[0]?.subjectId || option?.id;
                        const valId =
                          val?.subjectId ||
                          val?.electiveGroupId ||
                          val?.subjects?.[0]?.subjectId ||
                          val?.id;
                        return !!optId && optId === valId;
                      }}
                      size="small"
                      disableCloseOnSelect
                      renderOption={(optionProps, option, { selected }) => {
                        const { key, ...restOptionProps } = optionProps as any;
                        const label =
                          option?.electiveGroupName ||
                          option?.subjectName ||
                          option?.subjects?.[0]?.subjectName ||
                          option?.name ||
                          '';
                        const optionKey =
                          option?.electiveGroupId || option?.subjects?.[0]?.subjectId || option?.id;
                        return (
                          <li key={key ?? optionKey} {...restOptionProps}>
                            <Checkbox checked={selected} size="small" sx={{ mr: 0.5, p: 0.5 }} />
                            {label}
                          </li>
                        );
                      }}
                      value={formik.values.subjects}
                      onChange={(_event, value) => {
                        handleSubjectsChange(value);
                      }}
                      slotProps={{
                        chip: {
                          variant: 'soft',
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
                  <ShakingTextField error={!!(formik.touched.examName && formik.errors.examName)}>
                    <TextField
                      fullWidth
                      label="Exam Name *"
                      size="small"
                      name="examName"
                      placeholder="e.g. First Terminal 2024"
                      value={formik.values.examName}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
                        formik.setFieldValue('examName', value);
                        formik.setFieldTouched(`examName`, false);
                      }}
                      error={formik.touched.examName && Boolean(formik.errors.examName)}
                      helperText={
                        formik.touched.examName && formik.errors.examName
                          ? formik.errors.examName
                          : 'A short, descriptive name for this exam'
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
              <Grid size={{ xs: 12, md: 6 }}>
                <motion.div variants={formItemVariants} style={{ width: '100%' }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      minHeight: 40,
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1,
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2">Enable Room Assignment</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Turn on room planning in Step 3.
                      </Typography>
                    </Box>
                    <Switch
                      checked={formik.values.isRoomAssign}
                      onChange={(event) => {
                        formik.setFieldValue('isRoomAssign', event.target.checked);
                      }}
                      inputProps={{ 'aria-label': 'Enable room assignment' }}
                    />
                  </Paper>
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
                        sx={{ width: '100%', mb: 0.5 }}
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
                            borderColor: sub.subjectColor
                              ? alpha(sub.subjectColor, 0.3)
                              : 'divider',
                            bgcolor: sub.subjectColor ? alpha(sub.subjectColor, 0.1) : 'grey.100',
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
                            sx={{ color: sub.subjectColor || 'text.primary', lineHeight: 1 }}
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
