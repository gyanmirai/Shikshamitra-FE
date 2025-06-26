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

import type { IExamFormValues } from '../type';

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
              }}
              label="Exam Type *"
              formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
              error={formik.touched.examType && Boolean(formik.errors.examType)}
              helperText={(formik.touched.examType && formik.errors.examType) as string}
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
          <ShakingTextField error={!!(formik.touched.examName && formik.errors.examName) || false}>
            <TextField
              fullWidth
              label="Exam Name *"
              name="examName"
              // placeholder="Enter Exam Name"
              value={formik.values.examName}
              onChange={formik.handleChange}
              error={formik.touched.examName && Boolean(formik.errors.examName)}
              helperText={formik.touched.examName && formik.errors.examName}
              size="small"
            />
          </ShakingTextField>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <ShakingTextField
            error={!!(formik.touched.className && formik.errors.className) || false}
          >
            <CustomSelect
              options={allClass}
              onChange={(val) => {
                formik.setFieldValue('className', val as string);
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
              value={(formik.values.divisions.includes('all')
                ? ['all', ...formik.values.divisions.filter((id) => id !== 'all')]
                : formik.values.divisions
              ).filter((id) => id !== 'all')}
              onChange={(val) => {
                const value = val as string[];

                const divisionOptions =
                  allClass?.find((i: Standards) => i.id === formik.values.className)?.divisions ||
                  [];

                const allDivisionIds = divisionOptions.map((d) => d.id);
                const selectedWithoutAll = value.filter((id) => id !== 'all');
                const isAllClicked = value.includes('all');

                if (isAllClicked && selectedWithoutAll.length !== allDivisionIds.length) {
                  formik.setFieldValue('divisions', ['all', ...allDivisionIds]);
                } else if (isAllClicked && selectedWithoutAll.length === allDivisionIds.length) {
                  formik.setFieldValue('divisions', []);
                } else {
                  formik.setFieldValue('divisions', selectedWithoutAll);
                }
              }}
              formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
              error={!!(formik.touched.divisions && formik.errors.divisions)}
              helperText={
                Array.isArray(formik.errors.divisions)
                  ? formik.errors.divisions.join(', ')
                  : (formik.touched.divisions && formik.errors.divisions) || undefined
              }
            />
          </ShakingTextField>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <ShakingTextField error={!!(formik.touched.subjects && formik.errors.subjects) || false}>
            <ResponsiveMultiSelect
              label="Subjects *"
              disabled={formik.values.divisions.length === 0}
              options={subjectOptions}
              value={formik.values.subjects.map((sub: any) => sub.subjectCode)}
              getOptionLabel={(opt) => opt?.subjectName}
              getOptionValue={(opt) => opt?.subjectCode}
              onChange={(selectedCodes: string[]) => {
                const updatedSubjects = selectedCodes.map((code, index) => {
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
                formik.setFieldValue('subjects', updatedSubjects);
              }}
              error={!!(formik.touched.subjects && formik.errors.subjects)}
              helperText={
                typeof formik.errors.subjects === 'string'
                  ? formik.errors.subjects
                  : formik.touched.subjects && typeof formik.errors.subjects === 'string'
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
