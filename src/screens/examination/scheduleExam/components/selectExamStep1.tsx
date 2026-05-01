import type { FormikProps } from 'formik';
import type { Variants } from 'framer-motion';
import type { RootState } from 'src/redux/store';
import type { Medium, Standards, Organization } from 'src/types/school';

import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useBoolean } from 'src/hooks/use-boolean';
import { useMemo, useState, useEffect } from 'react';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { Grid, TextField, Autocomplete } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import { useGetExaminationTypesQuery } from 'src/redux/academicAPI/ExaminationApi/examSetting/exam-type-api';
import { cardStyle } from 'src/screens/academic/homework-assignment-management/homeworkCreation/component/homeworkForm';
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
      subjectTableData?.data?.items.map((item: any) => ({
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
                        formik.setFieldTouched(`className`, false);
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
                          : undefined
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
                        formik.values.subjects.forEach((subject) => {
                          const { subjectName } = subject;
                          const divisionsObj = value
                            .filter((code) => code !== 'all')
                            .reduce(
                              (acc, divisionId: string) => {
                                acc[divisionId] = updatedRoomDetails?.[subjectName]?.divisions?.[
                                  divisionId
                                ] ?? {
                                  roomIds: [],
                                  capacity: 0,
                                };
                                return acc;
                              },
                              {} as Record<string, IDivisionRoomDetail>
                            );
                          updatedRoomDetails[subjectName] = {
                            ...updatedRoomDetails[subjectName],
                            divisions: divisionsObj,
                            examDate: subject.examDate || null,
                          };
                        });
                        formik.setFieldValue('roomDetails', updatedRoomDetails);
                      }}
                      formControlProps={{ fullWidth: true }}
                      error={!!(formik.touched.divisions && formik.errors.divisions)}
                      helperText={
                        formik.touched.divisions
                          ? Array.isArray(formik.errors.divisions)
                            ? formik.errors.divisions.join(', ')
                            : formik.errors.divisions
                          : undefined
                      }
                    />
                  </ShakingTextField>
                </motion.div>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <motion.div variants={formItemVariants} style={{ width: '100%' }}>
                  <ShakingTextField
                    error={!!(formik.touched.selectedSubjects && formik.errors.selectedSubjects)}
                  >
                    <Autocomplete
                      multiple
                      options={subjectOptions}
                      getOptionLabel={(option: any) =>
                        option?.electiveGroupName || option?.subjects?.[0]?.subjectName || ''
                      }
                      size="small"
                      value={formik.values.selectedSubjects}
                      onChange={(event, value) => {
                        formik.setFieldValue('selectedSubjects', value);
                        formik.setFieldTouched(`selectedSubjects`, false);
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
                            formik.touched.selectedSubjects &&
                            Boolean(formik.errors.selectedSubjects)
                          }
                          helperText={
                            formik.touched.selectedSubjects && formik.errors.selectedSubjects
                              ? formik.errors.selectedSubjects instanceof Array
                                ? formik.errors.selectedSubjects.join(', ')
                                : formik.errors.selectedSubjects
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
                      helperText={formik.touched.examName && formik.errors.examName}
                    />
                  </ShakingTextField>
                </motion.div>
              </Grid>
            </Grid>
          </motion.div>
        </SectionCard>
      </Grid>
    </Grid>
  );
};

export default SelectExam;
