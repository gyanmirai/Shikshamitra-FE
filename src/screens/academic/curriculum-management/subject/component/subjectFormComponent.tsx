'use client';

import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';

import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';

import { Box, Grid, Chip, Button, TextField, Autocomplete, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { PublishUnpublishStatusType } from 'src/enums/publishUnpublish-status';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import SubjectCard from './subjectCardComponent';
import { validationSchema } from './validationSchema';
import { getSubjectInitialValues } from './initialValues';
import SettingSubjectForm from '../../setting/subjectCreation/subjectForm';
import SettingElectiveSubjectForm from '../../setting/electiveSubjectSetting/components/electiveSubjectForm';

import type { TeacherProfile, ISubjectFormProps, ISubjectFormValues } from './type';

// Enhanced subject options with Core and Elective groups
const subjectOptions = [
  { label: 'Mathematics', value: 'Mathematics', type: 'Core', subjectColor: '#DEB887' },
  { label: 'Science', value: 'Science', type: 'Core', subjectColor: '#00CED1' },
  { label: 'Social Science', value: 'Social Science', type: 'Core', subjectColor: '#B22222' },
  { label: 'English', value: 'English', type: 'Core', subjectColor: '#4682B4' },
  { label: 'Gujarati', value: 'Gujarati', type: 'Core', subjectColor: '#3CB371' },
  {
    label: 'Tech & Fitness Group',
    value: 'Tech & Fitness Group',
    type: 'Elective',
    subjects: [
      { name: 'Computer', code: 'COMP101', subjectColor: '#4169E1' },
      { name: 'Physical Training', code: 'PT101', subjectColor: '#FF69B4' },
    ],
  },
  {
    label: 'Language Enrichment Group',
    value: 'Language Enrichment Group',
    type: 'Elective',
    subjects: [
      { name: 'Sanskrit', code: 'SNSK101', subjectColor: '#DA70D6' },
      { name: 'Hindi', code: 'HIND101', subjectColor: '#FF4500' },
    ],
  },
];

const teacherProfiles: TeacherProfile[] = [
  {
    id: 1,
    name: 'Sharma Riya Kumar',
    avatarUrl: 'https://yourcdn.com/riya.png',
    designation: 'Senior Mathematics Teacher',
    department: 'Mathematics Department',
    class: '8',
    division: 'A',
    status: 'Active',
    dailyStatus: 'Present',
    email: 'riya.sharma@example.com',
    experience: '10 years',
    qualification: 'M.Sc. Mathematics, B.Ed',
    subjects: ['Algebra', 'Geometry'],
  },
  {
    id: 2,
    name: 'Patel Ankit Rajesh',
    avatarUrl: 'https://yourcdn.com/ankit.png',
    designation: 'Science Teacher',
    department: 'Science Department',
    class: '9',
    division: 'B',
    status: 'Active',
    dailyStatus: 'Present',
    email: 'ankit.patel@example.com',
    experience: '7 years',
    qualification: 'M.Sc. Physics, B.Ed',
    subjects: ['Physics', 'Chemistry'],
  },
  {
    id: 3,
    name: 'Desai Priya Mahesh',
    avatarUrl: 'https://yourcdn.com/priya.png',
    designation: 'English Lecturer',
    department: 'English Department',
    class: '10',
    division: 'C',
    status: 'Active',
    dailyStatus: 'On Leave',
    email: 'priya.desai@example.com',
    experience: '5 years',
    qualification: 'M.A. English, B.Ed',
    subjects: ['Literature', 'Grammar'],
  },
  {
    id: 4,
    name: 'Singh Rahul Vikram',
    avatarUrl: 'https://yourcdn.com/rahul.png',
    designation: 'History Teacher',
    department: 'Social Studies Department',
    class: '7',
    division: 'B',
    status: 'Active',
    dailyStatus: 'Present',
    email: 'rahul.singh@example.com',
    experience: '8 years',
    qualification: 'M.A. History, B.Ed',
    subjects: ['History', 'Civics'],
  },
  {
    id: 5,
    name: 'Mehta Neha Suresh',
    avatarUrl: 'https://yourcdn.com/neha.png',
    designation: 'Hindi Teacher',
    department: 'Hindi Department',
    class: '6',
    division: 'A',
    status: 'Active',
    dailyStatus: 'Present',
    email: 'neha.mehta@example.com',
    experience: '6 years',
    qualification: 'M.A. Hindi, B.Ed',
    subjects: ['Hindi'],
  },
  {
    id: 6,
    name: 'Atre Harshita Bhanudas',
    avatarUrl: 'https://yourcdn.com/harshita.png',
    designation: 'Subject Coordinator',
    department: 'Secondary Department',
    class: '10',
    division: 'A',
    status: 'Active',
    dailyStatus: 'Present',
    email: 'harshita.atre@example.com',
    experience: '9 years',
    qualification: 'M.Ed, B.Sc',
    subjects: ['Mathematics', 'Physics'],
  },
  {
    id: 7,
    name: 'Patel Priyanka Ramesh',
    avatarUrl: 'https://yourcdn.com/priyanka.png',
    designation: 'Science Teacher',
    department: 'Secondary Department',
    class: '8',
    division: 'C',
    status: 'Active',
    dailyStatus: 'Present',
    email: 'priyanka.patel@example.com',
    experience: '6 years',
    qualification: 'M.Sc Biology, B.Ed',
    subjects: ['Biology'],
  },
  {
    id: 8,
    name: 'Kumar Ankit Mahesh',
    avatarUrl: 'https://yourcdn.com/ankitk.png',
    designation: 'Secondary Teacher',
    department: 'Secondary Department',
    class: '7',
    division: 'A',
    status: 'Active',
    dailyStatus: 'Present',
    email: 'ankit.kumar@example.com',
    experience: '4 years',
    qualification: 'B.Sc, B.Ed',
    subjects: ['Science'],
  },
  {
    id: 9,
    name: 'Johnson Robert Alan',
    avatarUrl: 'https://yourcdn.com/robert.png',
    designation: 'English Teacher',
    department: 'Secondary Department',
    class: '6',
    division: 'C',
    status: 'Active',
    dailyStatus: 'On Leave',
    email: 'robert.johnson@example.com',
    experience: '11 years',
    qualification: 'M.Ed, M.A. English',
    subjects: ['English Literature'],
  },
  {
    id: 10,
    name: 'Ahir Dharmik Ganesh',
    avatarUrl: 'https://yourcdn.com/dharmik.png',
    designation: 'Computer Teacher',
    department: 'Secondary Department',
    class: '9',
    division: 'B',
    status: 'Active',
    dailyStatus: 'Present',
    email: 'dharmik.ahir@example.com',
    experience: '3 years',
    qualification: 'MCA, B.Ed',
    subjects: ['Computer Science'],
  },
  {
    id: 11,
    name: 'Atre Prerna Bhanudas',
    avatarUrl: 'https://yourcdn.com/prerna.png',
    designation: 'Primary Class Teacher',
    department: 'Primary Department',
    class: '2',
    division: 'A',
    status: 'Active',
    dailyStatus: 'Present',
    email: 'prerna.atre@example.com',
    experience: '4 years',
    qualification: 'B.Ed, D.El.Ed',
    subjects: ['All Subjects'],
  },
  {
    id: 12,
    name: 'Vadher Yagnik Jethabhai',
    avatarUrl: 'https://yourcdn.com/yagnik.png',
    designation: 'Primary Teacher',
    department: 'Primary Department',
    class: '3',
    division: 'B',
    status: 'Active',
    dailyStatus: 'Present',
    email: 'yagnik.vadher@example.com',
    experience: '2 years',
    qualification: 'B.Ed',
    subjects: ['EVS', 'Gujarati'],
  },
  {
    id: 13,
    name: 'Trivedi Amit Jignesh',
    avatarUrl: 'https://yourcdn.com/amit.png',
    designation: 'Primary Science Teacher',
    department: 'Primary Department',
    class: '4',
    division: 'C',
    status: 'Active',
    dailyStatus: 'On Duty',
    email: 'amit.trivedi@example.com',
    experience: '5 years',
    qualification: 'B.Sc, B.Ed',
    subjects: ['Science'],
  },
  {
    id: 14,
    name: 'Mehta Kavita Mahesh',
    avatarUrl: 'https://yourcdn.com/kavita.png',
    designation: 'Art & Craft Teacher',
    department: 'Primary Department',
    class: '1',
    division: 'A',
    status: 'Active',
    dailyStatus: 'Present',
    email: 'kavita.mehta@example.com',
    experience: '3 years',
    qualification: 'Diploma in Fine Arts',
    subjects: ['Art', 'Craft'],
  },
];

const SubjectForm = ({ onClose, data, isEdit, selectedClass }: ISubjectFormProps) => {
  // State to track if the form is in draft mode - determined by edit status or existing data status
  const [isDraft, setIsDraft] = useState<boolean>(false);
  // Flag to check if the subject is already published
  const isPublished: boolean =
    PublishUnpublishStatusType[data?.status as PublishUnpublishStatusType] === 'Published';
  // State to control visibility of add subject dialog
  const addSubjectDialog = useBoolean();
  // State to control visibility of add Elective subject dialog
  const addElectiveSubjectDialog = useBoolean();
  // State to track selected option for the autocomplete
  const [selectedOption, setSelectedOption] = useState<any>(null);
  // Flag to prevent infinite update loops
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize formik form with initial values from data prop or default values
  const formik = useFormik<ISubjectFormValues>({
    initialValues: getSubjectInitialValues(data, selectedClass),
    validationSchema,
    // Handle form submission
    onSubmit: (values) => {
      // Prepare the complete submission data
      const submitData = {
        ...values,
        id: data?.id || Date.now(),
        status: isDraft ? 'Draft' : 'Publish',
      };
      if (data) {
        shikshaMitraToast.success({
          message: `${values.subjectName} updated successfully for class ${values.className}`,
        });
      } else if (isDraft) {
        shikshaMitraToast.success({
          message: `${values.subjectName} subject save as draft successfully for class ${values.className}`,
        });
      } else {
        shikshaMitraToast.success({
          message: `${values.subjectName} subject published successfully for class ${values.className}`,
        });
      }

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
          (opt.type === 'Elective' &&
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
      formik.setFieldValue('subjectType', 'Core');
      formik.setFieldValue('subjects', []);
      setSelectedOption(null);
      return;
    }

    // Update Formik values for subject name and type
    formik.setFieldValue('subjectName', newValue.value);
    formik.setFieldValue('subjectType', newValue.type);
    setSelectedOption(newValue);
    formik.setFieldTouched('subjectName', false);

    // Determine if this is a Core subject or an Elective group
    if (newValue.type === 'Core') {
      // For Core subject, create a single subject entry
      const newSubject = {
        id: Date.now() + Math.random(),
        name: newValue.name,
        subjectName: newValue.value,
        className: formik.values.className || '',
        subjectCode: '',
        primaryTeacher: {},
        secondaryTeacher: [],
        description: '',
        isSubjectOpen: true,
        learningGoal: '',
        prerequisites: '',
        subjectColor: newValue.subjectColor,
        scheduleDate: null,
        status: 'Draft',
      };
      // Update subjects array in formik state
      formik.setFieldValue('subjects', [newSubject]);
    } else if (newValue.type === 'Elective') {
      // For Elective group, create multiple subject entries
      const initialElectives = newValue.subjects.map((subject: any) => ({
        id: Date.now() + Math.random(),
        name: subject.name,
        subjectName: subject.name,
        className: formik.values.className || '',
        subjectCode: '',
        primaryTeacher: {},
        secondaryTeacher: [],
        isSubjectOpen: true,
        description: '',
        learningGoal: '',
        prerequisites: '',
        subjectColor: subject.subjectColor,
        scheduleDate: null,
        status: 'Draft',
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

  console.log('formik.values-----', formik.values);

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" sx={{ height: '100%' }}>
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid container spacing={3}>
              {/* Class selection */}
              <Grid item xs={12} md={4}>
                <ShakingTextField
                  error={!!(formik.touched.className && formik.errors.className) || false}
                >
                  <CustomSelect
                    options={allClass}
                    label="Class *"
                    value={formik.values.className || selectedClass}
                    labelKey="name"
                    valueKey="name"
                    // placeholder="Search Class"
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
              <Grid item xs={12} md={4}>
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
                    ListboxProps={{
                      style: { maxHeight: 200, overflow: 'auto' },
                    }}
                    renderOption={(props, option) => (
                      <li {...props}>
                        <Box
                          sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}
                        >
                          {option.label}
                          <Chip
                            size="small"
                            label={option.type === 'Core' ? 'Core' : 'Elective'}
                            color={option.type === 'Core' ? 'primary' : 'secondary'}
                            sx={{ ml: 1, height: 20 }}
                          />
                        </Box>
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Subject *"
                        name="subjectName"
                        error={formik.touched.subjectName && Boolean(formik.errors.subjectName)}
                        helperText={formik.touched.subjectName && formik.errors.subjectName}
                      />
                    )}
                  />
                </ShakingTextField>
                {/* <Box display="flex" justifyContent="space-between">
                  <Box sx={{ display: 'inline-block' }}>
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      color="primary.main"
                      fontSize={12}
                      sx={{ cursor: 'pointer' }}
                      onClick={addSubjectDialog.onTrue}
                    >
                      Add Subject
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
                      Add Elective Group
                    </Typography>
                  </Box>
                </Box> */}

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
                      key={subject.id}
                      index={index}
                      formik={formik}
                      subject={subject}
                      isCore={formik.values.subjectType === 0}
                      isPublished={isPublished}
                      teacherOptions={teacherProfiles}
                      onSubjectChange={handleSubjectFieldChange}
                    />
                  ))}{' '}
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
                <Button
                  variant="contained"
                  startIcon={<Iconify icon={GlobalIcons.edit} width={16} height={16} />}
                  onClick={() => {
                    setIsDraft(true);
                    formik.handleSubmit();
                  }}
                  size="small"
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
                  size="small"
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
                  size="small"
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
