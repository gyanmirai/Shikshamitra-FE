'use client';

import { useFormik } from 'formik';

import { Box, Grid, Button, TextField, Typography, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { assignGradeValidationSchema } from './validationSchema';

import type { IAssignGradeProps } from '../type';

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
      feedback: data?.feedback || '',
    },
    validationSchema: assignGradeValidationSchema,
    onSubmit(values) {},
  });

  return (
    <Box>
      <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
        <form onSubmit={formik.handleSubmit}>
          <Scrollbar sx={{ p: 2, height: '500px' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} mb={-2}>
                <Typography variant="subtitle2">Student Submission</Typography>
              </Grid>
              <Grid item xs={12}>
                <Editor
                  editable={false}
                  onChange={() => {}}
                  value={`

1. The sun rises in the east.
2. Water boils at 100°C.
3. Plants need water to grow.

I have completed all answers as per the instructions.`}
                />
              </Grid>
              <Grid item xs={12} mb={-2}>
                <Typography variant="subtitle2">Description</Typography>
              </Grid>
              <Grid item xs={12}>
                <Box
                  sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    p: 2,
                    bgcolor: '#fafafa',
                    minHeight: '100px',
                    maxHeight: '200px',
                    overflow: 'auto',
                  }}
                >
                  <Typography
                    component="pre"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      m: 0,
                      fontSize: '0.875rem',
                      lineHeight: 1.5,
                    }}
                  >
                    {`Homework Assignment: Science Fundamentals

Due Date: Friday, March 15th, 2024
Instructions: Write detailed explanations for the following scientific facts.

Questions:
1. Explain why the sun appears to rise in the east every day
2. Describe the process of water boiling and why it occurs at 100°C at sea level
3. Explain the importance of water in plant growth and development

Additional Notes:
I have completed all answers according to the given instructions and provided scientific explanations for each point.`}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <ShakingTextField
                  error={!!(formik.touched.feedback && formik.errors.feedback) || false}
                >
                  <TextField
                    // placeholder="Enter Feedback"
                    label="Feedback *"
                    multiline
                    size="small"
                    rows={3}
                    disabled={!isEdit}
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
              size="small"
              onClick={() => {
                onClose(null, false);
              }}
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="small"
              type="submit"
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
