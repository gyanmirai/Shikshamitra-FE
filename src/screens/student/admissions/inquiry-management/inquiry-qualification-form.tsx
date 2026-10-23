import type { AdmissionInquiry } from 'src/redux/student/admissions/admission-inquiries-api';
import type { AdmissionInquiryManagement } from 'src/redux/student/admissions/admission-inquiry-management-api';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { Stack, TextField, Typography } from '@mui/material';
import { LoadingButton } from 'src/components/loading-button';
import { StudentFeedback } from 'src/components/student-feedback';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useUpdateAdmissionInquiryMutation } from 'src/redux/student/admissions/admission-inquiries-api';

import { INQUIRY_STATUS_OPTIONS, normalizeInquiryStatus } from './admission-inquiry-list-options';

export function InquiryQualificationForm({
  value,
  inquiry,
}: {
  value: AdmissionInquiryManagement;
  inquiry: AdmissionInquiry;
}) {
  const [update, updateState] = useUpdateAdmissionInquiryMutation();
  const originalStatus = normalizeInquiryStatus(inquiry.status);
  const formik = useFormik({
    initialValues: { status: originalStatus, reason: '' },
    enableReinitialize: true,
    validationSchema: Yup.object({
      status: Yup.number().oneOf([0, 2, 6]).required(),
      reason: Yup.string()
        .max(1024)
        .when('status', {
          is: (status: number) => status === 6 || (status === 0 && originalStatus !== 0),
          then: (schema) => schema.trim().required('Enter a reason for this status change'),
        }),
    }),
    onSubmit: async ({ status, reason }, helpers) => {
      if (value.isLocked) return;
      try {
        await update({
          id: inquiry.id,
          body: {
            applicantName: inquiry.applicantName,
            phone: inquiry.normalizedPhone,
            email: inquiry.email,
            preferredLanguageCode: inquiry.preferredLanguageCode,
            source: inquiry.source,
            sourceDetail: inquiry.sourceDetail,
            concurrencyStamp: inquiry.concurrencyStamp,
            status,
            statusReason: reason.trim(),
          },
        }).unwrap();
        helpers.resetForm();
        shikshaMitraToast.success({ message: 'Inquiry status updated.' });
      } catch (error) {
        const problem = parseApiProblemDetail(error);
        const concurrencyConflict =
          problem.errorCode?.replace(/\./g, ':') === 'Admissions:Inquiry:ConcurrencyConflict';
        const genericMessage = [
          'one or more business rules were violated',
          'one or more validation errors occurred',
          'something went wrong',
        ].includes(
          problem.detail
            .trim()
            .toLowerCase()
            .replace(/[.!]+$/, '')
        );
        shikshaMitraToast.error({
          message: concurrencyConflict
            ? 'This inquiry changed after it was loaded. Refresh the inquiry and try saving the status again.'
            : genericMessage || !problem.detail
              ? 'Unable to update inquiry status. Refresh the inquiry and try again.'
              : problem.detail,
        });
      }
    },
  });
  return (
    <Stack spacing={1.5} component="section" aria-label="Inquiry status">
      <Typography variant="subtitle1" component="h2">
        Inquiry status
      </Typography>
      <CustomSelect
        fullWidth
        size="small"
        label="Status"
        disabled={updateState.isLoading || value.isLocked}
        value={formik.values.status}
        options={INQUIRY_STATUS_OPTIONS}
        onChange={(next) => formik.setFieldValue('status', Number(next))}
      />
      <TextField
        fullWidth
        multiline
        minRows={2}
        size="small"
        label={
          formik.values.status === 6 || (formik.values.status === 0 && originalStatus !== 0)
            ? 'Status change reason *'
            : 'Status change note'
        }
        name="reason"
        disabled={updateState.isLoading || value.isLocked}
        value={formik.values.reason}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={Boolean(formik.touched.reason && formik.errors.reason)}
        helperText={formik.touched.reason && formik.errors.reason}
        slotProps={{ htmlInput: { maxLength: 1024 } }}
      />
      {formik.values.status === 2 && originalStatus !== 2 && (
        <StudentFeedback notificationKey="STU-0429" presentation="inline" severity="info">
          Confirm the family wants to continue. A qualification email is queued on the first
          Interested transition when a valid contact email is available. Move to next stage
          separately when ready.
        </StudentFeedback>
      )}
      <LoadingButton
        size="small"
        variant="contained"
        loading={updateState.isLoading}
        disabled={formik.values.status === originalStatus || value.isLocked}
        onClick={() => formik.handleSubmit()}
      >
        Save status
      </LoadingButton>
    </Stack>
  );
}
