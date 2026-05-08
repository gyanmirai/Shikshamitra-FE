'use client';

import type { RootState } from 'src/redux/store';
import type { IDocument } from 'src/screens/academic/curriculum-management/subjectAssignment/component/type';

import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { getFileIconByType } from 'src/screens/academic/curriculum-management/subjectAssignment/component/viewDetailComponents/documentList';
import { useUpdateHomeworkSubmissionFeedbackMutation } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/HomeworkAssessmentAndFeedbackApi';
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

import { assignGradeValidationSchema } from './validationSchema';
import { document } from '../../assignmentCreation/studentSubmission/assignMarksForm';

import type { IAssignGradeProps } from '../type';

/**
 * Props for the AssignGrade component
 * @param data Optional data containing initial grade and feedback values
 * @param onSubmit Callback function to handle form submission with grade and feedback values
 */
const AssignGrade: React.FC<IAssignGradeProps> = ({
  isEdit,
  data,
  homeworkId,
  onClose,
}: IAssignGradeProps) => {
  const [updateSubmissionFeedback, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateHomeworkSubmissionFeedbackMutation,
  });
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  /**
   * Initialize formik form with grade and feedback fields
   * @param initialValues Object containing initial grade and feedback values from data prop
   * @param onSubmit Handler function that gets called when form is submitted
   */
  const formik = useFormik({
    initialValues: {
      totalMarks: data?.totalMarks || '',
      feedback: data?.feedback || '',
    },
    validationSchema: assignGradeValidationSchema,
    onSubmit(values) {
      const isUpdate = typeof data?.totalMarks === 'number' || Boolean(data?.feedback);
      updateSubmissionFeedback({
        homeworkId: homeworkId || data?.homeworkId,
        studentId: data?.studentId,
        academicMediumId: medium?.id,
        body: {
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

              {/* Description Section */}
              <Grid size={{ xs: 12 }}>
                <Card
                  variant="outlined"
                  sx={{ borderStyle: 'dashed', boxShadow: 'var(--shadows-10)' }}
                >
                  <Box sx={{ p: 2 }}>
                    <Stack direction="row" alignItems="center" gap={1} mb={2}>
                      <Iconify
                        icon="solar:notebook-minimalistic-bold"
                        width={20}
                        sx={{ color: 'text.secondary' }}
                      />
                      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                        Homework Description
                      </Typography>
                    </Stack>
                    <Typography
                      component="pre"
                      variant="body2"
                      sx={{
                        whiteSpace: 'pre-wrap',
                        m: 0,
                        fontFamily: 'inherit',
                        color: 'text.primary',
                        p: 2,
                        bgcolor: (theme) => theme.palette.background.neutral,
                        borderRadius: 1,
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
                </Card>
              </Grid>

              {/* Evaluation & Feedback Section */}
              <Grid size={{ xs: 12 }}>
                <Card sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
                  <Typography variant="h6" sx={{ mb: 3 }}>
                    Evaluation & Feedback
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <ShakingTextField
                        error={!!(formik.touched.totalMarks && formik.errors.totalMarks) || false}
                      >
                        <TextField
                          label="Total Marks *"
                          fullWidth
                          name="totalMarks"
                          type="number"
                          value={formik.values.totalMarks}
                          onChange={formik.handleChange}
                          error={formik.touched.totalMarks && Boolean(formik.errors.totalMarks)}
                          helperText={formik.touched.totalMarks && formik.errors.totalMarks}
                          disabled={!isEdit}
                        />
                      </ShakingTextField>
                    </Grid>

                    <Grid size={{ xs: 12, md: 8 }}>
                      <ShakingTextField
                        error={!!(formik.touched.feedback && formik.errors.feedback) || false}
                      >
                        <TextField
                          label="Feedback"
                          multiline
                          rows={3}
                          fullWidth
                          name="feedback"
                          value={formik.values.feedback}
                          onChange={formik.handleChange}
                          error={formik.touched.feedback && Boolean(formik.errors.feedback)}
                          helperText={formik.touched.feedback && formik.errors.feedback}
                          disabled={!isEdit}
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
              size="small"
              loading={isUpdateLoading}
              onClick={(e: any) => formik.handleSubmit(e)}
              startIcon={
                <Iconify
                  icon={data?.feedback ? GlobalIcons.edit : GlobalIcons.submit}
                  width={data?.feedback ? 16 : 20}
                  height={data?.feedback ? 16 : 20}
                />
              }
            >
              {data?.feedback ? 'Update' : 'Submit'}
            </LoadingButton>
          </DialogActions>
        </Box>
      </BackPopUpChecked>
    </Box>
  );
};

export default AssignGrade;
