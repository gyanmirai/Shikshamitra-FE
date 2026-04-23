'use client';

import type { RootState } from 'src/redux/store';
import type { Medium, Standards, Organization } from 'src/types/school';

import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { PublishUnpublishStatusType } from 'src/enums/publishUnpublish-status';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Box, Grid, Chip, Button, TextField, Autocomplete, DialogActions } from '@mui/material';
import {
  useAddSubjectAssignmentMutation,
  useUploadCurriculumFileMutation,
  useGetCoreElectiveSubjectsQuery,
  useGetSubjectAssignmentByIdQuery,
  useUpdateSubjectAssignmentMutation,
} from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';

import SubjectCard from './subjectCardComponent';
import SettingSubjectForm from '../../../setting/subjectCreation/subjectForm';
import { validationSchema, getSubjectAssignmentInitialValues } from './initialValues';
import SettingElectiveSubjectForm from '../../../setting/electiveSubjectSetting/components/electiveSubjectForm';

import type { ISubjectAssignmentFormProps, ISubjectAssignmentFormValues } from './type';

const SubjectAssignmentForm = ({
  onClose,
  data,
  isEdit,
  selectedClass,
  classId,
}: ISubjectAssignmentFormProps) => {
  const { data: subjectAssignmentData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectAssignmentByIdQuery,
    params: { assignmentId: data?.id },
    options: {
      skip: !data?.id,
    },
  });

  const { currentMedium } = useSelector((state: RootState) => state.globalState);

  const {
    data: subjectOptionsData,
    isLoading: isSubjectOptionsLoading,
    isFetching: isSubjectOptionsFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetCoreElectiveSubjectsQuery,
    params: { academicMediumId: (currentMedium as Medium).id },
  });

  // Flag to check if the subject is already published
  const isPublished: boolean =
    PublishUnpublishStatusType[data?.status as PublishUnpublishStatusType] === 'Published';
  // State to control visibility of add subject dialog
  const addSubjectDialog = useBoolean();
  // State to control visibility of add Elective subject dialog
  const addElectiveSubjectDialog = useBoolean();
  // State to track selected option for the autocomplete
  const [selectedOption, setSelectedOption] = useState<any[]>([]);
  // Flag to prevent infinite update loops
  const [isInitializing, setIsInitializing] = useState(true);
  const [addSubjectAssignment, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddSubjectAssignmentMutation,
  });
  const [updateSubjectAssignment, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateSubjectAssignmentMutation,
  });

  const [uploadCurriculumFile] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUploadCurriculumFileMutation,
  });

  // Normalize API response: GET-by-ID may return { data: {...} } or a flat object
  const assignmentDetail =
    subjectAssignmentData?.data ?? subjectAssignmentData ?? (isEdit ? data : null);

  // Initialize formik form with initial values from data prop or default values
  const formik = useFormik<ISubjectAssignmentFormValues>({
    initialValues: getSubjectAssignmentInitialValues(assignmentDetail, selectedClass, classId),
    validationSchema,
    enableReinitialize: isInitializing,
    // Handle form submission
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
            academicMediumId: (currentMedium as Medium).id,
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

  // Fetch class data using custom query hook
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
  }, [medium]);

  // Initialize selected option from real API options when editing
  useEffect(() => {
    if (!isEdit || !isInitializing) return;
    const apiOptions = subjectOptionsData?.data;
    if (!apiOptions) return;

    const assignmentSubjects = (assignmentDetail?.subjects as any[]) || [];
    const preSelectedOptions = apiOptions
      .filter((item: any) =>
        assignmentSubjects.some(
          (s: any) => s.subjectId === item.id || s.electiveGroupId === item.id
        )
      )
      .map((item: any) => ({
        label: item.name,
        value: item.id,
        type: item.subjectType,
        color: item.color,
        subjects: item.subjects,
      }));

    setSelectedOption(preSelectedOptions);
    setIsInitializing(false);
  }, [isEdit, isInitializing, assignmentDetail, subjectOptionsData]);

  // Handle subject selection change
  const handleSubjectChange = (newValue: any[]) => {
    if (!newValue || newValue.length === 0) {
      formik.setFieldValue('subjectType', 0);
      formik.setFieldValue('subjects', []);
      setSelectedOption([]);
      return;
    }

    setSelectedOption(newValue);
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

  // Handle changes to individual subject fields
  // eslint-disable-next-line @typescript-eslint/default-param-last
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
                    options={allClass}
                    label="Class *"
                    value={formik.values.classId}
                    labelKey="name"
                    valueKey="id"
                    disabled={isEdit}
                    onChange={(val) => {
                      formik.setFieldValue('classId', val);
                      const standard = allClass.find((c) => c.id === val);
                      formik.setFieldValue('className', standard?.name);
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
                  error={!!(formik.touched.subjectName && formik.errors.subjectName)}
                >
                  <Autocomplete
                    multiple
                    fullWidth
                    size="small"
                    disabled={isPublished}
                    options={
                      subjectOptionsData?.data?.map((item: any) => ({
                        label: item.name,
                        value: item.id,
                        type: item.subjectType,
                        color: item.color,
                        subjects: item.subjects,
                      })) || []
                    }
                    loading={isSubjectOptionsLoading}
                    getOptionLabel={(option) => option.label}
                    value={selectedOption}
                    onChange={(_, newValue) => handleSubjectChange(newValue)}
                    ListboxProps={{
                      style: { maxHeight: 200, overflow: 'auto' },
                    }}
                    renderOption={(props, option) => {
                      const { key, ...restProps } = props;

                      return (
                        <li key={key} {...restProps}>
                          <Box
                            sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}
                          >
                            {option.label}
                            <Chip
                              size="small"
                              label={option.type === 0 ? 'Core' : 'Elective'}
                              color={option.type === 0 ? 'primary' : 'secondary'}
                              sx={{ ml: 1, height: 20 }}
                            />
                          </Box>
                        </li>
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Subjects *"
                        name="subjectName"
                        error={Boolean(formik.touched.subjectName && formik.errors.subjectName)}
                        helperText={formik.touched.subjectName && formik.errors.subjectName}
                        inputProps={{
                          ...params.inputProps,
                          readOnly: true,
                        }}
                      />
                    )}
                  />
                </ShakingTextField>

                <CustomDialog
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
                </CustomDialog>
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
