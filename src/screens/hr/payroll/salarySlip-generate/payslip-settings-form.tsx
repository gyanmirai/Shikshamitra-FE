import type { PayslipSettings } from 'src/redux/hr/payslip-api';

import { useFormik } from 'formik';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import { useRef, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { instituteSetupPaths } from 'src/constants/institute-setup';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import {
  useGetPayslipSettingsQuery,
  useSavePayslipSettingsMutation,
  defaultSalaryDocumentPresentation,
} from 'src/redux/hr/payslip-api';
import {
  Box,
  Stack,
  Alert,
  Switch,
  Button,
  Divider,
  MenuItem,
  Skeleton,
  TextField,
  Typography,
  FormControlLabel,
} from '@mui/material';

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
  const [save, saving] = useSavePayslipSettingsMutation();
  const [error, setError] = useState<string | null>(null);
  const request = useRef<{ payload: string; key: string } | null>(null);
  const form = useFormik({
    initialValues: initial,
    onSubmit: async (values, helpers) => {
      const settings = {
        presentation: values.presentation,
        automaticEmail: values.automaticEmail,
        concurrencyStamp: values.concurrencyStamp,
      };
      const payload = JSON.stringify(settings);
      if (request.current?.payload !== payload)
        request.current = { payload, key: crypto.randomUUID() };
      setError(null);
      try {
        const saved = await save({ ...settings, idempotencyKey: request.current.key }).unwrap();
        baseline.current = saved;
        // A refresh observed before this write was acknowledged cannot supersede it.
        observedInitial.current = latestInitial.current;
        // The same protection applies if that already-started read arrives later.
        ignoredReadRequestId.current = latestReadRequestId.current;
        helpers.resetForm({ values: saved });
        request.current = null;
        shikshaMitraToast.success({ message: 'Payslip and statement settings saved.' });
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
      <Stack
        component="form"
        sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}
        onSubmit={form.handleSubmit}
        noValidate
      >
        <Stack spacing={2} sx={{ flex: 1, minHeight: 0, overflow: 'auto', pr: 0.5, pb: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <Box component="section" aria-labelledby="payroll-school-details">
            <Typography id="payroll-school-details" variant="subtitle2" sx={{ mb: 1 }}>
              School details
            </Typography>
            <Typography variant="body2">
              {initial.schoolName || 'School name not configured'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
              {initial.schoolAddress ||
                'Add your school address in Institute Setup before issuing documents.'}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              School name, address and logo come from Institute Setup. Already-issued documents keep
              their original details.
            </Typography>
            <Button
              component={RouterLink}
              href={instituteSetupPaths.schoolIdentity}
              size="small"
              sx={{ mt: 0.5 }}
            >
              Open Institute Setup
            </Button>
          </Box>
          <Divider />
          <Typography variant="subtitle2">Payslip appearance</Typography>
          <Box
            sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}
          >
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
          </Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' },
              columnGap: 2,
              '& .MuiFormControlLabel-root': { m: 0, minWidth: 0, minHeight: 44 },
            }}
          >
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
          <Divider />
          <Typography variant="subtitle2">Statements and register</Typography>
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
          <Divider />
          <Typography variant="subtitle2">Delivery</Typography>
          <FormControlLabel
            label="Email each employee after payroll finalization"
            sx={{ m: 0, minWidth: 0, minHeight: 44 }}
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
        </Stack>
        <Stack
          direction="row"
          spacing={1}
          justifyContent="flex-end"
          sx={{
            flexShrink: 0,
            bgcolor: 'background.paper',
            py: 1.5,
            borderTop: 1,
            borderColor: 'divider',
            zIndex: 1,
          }}
        >
          <Button
            size="small"
            disabled={!canEdit || saving.isLoading || !form.dirty}
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
            disabled={!canEdit || saving.isLoading || !form.dirty}
          >
            Save
          </Button>
        </Stack>
      </Stack>
      {guard.confirmation}
    </>
  );
}
