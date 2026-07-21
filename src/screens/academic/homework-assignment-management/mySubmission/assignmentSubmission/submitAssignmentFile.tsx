'use client';

import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Button, DialogActions } from '@mui/material';
import { shikshaMitraToast } from 'src/components/toast';
import UploadDocument from 'src/components/upload-document/uploadDocument';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { useUploadCurriculumFileMutation } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';
import { useUploadAssignmentSubmissionFileMutation } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/AssignmentAssessmentAndFeedbackApi';

import { assignmentFileValidationSchema } from '../validationSchema';

import type { IAssignmentSubmissiontFormProps } from '../type';

export const SubmitAssignmentFile = ({
  selectedAssignment,
  onClose,
}: IAssignmentSubmissiontFormProps) => {
  const [uploadFile, { isLoading: isUploading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUploadCurriculumFileMutation,
  });
  const [submitAssignmentFile, { isLoading: isSubmitting }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUploadAssignmentSubmissionFileMutation,
  });

  const formik = useFormik({
    initialValues: {
      submission: selectedAssignment?.submission || [],
    },
    validationSchema: assignmentFileValidationSchema,
    onSubmit: async (values) => {
      try {
        const document = Array.isArray(values.submission)
          ? values.submission[0]
          : values.submission;
        const file = document?.file;
        const studentId = (selectedAssignment as any)?.studentId;
        const assignmentId = selectedAssignment?.id || (selectedAssignment as any)?.assignmentId;

        if (!file || !studentId || !assignmentId) {
          shikshaMitraToast.error({ message: 'Student, assignment, and file are required.' });
          return;
        }

        const uploadBody = new FormData();
        uploadBody.append('File', file);
        const uploadResponse = await uploadFile(uploadBody).unwrap();
        const uploadedFileName = uploadResponse?.data;

        if (!uploadedFileName) {
          shikshaMitraToast.error({ message: 'File upload failed.' });
          return;
        }

        const submitBody = new FormData();
        submitBody.append('StudentId', studentId);
        submitBody.append('AssignmentId', assignmentId);
        submitBody.append('FileName', uploadedFileName);
        submitBody.append('OriginalFileName', file.name);
        await submitAssignmentFile(submitBody).unwrap();
        shikshaMitraToast.success({ message: 'Assignment submitted successfully.' });
        onClose(values, true);
      } catch (error: any) {
        shikshaMitraToast.error({
          message: error?.data?.message || 'Failed to submit assignment file.',
        });
      }
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
            disabled={isUploading || isSubmitting}
          >
            Submit
          </Button>
        </DialogActions>
      </form>
    </BackPopUpChecked>
  );
};
