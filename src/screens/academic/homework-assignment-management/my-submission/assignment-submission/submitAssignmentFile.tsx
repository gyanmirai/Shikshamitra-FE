'use client';

import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Button, DialogActions } from '@mui/material';
import UploadDocument from 'src/components/upload-document/uploadDocument';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { assignmentFileValidationSchema } from '../validationSchema';

import type { IAssignmentSubmissiontFormProps } from '../type';

export const SubmitAssignmentFile = ({
  selectedAssignment,
  onClose,
}: IAssignmentSubmissiontFormProps) => {
  const formik = useFormik({
    initialValues: {
      submission: selectedAssignment?.submission || '',
    },
    validationSchema: assignmentFileValidationSchema,
    onSubmit: (values) => {
      // Handle file submission

      onClose(values, true);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit}>
        <UploadDocument formik={formik} name="submission" title="Upload Assignment" />
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
  );
};
