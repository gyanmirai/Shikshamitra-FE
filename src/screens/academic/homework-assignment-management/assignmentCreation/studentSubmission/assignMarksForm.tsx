'use client';

import type { IDocument } from 'src/screens/academic/curriculum-management/subject/component/type';

import * as Yup from 'yup';
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
// eslint-disable-next-line import/extensions
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

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
  const formik = useFormik({
    initialValues: {
      marks: typeof data?.marks === 'number' ? data.marks : '',
      totalMarks: typeof data?.totalMarks === 'number' ? data.totalMarks : 25,
      feedback: data?.feedback || '',
    },
    validationSchema: Yup.object({
      marks: Yup.number()
        .required('Marks is required')
        .max(Yup.ref('totalMarks'), 'Marks cannot exceed Total Marks'),
    }),
    onSubmit(values) {
      shikshaMitraToast.success({
        message: `Feedback and marks have been ${data?.feedback ? 'updated' : 'added'} successfully for ${data?.studentName}.`,
      });
      onClose(null, true);
    },
  });

  const handleDownload = (doc: IDocument) => {
    // window.open(doc.url, '_blank');
  };

  return (
    <Box>
      <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
        {/* <form onSubmit={formik.handleSubmit}> */}
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
              <Card
                key={document.id}
                sx={{
                  p: 2,
                  mb: 2,
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
                    // onClick={() => handleDownload(document)}
                  >
                    <Iconify icon={GlobalIcons.eye} />
                  </IconButton>
                </Tooltip>
              </Card>
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
                  label="Obtained Marks *"
                  fullWidth
                  type="number"
                  name="marks"
                  disabled={!isEdit}
                  inputProps={{
                    min: 0,
                    max: formik.values.totalMarks,
                  }}
                  onKeyDown={(e) => {
                    if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    const { value } = e.target;

                    if (value === '') {
                      formik.setFieldValue('marks', '');
                      return;
                    }

                    const numericValue = parseInt(value, 10);

                    if (!Number.isNaN(numericValue) && numericValue <= formik.values.totalMarks) {
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
          </Button>
        </DialogActions>
        {/* </form> */}
      </BackPopUpChecked>
    </Box>
  );
};

export default AssignGrade;
