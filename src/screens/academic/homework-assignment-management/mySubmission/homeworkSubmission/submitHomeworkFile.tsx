'use client';

import { useFormik } from 'formik';

import { Box, Button, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import UploadDocument from 'src/components/upload-document/uploadDocument';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { homeworkFileValidationSchema } from '../validationSchema';

import type { IHomeworkSubmissiontFormProps } from '../type';

export const SubmitHomeworkFile = ({
  selectedHomework,
  onClose,
}: IHomeworkSubmissiontFormProps) => {
  const formik = useFormik({
    initialValues: {
      submission: selectedHomework?.submission || [],
    },
    validationSchema: homeworkFileValidationSchema,
    onSubmit: (values) => {
      // Handle file submission
      console.log('Submitting files:', values);
      onClose(values, true);
    },
  });

  return (
    <Box display="flex" flexDirection="column" gap={2} p={1}>
      <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
        <form onSubmit={formik.handleSubmit}>
          <Scrollbar sx={{ p: 2, height: '300px' }}>
            <UploadDocument formik={formik} name="submission" title="" />
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
