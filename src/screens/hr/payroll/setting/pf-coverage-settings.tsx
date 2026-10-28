'use client';

import type { RootState } from 'src/redux/store';

import { useRef } from 'react';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { fDate } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useGetPfCoverageQuery, useSavePfCoverageMutation } from 'src/redux/hr/pf-coverage-api';
import { Box, Alert, Stack, Button, TextField, Typography, LinearProgress } from '@mui/material';

import { getLocalMonthKey } from '../structure/salary-structure-builder-utils';

export function PfCoverageSettings() {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canView = hasGrantedPermission(permissions, 'HR.PayrollManagement.Settings.PfRule.View');
  const query = useGetPfCoverageQuery(undefined, { skip: !canView });
  const [save, state] = useSavePfCoverageMutation();
  const request = useRef({ signature: '', key: '' });
  const canEdit =
    query.data?.hasSchoolWideScope &&
    hasGrantedPermission(permissions, 'HR.PayrollManagement.Settings.PfRule.Add');
  const form = useFormik({
    initialValues: { month: getLocalMonthKey(), coverage: '', evidence: '', error: '' },
    validate: (values) => ({
      ...(!/^\d{4}-(0[1-9]|1[0-2])$/.test(values.month)
        ? { month: 'Choose an effective month.' }
        : {}),
      ...(!values.coverage ? { coverage: 'Select school coverage.' } : {}),
      ...(!values.evidence.trim() || values.evidence.length > 1000
        ? { evidence: 'Add an evidence reference, up to 1000 characters.' }
        : {}),
    }),
    onSubmit: async (values) => {
      if (!canEdit || !query.data || query.isError || query.isFetching) return;
      const current = query.data.history.find(
        (item) => !item.isCancelled && item.effectiveMonth.slice(0, 7) <= values.month
      );
      const body = {
        effectiveMonth: `${values.month}-01T00:00:00.000Z`,
        isCovered: values.coverage === 'covered',
        evidenceReference: values.evidence.trim(),
        expectedConfigurationId: current?.id ?? null,
      };
      const signature = JSON.stringify(body);
      if (request.current.signature !== signature)
        request.current = { signature, key: crypto.randomUUID() };
      try {
        await save({ ...body, idempotencyKey: request.current.key }).unwrap();
        request.current = { signature: '', key: '' };
        form.resetForm();
        shikshaMitraToast.success({ message: 'School PF coverage saved.' });
      } catch (error) {
        form.setFieldValue('error', parseApiProblemDetail(error).detail);
      }
    },
  });
  if (!canView) return null;
  const current = query.data?.history.find(
    (item) => !item.isCancelled && item.effectiveMonth.slice(0, 7) <= getLocalMonthKey()
  );
  const loading = query.isLoading || query.isFetching;
  const busy = state.isLoading || form.isSubmitting;
  const disabled = busy || loading || query.isError;
  const missingCoverage = Boolean(query.data) && !loading && !query.isError && !current;
  const monthLabel = fDate(`${getLocalMonthKey()}-01`, 'MMMM YYYY');
  return (
    <FormSectionCard
      title="School PF Coverage"
      icon={GlobalIcons.building}
      descriptionTooltip="School coverage records whether the establishment is covered under PF. It is separate from the contribution rates in the PF rules below and is used for new staff PF enrollment decisions."
      titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
      action={
        current && !query.isError ? (
          <Label color={current.isCovered ? 'success' : 'default'}>
            {current.isCovered ? 'Covered under PF' : 'Not covered under PF'}
          </Label>
        ) : undefined
      }
      sx={{ mb: 1, minWidth: 0, flexShrink: 0 }}
    >
      {loading && <LinearProgress aria-label="Loading PF coverage" />}
      {current && !query.isError && (
        <Typography variant="body2" color="text.secondary" role="status">
          Effective from {fDate(current.effectiveMonth, 'MMMM YYYY')}.
        </Typography>
      )}
      {missingCoverage && (
        <Alert
          severity="warning"
          variant="outlined"
          sx={{
            bgcolor: 'background.paper',
            color: 'text.primary',
            borderColor: 'divider',
            '& .MuiAlert-icon': { color: 'text.secondary' },
          }}
        >
          No PF coverage record is effective for {monthLabel}.{' '}
          {canEdit
            ? 'Record school coverage below before saving new staff PF enrollment decisions.'
            : 'Ask a school administrator with school-wide access to record coverage before saving new staff PF enrollment decisions.'}
        </Alert>
      )}
      {query.isError && (
        <Alert
          severity="error"
          action={
            <Button size="small" onClick={() => query.refetch()}>
              Retry
            </Button>
          }
        >
          PF coverage could not be loaded.
        </Alert>
      )}
      {canEdit && (
        <Stack component="form" noValidate onSubmit={form.handleSubmit} spacing={2}>
          {form.values.error && <Alert severity="error">{form.values.error}</Alert>}
          <Box
            component="fieldset"
            disabled={disabled}
            inert={disabled}
            sx={{
              m: 0,
              p: 0,
              border: 0,
              minWidth: 0,
              display: 'grid',
              gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' },
              gap: 2,
            }}
          >
            <ShakingTextField error={Boolean(form.touched.month && form.errors.month)}>
              <TextField
                label="PF coverage effective month"
                type="month"
                name="month"
                size="small"
                fullWidth
                required
                value={form.values.month}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                disabled={disabled}
                error={form.touched.month && Boolean(form.errors.month)}
                helperText={form.touched.month && form.errors.month}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </ShakingTextField>
            <ShakingTextField error={Boolean(form.touched.coverage && form.errors.coverage)}>
              <CustomSelect
                label="School establishment coverage"
                name="coverage"
                size="small"
                fullWidth
                required
                value={form.values.coverage}
                onChange={(value) => form.setFieldValue('coverage', value)}
                onBlur={() => form.setFieldTouched('coverage', true)}
                disabled={disabled}
                error={Boolean(form.touched.coverage && form.errors.coverage)}
                helperText={form.touched.coverage ? form.errors.coverage : undefined}
                options={[
                  { value: 'covered', label: 'Covered under PF' },
                  { value: 'not-covered', label: 'Not covered under PF' },
                ]}
              />
            </ShakingTextField>
            <ShakingTextField
              error={Boolean(form.touched.evidence && form.errors.evidence)}
              sx={{ gridColumn: '1 / -1' }}
            >
              <TextField
                label="PF coverage evidence reference"
                name="evidence"
                size="small"
                fullWidth
                required
                value={form.values.evidence}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                disabled={disabled}
                error={form.touched.evidence && Boolean(form.errors.evidence)}
                helperText={form.touched.evidence && form.errors.evidence}
              />
            </ShakingTextField>
          </Box>
          <Stack direction="row" justifyContent="flex-end">
            <Button
              size="small"
              variant="contained"
              type="submit"
              disabled={disabled}
              loading={busy}
              startIcon={<Iconify icon={GlobalIcons.submit} width={18} />}
            >
              Save PF coverage
            </Button>
          </Stack>
        </Stack>
      )}
    </FormSectionCard>
  );
}
