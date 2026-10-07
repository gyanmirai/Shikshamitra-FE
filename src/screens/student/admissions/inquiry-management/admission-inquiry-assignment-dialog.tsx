'use client';

import type {
  AdmissionInquiry,
  AdmissionInquiryCounsellor,
} from 'src/redux/student/admissions/admission-inquiries-api';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import ShakingTextField from 'src/components/shaking-text-field';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Button, MenuItem, TextField, Typography, DialogActions } from '@mui/material';
import { useAssignAdmissionInquiryCounsellorMutation } from 'src/redux/student/admissions/admission-inquiries-api';

import { formatAdmissionReference } from '../admission-reference';

type Props = {
  inquiry: AdmissionInquiry | null;
  counsellors: AdmissionInquiryCounsellor[];
  counsellorsLoading: boolean;
  counsellorsError: boolean;
  onClose: () => void;
};

const schema = Yup.object({
  counsellorId: Yup.string().required('Choose a counsellor'),
  reason: Yup.string().trim().required('Enter a reason for changing counsellor').max(1024),
});

export function AdmissionInquiryAssignmentDialog({
  inquiry,
  counsellors,
  counsellorsLoading,
  counsellorsError,
  onClose,
}: Props) {
  const [assignCounsellor, assignmentState] = useAssignAdmissionInquiryCounsellorMutation();
  const formik = useFormik({
    initialValues: { counsellorId: inquiry?.assignedCounsellorId ?? '', reason: '' },
    enableReinitialize: true,
    validationSchema: schema,
    onSubmit: async (values) => {
      if (!inquiry) return;
      try {
        await assignCounsellor({
          id: inquiry.id,
          body: {
            mode: 0,
            counsellorId: values.counsellorId,
            candidateCounsellorIds: [],
            reason: values.reason.trim(),
          },
        }).unwrap();
        shikshaMitraToast.success({
          message: `${formatAdmissionReference(inquiry.inquiryNumber)} was assigned successfully.`,
        });
        onClose();
      } catch (error) {
        const problem = parseApiProblemDetail(error);
        shikshaMitraToast.error({
          message:
            problem.detail || 'Unable to assign this inquiry. Check the counsellor and try again.',
        });
      }
    },
  });

  if (!inquiry) return null;

  return (
    <CustomDialog
      open
      maxWidth="xs"
      title="Change counsellor"
      handleClose={onClose}
      disableClose={assignmentState.isLoading}
    >
      <DialogScrollContent onSubmit={() => formik.handleSubmit()}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Transfer {inquiry.applicantName} to an eligible counsellor in the configured intake pool.
          Capacity is checked before saving; scheduled follow-ups move with ownership.
        </Typography>
        <ShakingTextField
          error={Boolean(formik.touched.counsellorId && formik.errors.counsellorId)}
        >
          <TextField
            select
            fullWidth
            required
            size="small"
            name="counsellorId"
            label="Counsellor"
            value={formik.values.counsellorId}
            disabled={counsellorsLoading || counsellorsError}
            error={Boolean(formik.touched.counsellorId && formik.errors.counsellorId)}
            helperText={
              counsellorsError
                ? 'Unable to load eligible counsellors. Close and reopen this dialog to retry.'
                : counsellorsLoading
                  ? 'Loading eligible counsellors…'
                  : formik.touched.counsellorId && formik.errors.counsellorId
            }
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
          >
            {counsellors.map((counsellor) => (
              <MenuItem key={counsellor.id} value={counsellor.id}>
                {counsellor.name || counsellor.userName}
              </MenuItem>
            ))}
          </TextField>
        </ShakingTextField>
        <TextField
          fullWidth
          required
          multiline
          minRows={2}
          size="small"
          name="reason"
          label="Transfer reason"
          value={formik.values.reason}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          sx={{ mt: 2 }}
          error={Boolean(formik.touched.reason && formik.errors.reason)}
          helperText={formik.touched.reason && formik.errors.reason}
          slotProps={{ htmlInput: { maxLength: 1024 } }}
        />
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button
          size="small"
          variant="outlined"
          disabled={assignmentState.isLoading}
          startIcon={<Iconify icon="mdi:close" />}
          onClick={onClose}
        >
          Cancel
        </Button>
        <LoadingButton
          type="submit"
          size="small"
          variant="contained"
          loading={assignmentState.isLoading}
          disabled={
            counsellorsLoading ||
            counsellorsError ||
            !counsellors.length ||
            formik.values.counsellorId === inquiry.assignedCounsellorId
          }
          startIcon={<Iconify icon="mdi:account-arrow-right-outline" />}
          onClick={() => formik.handleSubmit()}
        >
          Change counsellor
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
  );
}
