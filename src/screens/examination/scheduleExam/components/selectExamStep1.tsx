import type { FormikProps } from 'formik';
import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';

import { Box, Grid, TextField, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import ExamTypeForm from '../../settings/examAssessmentTypeSetting.tsx/examTypeSetting/examTypeForm';

import type { ISubjectDetail, IExamFormValues } from '../type';

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
          <ShakingTextField error={!!(formik.touched.examType && formik.errors.examType) || false}>
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
              error={!!(formik.touched.examType && formik.errors.examType)}
              helperText={
                formik.touched.examType && formik.errors.examType
                  ? formik.errors.examType
                  : undefined
              }
            />
          </ShakingTextField>
          <Box mt={1} display="flex" justifyContent="flex-end">
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
          </Box>
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
              placeholder="Enter Exam Name"
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
              label="Class"
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
              label="Division"
              labelKey="name"
              valueKey="id"
              multiple
              disabled={!formik.values.className}
              options={
                allClass?.find((i: Standards) => i.id === formik.values.className)?.divisions || []
              }
              value={formik.values.divisions}
              onChange={(val) => {
                formik.setFieldValue('divisions', val as string[]);
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
            <CustomSelect
              options={[
                { value: 'Math', label: 'Math' },
                { value: 'English', label: 'English' },
                { value: 'Science', label: 'Science' },
              ]}
              value={formik.values.subjects.map((sub: ISubjectDetail) => sub.subjectName)} // Extract names
              onChange={(val) => {
                const updatedSubjects = val.map((subject, index) => ({
                  id: index,
                  subjectName: subject,
                  examDate: null,
                  examTime: null,
                  examDuration: 0,
                  totalMarks: 0,
                  passingMarks: 0,
                  teacher: '',
                  invigilationTeacher: '',
                }));
                formik.setFieldValue('subjects', updatedSubjects);
              }}
              multiple
              disabled={formik.values.divisions.length === 0}
              label="Subjects"
              formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
              error={!!(formik.touched.subjects && formik.errors.subjects)}
              helperText={
                formik.touched.subjects && formik.errors.subjects
                  ? Array.isArray(formik.errors.subjects)
                    ? formik.errors.subjects.join(', ') // Join array into a single string
                    : formik.errors.subjects // Directly use the string
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
