import { useFormik } from 'formik';

import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { validationSchema } from './validationSchema';

import type { IAssignGradeProps } from '../type';

const AssignGrade: React.FC<IAssignGradeProps> = ({ onClose, data }: IAssignGradeProps) => {
  const formik = useFormik({
    initialValues: {
      totalMarks: data?.totalMarks || '',
      marks: data?.marks || '',
      feedback: data?.feedback || '',
    },
    validationSchema,
    onSubmit(values) {},
  });

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
        <form onSubmit={formik.handleSubmit}>
          <Scrollbar sx={{ p: 2, height: '200px', backgroundColor: 'background.paper' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <ShakingTextField error={!!(formik.touched?.marks && formik.errors.marks) || false}>
                  <TextField
                    label="Total Marks *"
                    disabled
                    // placeholder="Enter Marks"
                    name="totalMarks"
                    type="number"
                    value={formik.values.totalMarks}
                    onChange={formik.handleChange}
                    error={formik.touched.totalMarks && Boolean(formik.errors.totalMarks)}
                    helperText={
                      formik.touched.totalMarks && formik.errors.totalMarks
                        ? formik.errors.totalMarks
                        : undefined
                    }
                    size="small"
                    sx={{
                      width: '100%',
                    }}
                  />
                </ShakingTextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <ShakingTextField error={!!(formik.touched?.marks && formik.errors.marks) || false}>
                  <TextField
                    label="Marks *"
                    // placeholder="Enter Marks"
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
                    label="Feedback"
                    // placeholder="Enter Feedback"
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
          <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
            <Button
              size="small"
              onClick={() => {
                onClose?.(null, false);
              }}
              variant="outlined"
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
            >
              Cancel
            </Button>
            <Button
              size="small"
              type="submit"
              variant="contained"
              startIcon={
                <Iconify
                  icon={data ? GlobalIcons.edit : GlobalIcons.submit}
                  width={data ? 16 : 20}
                  height={data ? 16 : 20}
                />
              }
            >
              {data ? 'Update' : 'Submit'}
            </Button>
          </DialogActions>
        </form>
      </BackPopUpChecked>
    </Box>
  );
};

export default AssignGrade;
