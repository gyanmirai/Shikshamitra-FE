'use client';

import * as Yup from 'yup';
import { useFormik } from 'formik';

import { Box, Grid, Button, TextField, Typography, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import type { IAssignGradeProps } from '../../homeworkCreation/type';

/**
 * Props for the AssignGrade component
 * @param data Optional data containing initial grade and feedback values
 * @param onSubmit Callback function to handle form submission with grade and feedback values
 */
const AssignMarksForText: React.FC<IAssignGradeProps> = ({
  isEdit,
  data,
  onClose,
}: IAssignGradeProps) => {
  /**
   * Initialize formik form with grade and feedback fields
   * @param initialValues Object containing initial grade and feedback values from data prop
   * @param onSubmit Handler function that gets called when form is submitted
   */
  const formik = useFormik({
    initialValues: {
      marks: data?.marks || '',
      totalMarks: data?.totalMarks || 25,
      feedback: data?.feedback || '',
    },
    validationSchema: Yup.object({
      marks: Yup.string().required('Marks is required'),
    }),
    onSubmit(values) {},
  });

  return (
    <Box>
      <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
        <form onSubmit={formik.handleSubmit}>
          <Scrollbar sx={{ p: 2, height: '280px' }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Box display="flex" gap={2}>
                  <Typography variant="body2">
                    <strong>Name : </strong>
                    {data?.studentName}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Roll No : </strong>
                    {data?.rollNumber}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Editor onChange={(value) => {}} value="Submission Data" editable={false} />
              </Grid>
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={!!(formik.touched.totalMarks && formik.errors.totalMarks) || false}
                >
                  <TextField
                    label="Total Marks"
                    fullWidth
                    name="totalMarks"
                    disabled
                    size="small"
                    value={formik.values.totalMarks}
                    onChange={formik.handleChange}
                    error={formik.touched.totalMarks && Boolean(formik.errors.totalMarks)}
                    helperText={formik.touched.totalMarks && formik.errors.totalMarks}
                  />
                </ShakingTextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <ShakingTextField error={!!(formik.touched.marks && formik.errors.marks) || false}>
                  <TextField
                    // placeholder="Enter Marks"
                    label="Obtained Marks *"
                    fullWidth
                    type="number"
                    name="marks"
                    onKeyDown={(e) => {
                      if (['e', 'E', '+', '-'].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    disabled={!isEdit}
                    size="small"
                    value={formik.values.marks}
                    onChange={formik.handleChange}
                    error={formik.touched.marks && Boolean(formik.errors.marks)}
                    helperText={formik.touched.marks && formik.errors.marks}
                  />
                </ShakingTextField>
              </Grid>
              <Grid item xs={12}>
                <ShakingTextField
                  error={!!(formik.touched.feedback && formik.errors.feedback) || false}
                >
                  <TextField
                    // placeholder="Enter Feedback"
                    label="Feedback"
                    multiline
                    size="small"
                    disabled={!isEdit}
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
              variant="outlined"
              onClick={() => {
                onClose(null, false);
              }}
              size="small"
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              type="submit"
              size="small"
              onClick={() => {
                formik.handleSubmit();
              }}
              startIcon={<Iconify icon={GlobalIcons.submit} />}
            >
              Submit
            </Button>
          </DialogActions>
        </form>
      </BackPopUpChecked>
    </Box>
  );
};

export default AssignMarksForText;
