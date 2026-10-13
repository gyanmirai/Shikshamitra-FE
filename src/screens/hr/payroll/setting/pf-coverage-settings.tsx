'use client';

import type { RootState } from 'src/redux/store';

import { useRef } from 'react';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { Alert, Stack, Button, MenuItem, TextField, Typography } from '@mui/material';
import { useGetPfCoverageQuery, useSavePfCoverageMutation } from 'src/redux/hr/pf-coverage-api';

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
      if (!canEdit || !query.data) return;
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
  return (
    <Stack spacing={1} sx={{ mb: 2 }}>
      <Typography variant="subtitle2">School PF coverage</Typography>
      <Alert severity={current ? 'info' : 'warning'}>
        {current
          ? `School PF coverage: ${current.isCovered ? 'Covered' : 'Not covered'}. Effective ${current.effectiveMonth.slice(0, 7)}.`
          : 'School PF coverage needs review before new salary enrollment decisions can be saved.'}
      </Alert>
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
        <Stack component="form" onSubmit={form.handleSubmit} spacing={1}>
          {form.values.error && <Alert severity="error">{form.values.error}</Alert>}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <TextField
              label="PF coverage effective month"
              type="month"
              name="month"
              size="small"
              fullWidth
              value={form.values.month}
              onChange={form.handleChange}
              disabled={state.isLoading}
              error={form.touched.month && Boolean(form.errors.month)}
              helperText={form.touched.month && form.errors.month}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              label="School establishment coverage"
              select
              name="coverage"
              size="small"
              fullWidth
              value={form.values.coverage}
              onChange={form.handleChange}
              disabled={state.isLoading}
              error={form.touched.coverage && Boolean(form.errors.coverage)}
              helperText={form.touched.coverage && form.errors.coverage}
            >
              <MenuItem value="covered">Covered under PF</MenuItem>
              <MenuItem value="not-covered">Not covered under PF</MenuItem>
            </TextField>
          </Stack>
          <TextField
            label="PF coverage evidence reference"
            name="evidence"
            size="small"
            fullWidth
            value={form.values.evidence}
            onChange={form.handleChange}
            disabled={state.isLoading}
            error={form.touched.evidence && Boolean(form.errors.evidence)}
            helperText={form.touched.evidence && form.errors.evidence}
          />
          <Button size="small" variant="outlined" type="submit" disabled={state.isLoading}>
            Save PF coverage
          </Button>
        </Stack>
      )}
    </Stack>
  );
}
