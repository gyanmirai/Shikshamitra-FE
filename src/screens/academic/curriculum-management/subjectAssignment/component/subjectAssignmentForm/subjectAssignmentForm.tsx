'use client';

import type { RootState } from 'src/redux/store';
import type { Medium, Organization } from 'src/types/school';

import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { useMemo, useCallback } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { PublishUnpublishStatusType } from 'src/enums/publishUnpublish-status';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  Box,
  Grid,
  Chip,
  Button,
  Skeleton,
  ListItem,
  TextField,
  Autocomplete,
  DialogActions,
  ListItemButton,
} from '@mui/material';
import {
  useAddSubjectAssignmentMutation,
  useUploadCurriculumFileMutation,
  useGetCoreElectiveSubjectsQuery,
  useGetSubjectAssignmentByIdQuery,
  useUpdateSubjectAssignmentMutation,
} from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';

import SubjectCard from './subjectCardComponent';
import { SubjectType, SubjectAssignmentStatus } from '../../enum/subjectType';
import { validationSchema, getSubjectAssignmentInitialValues1 } from './initialValues';

import type { ISubjectAssignmentFormProps, ISubjectAssignmentFormValues } from './type';

const SubjectAssignmentForm = ({
  onClose,
  data,
  isEdit,
  selectedClass,
  classId,
  subjectTableData,
}: ISubjectAssignmentFormProps) => {
  // Flag to check if the subject is already published
  const isPublished: boolean =
    SubjectAssignmentStatus[data?.status as SubjectAssignmentStatus] === 'Published';
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);
  const { data: subjectAssignmentData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectAssignmentByIdQuery,
    params: { assignmentId: data?.id },
    options: {
      skip: !data?.id,
    },
  });
  const [uploadCurriculumFile] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUploadCurriculumFileMutation,
  });
  const {
    data: subjectOptionsData,
    isLoading: isSubjectOptionsLoading,
    isFetching: isSubjectOptionsFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetCoreElectiveSubjectsQuery,
    params: { academicMediumId: (medium as Medium).id },
  });

  const [addSubjectAssignment, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddSubjectAssignmentMutation,
  });
  const [updateSubjectAssignment, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateSubjectAssignmentMutation,
  });

  const checkIfSubjectIsExists = useCallback(
    (currentId: string) => {
      const isExists = subjectTableData?.some((subject: any) => {
        if (subject.subjectType === SubjectType.Core) {
          return subject.subjects?.[0]?.subjectId === currentId;
        }
        return subject.electiveGroupId === currentId;
      });
      return isExists;
    },
    [subjectTableData]
  );

  const subjectsOptions = useMemo(
    () =>
      (!isEdit
        ? subjectOptionsData?.data?.filter((item: any) => checkIfSubjectIsExists(item.id))
        : subjectOptionsData?.data
      )?.map((item: any) => ({
        ...item,
        label: item.name,
        value: item.id,
        type: item.subjectType,
        color: item.color,
        subjects: item.subjects,
      })) || [],
    [isEdit, subjectOptionsData?.data, checkIfSubjectIsExists]
  );

  const classOPtions = useMemo(() => {
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];
    return allClasses.map((cls: any) => ({ label: cls.name, value: cls.id }));
  }, [medium]);
  const formik = useFormik<ISubjectAssignmentFormValues>({
    enableReinitialize: true,
    initialValues: getSubjectAssignmentInitialValues1(
      subjectAssignmentData?.data || {},
      selectedClass,
      classId
    ),
    validationSchema,
    onSubmit: async (values, formikHelpers) => {
      try {
        const subjectsPayload = values.subjects.map((subj) => ({
          subjectId: subj.subjectId, // ✅ required
          electiveGroupId: subj.electiveGroupId || null, // ✅ UUID or null
          subjectCode: subj.subjectCode,
          documents: subj.documents || [],
          learningGoal: subj.learningGoal,
          prerequisites: subj.prerequisites,
          description: subj.description,
          primaryTeacherId: subj.primaryTeacher || null,
          secondaryTeacherId: subj.secondaryTeacher || [],
        }));

        const payload = {
          classId: values.classId,
          status: values.status,
          subjects: subjectsPayload,
        };

        if (isEdit && data?.id) {
          await updateSubjectAssignment({ assignmentId: data.id, body: payload }).unwrap();

          shikshaMitraToast.success({
            message: `Subject Assignment updated successfully for class ${values.className}`,
          });
        } else {
          await addSubjectAssignment({
            academicMediumId: (medium as Medium).id,
            body: payload,
          }).unwrap();

          shikshaMitraToast.success({
            message:
              values.status === 0
                ? `Subject Assignment saved as draft for class ${values.className}`
                : `Subject Assignment published successfully for class ${values.className}`,
          });
        }

        onClose(null, true);
      } catch (error) {
        console.error('Failed to save subject assignment', error);
        shikshaMitraToast.error({ message: 'Failed to save subject assignment' });
      }
    },
  });
  if (isLoading) {
    return (
      <Box sx={{ p: 2 }}>
        <Grid container spacing={3}>
          {/* Class dropdown skeleton */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="rounded" height={40} width="100%" />
          </Grid>
          {/* Subjects dropdown skeleton */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="rounded" height={40} width="100%" />
          </Grid>
          {/* Subject card skeleton */}
          <Grid size={{ xs: 12 }}>
            <Skeleton variant="rounded" height={56} width="100%" />
          </Grid>
        </Grid>
      </Box>
    );
  }

  const handleSubjectChange = (newValue: any[]) => {
    if (!newValue || newValue.length === 0) {
      formik.setFieldValue('subjectType', 0);
      formik.setFieldValue('subjects', []);

      formik.setFieldValue('selectedSubjects', []);
      return;
    }

    formik.setFieldValue('selectedSubjects', newValue);
    formik.setFieldTouched('subjectName', false);

    // Combine all subjects from selected options
    const allSubjects: any[] = [];

    newValue.forEach((option) => {
      if (option.type === 0) {
        // Core Subject
        const newSubject = {
          subjectId: option.value, // New assignment, so no assignment ID yet
          subjectName: option.label, // Use label (Name)
          subjectCode: '', // User to enter code
          subjectType: 0,
          primaryTeacher: '',
          secondaryTeacher: [],
          description: '',
          isSubjectOpen: true,
          learningGoal: '',
          prerequisites: '',
          subjectColor: option.color || '#4169E1',
          documents: [],
          subjectNo: option.value,
        };
        allSubjects.push(newSubject);
      } else if (option.type === 1) {
        // Elective Group
        const electives = (option.subjects || []).map((subject: any) => ({
          subjectId: subject.id,
          subjectName: subject.name,
          subjectCode: '', // User to enter code
          subjectType: 1,
          electiveGroupId: option.value, // Group ID
          primaryTeacher: '',
          secondaryTeacher: [],
          isSubjectOpen: true,
          description: '',
          learningGoal: '',
          prerequisites: '',
          subjectColor: subject.color || '#FFA726',
          documents: [],
          subjectNo: subject.id,
        }));
        allSubjects.push(...electives);
      }
    });

    // Update formik values
    formik.setFieldValue('subjects', allSubjects);
    const hasCore = newValue.some((v) => v.type === 0);
    formik.setFieldValue('subjectType', hasCore ? 0 : 1);
  };

  const handleSubjectFieldChange = (subjectId: string, field: string, value: any) => {
    if (!subjectId) return;
    // Update the subjects array in Formik
    const updatedSubjects = formik.values.subjects?.map((subject) =>
      subject.subjectNo === subjectId ? { ...subject, [field]: value } : subject
    );
    formik.setFieldValue('subjects', updatedSubjects);
  };

  const handleFileUpload = async (files: (File | string)[], index: number | null) => {
    const uploadedFiles: (string | File)[] = [];
    const formData = new FormData();
    formData.append('FileName', (files[0] as File)?.name);
    formData.append('File', files[0] as File);
    const response = await uploadCurriculumFile(formData).unwrap();
    uploadedFiles.push(response.data);

    formik.setFieldValue(`subjects.${index}.documents`, uploadedFiles);
  };

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" sx={{ height: '100%' }}>
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid container spacing={3}>
              {/* Class selection */}
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={!!(formik.touched.className && formik.errors.className)}>
                  <CustomSelect
                    options={classOPtions}
                    label="Class *"
                    value={formik.values.classId}
                    labelKey="label"
                    valueKey="value"
                    disabled={isEdit}
                    onChange={(val) => {
                      formik.setFieldValue('classId', val);
                      const standard = classOPtions.find((c: any) => c.value === val);
                      formik.setFieldValue('className', standard?.label);
                    }}
                    formControlProps={{ sx: { minWidth: 180, width: '100%' } }}
                    error={Boolean(formik.touched.className && formik.errors.className)}
                    helperText={(formik.touched.className && formik.errors.className) || ''}
                  />
                </ShakingTextField>
              </Grid>

              {/* Subject/Group selection */}
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={!!(formik.touched.selectedSubjects && formik.errors.selectedSubjects)}
                >
                  <Autocomplete
                    multiple
                    fullWidth
                    size="small"
                    disabled={isPublished}
                    options={subjectsOptions}
                    loading={isSubjectOptionsLoading}
                    getOptionLabel={(option: any) => option?.label}
                    value={formik?.values?.selectedSubjects || []}
                    onChange={(_, newValue) => handleSubjectChange(newValue)}
                    ListboxProps={{
                      style: { maxHeight: 200, overflow: 'auto' },
                    }}
                    renderOption={(props, option) => {
                      const { key, ...restProps } = props;
                      return (
                        <ListItem disablePadding key={key} {...restProps}>
                          <ListItemButton
                            disableTouchRipple
                            disableRipple
                            sx={{
                              py: 0.5,
                              px: 1,
                              minHeight: 'auto',
                              '&:hover': { backgroundColor: 'transparent' },
                            }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                width: '100%',
                                alignItems: 'center',
                              }}
                            >
                              {option.label}

                              <Chip
                                size="small"
                                label={option.type === 0 ? 'Core' : 'Elective'}
                                color={option.type === 0 ? 'primary' : 'secondary'}
                                sx={{ ml: 1, height: 20 }}
                              />
                            </Box>
                          </ListItemButton>
                        </ListItem>
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Subjects *"
                        name="selectedSubjects"
                        error={Boolean(
                          formik.touched.selectedSubjects && formik.errors.selectedSubjects
                        )}
                        helperText={
                          formik.touched.selectedSubjects && formik.errors.selectedSubjects
                        }
                        inputProps={{
                          ...params.inputProps,
                          readOnly: true,
                        }}
                      />
                    )}
                  />
                </ShakingTextField>

                {/* <CustomDialog
                  open={addSubjectDialog.value}
                  handleClose={addSubjectDialog.onFalse}
                  title="Add Subject"
                >
                  <SettingSubjectForm
                    open={addSubjectDialog}
                    onClose={() => addSubjectDialog.onFalse()}
                    editData={null}
                  />
                </CustomDialog>

                <CustomDialog
                  open={addElectiveSubjectDialog.value}
                  handleClose={addElectiveSubjectDialog.onFalse}
                  title="Add Elective Group"
                >
                  <SettingElectiveSubjectForm
                    open={addElectiveSubjectDialog}
                    onClose={() => addElectiveSubjectDialog.onFalse()}
                    editData={null}
                  />
                </CustomDialog> */}
              </Grid>

              {/* Subject Cards Section */}
              {formik.values.subjects && formik.values.subjects.length > 0 && (
                <Grid size={{ xs: 12 }}>
                  {formik?.values?.subjects?.map((subject, index) => (
                    <SubjectCard
                      key={subject.subjectNo}
                      index={index}
                      formik={formik}
                      subject={subject}
                      isCore={formik.values.subjectType === 0}
                      isPublished={isPublished}
                      // teacherOptions={teacherProfiles}
                      onSubjectChange={handleSubjectFieldChange}
                      onFileUpload={handleFileUpload}
                    />
                  ))}
                </Grid>
              )}
            </Grid>
          </Scrollbar>

          {/* Action Buttons */}
          <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
            {isEdit ? (
              <>
                <Button
                  variant="outlined"
                  startIcon={<Iconify icon={GlobalIcons.cancel} />}
                  onClick={() => {
                    onClose(null, false);
                  }}
                  size="small"
                >
                  Cancel
                </Button>
                <LoadingButton
                  size="small"
                  variant="contained"
                  onClick={() => {
                    formik.handleSubmit();
                  }}
                  loading={isUpdateLoading}
                  startIcon={<Iconify icon={GlobalIcons.edit} width={16} height={16} />}
                >
                  Update
                </LoadingButton>
              </>
            ) : (
              <>
                <LoadingButton
                  size="small"
                  type="submit"
                  variant="outlined"
                  onClick={() => {
                    formik.setFieldValue('status', PublishUnpublishStatusType.Draft); // Draft
                    formik.handleSubmit();
                  }}
                  loading={
                    isAddLoading && formik.values.status === PublishUnpublishStatusType.Draft
                  }
                  startIcon={<Iconify icon={GlobalIcons.draftIcon} />}
                >
                  Save Draft
                </LoadingButton>
                <LoadingButton
                  size="small"
                  type="submit"
                  variant="contained"
                  onClick={() => {
                    formik.setFieldValue('status', PublishUnpublishStatusType.Published); // Publish
                    formik.handleSubmit();
                  }}
                  loading={
                    isAddLoading && formik.values.status === PublishUnpublishStatusType.Published
                  }
                  startIcon={<Iconify icon={GlobalIcons.publish} />}
                >
                  Publish
                </LoadingButton>
              </>
            )}
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};
export default SubjectAssignmentForm;
