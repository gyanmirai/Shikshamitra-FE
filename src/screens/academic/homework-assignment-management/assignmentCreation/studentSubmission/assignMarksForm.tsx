'use client';

import type { IDocument } from 'src/screens/academic/curriculum-management/subjectAssignment/component/type';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
// eslint-disable-next-line import/extensions
import { Scrollbar } from 'src/components/scrollbar';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { getFileIconByType } from 'src/screens/academic/curriculum-management/subjectAssignment/component/viewDetailComponents/documentList';
import { useUpdateSubmissionFeedbackMutation } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/AssignmentAssessmentAndFeedbackApi';
import {
  Box,
  Grid,
  Card,
  Stack,
  Avatar,
  Button,
  Divider,
  Tooltip,
  TextField,
  Typography,
  IconButton,
  DialogActions,
} from '@mui/material';

import type { IAssignGradeProps } from '../../homeworkCreation/type';

export const document: IDocument = {
  id: 'doc-1',
  name: 'Lecture Notes.pdf',
  type: 'pdf',
  url: 'https://example.com/files/lecture-notes.pdf',
  size: '2.4 MB',
};

/**
 * Props for the AssignGrade component
 * @param data Optional data containing initial grade and feedback values
 * @param onSubmit Callback function to handle form submission with grade and feedback values
 */
const AssignGrade: React.FC<IAssignGradeProps> = ({ isEdit, data, onClose }: IAssignGradeProps) => {
  /**
   * Initialize formik form with grade and feedback fields
   * @param initialValues Object containing initial grade and feedback values from data prop
   * @param onSubmit Handler function that gets called when form is submitted
   */
  const [updateSubmissionFeedback, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateSubmissionFeedbackMutation,
  });
  const formik = useFormik({
    initialValues: {
      marks: typeof data?.marks === 'number' ? data.marks : '',
      totalMarks: typeof data?.totalMarks === 'number' ? data.totalMarks : 25,
      feedback: data?.feedback || '',
    },
    validationSchema: Yup.object({
      marks: Yup.number()
        .required('Obtained Marks is required')
        .max(Yup.ref('totalMarks'), 'Obtained Marks cannot exceed Total Marks'),
    }),
    onSubmit(values) {
      const isUpdate = typeof data?.marks === 'number' || Boolean(data?.feedback);
      updateSubmissionFeedback({
        assignmentId: data?.id, // Assuming data.assignmentId is available
        studentId: data?.studentName, // Assuming data.studentId is available
        body: {
          marks: values.marks,
          totalMarks: values.totalMarks,
          feedback: values.feedback,
        },
      });
      shikshaMitraToast.success({
        message: `Feedback and marks have been ${
          isUpdate ? 'updated' : 'added'
        } successfully for ${data?.studentName ?? 'the student'}.`,
      });
      onClose(null, true);
    },
  });

  const handleDownload = (doc: IDocument) => {
    window.open(doc.url, '_blank');
  };

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

              {/* Student Submission Section */}
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
                  <Box sx={{ p: 2 }}>
                    <Card
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        bgcolor: 'background.paper',
                        '&:hover': {
                          bgcolor: 'background.neutral',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {getFileIconByType(document.type ?? 'txt', 32)}
                        <Box>
                          <Typography variant="subtitle2" noWrap sx={{ maxWidth: 200 }}>
                            {document.name}
                          </Typography>
                          {document.size && (
                            <Typography variant="caption" color="text.secondary">
                              {document.size}
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      <Tooltip title="Preview">
                        <IconButton
                          size="small"
                          onClick={() => handleDownload(document)}
                          sx={{ color: 'text.secondary' }}
                        >
                          <Iconify icon={GlobalIcons.eye} width={20} />
                        </IconButton>
                      </Tooltip>
                    </Card>
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
                          disabled
                          size="small"
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
                          disabled={!isEdit}
                          inputProps={{ min: 0, max: formik.values.totalMarks }}
                          onKeyDown={(e) => {
                            if (['e', 'E', '+', '-', '.'].includes(e.key)) e.preventDefault();
                          }}
                          onChange={(e) => {
                            const { value } = e.target;
                            if (value === '') {
                              formik.setFieldValue('marks', '');
                              return;
                            }
                            const numericValue = parseInt(value, 10);
                            if (
                              !Number.isNaN(numericValue) &&
                              numericValue <= Number(formik.values.totalMarks)
                            ) {
                              formik.setFieldValue('marks', numericValue);
                            }
                          }}
                          size="small"
                          value={formik.values.marks}
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
            <LoadingButton
              variant="contained"
              loading={isUpdateLoading}
              size="small"
              onClick={(e: any) => formik.handleSubmit(e)}
              startIcon={
                <Iconify
                  icon={data?.marks ? GlobalIcons.edit : GlobalIcons.submit}
                  width={data?.marks ? 16 : 20}
                  height={data?.marks ? 16 : 20}
                />
              }
            >
              {data?.marks ? 'Update' : 'Submit'}
            </LoadingButton>
          </DialogActions>
        </Box>
      </BackPopUpChecked>
    </Box>
  );
};

export default AssignGrade;
