import type { LibraryPolicyVersion } from 'src/redux/library/policy-types';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useState } from 'react';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { DatePicker } from '@mui/x-date-pickers';
import { Alert, Stack, TextField } from '@mui/material';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ShakingTextField from 'src/components/shaking-text-field';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  usePublishLibraryPolicyMutation,
  useArchiveLibraryPolicyMutation,
} from 'src/redux/library/policies-api';

export function PolicyLifecycleDialog({
  item,
  action,
  onClose,
}: {
  item: LibraryPolicyVersion;
  action: 'publish' | 'archive';
  onClose: () => void;
}) {
  const [publish] = usePublishLibraryPolicyMutation();
  const [archive] = useArchiveLibraryPolicyMutation();
  const [error, setError] = useState('');
  const formik = useFormik({
    initialValues: { effectiveOn: '', reason: '' },
    validationSchema:
      action === 'archive'
        ? Yup.object({
            effectiveOn: Yup.string().required('Effective date is required'),
            reason: Yup.string().trim().required('Reason is required').max(500),
          })
        : undefined,
    onSubmit: async (values) => {
      setError('');
      try {
        const identity = { versionId: item.id, concurrencyStamp: item.concurrencyStamp };
        if (action === 'publish') await publish(identity).unwrap();
        else await archive({ ...identity, ...values }).unwrap();
        shikshaMitraToast.success({
          message:
            action === 'publish' ? 'Borrowing policy published.' : 'Borrowing policy archived.',
        });
        onClose();
      } catch (cause) {
        setError(
          parseApiProblemDetail(cause).detail || 'Could not change this policy. Please retry.'
        );
      }
    },
  });
  return (
    <ConfirmDialog
      open
      icon={action === 'publish' ? 'info' : 'warning'}
      title={action === 'publish' ? 'Publish Borrowing Policy?' : 'Archive Borrowing Policy?'}
      onClose={() => {
        if (!formik.isSubmitting) onClose();
      }}
      disableCancel={formik.isSubmitting}
      disableBackdropClick={formik.isSubmitting}
      disableEscapeKeyDown={formik.isSubmitting}
      content={
        <Stack spacing={2}>
          <span>
            {action === 'publish'
              ? `Publish “${item.name}” version ${item.version} for matching transactions in its effective date range? Existing loans keep their saved terms.`
              : `Stop “${item.name}” version ${item.version} from applying on and after the selected date? Earlier transactions keep their saved terms.`}
          </span>
          {error && <Alert severity="error">{error}</Alert>}
          {action === 'archive' && (
            <>
              <ShakingTextField
                error={Boolean(formik.touched.effectiveOn && formik.errors.effectiveOn)}
              >
                <DatePicker
                  label="Archive from"
                  value={formik.values.effectiveOn ? dayjs(formik.values.effectiveOn) : null}
                  disabled={formik.isSubmitting}
                  onChange={(value) =>
                    formik.setFieldValue(
                      'effectiveOn',
                      value?.isValid() ? value.format('YYYY-MM-DD') : ''
                    )
                  }
                  slotProps={{
                    textField: {
                      required: true,
                      fullWidth: true,
                      size: 'small',
                      name: 'effectiveOn',
                      onBlur: formik.handleBlur,
                      error: Boolean(formik.touched.effectiveOn && formik.errors.effectiveOn),
                      helperText: formik.touched.effectiveOn && formik.errors.effectiveOn,
                    },
                  }}
                />
              </ShakingTextField>
              <ShakingTextField error={Boolean(formik.touched.reason && formik.errors.reason)}>
                <TextField
                  label="Reason"
                  required
                  fullWidth
                  size="small"
                  multiline
                  minRows={2}
                  name="reason"
                  value={formik.values.reason}
                  disabled={formik.isSubmitting}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={Boolean(formik.touched.reason && formik.errors.reason)}
                  helperText={formik.touched.reason && formik.errors.reason}
                />
              </ShakingTextField>
            </>
          )}
        </Stack>
      }
      action={
        <LoadingButton
          size="small"
          variant="contained"
          color="inherit"
          loading={formik.isSubmitting}
          onClick={() => formik.submitForm()}
          startIcon={
            <Iconify icon={action === 'publish' ? GlobalIcons.publish : GlobalIcons.archive} />
          }
        >
          {action === 'publish' ? 'Publish' : 'Archive'}
        </LoadingButton>
      }
    />
  );
}
