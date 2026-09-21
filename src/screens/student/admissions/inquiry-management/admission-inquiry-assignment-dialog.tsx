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
    initialValues: { counsellorId: inquiry?.assignedCounsellorId ?? '' },
    enableReinitialize: true,
    validationSchema: schema,
    onSubmit: async (values) => {
      if (!inquiry) return;
      try {
        await assignCounsellor({
          id: inquiry.id,
          body: { mode: 0, counsellorId: values.counsellorId, candidateCounsellorIds: [] },
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
      title="Assign counsellor"
      handleClose={onClose}
      disableClose={assignmentState.isLoading}
    >
      <DialogScrollContent onSubmit={() => formik.handleSubmit()}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Choose the counsellor responsible for {inquiry.applicantName}. Assignment is limited to
          active staff who can access this admission offering.
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
          startIcon={<Iconify icon="mdi:account-arrow-right-outline" />}
          onClick={() => formik.handleSubmit()}
        >
          Assign
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
  );
}
