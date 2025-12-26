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
  useGetSubjectAssignmentByIdQuery,
  useUpdateSubjectAssignmentMutation,
} from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';

import SubjectCard from './subjectCardComponent';
import SettingSubjectForm from '../../../setting/subjectCreation/subjectForm';
import { validationSchema, getSubjectAssignmentInitialValues } from './initialValues';
import SettingElectiveSubjectForm from '../../../setting/electiveSubjectSetting/components/electiveSubjectForm';

import type { ISubjectAssignmentFormProps, ISubjectAssignmentFormValues } from './type';

// Enhanced subject options with Core and Elective groups
const subjectOptions = [
  { label: 'Mathematics', value: 'Mathematics', type: 0, subjectColor: '#DEB887' },
  { label: 'Science', value: 'Science', type: 0, subjectColor: '#00CED1' },
  { label: 'Social Science', value: 'Social Science', type: 0, subjectColor: '#B22222' },
  { label: 'English', value: 'English', type: 0, subjectColor: '#4682B4' },
  { label: 'Gujarati', value: 'Gujarati', type: 0, subjectColor: '#3CB371' },
  {
    label: 'Tech & Fitness Group',
    value: 'Tech & Fitness Group',
    type: 1,
    subjects: [
      { name: 'Computer', code: 'COMP101', subjectColor: '#4169E1' },
      { name: 'Physical Training', code: 'PT101', subjectColor: '#FF69B4' },
    ],
  },
  {
    label: 'Language Enrichment Group',
    value: 'Language Enrichment Group',
    type: 1,
    subjects: [
      { name: 'Sanskrit', code: 'SNSK101', subjectColor: '#DA70D6' },
      { name: 'Hindi', code: 'HIND101', subjectColor: '#FF4500' },
    ],
  },
];

const SubjectAssignmentForm = ({
  onClose,
  data,
  isEdit,
  selectedClass,
  classId,
}: ISubjectAssignmentFormProps) => {
  const {
    data: subjectAssignmentData,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectAssignmentByIdQuery,
    params: { assignmentId: data?.id },
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
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
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

  // Initialize formik form with initial values from data prop or default values
  const formik = useFormik<ISubjectAssignmentFormValues>({
    initialValues: getSubjectAssignmentInitialValues(subjectAssignmentData, selectedClass, classId),
    validationSchema,
    enableReinitialize: true,
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

        const finalPayload = {
          academicMediumId: (currentMedium as Medium).id,
          body: payload,
        };

        if (isEdit && subjectAssignmentData) {
          await updateSubjectAssignment(finalPayload).unwrap();

          shikshaMitraToast.success({
            message: `Subject Assignment updated successfully for class ${values.className}`,
          });
        } else {
          await addSubjectAssignment(finalPayload).unwrap();

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

  // Initialize subject option when editing
  useEffect(() => {
    if (isEdit && data && isInitializing) {
      const preSelectedOptions: any[] = [];
      const subjects = data.subjects || [];

      // Naive matching: match by name or group containment
      subjectOptions.forEach((opt) => {
        if (opt.type === 0) {
          // Core
          if (subjects.some((s: any) => s.subjectName === opt.value)) {
            preSelectedOptions.push(opt);
          }
        } else {
          // Elective Group
          // Check if ANY of the group's subjects are in the data
          // eslint-disable-next-line no-lonely-if
          if (
            opt.subjects &&
            opt.subjects.some((sub: any) => subjects.some((s: any) => s.subjectName === sub.name))
          ) {
            preSelectedOptions.push(opt);
          }
        }
      });

      if (preSelectedOptions.length > 0) {
        setSelectedOption(preSelectedOptions);
      }

      setIsInitializing(false);
    }
  }, [data, isEdit, isInitializing]);

  // Handle subject selection change
  const handleSubjectChange = (newValue: any[]) => {
    if (!newValue || newValue.length === 0) {
      formik.setFieldValue('subjectName', '');
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
        const newSubject = {
          subjectId: null, // New subject
          subjectName: option.value,
          subjectCode: '',
          subjectType: 0,
          primaryTeacher: '',
          secondaryTeacher: [],
          description: '',
          isSubjectOpen: true,
          learningGoal: '',
          prerequisites: '',
          subjectColor: option.subjectColor,
          documents: [],
          subjectNo: Date.now() + Math.random(),
        };
        allSubjects.push(newSubject);
      } else if (option.type === 1) {
        const electives = option.subjects.map((subject: any) => ({
          subjectId: null,
          subjectName: subject.name,
          subjectCode: subject.code,
          subjectType: 1,
          electiveGroupId: option.value,
          primaryTeacher: '',
          secondaryTeacher: [],
          isSubjectOpen: true,
          description: '',
          learningGoal: '',
          prerequisites: '',
          subjectColor: subject.subjectColor,
          documents: [],
          subjectNo: Date.now() + Math.random(),
        }));
        allSubjects.push(...electives);
      }
    });

    // Update formik values
    formik.setFieldValue('subjects', allSubjects);
    formik.setFieldValue('subjectName', newValue.map((v) => v.label).join(', '));
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

  const handleFileUpload = async (files: (File | string)[], index: number) => {
    console.log('files', files);
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
                    options={subjectOptions}
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
