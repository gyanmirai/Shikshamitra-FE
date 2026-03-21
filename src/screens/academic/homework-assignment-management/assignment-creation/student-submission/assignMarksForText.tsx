'use client';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  Box,
  Grid,
  Card,
  Stack,
  Avatar,
  Button,
  Divider,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';

import type { IAssignGradeProps } from '../../homework-creation/type';

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
    onSubmit(values) {
      shikshaMitraToast.success({
        message: `Feedback and marks have been ${
          data?.feedback ? 'updated' : 'added'
        } successfully for ${data?.studentName}.`,
      });
      onClose(null, true);
    },
  });

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
        <Box
          component="form"
          sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          onSubmit={formik.handleSubmit}
        >
          <Scrollbar sx={{ height: '500px', p: 2 }}>
            <Grid container spacing={3}>
              {/* Student Profile Section */}
              <Grid size={{ xs: 12 }}>
                <Card sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar
                      alt={data?.studentName || 'Student'}
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor: 'primary.lighter',
                        color: 'primary.main',
                        fontWeight: 'bold',
                      }}
                    >
                      {data?.studentName?.charAt(0) || 'S'}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {data?.studentName}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Roll No: {data?.rollNumber || '--'}
                      </Typography>
                    </Box>
                  </Stack>
                </Card>
              </Grid>

              {/* Submission Content */}
              <Grid size={{ xs: 12 }}>
                <Card sx={{ p: 0, overflow: 'hidden', boxShadow: 'var(--shadows-10)' }}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: (theme) => theme.palette.grey[100],
                      borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                      <Iconify
                        icon="solar:document-text-bold"
                        width={20}
                        sx={{ color: 'info.main' }}
                      />
                      Student Submission
                    </Typography>
                  </Box>
                  <Box sx={{ p: 1 }}>
                    <Editor value="Submission Data" editable={false} onChange={(value) => {}} />
                  </Box>
                </Card>
              </Grid>

              {/* Assessment & Feedback Section */}
              <Grid size={{ xs: 12 }}>
                <Card sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    Assessment & Feedback
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <ShakingTextField
                        error={!!(formik.touched.totalMarks && formik.errors.totalMarks)}
                      >
                        <TextField
                          label="Total Marks"
                          fullWidth
                          name="totalMarks"
                          size="small"
                          disabled
                          value={formik.values.totalMarks}
                          onChange={formik.handleChange}
                          error={formik.touched.totalMarks && Boolean(formik.errors.totalMarks)}
                          helperText={formik.touched.totalMarks && formik.errors.totalMarks}
                        />
                      </ShakingTextField>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <ShakingTextField error={!!(formik.touched.marks && formik.errors.marks)}>
                        <TextField
                          label="Obtained Marks *"
                          fullWidth
                          type="number"
                          name="marks"
                          size="small"
                          disabled={!isEdit}
                          value={formik.values.marks}
                          onChange={formik.handleChange}
                          onKeyDown={(e) => {
                            if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
                          }}
                          error={formik.touched.marks && Boolean(formik.errors.marks)}
                          helperText={formik.touched.marks && formik.errors.marks}
                        />
                      </ShakingTextField>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <ShakingTextField
                        error={!!(formik.touched.feedback && formik.errors.feedback)}
                      >
                        <TextField
                          label="Feedback"
                          multiline
                          rows={3}
                          fullWidth
                          size="small"
                          disabled={!isEdit}
                          name="feedback"
                          value={formik.values.feedback}
                          onChange={formik.handleChange}
                          error={formik.touched.feedback && Boolean(formik.errors.feedback)}
                          helperText={formik.touched.feedback && formik.errors.feedback}
                        />
                      </ShakingTextField>
                    </Grid>
                  </Grid>
                </Card>
              </Grid>
            </Grid>
          </Scrollbar>

          <Divider />

          <DialogActions sx={{ bgcolor: 'background.paper', p: 2.5 }}>
            <Button
              variant="outlined"
              color="inherit"
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
        </Box>
      </BackPopUpChecked>
    </Box>
  );
};

export default AssignMarksForText;
