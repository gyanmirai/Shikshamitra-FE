import { useFormik } from 'formik';

import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';

import { validationSchema } from './validationSchema';

import type { IAssignGradeProps } from '../type';

const AssignGrade: React.FC<IAssignGradeProps> = ({ data }: IAssignGradeProps) => {
  const formik = useFormik({
    initialValues: {
      marks: data?.marks || '',
      feedback: data?.feedback || '',
    },
    validationSchema,
    onSubmit(values) {
      console.log('values---', values);
    },
  });

  return (
    <Box display="flex" flexDirection="column" gap={2} p={1}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '300px' }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <ShakingTextField error={!!(formik.touched?.marks && formik.errors.marks) || false}>
                <TextField
                  label="Marks"
                  name="marks"
                  type="number"
                  value={formik.values.marks}
                  onChange={formik.handleChange}
                  error={formik.touched.marks && Boolean(formik.errors.marks)}
                  helperText={
                    formik.touched.marks && formik.errors.marks ? formik.errors.marks : undefined
                  }
                  size="small"
                  sx={{
                    width: '100%',
                  }}
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
