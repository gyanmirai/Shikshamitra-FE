import { useFormik } from 'formik';

import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import { validationSchema } from './validationSchema';

import type { IAssignGradeProps } from '../type';

const AssignGrade: React.FC<IAssignGradeProps> = ({ data, onSubmit }: IAssignGradeProps) => {
  const formik = useFormik({
    initialValues: {
      grade: data?.grade || '',
      feedback: data?.feedback || '',
    },
    validationSchema,
    onSubmit(values) {
      onSubmit(values);
    },
  });

  return (
    <Box display="flex" flexDirection="column" gap={2} p={1}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '300px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ShakingTextField error={!!(formik.touched?.grade && formik.errors.grade) || false}>
                <CustomSelect
                  options={[
                    { value: 'A+', label: 'A+' },
                    { value: 'A', label: 'A' },
                    { value: 'A-', label: 'A-' },
                    { value: 'B+', label: 'B+' },
                    { value: 'B', label: 'B' },
                    { value: 'B-', label: 'B-' },
                    { value: 'C+', label: 'C+' },
                    { value: 'C', label: 'C' },
                    { value: 'C-', label: 'C-' },
                    { value: 'D', label: 'D' },
                    { value: 'F', label: 'F' },
                  ]}
                  label="Grade"
                  name="grade"
                  value={formik.values.grade}
                  onChange={(val) => {
                    formik.setFieldValue('grade', val);
                  }}
                  formControlProps={{ sx: { minWidth: 180, width: '100%' } }}
                  error={formik.touched.grade && Boolean(formik.errors.grade)}
                  helperText={
                    formik.touched.grade && formik.errors.grade ? formik.errors.grade : undefined
                  }
                />
              </ShakingTextField>
            </Grid>
            <Grid item xs={12}>
              <ShakingTextField
                error={!!(formik.touched?.feedback && formik.errors.feedback) || false}
              >
                <TextField
                  placeholder="Detailed Feedback"
                  multiline
                  rows={3}
                  fullWidth
                  name="feedback"
                  value={formik.values.feedback}
                  onChange={formik.handleChange}
                  error={formik.touched.feedback && Boolean(formik.errors.feedback)}
                  helperText={formik.touched.feedback && formik.errors.feedback}
                />
              </ShakingTextField>
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          <Button size="small" type="submit" variant="contained">
            Submit
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};

export default AssignGrade;
