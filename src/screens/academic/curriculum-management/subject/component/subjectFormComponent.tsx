'use client';

import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';

import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';

import {
  Box,
  Grid,
  Chip,
  Button,
  TextField,
  Typography,
  Autocomplete,
  DialogActions,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import SubjectCard from './subjectCardComponent';
import { validationSchema } from './validationSchema';
import { getSubjectInitialValues } from './initialValues';
import SettingSubjectForm from '../../setting/subjectCreation/subjectForm';
import SettingElectiveSubjectForm from '../../setting/electiveSubjectSetting/components/electiveSubjectForm';

import type { ISubjectFormProps, ISubjectFormValues } from './type';

// Enhanced subject options with core and elective groups
const subjectOptions = [
  // Core subjects
  { label: 'Mathematics', value: 'Mathematics', type: 'core' },
  { label: 'Physics', value: 'Physics', type: 'core' },
  { label: 'Biology', value: 'Biology', type: 'core' },
  // Elective subject groups
  {
    label: 'Science Electives',
    value: 'Science Electives',
    type: 'elective',
    subjects: [
      { name: 'Chemistry', code: 'CHEM101' },
      { name: 'Earth Science', code: 'ESCI101' },
      { name: 'Astronomy', code: 'ASTR101' },
    ],
  },
  {
    label: 'Language Electives',
    value: 'Language Electives',
    type: 'elective',
    subjects: [
      { name: 'French', code: 'FREN101' },
      { name: 'Spanish', code: 'SPAN101' },
      { name: 'German', code: 'GERM101' },
    ],
  },
  {
    label: 'Arts Electives',
    value: 'Arts Electives',
    type: 'elective',
    subjects: [
      { name: 'Music', code: 'MUS101' },
      { name: 'Visual Arts', code: 'ARTS101' },
      { name: 'Drama', code: 'DRAM101' },
    ],
  },
];

// Available teachers for selection
const teacherOptions = [
  { value: 'Jiya', label: 'Jiya' },
  { value: 'Riya', label: 'Riya' },
  { value: 'Priya', label: 'Priya' },
];

const SubjectForm = ({ onClose, data, isEdit, selectedClass }: ISubjectFormProps) => {
  // State to track if the form is in draft mode - determined by edit status or existing data status
  const [isDraft, setIsDraft] = useState(!isEdit || (data && data.status === 'Unpublish'));
  // Flag to check if the subject is already published
  const isPublished = data?.status === 'Publish';
  // State to control visibility of add subject dialog
  const addSubjectDialog = useBoolean();
  // State to control visibility of add elective subject dialog
  const addElectiveSubjectDialog = useBoolean();
  // State to track selected option for the autocomplete
  const [selectedOption, setSelectedOption] = useState<any>(null);
  // Flag to prevent infinite update loops
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize formik form with initial values from data prop or default values
  const formik = useFormik<ISubjectFormValues>({
    initialValues: getSubjectInitialValues(data),
    validationSchema,
    // Handle form submission
    onSubmit: (values) => {
      // Prepare the complete submission data
      const submitData = {
        ...values,
        id: data?.id || Date.now(),
        status: isDraft ? 'Unpublish' : 'Publish',
      };

      // Pass the data to the parent component's handler
      // onSubmit(submitData);
      onClose(null, true);
    },
  });

  // Fetch class data using custom query hook
  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);

  // Get current board, medium and medium setter from global state
  const {
    currentBoard,
    currentMedium: medium,
    setCurrentMedium: setMedium,
  } = useSelector((state: RootState) => state.globalState);

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
      // Find the corresponding subject option
      const option = subjectOptions.find(
        (opt) =>
          opt.value === data.subjectName ||
          (opt.type === 'elective' &&
            opt.subjects?.some((s) => data.subjects?.some((ds) => ds.subjectName === s.name)))
      );

      if (option) {
        setSelectedOption(option);

        // If we're editing, make sure the subjects array is initialized in formik values
        if (data.subjects && data.subjects.length > 0) {
          formik.setFieldValue('subjects', data.subjects);
        }
      }

      setIsInitializing(false);
    }
  }, [data, isEdit, isInitializing, formik]);

  // Handle subject selection change
  const handleSubjectChange = (newValue: any) => {
    if (!newValue) {
      formik.setFieldValue('subjectName', '');
      formik.setFieldValue('subjectType', 'core');
      formik.setFieldValue('subjects', []);
      setSelectedOption(null);
      return;
    }

    // Update Formik values for subject name and type
    formik.setFieldValue('subjectName', newValue.value);
    formik.setFieldValue('subjectType', newValue.type);
    setSelectedOption(newValue);

    // Determine if this is a core subject or an elective group
    if (newValue.type === 'core') {
      // For core subject, create a single subject entry
      const newSubject = {
        id: Date.now() + Math.random(),
        name: newValue.name,
        subjectName: newValue.value,
        className: formik.values.className || '',
        subjectCode: '',
        primaryTeacher: '',
        secondaryTeacher: [],
        description: '',
        learningGoal: '',
        prerequisites: '',
        subjectColor: '#1976d2',
        scheduleDate: null,
        status: 'Unpublish',
      };
      // Update subjects array in formik state
      formik.setFieldValue('subjects', [newSubject]);
    } else if (newValue.type === 'elective') {
      // For elective group, create multiple subject entries
      const initialElectives = newValue.subjects.map((subject: any) => ({
        id: Date.now() + Math.random(),
        name: subject.name,
        subjectName: subject.name,
        className: formik.values.className || '',
        subjectCode: '',
        primaryTeacher: '',
        secondaryTeacher: [],
        description: '',
        learningGoal: '',
        prerequisites: '',
        subjectColor: '#1976d2',
        scheduleDate: null,
        status: 'Unpublish',
      }));

      // Update subjects array in formik state
      formik.setFieldValue('subjects', initialElectives);
    }
  };

  // Handle changes to individual subject fields
  const handleSubjectFieldChange = (subjectId: string | number, field: string, value: any) => {
    // Update the subjects array in Formik
    const updatedSubjects = formik.values.subjects?.map((subject) =>
      subject.id === subjectId ? { ...subject, [field]: value } : subject
    );
    formik.setFieldValue('subjects', updatedSubjects);
  };

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" sx={{ height: '100%' }}>
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid container spacing={3}>
              {/* Class selection */}
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.className && formik.errors.className) || false}
                >
                  <CustomSelect
                    options={allClass}
                    label="Class"
                    value={formik.values.className || selectedClass}
                    labelKey="name"
                    valueKey="id"
                    placeholder="Search Class"
                    onChange={(val) => {
                      formik.setFieldValue('className', val);

                      // Also update className for all subjects in the array
                      if ((formik?.values?.subjects ?? []).length > 0) {
                        const updatedSubjects = (formik?.values?.subjects ?? []).map((subject) => ({
                          ...subject,
                          className: val,
                        }));
                        formik.setFieldValue('subjects', updatedSubjects);
                      }
                    }}
                    formControlProps={{ sx: { minWidth: 180, width: '100%' } }}
                    error={formik.touched.className && Boolean(formik.errors.className)}
                    helperText={(formik.touched.className && formik.errors.className) || ''}
                  />
                </ShakingTextField>
              </Grid>

              {/* Subject/Group selection */}
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.subjectName && formik.errors.subjectName) || false}
                >
                  <Autocomplete
                    fullWidth
                    size="small"
                    disabled={isPublished}
                    options={subjectOptions}
                    getOptionLabel={(option) => option.label}
                    value={selectedOption}
                    onChange={(_, newValue) => {
                      handleSubjectChange(newValue);
                    }}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <Box
                          sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}
                        >
                          {option.label}
                          <Chip
                            size="small"
                            label={option.type === 'core' ? 'Core' : 'Elective'}
                            color={option.type === 'core' ? 'primary' : 'secondary'}
                            sx={{ ml: 1, height: 20 }}
                          />
                        </Box>
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Subject Name"
                        name="subjectName"
                        error={formik.touched.subjectName && Boolean(formik.errors.subjectName)}
                        helperText={formik.touched.subjectName && formik.errors.subjectName}
                      />
                    )}
                  />
                </ShakingTextField>
                <Box display="flex" justifyContent="space-between">
                  <Box sx={{ display: 'inline-block' }}>
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      color="primary.main"
                      fontSize={12}
                      sx={{ cursor: 'pointer' }}
                      onClick={addSubjectDialog.onTrue}
                    >
                      Add Subject ?
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'inline-block' }}>
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      color="primary.main"
                      fontSize={12}
                      sx={{ cursor: 'pointer' }}
                      onClick={addElectiveSubjectDialog.onTrue}
                    >
                      Add Elective Group ?
                    </Typography>
                  </Box>
                </Box>

                <CustomDialog
                  open={addSubjectDialog.value}
                  handleClose={addSubjectDialog.onFalse}
                  title="Add Subject"
                >
                  <SettingSubjectForm
                    open={addSubjectDialog}
                    onClose={() => {
                      addSubjectDialog.onFalse();
                    }}
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
                    onClose={() => {
                      addElectiveSubjectDialog.onFalse();
                    }}
                    editData={null}
                  />
                </CustomDialog>
                {/* Add Subject link */}
              </Grid>

              {/* Subject Cards Section */}
              {formik.values.subjects && formik.values.subjects.length > 0 && (
                <Grid item xs={12}>
                  {/* Map and render all subject cards */}
                  {formik.values.subjects.map((subject, index) => (
                    <SubjectCard
                      index={index}
                      formik={formik}
                      subject={subject}
                      isCore={formik.values.subjectType === 'core'}
                      isPublished={isPublished}
                      teacherOptions={teacherOptions}
                      onSubjectChange={handleSubjectFieldChange}
                    />
                  ))}
                </Grid>
              )}
            </Grid>
          </Scrollbar>

          {/* Action Buttons */}
          <DialogActions sx={{ flexShrink: 0, p: 2 }}>
            {isEdit ? (
              <>
                <Button
                  variant="outlined"
                  startIcon={<Iconify icon={GlobalIcons.cancel} />}
                  onClick={() => {
                    onClose(null, false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Iconify icon={GlobalIcons.edit} />}
                  onClick={() => {
                    setIsDraft(true);
                    formik.handleSubmit();
                  }}
                >
                  Update
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outlined"
                  startIcon={<Iconify icon={GlobalIcons.draftIcon} />}
                  onClick={() => {
                    setIsDraft(true);
                    formik.handleSubmit();
                  }}
                >
                  Save Draft
                </Button>
                <Button
                  startIcon={<Iconify icon={GlobalIcons.publish} />}
                  type="submit"
                  variant="contained"
                  onClick={() => {
                    setIsDraft(false);
                    formik.handleSubmit();
                  }}
                >
                  Publish
                </Button>
              </>
            )}
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default SubjectForm;
