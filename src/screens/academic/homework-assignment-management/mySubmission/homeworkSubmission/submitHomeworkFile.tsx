'use client';

import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Button, DialogActions } from '@mui/material';
import { shikshaMitraToast } from 'src/components/toast';
import UploadDocument from 'src/components/upload-document/uploadDocument';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { useUploadCurriculumFileMutation } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';
import { useUploadHomeworkSubmissionFileMutation } from 'src/redux/academicAPI/HomeworkAssignmentApi/AssessmentAndFeedbackApi/HomeworkAssessmentAndFeedbackApi';

import { homeworkFileValidationSchema } from '../validationSchema';

import type { IHomeworkSubmissiontFormProps } from '../type';

export const SubmitHomeworkFile = ({
  selectedHomework,
  onClose,
}: IHomeworkSubmissiontFormProps) => {
  const [uploadFile, { isLoading: isUploading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUploadCurriculumFileMutation,
  });
  const [submitHomeworkFile, { isLoading: isSubmitting }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUploadHomeworkSubmissionFileMutation,
  });

  const formik = useFormik({
    initialValues: {
      submission: selectedHomework?.submission || [],
    },
    validationSchema: homeworkFileValidationSchema,
    onSubmit: async (values) => {
      try {
        const document = Array.isArray(values.submission)
          ? values.submission[0]
          : values.submission;
        const file = document?.file;
        const studentId = (selectedHomework as any)?.studentId;
        const homeworkId = selectedHomework?.id || (selectedHomework as any)?.homeworkId;

        if (!file || !studentId || !homeworkId) {
          shikshaMitraToast.error({ message: 'Student, homework, and file are required.' });
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
        submitBody.append('HomeworkId', homeworkId);
        submitBody.append('FileName', uploadedFileName);
        submitBody.append('OriginalFileName', file.name);
        await submitHomeworkFile(submitBody).unwrap();
        shikshaMitraToast.success({ message: 'Homework submitted successfully.' });
        onClose(values, true);
      } catch (error: any) {
        shikshaMitraToast.error({
          message: error?.data?.message || 'Failed to submit homework file.',
        });
      }
    },
  });

  return (
    <Box display="flex" flexDirection="column" gap={1} p={1}>
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
              disabled={isUploading || isSubmitting}
            >
              Submit
            </Button>
          </DialogActions>
        </form>
      </BackPopUpChecked>
    </Box>
  );
};
