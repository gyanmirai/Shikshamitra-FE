import type { FormikProps } from 'formik';
import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';

import { Box, Grid, TextField } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';

import ExamTypeForm from '../../settings/examAssessmentTypeSetting.tsx/examTypeSetting/examTypeForm';

import type { IRoomDetails, IExamFormValues } from '../type';

const subjectOptions = [
  // Core subjects
  { subjectName: 'Mathematics', subjectCode: 'MATH', subjectColor: '#DEB887', type: 'Core' },
  { subjectName: 'Science', subjectCode: 'SCI', subjectColor: '#00CED1', type: 'Core' },
  {
    subjectName: 'Social Science',
    subjectCode: 'SSCI',
    subjectColor: '#B22222',
    type: 'Core',
  },
  { subjectName: 'English', subjectCode: 'ENG', subjectColor: '#4682B4', type: 'Core' },
  { subjectName: 'Gujarati', subjectCode: 'GUJ', subjectColor: '#3CB371', type: 'Core' },

  // Elective subjects (group name included in subjectName)
  {
    subjectName: 'Computer (Tech & Fitness Group)',
    subjectCode: 'COMP',
    subjectColor: '#4169E1',
    type: 'Elective',
  },
  {
    subjectName: 'Physical Training (Tech & Fitness Group)',
    subjectCode: 'PHYS',
    subjectColor: '#FF69B4',
    type: 'Elective',
  },
  {
    subjectName: 'Sanskrit (Language Enrichment Group)',
    subjectCode: 'SANS',
    subjectColor: '#DA70D6',
    type: 'Elective',
  },
  {
    subjectName: 'Hindi (Language Enrichment Group)',
    subjectCode: 'HIND',
    subjectColor: '#FF4500',
    type: 'Elective',
  },
];

const SelectExam = (props: FormikProps<IExamFormValues>) => {
  // Dialog state to control exam type creation modal visibility
  const examTypeDialog = useBoolean();

  // Formik form instance passed down as props
  const formik = props;
  // State to store all classes/standards for the selected organization
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store selected class/standard ID
  const [classes, setClasses] = useState<string>('');
  console.log('formik values----', formik.values);

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
    setClasses(allClasses[0]?.id || '');
  }, [medium]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <ShakingTextField error={!!(formik.touched.examName && formik.errors.examName) || false}>
            <TextField
              fullWidth
              label="Exam Name *"
              name="examName"
              // placeholder="Enter Exam Name"
              value={formik.values.examName}
              onChange={(e) => {
                const value = e.target.value
                  // Remove everything except letters and spaces
                  .replace(/[^a-zA-Z0-9\s]/g, '');
                formik.setFieldValue('examName', value);
                formik.setFieldTouched(`examName`, false);
              }}
              // onChange={formik.handleChange}
              error={formik.touched.examName && Boolean(formik.errors.examName)}
              helperText={formik.touched.examName && formik.errors.examName}
              size="small"
            />
          </ShakingTextField>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <ShakingTextField error={formik.touched.examType && Boolean(formik.errors.examType)}>
            <CustomSelect
              options={[
                { value: 'Mid', label: 'Mid' },
                { value: 'Practical', label: 'Practical' },
                { value: 'Final', label: 'Final' },
              ]}
              value={formik.values.examType}
              onChange={(val) => {
                formik.setFieldValue('examType', val);
                formik.setFieldTouched(`examType`, false);
              }}
              label="Exam Type *"
              formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
              error={formik.touched.examType && Boolean(formik.errors.examType)}
              helperText={formik.touched.examType ? formik.errors.examType : undefined}
              // error={!!(formik.touched.examType && formik.errors.examType)}
              // helperText={
              //   formik.touched.examType && formik.errors.examType
              //     ? formik.errors.examType
              //     : undefined
              // }
            />
          </ShakingTextField>
          {/* <Box mt={1} display="flex" justifyContent="flex-end">
            <Typography
              variant="body2"
              fontWeight={500}
              color="primary.main"
              fontSize={12}
              sx={{ cursor: 'pointer' }}
              onClick={() => examTypeDialog.onTrue()}
            >
              Add Exam Type ?
            </Typography>
          </Box> */}
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
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <ShakingTextField
            error={!!(formik.touched.className && formik.errors.className) || false}
          >
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
              formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
              error={!!(formik.touched.className && formik.errors.className)}
              helperText={
                formik.touched.className && formik.errors.className
                  ? formik.errors.className
                  : undefined
              }
            />
          </ShakingTextField>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <ShakingTextField
            error={!!(formik.touched.divisions && formik.errors.divisions) || false}
          >
            <CustomSelect
              label="Division *"
              labelKey="name"
              valueKey="id"
              multiple
              disabled={!formik.values.className}
              options={[
                { id: 'all', name: 'All' },
                ...(allClass?.find((i: Standards) => i.id === formik.values.className)?.divisions ||
                  []),
              ]}
              value={formik.values.divisions}
              onChange={(val) => {
                const value = val as string[];

                const divisionOptions =
                  allClass?.find((i: Standards) => i.id === formik.values.className)?.divisions ||
                  [];

                const allDivisionIds = divisionOptions.map((d) => d.id);
                const isAllClicked = value.includes('all');
                const wasAllPreviouslySelected = formik.values.divisions.includes('all');

                if (isAllClicked && !wasAllPreviouslySelected) {
                  // "All" was just clicked - select all divisions
                  formik.setFieldValue('divisions', ['all', ...allDivisionIds]);
                } else if (!isAllClicked && wasAllPreviouslySelected) {
                  // "All" was just unchecked - deselect all divisions
                  formik.setFieldValue('divisions', []);
                } else if (isAllClicked && wasAllPreviouslySelected) {
                  // Individual item was selected/deselected while "All" was already selected
                  const selectedWithoutAll = value.filter((id) => id !== 'all');

                  if (selectedWithoutAll.length === allDivisionIds.length) {
                    // All individual items are selected, keep "All" selected
                    formik.setFieldValue('divisions', ['all', ...allDivisionIds]);
                  } else {
                    // Not all individual items are selected, remove "All"
                    formik.setFieldValue('divisions', selectedWithoutAll);
                  }
                } else {
                  // "All" is not selected, handle individual selections
                  const selectedWithoutAll = value.filter((id) => id !== 'all');

                  if (selectedWithoutAll.length === allDivisionIds.length) {
                    // All individual items are selected, add "All"
                    formik.setFieldValue('divisions', ['all', ...allDivisionIds]);
                  } else {
                    // Not all items selected, just keep individual selections
                    formik.setFieldValue('divisions', selectedWithoutAll);
                  }
                }
                formik.setFieldTouched(`divisions`, false);
              }}
              formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
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
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <ShakingTextField error={!!(formik.touched.subjects && formik.errors.subjects) || false}>
            <ResponsiveMultiSelect
              label="Subjects *"
              disabled={formik.values.divisions.length === 0}
              options={[
                { subjectName: 'All', subjectCode: 'all', subjectColor: '#000000', type: 'All' },
                ...subjectOptions,
              ]}
              value={formik.values.subjects.map((sub: any) => sub.subjectCode)}
              getOptionLabel={(opt) => opt?.subjectName}
              getOptionValue={(opt) => opt?.subjectCode}
              onChange={(selectedCodes: string[]) => {
                const isAllSelected = selectedCodes.includes('all');
                const wasAllPreviouslySelected = formik.values.subjects.some(
                  (sub) => sub.subjectCode === 'all'
                );

                let updatedSubjects: Array<{
                  id: number;
                  subjectName: string;
                  subjectCode: string;
                  subjectColor: string;
                  examDate: null;
                  startTime: null;
                  endTime: null;
                  totalMarks: null;
                  passingMarks: null;
                }>;

                if (isAllSelected && !wasAllPreviouslySelected) {
                  updatedSubjects = [
                    {
                      id: -1,
                      subjectName: 'All',
                      subjectCode: 'all',
                      subjectColor: '#000000',
                      examDate: null,
                      startTime: null,
                      endTime: null,
                      totalMarks: null,
                      passingMarks: null,
                    },
                    ...subjectOptions.map((subject, index) => ({
                      id: index,
                      subjectName: subject.subjectName,
                      subjectCode: subject.subjectCode,
                      subjectColor: subject.subjectColor,
                      examDate: null,
                      startTime: null,
                      endTime: null,
                      totalMarks: null,
                      passingMarks: null,
                    })),
                  ];
                } else if (!isAllSelected && wasAllPreviouslySelected) {
                  updatedSubjects = [];
                } else {
                  updatedSubjects = selectedCodes
                    .filter((code) => code !== 'all')
                    .map((code, index) => {
                      const fullSubject = subjectOptions.find((s) => s.subjectCode === code);
                      return {
                        id: index,
                        subjectName: fullSubject?.subjectName || '',
                        subjectCode: fullSubject?.subjectCode || '',
                        subjectColor: fullSubject?.subjectColor || '#000000',
                        examDate: null,
                        startTime: null,
                        endTime: null,
                        totalMarks: null,
                        passingMarks: null,
                      };
                    });
                }

                formik.setFieldValue('subjects', updatedSubjects);
                formik.setFieldTouched(`subjects`, false);
                const updatedRoomDetails = selectedCodes.reduce((acc, code) => {
                  if (code === 'all') return acc;

                  const subject = subjectOptions.find((s) => s.subjectCode === code);
                  if (!subject) return acc;

                  acc[subject.subjectName] = {
                    divisionId: '',
                    roomIds: [],
                    capacity: 0,
                    copyPastSubject: '',
                  };
                  return acc;
                }, {} as IRoomDetails);

                formik.setFieldValue('roomDetails', updatedRoomDetails);
              }}
              error={!!(formik.touched.subjects && formik.errors.subjects)}
              helperText={
                formik.touched.subjects && typeof formik.errors.subjects === 'string'
                  ? formik.errors.subjects
                  : undefined
              }
            />
          </ShakingTextField>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SelectExam;
