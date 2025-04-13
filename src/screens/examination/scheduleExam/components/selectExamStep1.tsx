import type { FormikProps } from 'formik';
import type { Standards } from 'src/types/school';

import { Box, Grid, TextField } from '@mui/material';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import type { ISubjectDetail, IExamFormValues } from '../type';

const SelectExam = (props: FormikProps<IExamFormValues>) => {
  const formik = props;
  // Fetch class data using custom hook and handle loading state
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });
  console.log('formik vakue----', formik.values);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
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
              label="Exam Type"
              isLoading={isLoading}
              formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
              error={!!(formik.touched.examType && formik.errors.examType)}
              helperText={
                formik.touched.examType && formik.errors.examType
                  ? formik.errors.examType
                  : undefined
              }
            />
          </ShakingTextField>
        </Grid>

        <Grid item xs={12} md={6}>
          <ShakingTextField error={!!(formik.touched.examName && formik.errors.examName) || false}>
            <TextField
              fullWidth
              label="Exam Name"
              name="examName"
              value={formik.values.examName}
              onChange={formik.handleChange}
              error={formik.touched.examName && Boolean(formik.errors.examName)}
              helperText={formik.touched.examName && formik.errors.examName}
              size="small"
            />
          </ShakingTextField>
        </Grid>
        <Grid item xs={12} md={6}>
          <ShakingTextField
            error={!!(formik.touched.className && formik.errors.className) || false}
          >
            <CustomSelect
              options={classData?.items}
              onChange={(val) => {
                formik.setFieldValue('className', val as string);
              }}
              label="Class"
              isLoading={isLoading}
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
        <Grid item xs={12} md={6}>
          <ShakingTextField
            error={!!(formik.touched.divisions && formik.errors.divisions) || false}
          >
            <CustomSelect
              label="Division"
              labelKey="name"
              valueKey="id"
              multiple
              options={
                classData?.items.find((i: Standards) => i.id === formik.values.className)
                  ?.divisions || []
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

        <Grid item xs={12} md={6}>
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
              label="Subjects"
              isLoading={isLoading}
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
