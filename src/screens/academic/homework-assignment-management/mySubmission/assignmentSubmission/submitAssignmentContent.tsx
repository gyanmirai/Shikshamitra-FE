'use client';

import { useFormik } from 'formik';

import { Box, Button, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { assignmentContentValidationSchema } from '../validationSchema';

import type { IAssignmentSubmissiontFormProps } from '../type';

export const SubmitAssignmentContent = ({
  selectedAssignment,
  onClose,
}: IAssignmentSubmissiontFormProps) => {
  const formik = useFormik({
    initialValues: {
      content: selectedAssignment?.content || '',
    },
    validationSchema: assignmentContentValidationSchema,
    onSubmit: (values) => {
      // Handle content submission
      console.log('Submitting content:', values);
      onClose(values, true);
    },
  });

  return (
    <Box display="flex" flexDirection="column" gap={2} p={1}>
      <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
        <form onSubmit={formik.handleSubmit}>
          <Scrollbar sx={{ p: 2, height: '300px' }}>
            <Editor
              value={formik.values.content}
              onChange={(value) => formik.setFieldValue('content', value)}
              error={formik.touched.content && Boolean(formik.errors.content)}
              helperText={formik.touched.content && formik.errors.content}
              placeholder="Enter your assignment content here..."
            />
          </Scrollbar>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={() => onClose(null, false)}
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              type="submit"
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

export default SubmitAssignmentContent;
