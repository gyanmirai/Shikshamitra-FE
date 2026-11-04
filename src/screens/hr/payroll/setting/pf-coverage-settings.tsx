'use client';

import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import SubmitButton from 'src/components/submit-button';
import { shikshaMitraToast } from 'src/components/toast';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ShakingTextField from 'src/components/shaking-text-field';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { HrNotice, HrLoadingNotice } from 'src/screens/hr/components/hr-notice';
import { FormSectionCard, FormFieldSpacing } from 'src/components/form-section-card';
import { useGetPfCoverageQuery, useSavePfCoverageMutation } from 'src/redux/hr/pf-coverage-api';
import {
  Alert,
  Stack,
  Button,
  MenuItem,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';
import {
  SetupEditorBody,
  SetupEditorActions,
  useHrSetupEditorState,
  SetupInlineCustomDialog,
} from 'src/screens/hr/setup/hr-setup-editor-context';

import { getLocalMonthKey } from '../structure/salary-structure-builder-utils';

export function PfCoverageSettings({ onSaved }: { onSaved?: () => void } = {}) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canView = hasGrantedPermission(permissions, 'HR.PayrollManagement.Settings.PfRule.View');
  const query = useGetPfCoverageQuery(undefined, { skip: !canView });
  const [save, state] = useSavePfCoverageMutation();
  const [editing, setEditing] = useState(false);
  const [discard, setDiscard] = useState(false);
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
      if (!canEdit || !query.data || query.isFetching || query.isError || state.isLoading) return;
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
        setEditing(false);
        shikshaMitraToast.success({ message: 'School PF coverage saved.' });
        onSaved?.();
      } catch (error) {
        form.setFieldValue('error', parseApiProblemDetail(error).detail);
      }
    },
  });
  const current = query.data?.history.find(
    (item) => !item.isCancelled && item.effectiveMonth.slice(0, 7) <= getLocalMonthKey()
  );
  const loading = query.isLoading || !query.data;
  const busy = state.isLoading || form.isSubmitting;
  const unavailable = query.isFetching || query.isError;
  const embedded = useHrSetupEditorState({
    dirty: form.dirty,
    busy,
    save: canView && canEdit ? form.submitForm : null,
    disabled: loading || unavailable,
  });
  if (!canView) return null;
  const close = () => {
    if (busy) return;
    if (form.dirty) {
      setDiscard(true);
      return;
    }
    form.resetForm();
    setEditing(false);
  };
  const errorFor = (field: 'month' | 'coverage' | 'evidence') =>
    Boolean((form.touched[field] || form.submitCount > 0) && form.errors[field]);
  return (
    <Stack spacing={1.5} sx={{ mb: 2, flexShrink: 0 }}>
      {query.isError ? (
        <Alert
          severity="error"
          action={
            <Button size="small" onClick={() => query.refetch()} disabled={query.isFetching}>
              Retry
            </Button>
          }
        >
          PF coverage could not be loaded. Retry to check the school configuration.
        </Alert>
      ) : loading ? (
        <HrLoadingNotice>Loading school PF coverage...</HrLoadingNotice>
      ) : (
        <>
          {(!embedded || !canEdit) && (
            <HrNotice
              severity="info"
              role={current ? 'status' : 'alert'}
              action={
                canEdit && !embedded ? (
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={query.isFetching}
                    onClick={() => setEditing(true)}
                  >
                    {current ? 'Configure coverage' : 'Set up PF coverage'}
                  </Button>
                ) : undefined
              }
            >
              <Stack spacing={0.5}>
                <Typography variant="subtitle2">School PF Coverage</Typography>
                <Typography variant="body2">
                  {current
                    ? `${current.isCovered ? 'Covered under PF' : 'Not covered under PF'}. Effective ${current.effectiveMonth.slice(0, 7)}.`
                    : 'PF coverage is not configured for the current month. Complete coverage setup before saving new salary enrollment decisions.'}
                </Typography>
                {!current && !canEdit && (
                  <Typography variant="body2">
                    Ask an authorized school-wide HR administrator to complete PF coverage setup.
                  </Typography>
                )}
              </Stack>
            </HrNotice>
          )}
          {query.isFetching && <HrLoadingNotice>Refreshing school PF coverage...</HrLoadingNotice>}
        </>
      )}
      {canEdit && (
        <SetupInlineCustomDialog
          open={embedded || editing}
          title={embedded ? null : 'Configure PF Coverage'}
          titleInfo="Record whether PF covers the school, its effective month, and supporting evidence. Contribution rules are managed separately."
          handleClose={close}
          disableClose={busy}
          hasUnsavedChanges={form.dirty}
          guardUnsavedChanges={false}
          formProps={{
            noValidate: true,
            onSubmit: (event) => {
              event.preventDefault();
              form.handleSubmit();
            },
          }}
        >
          <SetupEditorBody>
            <Stack spacing={2} sx={embedded ? { width: 1, maxWidth: 'md', mx: 'auto' } : undefined}>
              {form.values.error && <Alert severity="error">{form.values.error}</Alert>}
              {unavailable && (
                <Alert
                  severity="warning"
                  action={
                    query.isError ? (
                      <Button
                        size="small"
                        onClick={() => query.refetch()}
                        disabled={query.isFetching}
                      >
                        Retry
                      </Button>
                    ) : undefined
                  }
                >
                  Wait for coverage to reload before submitting. Your entries are preserved.
                </Alert>
              )}
              <FormSectionCard
                title={embedded ? 'PF Coverage' : 'Coverage Details'}
                icon={GlobalIcons.documentIcon}
                descriptionTooltip="Choose the school coverage status and effective month. Add a reference to the supporting registration or review record."
                action={
                  <Label color={current ? 'success' : 'warning'}>
                    {current ? 'Configured' : 'Setup required'}
                  </Label>
                }
              >
                <Stack spacing={2}>
                  {embedded && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      role={current ? 'status' : 'alert'}
                    >
                      {current
                        ? `${current.isCovered ? 'Covered under PF' : 'Not covered under PF'}. Effective ${current.effectiveMonth.slice(0, 7)}.`
                        : 'Record school PF coverage to complete HR setup and save new salary enrollment decisions.'}
                    </Typography>
                  )}
                  <FormFieldSpacing
                    sx={{
                      display: 'grid',
                      gap: 2,
                      pt: 0.5,
                      gridTemplateColumns: embedded
                        ? { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' }
                        : 'minmax(0, 1fr)',
                    }}
                  >
                    <ShakingTextField error={errorFor('month')}>
                      <TextField
                        required
                        autoFocus
                        label="PF coverage effective month"
                        type="month"
                        name="month"
                        size="small"
                        fullWidth
                        value={form.values.month}
                        onChange={form.handleChange}
                        onBlur={form.handleBlur}
                        disabled={busy}
                        error={errorFor('month')}
                        helperText={errorFor('month') ? form.errors.month : undefined}
                        slotProps={{ inputLabel: { shrink: true } }}
                      />
                    </ShakingTextField>
                    <ShakingTextField error={errorFor('coverage')}>
                      <TextField
                        required
                        label="School establishment coverage"
                        select
                        name="coverage"
                        size="small"
                        fullWidth
                        value={form.values.coverage}
                        onChange={form.handleChange}
                        onBlur={form.handleBlur}
                        disabled={busy}
                        error={errorFor('coverage')}
                        helperText={errorFor('coverage') ? form.errors.coverage : undefined}
                        slotProps={{ inputLabel: { shrink: true } }}
                      >
                        <MenuItem value="covered">Covered under PF</MenuItem>
                        <MenuItem value="not-covered">Not covered under PF</MenuItem>
                      </TextField>
                    </ShakingTextField>
                    <ShakingTextField error={errorFor('evidence')} sx={{ gridColumn: '1 / -1' }}>
                      <TextField
                        required
                        label="PF coverage evidence reference"
                        name="evidence"
                        size="small"
                        fullWidth
                        value={form.values.evidence}
                        onChange={form.handleChange}
                        onBlur={form.handleBlur}
                        disabled={busy}
                        error={errorFor('evidence')}
                        helperText={
                          errorFor('evidence')
                            ? form.errors.evidence
                            : 'Registration number, document link, or review reference.'
                        }
                        slotProps={{ inputLabel: { shrink: true } }}
                      />
                    </ShakingTextField>
                  </FormFieldSpacing>
                </Stack>
              </FormSectionCard>
            </Stack>
          </SetupEditorBody>
          <SetupEditorActions>
            <DialogActions>
              <Button
                size="small"
                variant="outlined"
                onClick={close}
                disabled={busy}
                startIcon={<Iconify icon={GlobalIcons.cancel} />}
              >
                Cancel
              </Button>
              <SubmitButton loading={busy} disabled={unavailable} />
            </DialogActions>
          </SetupEditorActions>
        </SetupInlineCustomDialog>
      )}
      <ConfirmDialog
        open={discard}
        onClose={() => setDiscard(false)}
        title="Discard Changes?"
        content="Your PF coverage changes have not been saved."
        cancelText="Keep editing"
        action={
          <Button
            size="small"
            variant="contained"
            color="warning"
            onClick={() => {
              form.resetForm();
              setDiscard(false);
              setEditing(false);
            }}
          >
            Discard changes
          </Button>
        }
      />
    </Stack>
  );
}
