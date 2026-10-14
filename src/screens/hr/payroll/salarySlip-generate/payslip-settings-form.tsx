import type { PayslipSettings } from 'src/redux/hr/payslip-api';

import { useFormik } from 'formik';
import { useRouter } from 'src/routes/hooks';
import { useRef, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import {
  Box,
  Stack,
  Alert,
  Switch,
  Button,
  MenuItem,
  Skeleton,
  TextField,
  Typography,
  FormControlLabel,
} from '@mui/material';
import {
  useGetPayslipSettingsQuery,
  useUploadPayslipLogoMutation,
  useSavePayslipSettingsMutation,
  defaultSalaryDocumentPresentation,
} from 'src/redux/hr/payslip-api';

import { payslipActionError } from './payslip-action-error';
import { salaryDocumentFields } from './salary-document-fields';

export default function PayslipSettingsForm({ canEdit }: { canEdit: boolean }) {
  const query = useGetPayslipSettingsQuery();
  if (query.data)
    return (
      <>
        {query.isError && (
          <Alert
            severity="error"
            action={
              <Button size="small" onClick={() => query.refetch()}>
                Retry
              </Button>
            }
          >
            Settings could not be refreshed. Your changes have been kept.
          </Alert>
        )}
        <SettingsForm
          initial={query.data}
          readRequestId={query.requestId}
          canApplyRead={!query.isFetching && !query.isError}
          canEdit={canEdit}
        />
      </>
    );
  if (query.isError)
    return (
      <Alert
        severity="error"
        action={
          <Button size="small" onClick={() => query.refetch()}>
            Retry
          </Button>
        }
      >
        Settings could not be loaded.
      </Alert>
    );
  return (
    <Stack spacing={1} aria-busy="true" aria-label="Loading payslip settings">
      <Skeleton variant="rounded" height={40} />
      <Skeleton variant="rounded" height={80} />
      <Skeleton width={220} height={36} />
      <Stack direction="row" justifyContent="flex-end" spacing={1}>
        <Button disabled size="small">
          Cancel
        </Button>
        <Button disabled size="small">
          Save
        </Button>
      </Stack>
    </Stack>
  );
}

function SettingsForm({
  initial,
  readRequestId,
  canApplyRead,
  canEdit,
}: {
  initial: PayslipSettings;
  readRequestId?: string;
  canApplyRead: boolean;
  canEdit: boolean;
}) {
  const router = useRouter();
  const baseline = useRef(initial);
  const observedInitial = useRef(initial);
  const latestInitial = useRef(initial);
  latestInitial.current = initial;
  const latestReadRequestId = useRef(readRequestId);
  latestReadRequestId.current = readRequestId;
  const ignoredReadRequestId = useRef<string | undefined>(undefined);
  const [uploadLogo, uploading] = useUploadPayslipLogoMutation();
  const [save, saving] = useSavePayslipSettingsMutation();
  const [error, setError] = useState<string | null>(null);
  const request = useRef<{ payload: string; key: string } | null>(null);
  const form = useFormik({
    initialValues: initial,
    validate: (values) => ({
      ...(!values.schoolName.trim() ? { schoolName: 'Enter the school name.' } : {}),
      ...(!values.schoolAddress.trim() ? { schoolAddress: 'Enter the school address.' } : {}),
    }),
    onSubmit: async (values, helpers) => {
      const payload = JSON.stringify(values);
      if (request.current?.payload !== payload)
        request.current = { payload, key: crypto.randomUUID() };
      setError(null);
      try {
        const saved = await save({ ...values, idempotencyKey: request.current.key }).unwrap();
        baseline.current = saved;
        // A refresh observed before this write was acknowledged cannot supersede it.
        observedInitial.current = latestInitial.current;
        // The same protection applies if that already-started read arrives later.
        ignoredReadRequestId.current = latestReadRequestId.current;
        helpers.resetForm({ values: saved });
        request.current = null;
        shikshaMitraToast.success({ message: 'Payslip settings saved.' });
      } catch (failure) {
        setError(payslipActionError(failure, 'Settings could not be saved. Try again.'));
      }
    },
  });
  const presentation = form.values.presentation ?? defaultSalaryDocumentPresentation;
  const updatePresentation = (key: keyof typeof presentation, value: unknown) =>
    form.setFieldValue('presentation', { ...presentation, [key]: value });
  const { dirty, isSubmitting, resetForm } = form;
  useEffect(() => {
    if (isSubmitting || !canApplyRead || observedInitial.current === initial) return;
    observedInitial.current = initial;
    if (readRequestId && readRequestId === ignoredReadRequestId.current) return;
    baseline.current = initial;
    if (!dirty) resetForm({ values: initial });
  }, [initial, readRequestId, canApplyRead, dirty, isSubmitting, resetForm]);
  const guard = useUnsavedNavigation(form.dirty, { push: router.push });
  return (
    <>
      <Stack component="form" spacing={1} onSubmit={form.handleSubmit} noValidate>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="School name"
          name="schoolName"
          value={form.values.schoolName}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          size="small"
          fullWidth
          disabled={!canEdit || saving.isLoading}
          error={!!form.touched.schoolName && !!form.errors.schoolName}
          helperText={form.touched.schoolName && form.errors.schoolName}
          slotProps={{ htmlInput: { maxLength: 250 } }}
        />
        <TextField
          label="School address"
          name="schoolAddress"
          value={form.values.schoolAddress}
          onChange={form.handleChange}
          onBlur={form.handleBlur}
          size="small"
          fullWidth
          multiline
          minRows={2}
          disabled={!canEdit || saving.isLoading}
          error={!!form.touched.schoolAddress && !!form.errors.schoolAddress}
          helperText={form.touched.schoolAddress && form.errors.schoolAddress}
          slotProps={{ htmlInput: { maxLength: 1000 } }}
        />
        <Typography variant="subtitle2">Document presentation</Typography>
        <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
          <TextField
            select
            size="small"
            label="Layout"
            value={presentation.layout}
            disabled={!canEdit || saving.isLoading}
            onChange={(event) => updatePresentation('layout', event.target.value)}
          >
            <MenuItem value="Compact">Compact</MenuItem>
            <MenuItem value="Detailed">Detailed</MenuItem>
          </TextField>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Button
              component="label"
              variant="outlined"
              size="small"
              disabled={!canEdit || saving.isLoading || uploading.isLoading}
            >
              {uploading.isLoading
                ? 'Uploading logo'
                : presentation.logoBlobName
                  ? 'Replace logo'
                  : 'Upload school logo'}
              <input
                hidden
                type="file"
                accept="image/png,image/jpeg"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  event.target.value = '';
                  if (!file) return;
                  if (file.size > 2097152) {
                    setError('Use a PNG or JPEG logo under 2 MB.');
                    return;
                  }
                  try {
                    const result = await uploadLogo(file).unwrap();
                    updatePresentation('logoBlobName', result.blobName);
                    setError(null);
                  } catch (failure) {
                    setError(payslipActionError(failure, 'The logo could not be uploaded.'));
                  }
                }}
              />
            </Button>
            {presentation.logoBlobName && (
              <Button
                size="small"
                disabled={!canEdit || saving.isLoading}
                onClick={() => updatePresentation('logoBlobName', null)}
              >
                Remove
              </Button>
            )}
          </Stack>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
          {(
            [
              ['showStaffDetails', 'Staff details'],
              ['showBankDetails', 'Bank details'],
              ['showAttendance', 'Attendance and leave'],
              ['showEarningsBreakdown', 'Earnings breakdown'],
              ['showZeroDeductions', 'Zero-value deductions'],
            ] as const
          ).map(([key, label]) => (
            <FormControlLabel
              key={key}
              label={label}
              control={
                <Switch
                  size="small"
                  checked={presentation[key]}
                  disabled={!canEdit || saving.isLoading}
                  onChange={(_, checked) => updatePresentation(key, checked)}
                />
              }
            />
          ))}
        </Box>
        <Typography variant="caption" color="text.secondary">
          Employee identity, period, totals, and every nonzero deduction always appear. Changes
          apply to newly issued documents.
        </Typography>
        {(
          [
            ['statementColumns', 'Employee statement columns'],
            ['registerColumns', 'School register columns'],
          ] as const
        ).map(([key, label]) => (
          <TextField
            key={key}
            select
            size="small"
            label={label}
            value={presentation[key]}
            disabled={!canEdit || saving.isLoading}
            SelectProps={{ multiple: true }}
            onChange={(event) =>
              updatePresentation(
                key,
                typeof event.target.value === 'string'
                  ? event.target.value.split(',')
                  : event.target.value
              )
            }
            helperText="An empty selection uses the standard columns. Identity and totals remain included."
          >
            {salaryDocumentFields.map(([id, name]) => (
              <MenuItem key={id} value={id}>
                {name}
              </MenuItem>
            ))}
          </TextField>
        ))}
        <FormControlLabel
          label="Email each employee after payroll finalization"
          control={
            <Switch
              size="small"
              name="automaticEmail"
              checked={form.values.automaticEmail}
              onChange={form.handleChange}
              disabled={!canEdit || saving.isLoading}
            />
          }
        />
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button
            size="small"
            disabled={!canEdit || saving.isLoading || uploading.isLoading || !form.dirty}
            onClick={() =>
              guard.requestNavigation(() => {
                form.resetForm({ values: baseline.current });
                request.current = null;
                setError(null);
              })
            }
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            size="small"
            disabled={!canEdit || saving.isLoading || uploading.isLoading || !form.dirty}
          >
            Save
          </Button>
        </Stack>
      </Stack>
      {guard.confirmation}
    </>
  );
}
