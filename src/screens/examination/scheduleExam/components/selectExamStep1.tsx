import type { FormikProps } from 'formik';
import type { Variants } from 'framer-motion';
import type { RootState } from 'src/redux/store';
import type { Medium, Standards, Organization } from 'src/types/school';

import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useMemo, useState, useEffect } from 'react';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Grid, Checkbox, TextField, Typography, Autocomplete } from '@mui/material';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import { useGetExaminationTypesQuery } from 'src/redux/academicAPI/ExaminationApi/examSetting/exam-type-api';
import { cardStyle } from 'src/screens/academic/homework-assignment-management/homeworkCreation/component/homeworkForm';
import { SubjectAssignmentStatus } from 'src/screens/academic/curriculum-management/subjectAssignment/enum/subjectType';
import { useGetSubjectAssignmentsQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';

import ExamTypeForm from '../../settings/examAssessmentTypeSetting.tsx/examTypeSetting/examTypeForm';

import type { IExamFormValues, IDivisionRoomDetail } from '../type';

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
    params: { academicMediumId: (medium as Medium)?.id },
    options: {
      skip: !(medium as Medium)?.id,
    },
  });

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
    params: { standardId: formik.values.className, ...query },
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

  return (
    <Grid container>
      <Grid size={{ xs: 12 }}>
        <SectionCard title="Schedule & Deadlines" paperProps={{ sx: cardStyle }}>
          <motion.div
            variants={formContainerVariants}
            initial="hidden"
            animate="show"
            style={{ width: '100%' }}
          >
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <motion.div variants={formItemVariants} style={{ width: '100%' }}>
                  <ShakingTextField
                    error={formik.touched.examType && Boolean(formik.errors.examType)}
                  >
                    <CustomSelect
                      options={examTypeData?.items || []}
                      isLoading={isLoading || isFetching}
                      value={formik.values.examType}
                      onChange={(val) => {
                        formik.setFieldValue('examType', val);
                        // Also store the display name so the Review step shows it correctly
                        const selectedType = examTypeData?.items?.find(
                          (item: any) => item.id === val
                        );
                        formik.setFieldValue('examTypeName', selectedType?.examType ?? '');
                        formik.setFieldTouched(`examType`, false);
                      }}
                      labelKey="examType"
                      valueKey="id"
                      label="Exam Type *"
                      formControlProps={{ fullWidth: true }}
                      error={formik.touched.examType && Boolean(formik.errors.examType)}
                      helperText={formik.touched.examType ? formik.errors.examType : undefined}
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
                    />
                  </ShakingTextField>
                </motion.div>
              </Grid>

              <Grid size={{ xs: 12, md: 8 }}>
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
                      onChange={(event, value) => {
                        const normalizedSubjects = value.map((sub: any, index: number) => {
                          const isElective = !!sub.electiveGroupId;
                          return {
                            ...sub,
                            subjectId:
                              sub.electiveGroupId || sub?.subjects?.[0]?.subjectId || sub.subjectId,
                            subjectName:
                              sub?.electiveGroupName ||
                              sub.subjects?.[0]?.subjectName ||
                              sub.subjectName ||
                              '',
                            examDate: sub?.examDate || null,
                            startTime: sub?.startTime || null,
                            endTime: sub?.endTime || null,
                            totalMarks: sub?.totalMarks ?? '',
                            passingMarks: sub?.passingMarks ?? '',
                            notes: sub?.notes || '',
                            gradeScalingId: sub?.gradeScalingId || null,
                            // Elective groups have no meaningful single subjectCode
                            subjectCode: isElective
                              ? ''
                              : sub?.subjects?.[0]?.subjectCode || sub.subjectCode || '',
                            // API returns `color`, not `subjectColor` — map correctly
                            subjectColor: sub?.color || sub?.subjectColor || '#9E9E9E',
                            // Ensure schedulingMode is always initialized for elective groups
                            schedulingMode:
                              sub.schedulingMode ?? (isElective ? 'separate' : undefined),
                            // Normalize nested subjects array: ensure each subject has subjectColor and default schedule values
                            subjects: isElective
                              ? (sub.subjects ?? []).map((s: any) => ({
                                  ...s,
                                  subjectColor: s.color || s.subjectColor || '#9E9E9E',
                                  examDate: s.examDate || null,
                                  startTime: s.startTime || null,
                                  endTime: s.endTime || null,
                                  totalMarks: s.totalMarks ?? '',
                                  passingMarks: s.passingMarks ?? '',
                                  notes: s.notes || '',
                                  gradeScalingId: s.gradeScalingId || null,
                                }))
                              : sub.subjects,
                          };
                        });

                        formik.setFieldValue('subjects', normalizedSubjects);
                        formik.setFieldTouched('subjects', false);
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
                        />
                      )}
                    />
                  </ShakingTextField>
                </motion.div>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
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
                    />
                  </ShakingTextField>
                </motion.div>
              </Grid>

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
