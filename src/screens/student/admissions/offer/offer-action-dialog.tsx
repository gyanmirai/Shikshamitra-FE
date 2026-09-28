import type { AdmissionOfferStage } from 'src/redux/student/admissions/admission-offer-types';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { Iconify } from 'src/components/iconify';
import { DateTimePicker } from '@mui/x-date-pickers';
import { LoadingButton } from 'src/components/loading-button';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import {
  Alert,
  Stack,
  Button,
  Checkbox,
  TextField,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { ReviewDialog } from '../review/review-dialog';

export type OfferAction = 'issue' | 'accept' | 'decline' | 'extend' | 'withdraw' | 'reissue' | null;
export type OfferActionValue = {
  expiresAt: string;
  reason: string;
  confirmTerms: boolean;
  confirmConditions: boolean;
};
type Props = {
  action: OfferAction;
  state: AdmissionOfferStage;
  busy: boolean;
  onClose: () => void;
  onSubmit: (value: OfferActionValue) => Promise<void>;
};
const TITLES = {
  issue: 'Issue offer',
  accept: 'Accept offer',
  decline: 'Decline offer',
  extend: 'Extend offer',
  withdraw: 'Withdraw offer',
  reissue: 'Reissue offer',
};

export function OfferActionDialog({ action, state, busy, onClose, onSubmit }: Props) {
  if (!action) return null;
  return (
    <OfferActionForm
      key={action}
      action={action}
      state={state}
      busy={busy}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}

function OfferActionForm({
  action,
  state,
  busy,
  onClose,
  onSubmit,
}: Props & { action: Exclude<OfferAction, null> }) {
  const expiryAction = action === 'issue' || action === 'extend' || action === 'reissue';
  const reasonRequired =
    action === 'withdraw' || (action === 'decline' && state.policy?.requireDeclineReason);
  const formik = useFormik<OfferActionValue>({
    initialValues: {
      expiresAt: dayjs()
        .add(state.policy?.validityDays ?? 14, 'day')
        .toISOString(),
      reason: '',
      confirmTerms: false,
      confirmConditions: false,
    },
    validationSchema: Yup.object({
      expiresAt: Yup.string().test(
        'future-expiry',
        'Choose a future offer expiry.',
        (value) =>
          !expiryAction || Boolean(value && dayjs(value).isValid() && dayjs(value).isAfter(dayjs()))
      ),
      reason: Yup.string()
        .trim()
        .max(512, 'Use 512 characters or fewer.')
        .test(
          'required-reason',
          'Enter a reason.',
          (value) => !reasonRequired || Boolean(value?.trim())
        ),
      confirmTerms: Yup.boolean().test(
        'terms',
        'Confirm acceptance of terms.',
        (value) => action !== 'accept' || !state.policy?.requireTermsAcceptance || Boolean(value)
      ),
      confirmConditions: Yup.boolean().test(
        'conditions',
        'Confirm the conditions.',
        (value) =>
          action !== 'accept' || !state.policy?.requireConditionsConfirmation || Boolean(value)
      ),
    }),
    onSubmit: async (values) => {
      await onSubmit({ ...values, reason: values.reason.trim() });
    },
  });
  const submitting = busy || formik.isSubmitting;

  return (
    <ReviewDialog
      open
      title={TITLES[action]}
      dirty={formik.dirty}
      busy={submitting}
      onClose={onClose}
      actions={(requestClose) => (
        <DialogActions sx={{ p: 2 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="mdi:close" />}
            disabled={submitting}
            onClick={requestClose}
          >
            Cancel
          </Button>
          <LoadingButton
            size="small"
            variant="contained"
            color={action === 'decline' || action === 'withdraw' ? 'warning' : 'primary'}
            startIcon={<Iconify icon="mdi:check-circle-outline" />}
            loading={submitting}
            onClick={() => formik.handleSubmit()}
          >
            {TITLES[action]}
          </LoadingButton>
        </DialogActions>
      )}
    >
      <DialogScrollContent onSubmit={() => formik.handleSubmit()}>
        <Stack spacing={2}>
          <Alert severity="info">
            {action === 'accept'
              ? 'Record this response only after confirming it with the applicant or guardian.'
              : 'This action will be recorded in the admission offer history.'}
          </Alert>
          {expiryAction && (
            <ShakingTextField error={Boolean(formik.touched.expiresAt && formik.errors.expiresAt)}>
              <DateTimePicker
                label="Offer expiry"
                value={formik.values.expiresAt ? dayjs(formik.values.expiresAt) : null}
                minDateTime={dayjs()}
                onChange={(value) =>
                  formik.setFieldValue('expiresAt', value?.isValid() ? value.toISOString() : '')
                }
                disabled={action === 'issue' && state.policy?.allowExpiryOverride === false}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    required: true,
                    onBlur: () => formik.setFieldTouched('expiresAt', true),
                    error: Boolean(formik.touched.expiresAt && formik.errors.expiresAt),
                    helperText: formik.touched.expiresAt && formik.errors.expiresAt,
                  },
                }}
              />
            </ShakingTextField>
          )}
          {action === 'accept' && state.policy?.requireTermsAcceptance && (
            <FormControlLabel
              label="I confirm the offer terms were accepted"
              control={
                <Checkbox
                  checked={formik.values.confirmTerms}
                  onChange={(_, checked) => formik.setFieldValue('confirmTerms', checked)}
                />
              }
            />
          )}
          {action === 'accept' && state.policy?.requireConditionsConfirmation && (
            <FormControlLabel
              label="I confirm the offer conditions were satisfied"
              control={
                <Checkbox
                  checked={formik.values.confirmConditions}
                  onChange={(_, checked) => formik.setFieldValue('confirmConditions', checked)}
                />
              }
            />
          )}
          <ShakingTextField error={Boolean(formik.touched.reason && formik.errors.reason)}>
            <TextField
              fullWidth
              size="small"
              multiline
              minRows={2}
              label={reasonRequired ? 'Reason *' : 'Note'}
              {...formik.getFieldProps('reason')}
              error={Boolean(formik.touched.reason && formik.errors.reason)}
              helperText={formik.touched.reason && formik.errors.reason}
            />
          </ShakingTextField>
        </Stack>
      </DialogScrollContent>
    </ReviewDialog>
  );
}
