'use client';

import type { IDocument } from 'src/screens/academic/curriculum-management/subject/component/type';

import { useFormik } from 'formik';

import {
  Box,
  Grid,
  Card,
  Button,
  Tooltip,
  TextField,
  Typography,
  IconButton,
  DialogActions,
} from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { getFileIconByType } from 'src/screens/academic/curriculum-management/subject/component/viewDetailComponents/documentList';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { assignGradeValidationSchema } from './validationSchema';
import { document } from '../../assignmentCreation/studentSubmission/assignMarksForm';

import type { IAssignGradeProps } from '../type';

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
  const formik = useFormik({
    initialValues: {
      totalMarks: data?.totalMarks || '',
      feedback: data?.feedback || '',
    },
    validationSchema: assignGradeValidationSchema,
    onSubmit(values) {},
  });

  const handleDownload = (doc: IDocument) => {
    window.open(doc.url, '_blank');
  };

  return (
    <Box>
      <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
        <form onSubmit={formik.handleSubmit}>
          <Scrollbar sx={{ p: 2, height: '500px' }}>
            <Grid container spacing={3}>
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
              <Grid item xs={12} mb={-2}>
                <Typography variant="subtitle2">Student Submission</Typography>
              </Grid>
              <Grid item xs={12}>
                <Card
                  key={document.id}
                  sx={{
                    p: 2,

                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {getFileIconByType(document.type ?? 'txt', 32)}
                    <Box>
                      <Typography variant="subtitle2">{document.name}</Typography>
                      {document.size && (
                        <Typography variant="body2" color="text.secondary">
                          {document.size}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Tooltip title="Preview">
                    <IconButton
                      edge="end"
                      aria-label="preview"
                      onClick={() => handleDownload(document)}
                    >
                      <Iconify icon={GlobalIcons.eye} />
                    </IconButton>
                  </Tooltip>
                </Card>
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

export default AssignGrade;
